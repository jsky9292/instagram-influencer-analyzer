"""
Instagram 팔로워 크롤링 API - 다중 계정 지원
특정 인플루언서의 팔로워 목록을 여러 계정으로 로테이션하며 수집합니다.
"""

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import requests
import json
import time
import random
from pathlib import Path
import os
from datetime import datetime, timedelta
import asyncio
import aiohttp
from collections import deque
import hashlib

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 계정 정보 모델
class AccountCredentials(BaseModel):
    username: str
    password: str
    proxy: Optional[str] = None  # "http://proxy.example.com:8080"

class AccountManager:
    def __init__(self):
        self.accounts_file = "follower_accounts.json"
        self.accounts = self._load_accounts()
        self.account_states = {}  # 계정별 상태 추적
        self.current_index = 0
        
    def _load_accounts(self):
        """저장된 계정 목록 로드"""
        if os.path.exists(self.accounts_file):
            try:
                with open(self.accounts_file, "r") as f:
                    data = json.load(f)
                    return data.get("accounts", [])
            except:
                return []
        return []
    
    def _save_accounts(self):
        """계정 목록 저장"""
        data = {
            "accounts": self.accounts,
            "updated_at": datetime.now().isoformat()
        }
        with open(self.accounts_file, "w") as f:
            json.dump(data, f, indent=2)
    
    def add_account(self, username: str, password: str, proxy: Optional[str] = None):
        """계정 추가"""
        # 비밀번호 해시 (보안을 위해)
        password_hash = hashlib.sha256(password.encode()).hexdigest()[:16] + "..."
        
        account = {
            "username": username,
            "password": password,  # 실제 사용시에는 암호화 필요
            "proxy": proxy,
            "added_at": datetime.now().isoformat(),
            "last_used": None,
            "request_count": 0,
            "status": "active",
            "cookie_file": f"ig_cookies_{username}.json"
        }
        
        # 중복 체크
        for acc in self.accounts:
            if acc["username"] == username:
                return {"success": False, "message": "이미 등록된 계정입니다."}
        
        self.accounts.append(account)
        self._save_accounts()
        
        # 계정 상태 초기화
        self.account_states[username] = {
            "requests_made": 0,
            "last_request": None,
            "cooldown_until": None,
            "errors": 0
        }
        
        return {"success": True, "message": f"계정 {username} 추가 완료"}
    
    def remove_account(self, username: str):
        """계정 제거"""
        self.accounts = [acc for acc in self.accounts if acc["username"] != username]
        self._save_accounts()
        
        # 쿠키 파일 삭제
        cookie_file = f"ig_cookies_{username}.json"
        if os.path.exists(cookie_file):
            os.remove(cookie_file)
            
        return {"success": True, "message": f"계정 {username} 제거 완료"}
    
    def get_next_account(self):
        """인터리빙 방식으로 다음 사용 가능한 계정 반환"""
        if not self.accounts:
            return None
        
        # 사용 가능한 계정 찾기
        available_accounts = []
        current_time = datetime.now()
        
        for account in self.accounts:
            username = account["username"]
            state = self.account_states.get(username, {})
            
            # 쿨다운 체크
            if state.get("cooldown_until"):
                if current_time < state["cooldown_until"]:
                    continue
                    
            # 에러 횟수 체크 (5회 이상 에러시 30분 쿨다운)
            if state.get("errors", 0) >= 5:
                continue
                
            available_accounts.append(account)
        
        if not available_accounts:
            return None
            
        # 라운드로빈 방식으로 선택
        account = available_accounts[self.current_index % len(available_accounts)]
        self.current_index += 1
        
        return account
    
    def mark_account_used(self, username: str, success: bool = True):
        """계정 사용 기록"""
        if username not in self.account_states:
            self.account_states[username] = {}
            
        state = self.account_states[username]
        state["last_request"] = datetime.now()
        state["requests_made"] = state.get("requests_made", 0) + 1
        
        if not success:
            state["errors"] = state.get("errors", 0) + 1
            # 에러 5회 이상시 30분 쿨다운
            if state["errors"] >= 5:
                state["cooldown_until"] = datetime.now() + timedelta(minutes=30)
        else:
            state["errors"] = 0  # 성공시 에러 카운트 리셋
            
        # 50번 요청마다 5분 쿨다운
        if state["requests_made"] % 50 == 0:
            state["cooldown_until"] = datetime.now() + timedelta(minutes=5)

