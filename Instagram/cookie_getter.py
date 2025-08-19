from playwright.sync_api import sync_playwright
import time
import json

def get_instagram_cookies(username, password, save_path="ig_cookies.json"):
    with sync_playwright() as p:
        # headless 모드로 실행
        browser = p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = context.new_page()
        
        try:
            page.goto("https://www.instagram.com/accounts/login/", wait_until="networkidle")
            time.sleep(3)
            
            # 쿠키 동의 버튼이 있으면 클릭
            try:
                page.click("button:has-text('Allow essential and optional cookies')", timeout=2000)
            except:
                pass
            
            # 로그인 폼 대기
            page.wait_for_selector("input[name='username']", timeout=10000)
            
            # 로그인 정보 입력
            page.fill("input[name='username']", username)
            time.sleep(1)
            page.fill("input[name='password']", password)
            time.sleep(1)
            
            # 로그인 버튼 클릭
            page.click("button[type='submit']")
            
            # 로그인 완료 대기
            time.sleep(5)
            
            # 쿠키 추출
            cookies = context.cookies()
            cookies_dict = {c['name']: c['value'] for c in cookies if c['name'] in ['sessionid', 'ds_user_id', 'csrftoken']}
            
            if cookies_dict.get('sessionid'):
                print(f"[SUCCESS] 쿠키 생성 완료: sessionid={cookies_dict['sessionid'][:10]}...")
                with open(save_path, "w") as f:
                    json.dump(cookies_dict, f)
            else:
                print("[WARNING] sessionid를 찾을 수 없습니다. 로그인 실패 가능성")
                
        except Exception as e:
            print(f"[ERROR] 쿠키 생성 실패: {e}")
            cookies_dict = {}
        finally:
            browser.close()
            
        return cookies_dict