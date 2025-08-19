#!/usr/bin/env python3
"""
향상된 실제 데이터 수집기 테스트 스크립트
"""

import requests
import json
import time

def test_enhanced_real_data_collector():
    print("🚀 향상된 실제 데이터 수집기 테스트 시작...")
    
    # Supabase 설정
    SUPABASE_URL = "https://rdxsrpvngdnhvlfbjszv.supabase.co"
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHNycHZuZ2RuaHZsZmJqc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1MjYyMjIsImV4cCI6MjA0MTEwMjIyMn0.TYcJ7Bb-w0VGGgJMaKJ3UGaD_VWO6xOJ1-8lp9PTsII"
    
    # 테스트 URL (공개 액세스)
    url = f"{SUPABASE_URL}/functions/v1/public-enhanced-real-data-collector"
    
    # 헤더 설정
    headers = {
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY
    }
    
    # 테스트 케이스들
    test_cases = [
        {
            "name": "음식 관련 인플루언서 검색",
            "data": {
                "query": "음식",
                "platforms": ["INSTAGRAM", "YOUTUBE"],
                "filters": {
                    "min_followers": 10000,
                    "max_followers": 500000,
                    "min_engagement": 2.0,
                    "max_engagement": 15.0
                },
                "limit": 15,
                "realtime": True
            }
        },
        {
            "name": "패션 관련 인플루언서 검색",
            "data": {
                "query": "패션",
                "platforms": ["INSTAGRAM", "TIKTOK"],
                "filters": {
                    "min_followers": 5000,
                    "max_followers": 1000000
                },
                "limit": 10,
                "realtime": True
            }
        },
        {
            "name": "뷰티 관련 인플루언서 검색",
            "data": {
                "query": "뷰티",
                "platforms": ["INSTAGRAM", "YOUTUBE", "TIKTOK"],
                "filters": {},
                "limit": 20,
                "realtime": True
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'='*50}")
        print(f"테스트 {i}: {test_case['name']}")
        print(f"{'='*50}")
        
        try:
            # 요청 시간 측정
            start_time = time.time()
            
            response = requests.post(
                url,
                headers=headers,
                json=test_case['data'],
                timeout=30
            )
            
            end_time = time.time()
            response_time = round((end_time - start_time) * 1000, 2)
            
            print(f"⏱️  응답 시간: {response_time}ms")
            print(f"📊 HTTP 상태 코드: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('success'):
                    data = result.get('data', {})
                    stats = result.get('stats', {})
                    metadata = result.get('metadata', {})
                    
                    results = data.get('results', [])
                    total_found = data.get('total_found', 0)
                    
                    print(f"✅ 성공!")
                    print(f"📈 검색 결과: {total_found}명")
                    print(f"🌍 검색 플랫폼: {list(stats.get('by_platform', {}).keys())}")
                    print(f"📊 플랫폼별 결과: {stats.get('by_platform', {})}")
                    print(f"👥 평균 팔로워: {stats.get('avg_followers', 0):,}명")
                    print(f"❤️  평균 인게이지먼트: {stats.get('avg_engagement', 0)}%")
                    
                    if stats.get('by_category'):
                        print(f"🏷️  카테고리별 분포: {stats.get('by_category', {})}")
                    
                    # 첫 번째 결과 상세 출력
                    if results:
                        first_result = results[0]
                        print(f"\n📌 첫 번째 결과 예시:")
                        print(f"   🎯 플랫폼: {first_result.get('platform', 'N/A')}")
                        print(f"   👤 이름: {first_result.get('full_name', 'N/A')}")
                        print(f"   👥 팔로워: {first_result.get('followers', 0):,}명")
                        print(f"   ❤️  인게이지먼트: {first_result.get('engagement_rate', 0)}%")
                        print(f"   🏷️  카테고리: {first_result.get('category', 'N/A')}")
                        print(f"   📍 위치: {first_result.get('location', 'N/A')}")
                        print(f"   💰 예상 비용: {first_result.get('collaboration_cost', 'N/A')}")
                        print(f"   ✅ 인증 여부: {'예' if first_result.get('is_verified') else '아니오'}")
                        
                        if first_result.get('hashtag_analysis'):
                            tags = first_result['hashtag_analysis'].get('relevant_tags', [])
                            print(f"   🏷️  관련 해시태그: {', '.join(tags[:3])}")
                else:
                    error = result.get('error', {})
                    print(f"❌ 실패: {error.get('message', '알 수 없는 오류')}")
                    print(f"🔍 오류 코드: {error.get('code', 'UNKNOWN')}")
            else:
                print(f"❌ HTTP 오류: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"🔍 오류 내용: {error_data}")
                except:
                    print(f"🔍 오류 내용: {response.text}")
            
        except requests.exceptions.Timeout:
            print("⏰ 요청 시간 초과 (30초)")
        except requests.exceptions.RequestException as e:
            print(f"🌐 네트워크 오류: {e}")
        except Exception as e:
            print(f"💥 예기치 못한 오류: {e}")
        
        if i < len(test_cases):
            print("\n⏳ 다음 테스트까지 2초 대기...")
            time.sleep(2)
    
    print(f"\n{'='*50}")
    print("🎉 모든 테스트 완료!")
    print(f"{'='*50}")

if __name__ == "__main__":
    test_enhanced_real_data_collector()