class MultiAccountFollowerCrawler:
    def __init__(self):
        self.account_manager = AccountManager()
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        ]
        
    def _get_cookies_for_account(self, account):
        """계정별 쿠키 로드 또는 생성"""
        cookie_file = account["cookie_file"]
        
        if os.path.exists(cookie_file):
            with open(cookie_file, "r") as f:
                return json.load(f)
        else:
            # 쿠키가 없으면 로그인 필요
            from instagram.cookie_getter import get_instagram_cookies
            try:
                get_instagram_cookies(
                    account["username"], 
                    account["password"], 
                    save_path=cookie_file
                )
                with open(cookie_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                print(f"계정 {account['username']} 로그인 실패: {e}")
                return None
    
    def _make_request(self, url: str, account: dict, params: dict = None):
        """프록시와 계정 정보를 사용하여 요청"""
        cookies = self._get_cookies_for_account(account)
        if not cookies:
            return None
            
        headers = {
            "x-ig-app-id": "936619743392459",
            "User-Agent": random.choice(self.user_agents),
            "Accept": "*/*",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
            "cookie": "; ".join(f"{k}={v}" for k, v in cookies.items()),
            "x-requested-with": "XMLHttpRequest",
            "referer": "https://www.instagram.com/"
        }
        
        proxies = None
        if account.get("proxy"):
            proxies = {
                "http": account["proxy"],
                "https": account["proxy"]
            }
            
        try:
            resp = requests.get(url, headers=headers, params=params, proxies=proxies, timeout=10)
            return resp
        except Exception as e:
            print(f"요청 실패 ({account['username']}): {e}")
            return None
    
    def get_followers_with_rotation(self, target_username: str, max_count: int = 1000):
        """
        여러 계정을 로테이션하며 팔로워 수집
        """
        # 먼저 target user의 ID 획득
        account = self.account_manager.get_next_account()
        if not account:
            return {"success": False, "error": "사용 가능한 계정이 없습니다."}
            
        # User ID 획득
        url = f"https://i.instagram.com/api/v1/users/web_profile_info/?username={target_username}"
        resp = self._make_request(url, account)
        
        if not resp or resp.status_code != 200:
            return {"success": False, "error": "사용자를 찾을 수 없습니다."}
            
        user_data = resp.json().get('data', {}).get('user', {})
        user_id = user_data.get('id')
        
        if not user_id:
            return {"success": False, "error": "사용자 ID를 찾을 수 없습니다."}
            
        # 팔로워 수집 시작
        followers = []
        next_max_id = None
        total_collected = 0
        request_count = 0
        
        while total_collected < max_count:
            # 계정 로테이션
            if request_count > 0 and request_count % 30 == 0:  # 30개 요청마다 계정 전환
                print(f"계정 전환 (현재 {account['username']}에서 {request_count}개 요청 완료)")
                time.sleep(random.uniform(5, 10))  # 계정 전환시 딜레이
                
            account = self.account_manager.get_next_account()
            if not account:
                print("사용 가능한 계정이 없습니다. 대기 중...")
                time.sleep(60)  # 1분 대기 후 재시도
                continue
                
            # 팔로워 API 호출
            base_url = f"https://i.instagram.com/api/v1/friendships/{user_id}/followers/"
            params = {
                "count": min(50, max_count - total_collected),
                "search_surface": "follow_list_page"
            }
            
            if next_max_id:
                params["max_id"] = next_max_id
                
            resp = self._make_request(base_url, account, params)
            
            if resp and resp.status_code == 200:
                data = resp.json()
                users = data.get("users", [])
                
                for user in users:
                    follower_info = {
                        "user_id": user.get("pk"),
                        "username": user.get("username"),
                        "full_name": user.get("full_name"),
                        "profile_pic_url": user.get("profile_pic_url"),
                        "is_verified": user.get("is_verified", False),
                        "is_private": user.get("is_private", False),
                        "follower_count": user.get("follower_count", 0),
                        "collected_by": account["username"],  # 어떤 계정으로 수집했는지 기록
                        "collected_at": datetime.now().isoformat()
                    }
                    followers.append(follower_info)
                
                total_collected += len(users)
                request_count += 1
                
                # 계정 사용 기록
                self.account_manager.mark_account_used(account["username"], success=True)
                
                # 다음 페이지 확인
                next_max_id = data.get("next_max_id")
                if not next_max_id or not users:
                    break
                    
                # 요청 간 딜레이 (랜덤)
                delay = random.uniform(1.0, 3.0)
                print(f"[{account['username']}] {len(users)}명 수집 완료, {delay:.1f}초 대기...")
                time.sleep(delay)
                
            elif resp and resp.status_code == 429:
                # Rate limit - 계정 쿨다운 설정
                print(f"[{account['username']}] Rate limit 도달, 계정 전환...")
                self.account_manager.mark_account_used(account["username"], success=False)
                continue
                
            elif resp and resp.status_code == 401:
                # 인증 실패 - 쿠키 삭제
                print(f"[{account['username']}] 인증 실패, 재로그인 필요")
                os.remove(account["cookie_file"])
                self.account_manager.mark_account_used(account["username"], success=False)
                continue
                
            else:
                print(f"[{account['username']}] 요청 실패: {resp.status_code if resp else 'No response'}")
                self.account_manager.mark_account_used(account["username"], success=False)
                continue
        
        return {
            "success": True,
            "target_username": target_username,
            "total_collected": total_collected,
            "followers": followers,
            "accounts_used": list(set([f["collected_by"] for f in followers])),
            "timestamp": datetime.now().isoformat()
        }

# 계정 관리 엔드포인트
@app.post("/api/accounts/add")
async def add_account(credentials: AccountCredentials):
    """새 계정 추가"""
    manager = AccountManager()
    result = manager.add_account(credentials.username, credentials.password, credentials.proxy)
    return result

@app.delete("/api/accounts/{username}")
async def remove_account(username: str):
    """계정 제거"""
    manager = AccountManager()
    result = manager.remove_account(username)
    return result

@app.get("/api/accounts/list")
async def list_accounts():
    """등록된 계정 목록"""
    manager = AccountManager()
    # 비밀번호는 제외하고 반환
    safe_accounts = []
    for acc in manager.accounts:
        safe_acc = acc.copy()
        safe_acc["password"] = "***"  # 비밀번호 숨김
        safe_accounts.append(safe_acc)
    return {"accounts": safe_accounts}

@app.get("/api/accounts/status")
async def account_status():
    """계정 상태 확인"""
    manager = AccountManager()
    return {
        "total_accounts": len(manager.accounts),
        "account_states": manager.account_states,
        "timestamp": datetime.now().isoformat()
    }

# VPN/프록시 체크
@app.get("/api/check-ip")
async def check_ip():
    """현재 IP 주소 확인 (VPN 사용 여부 체크)"""
    try:
        # IP 확인 서비스 사용
        resp = requests.get("https://api.ipify.org?format=json", timeout=5)
        ip = resp.json().get("ip")
        
        # VPN 감지 (간단한 체크)
        vpn_check = requests.get(f"https://ipapi.co/{ip}/json/", timeout=5)
        vpn_data = vpn_check.json()
        
        return {
            "ip": ip,
            "country": vpn_data.get("country_name"),
            "city": vpn_data.get("city"),
            "org": vpn_data.get("org"),
            "is_vpn": "vpn" in vpn_data.get("org", "").lower() or "proxy" in vpn_data.get("org", "").lower(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

# 팔로워 크롤링 엔드포인트
@app.post("/api/followers/crawl")
async def crawl_followers(
    target_username: str = Body(...),
    max_count: int = Body(1000),
    use_rotation: bool = Body(True)
):
    """
    팔로워 크롤링 실행
    use_rotation: True면 다중 계정 로테이션, False면 단일 계정
    """
    crawler = MultiAccountFollowerCrawler()
    
    if use_rotation:
        result = crawler.get_followers_with_rotation(target_username, max_count)
    else:
        # 단일 계정 모드 (첫 번째 계정만 사용)
        manager = AccountManager()
        if not manager.accounts:
            raise HTTPException(status_code=400, detail="등록된 계정이 없습니다.")
        # 기존 단일 계정 로직 사용
        result = {"success": False, "error": "단일 계정 모드는 아직 구현되지 않았습니다."}
    
    return result

@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy", "service": "multi_account_follower_crawler"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)