#!/usr/bin/env python3
"""
FastAPI 기반 Instagram 크롤링 API 서버
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn
import json
import asyncio
import sys
import os
from datetime import datetime
from pathlib import Path

# Instagram 크롤러 추가
instagram_path = Path(__file__).parent.parent.parent / "instagram"
sys.path.append(str(instagram_path))

# Config 파일 경로
CONFIG_PATH = instagram_path / "config.json"

try:
    from InstagramCrawler import InstagramCrawler
except ImportError:
    print("Instagram 크롤러를 찾을 수 없습니다. 경로를 확인해주세요.")

# Config 파일 로드
def load_config():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

config = load_config()

app = FastAPI(title="Instagram Influencer Crawling API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Instagram Influencer Crawling API"}

@app.post("/crawl")
async def crawl_hashtag(request: dict):
    """해시태그 기반 인플루언서 크롤링"""
    
    hashtag = request.get("hashtag", "").strip()
    max_count = request.get("max_count", 20)
    max_user_posts = request.get("max_user_posts", 30)
    
    if not hashtag:
        raise HTTPException(status_code=400, detail="해시태그가 필요합니다")
    
    # 기존 수집된 데이터 확인
    existing_data_path = instagram_path / "results" / "2025-08-17_17_31_먹방"
    profiles_csv = existing_data_path / "insta_먹방_profiles.csv"
    
    async def generate_stream():
        try:
            # 항상 실시간 크롤링 시도
            yield f"data: {json.dumps({'progress': f'#{hashtag} 해시태그 실시간 크롤링 시작...'})}\n\n"
                await asyncio.sleep(0.5)
                
                # CSV 파일 읽기
                import pandas as pd
                df = pd.read_csv(profiles_csv, encoding='utf-8-sig')
                
                results = []
                total = len(df)
                
                for idx, row in df.iterrows():
                    username = row['username']
                    yield f"data: {json.dumps({'progress': f'[{idx+1}/{total}] @{username} 데이터 처리 중...'})}\n\n"
                    await asyncio.sleep(0.1)
                    
                    # 각 프로필 데이터 JSON 로드
                    profile_dir = existing_data_path / row['username']
                    profile_json = profile_dir / f"ig_profile_{row['username']}_raw.json"
                    posts_json = profile_dir / f"ig_posts_{row['username']}_max30.json"
                    
                    profile_data = {
                        'username': row['username'],
                        'full_name': row.get('full_name', ''),
                        'bio': row.get('bio', ''),
                        'followers': int(row['followers']) if pd.notna(row['followers']) else 0,
                        'following': int(row['following']) if pd.notna(row['following']) else 0,
                        'posts': int(row['posts']) if pd.notna(row['posts']) else 0,
                        'engagement_rate': float(row['engagement_rate']) if pd.notna(row['engagement_rate']) else 0.0,
                        'is_verified': bool(row['is_verified']) if pd.notna(row['is_verified']) else False,
                        'category': row.get('category', 'Unknown'),
                        'ai_grade': row.get('ai_grade', 'C'),
                        'ai_score': int(row['ai_score']) if pd.notna(row['ai_score']) else 70
                    }
                    
                    # 추가 데이터 로드 (있으면)
                    if profile_json.exists():
                        try:
                            with open(profile_json, 'r', encoding='utf-8') as f:
                                raw_profile = json.load(f)
                                profile_data['profile_pic_url'] = raw_profile.get('profile_pic_url', '')
                                profile_data['external_url'] = raw_profile.get('external_url', '')
                        except:
                            pass
                    
                    results.append(profile_data)
                    
                    if idx >= max_count - 1:
                        break
                
                yield f"data: {json.dumps({'progress': f'✅ {len(results)}명의 인플루언서 데이터 로드 완료!'})}\n\n"
                await asyncio.sleep(0.1)
                
                yield f"data: {json.dumps({'result': results})}\n\n"
                yield f"data: [DONE]\n\n"
                return
            
            # 기존 데이터가 없으면 새로 크롤링 시도
            yield f"data: {json.dumps({'progress': f'#{hashtag} 해시태그 크롤링 시작...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # 크롤러 초기화
            yield f"data: {json.dumps({'progress': '크롤러 초기화 중...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # Config에서 인증 정보 사용
            if config and 'instagram' in config:
                username = config['instagram']['username']
                password = config['instagram']['password']
            else:
                yield f"data: {json.dumps({'error': 'Instagram 인증 정보가 없습니다. config.json을 확인해주세요.'})}\n\n"
                return
            
            crawler = InstagramCrawler(
                category=hashtag,
                max_count=max_count,
                sleep_sec=1.0,
                output_dir="temp_results",
                max_user_posts=max_user_posts,
                username=username,
                password=password
            )
            
            # 해시태그 게시물 수집
            yield f"data: {json.dumps({'progress': f'#{hashtag} 게시물 수집 중... (최대 {max_count}개)'})}\n\n"
            await asyncio.sleep(0.1)
            
            # 실제 크롤링 실행 (비동기로 처리)
            loop = asyncio.get_event_loop()
            
            # 게시물 수집
            posts = await loop.run_in_executor(
                None, 
                crawler.get_recent_posts_by_tag, 
                hashtag, 
                max_count, 
                None
            )
            
            print(f"[DEBUG] 수집된 게시물 수: {len(posts)}")
            yield f"data: {json.dumps({'progress': f'게시물 {len(posts)}개 수집 완료'})}\n\n"
            await asyncio.sleep(0.1)
            
            # 사용자 추출
            yield f"data: {json.dumps({'progress': '인플루언서 계정 추출 중...'})}\n\n"
            await asyncio.sleep(0.1)
            
            usernames = crawler.extract_usernames_from_posts(posts)
            
            print(f"[DEBUG] 추출된 사용자명: {usernames[:5]}...")  # 처음 5개만 출력
            yield f"data: {json.dumps({'progress': f'유니크 계정 {len(usernames)}개 발견'})}\n\n"
            await asyncio.sleep(0.1)
            
            # 프로필 수집
            results = []
            for i, username in enumerate(usernames, 1):
                yield f"data: {json.dumps({'progress': f'[{i}/{len(usernames)}] @{username} 프로필 분석 중...'})}\n\n"
                await asyncio.sleep(0.1)
                
                try:
                    profile = await loop.run_in_executor(
                        None,
                        crawler.scrape_instagram_profile,
                        username,
                        None
                    )
                    
                    if profile:
                        print(f"[DEBUG] 수집된 프로필 - @{username}: 팔로워 {profile.get('followers', 0)}, 참여율 {profile.get('engagement_rate', 0):.2f}%")
                        # recent_posts_raw 제거 (용량 절약)
                        if 'recent_posts_raw' in profile:
                            del profile['recent_posts_raw']
                        results.append(profile)
                        
                except Exception as e:
                    print(f"프로필 수집 오류 ({username}): {e}")
                    continue
                
                # 너무 빠르면 차단될 수 있으므로 딜레이
                await asyncio.sleep(1)
            
            # 최종 결과 전송
            yield f"data: {json.dumps({'progress': f'크롤링 완료! {len(results)}명의 인플루언서 정보 수집'})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'result': results})}\n\n"
            yield f"data: [DONE]\n\n"
            
        except Exception as e:
            error_msg = f"크롤링 중 오류 발생: {str(e)}"
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)