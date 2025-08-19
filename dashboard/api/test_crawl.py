#!/usr/bin/env python3
"""
크롤링 API 테스트 스크립트
"""

import requests
import json
import time

def test_crawling(hashtag="먹방", target_country="us"):
    """크롤링 API 테스트"""
    url = "http://localhost:8000/crawl"
    
    payload = {
        "hashtag": hashtag,
        "max_count": 5,  # 테스트용으로 5개만
        "max_user_posts": 10,
        "target_country": target_country
    }
    
    print(f"테스트 시작: #{hashtag} ({target_country})")
    print(f"요청 데이터: {json.dumps(payload, ensure_ascii=False)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, json=payload, stream=True)
        
        if response.status_code == 200:
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    if decoded_line.startswith('data: '):
                        data_str = decoded_line[6:]
                        if data_str == '[DONE]':
                            print("\n✅ 크롤링 완료!")
                            break
                        try:
                            data = json.loads(data_str)
                            if 'progress' in data:
                                print(f"진행: {data['progress']}")
                            elif 'error' in data:
                                print(f"❌ 오류: {data['error']}")
                            elif 'result' in data:
                                print(f"\n✅ 결과: {len(data['result'])}명의 인플루언서 발견")
                                for idx, inf in enumerate(data['result'][:3], 1):
                                    print(f"  {idx}. @{inf['username']} - 팔로워: {inf['followers']:,}")
                        except json.JSONDecodeError:
                            pass
        else:
            print(f"❌ 오류: HTTP {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ 연결 오류: {e}")

if __name__ == "__main__":
    # 한국어 -> 영어 번역 테스트
    print("=" * 50)
    print("테스트 1: 한국어 '먹방' -> 미국")
    print("=" * 50)
    test_crawling("먹방", "us")
    
    time.sleep(2)
    
    # 직접 영어 해시태그 테스트
    print("\n" + "=" * 50)
    print("테스트 2: 영어 'food' -> 미국")
    print("=" * 50)
    test_crawling("food", "us")