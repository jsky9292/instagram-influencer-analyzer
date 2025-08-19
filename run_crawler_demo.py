#!/usr/bin/env python3
"""
인플루언서 크롤러 데모 실행 스크립트
자동으로 샘플 데이터를 크롤링합니다.
"""

from influencer_crawler import InfluencerCrawler
import sys

def main():
    print("=" * 50)
    print("YouTube 인플루언서 크롤러 - 자동 실행 데모")
    print("=" * 50)
    
    # 크롤러 인스턴스 생성
    crawler = InfluencerCrawler()
    
    # 샘플 채널 목록 (한국 유튜버 포함)
    sample_channels = [
        "https://www.youtube.com/@MrBeast",  # MrBeast
        "https://www.youtube.com/@PewDiePie",  # PewDiePie
        "https://www.youtube.com/@ddeunddeun",  # 뜬뜬 (한국)
    ]
    
    print("\n다음 채널들을 크롤링합니다:")
    for i, channel in enumerate(sample_channels, 1):
        print(f"  {i}. {channel}")
    
    print("\n크롤링을 시작합니다...")
    print("-" * 50)
    
    # 각 채널 크롤링 (비디오 3개씩)
    for channel_url in sample_channels:
        try:
            result = crawler.crawl_influencer(
                channel_url=channel_url,
                include_videos=True,
                max_videos=3
            )
            
            if result:
                channel_info = result['channel']
                print(f"\n📊 수집 완료:")
                print(f"  채널: {channel_info['채널명']}")
                print(f"  구독자: {channel_info['구독자수']}")
                if 'videos' in result:
                    print(f"  비디오: {len(result['videos'])}개 수집")
            
        except Exception as e:
            print(f"\n❌ 크롤링 실패: {e}")
            continue
        
        print("-" * 50)
    
    # 데이터 저장
    if crawler.results:
        print("\n💾 데이터 저장 중...")
        
        # Excel 저장
        crawler.save_to_excel('demo_influencers.xlsx')
        
        # JSON 저장
        crawler.save_to_json('demo_influencers.json')
        
        print("\n✨ 크롤링 완료!")
        print(f"  총 {len(crawler.results)}개 채널 정보 수집")
        
        # 결과 요약
        print("\n📈 수집 결과 요약:")
        for result in crawler.results:
            channel = result['channel']
            video_count = len(result.get('videos', []))
            print(f"  • {channel['채널명']}: {channel['구독자수']} 구독자, {video_count}개 비디오")
    else:
        print("\n⚠️ 수집된 데이터가 없습니다.")
    
    print("\n" + "=" * 50)
    print("프로그램 종료")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n사용자에 의해 중단되었습니다.")
        sys.exit(0)
    except Exception as e:
        print(f"\n오류 발생: {e}")
        sys.exit(1)