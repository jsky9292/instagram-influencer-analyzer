#!/usr/bin/env python3
"""
Instagram 크롤러 실행 스크립트 (설정 파일 사용)
"""

import sys
import os
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from InstagramCrawler import InstagramCrawler

def load_config(config_file):
    """설정 파일 로드"""
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ 설정 파일을 찾을 수 없습니다: {config_file}")
        print("config_example.json을 참고하여 config.json을 만들어주세요.")
        return None
    except json.JSONDecodeError as e:
        print(f"❌ 설정 파일 파싱 오류: {e}")
        return None

def main():
    print("=" * 60)
    print("Instagram 인플루언서 크롤러 - 설정 파일 실행")
    print("=" * 60)
    
    # 설정 파일 로드
    config = load_config("config.json")
    if not config:
        # config.json이 없으면 예제 파일로 시도
        print("config.json이 없어서 config_example.json으로 시도합니다...")
        config = load_config("config_example.json")
        if not config:
            return
        
        # 예제 파일의 경우 실제 로그인 정보가 필요함을 알림
        instagram_config = config.get('instagram', {})
        if (instagram_config.get('username') == 'your_instagram_username' or 
            instagram_config.get('password') == 'your_instagram_password'):
            print("\n⚠️ 예제 설정 파일을 사용 중입니다.")
            print("실제 Instagram 계정 정보를 입력해주세요:")
            
            username = input("Instagram 아이디: ").strip()
            password = input("Instagram 비밀번호: ").strip()
            
            if username and password:
                config['instagram']['username'] = username
                config['instagram']['password'] = password
            else:
                print("❌ 로그인 정보가 필요합니다.")
                return
    
    # 설정 추출
    instagram_config = config.get('instagram', {})
    crawling_config = config.get('crawling', {})
    
    username = instagram_config.get('username')
    password = instagram_config.get('password')
    category = crawling_config.get('category', 'fashion')
    max_count = crawling_config.get('max_count', 20)
    sleep_sec = crawling_config.get('sleep_sec', 2.0)
    max_user_posts = crawling_config.get('max_user_posts', 30)
    
    if not username or not password:
        print("❌ Instagram 로그인 정보가 설정되지 않았습니다.")
        return
    
    print(f"\n📊 설정 확인:")
    print(f"  아이디: {username}")
    print(f"  해시태그: #{category}")
    print(f"  수집 게시물: {max_count}개")
    print(f"  요청 간격: {sleep_sec}초")
    print(f"  계정별 게시물: {max_user_posts}개")
    
    try:
        print("\n🚀 크롤러 시작...")
        print("-" * 50)
        
        # 쿠키 파일 확인 및 생성
        cookie_file = "ig_cookies.json"
        
        if not os.path.exists(cookie_file):
            print("🔄 Instagram 로그인 중... (브라우저가 열립니다)")
            print("💡 2차 인증이 있다면 브라우저에서 직접 완료해주세요.")
            print("💡 로그인 완료 후 잠시 기다려주세요...")
            
            from cookie_getter import get_instagram_cookies
            get_instagram_cookies(username, password, cookie_file)
            print("✅ 쿠키 생성 완료")
        else:
            print("✅ 기존 쿠키 파일 사용")
        
        # 크롤러 실행
        crawler = InstagramCrawler(
            category=category,
            max_count=max_count,
            sleep_sec=sleep_sec,
            output_dir="results",
            max_user_posts=max_user_posts
        )
        
        print(f"\n📈 크롤링 시작: #{category}")
        crawler.run()
        
        print("\n🎉 크롤링 완료!")
        print("📁 결과는 'results' 폴더에 저장되었습니다.")
        
        # 결과 파일 확인
        results_dir = "results"
        if os.path.exists(results_dir):
            files = [f for f in os.listdir(results_dir) if f.endswith(('.csv', '.json'))]
            if files:
                print(f"\n📋 생성된 파일:")
                for file in files:
                    print(f"  - {file}")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ 사용자에 의해 중단되었습니다.")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()