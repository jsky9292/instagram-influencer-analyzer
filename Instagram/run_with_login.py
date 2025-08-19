#!/usr/bin/env python3
"""
Instagram 크롤러 실행 스크립트 (로그인 포함)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from InstagramCrawler import InstagramCrawler

def main():
    print("=" * 60)
    print("Instagram 인플루언서 크롤러 - 로그인 및 실행")
    print("=" * 60)
    
    # 사용자 입력
    print("\n📝 설정 입력:")
    
    # Instagram 로그인 정보
    print("\n🔐 Instagram 로그인 정보:")
    username = input("Instagram 아이디: ").strip()
    password = input("Instagram 비밀번호: ").strip()
    
    if not username or not password:
        print("❌ 아이디와 비밀번호를 모두 입력해주세요.")
        return
    
    # 크롤링 설정
    print("\n🎯 크롤링 설정:")
    category = input("해시태그 (예: fashion, travel): ").strip().replace("#", "")
    
    if not category:
        category = "fashion"  # 기본값
        print(f"기본값 사용: {category}")
    
    try:
        max_count = int(input("수집할 게시물 수 (기본: 20): ") or "20")
    except ValueError:
        max_count = 20
    
    try:
        sleep_sec = float(input("요청 간격(초) (기본: 2.0): ") or "2.0")
    except ValueError:
        sleep_sec = 2.0
    
    try:
        max_user_posts = int(input("계정별 최대 게시물 수 (기본: 30): ") or "30")
    except ValueError:
        max_user_posts = 30
    
    print(f"\n📊 설정 확인:")
    print(f"  아이디: {username}")
    print(f"  해시태그: #{category}")
    print(f"  수집 게시물: {max_count}개")
    print(f"  요청 간격: {sleep_sec}초")
    print(f"  계정별 게시물: {max_user_posts}개")
    
    confirm = input("\n위 설정으로 진행하시겠습니까? (y/n): ").lower()
    if confirm != 'y':
        print("취소되었습니다.")
        return
    
    try:
        print("\n🚀 크롤러 시작...")
        print("-" * 50)
        
        # 쿠키 파일 확인 및 생성
        import json
        cookie_file = "ig_cookies.json"
        
        if not os.path.exists(cookie_file):
            print("🔄 Instagram 로그인 중... (브라우저가 열립니다)")
            print("💡 2차 인증이 있다면 브라우저에서 직접 완료해주세요.")
            
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
        print("결과는 'results' 폴더에 저장되었습니다.")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ 사용자에 의해 중단되었습니다.")
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()