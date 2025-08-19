#!/usr/bin/env python3
"""
Influencer Crawler
YouTube 인플루언서 정보 크롤링 프로그램
"""

import json
import time
import re
from datetime import datetime
from pathlib import Path
import pandas as pd

try:
    import yt_dlp
    import requests
    from bs4 import BeautifulSoup
    from tqdm import tqdm
except ImportError as e:
    print(f"필요한 라이브러리가 설치되지 않았습니다: {e}")
    print("\n다음 명령어로 설치해주세요:")
    print("pip install yt-dlp requests beautifulsoup4 pandas tqdm openpyxl")
    exit(1)


class InfluencerCrawler:
    def __init__(self):
        self.ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
        }
        self.results = []
        
    def get_channel_info(self, channel_url):
        """
        YouTube 채널 정보 추출
        
        Args:
            channel_url: YouTube 채널 URL
            
        Returns:
            dict: 채널 정보
        """
        try:
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(channel_url, download=False)
                
                channel_data = {
                    '채널명': info.get('channel', info.get('uploader', 'Unknown')),
                    '채널_ID': info.get('channel_id', ''),
                    '채널_URL': info.get('channel_url', channel_url),
                    '구독자수': self._format_number(info.get('channel_follower_count', 0)),
                    '설명': info.get('description', '')[:200],  # 설명 첫 200자
                    '수집시간': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                
                return channel_data
                
        except Exception as e:
            print(f"❌ 채널 정보 추출 실패: {e}")
            return None
    
    def get_channel_videos(self, channel_url, max_videos=10):
        """
        채널의 최근 비디오 정보 추출
        
        Args:
            channel_url: YouTube 채널 URL
            max_videos: 수집할 최대 비디오 수
            
        Returns:
            list: 비디오 정보 리스트
        """
        videos = []
        
        try:
            ydl_opts = {
                'quiet': True,
                'extract_flat': 'in_playlist',
                'playlistend': max_videos,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # 채널의 uploads 플레이리스트 URL 구성
                if '/channel/' in channel_url:
                    channel_id = channel_url.split('/channel/')[-1].split('/')[0]
                    uploads_url = f"https://www.youtube.com/channel/{channel_id}/videos"
                elif '/@' in channel_url:
                    uploads_url = channel_url.rstrip('/') + '/videos'
                else:
                    uploads_url = channel_url
                
                print(f"  📹 비디오 목록 수집 중: {uploads_url}")
                info = ydl.extract_info(uploads_url, download=False)
                
                entries = info.get('entries', [])[:max_videos]
                
                for entry in tqdm(entries, desc="  비디오 정보 수집"):
                    video_url = f"https://www.youtube.com/watch?v={entry['id']}"
                    
                    # 각 비디오의 상세 정보 추출
                    try:
                        video_info = ydl.extract_info(video_url, download=False)
                        
                        video_data = {
                            '제목': video_info.get('title', ''),
                            'URL': video_url,
                            '조회수': self._format_number(video_info.get('view_count', 0)),
                            '좋아요': self._format_number(video_info.get('like_count', 0)),
                            '댓글수': self._format_number(video_info.get('comment_count', 0)),
                            '길이(초)': video_info.get('duration', 0),
                            '업로드날짜': video_info.get('upload_date', ''),
                            '설명': video_info.get('description', '')[:100],
                        }
                        
                        videos.append(video_data)
                        time.sleep(0.5)  # API 부하 방지
                        
                    except Exception as e:
                        print(f"    ⚠️ 비디오 정보 추출 실패: {e}")
                        continue
                        
        except Exception as e:
            print(f"❌ 비디오 목록 추출 실패: {e}")
            
        return videos
    
    def search_channels(self, keyword, max_results=10):
        """
        키워드로 YouTube 채널 검색
        
        Args:
            keyword: 검색 키워드
            max_results: 최대 결과 수
            
        Returns:
            list: 채널 URL 리스트
        """
        channels = []
        
        try:
            search_url = f"ytsearch{max_results}:{keyword} channel"
            
            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                info = ydl.extract_info(search_url, download=False)
                
                for entry in info.get('entries', []):
                    if entry.get('channel_url'):
                        channels.append(entry['channel_url'])
                        
        except Exception as e:
            print(f"❌ 채널 검색 실패: {e}")
            
        return channels
    
    def crawl_influencer(self, channel_url, include_videos=True, max_videos=5):
        """
        단일 인플루언서 정보 크롤링
        
        Args:
            channel_url: 채널 URL
            include_videos: 비디오 정보 포함 여부
            max_videos: 수집할 최대 비디오 수
        """
        print(f"\n🔍 크롤링 시작: {channel_url}")
        
        # 채널 정보 수집
        channel_info = self.get_channel_info(channel_url)
        
        if channel_info:
            print(f"  ✅ 채널: {channel_info['채널명']}")
            print(f"  👥 구독자: {channel_info['구독자수']}")
            
            result = {'channel': channel_info}
            
            # 비디오 정보 수집
            if include_videos:
                videos = self.get_channel_videos(channel_url, max_videos)
                result['videos'] = videos
                print(f"  📊 수집된 비디오: {len(videos)}개")
            
            self.results.append(result)
            return result
        
        return None
    
    def crawl_multiple(self, channel_urls, include_videos=True, max_videos=5):
        """
        여러 인플루언서 정보 일괄 크롤링
        
        Args:
            channel_urls: 채널 URL 리스트
            include_videos: 비디오 정보 포함 여부
            max_videos: 채널당 수집할 최대 비디오 수
        """
        print(f"\n{'='*50}")
        print(f"총 {len(channel_urls)}개 채널 크롤링 시작")
        print(f"{'='*50}")
        
        for url in channel_urls:
            self.crawl_influencer(url, include_videos, max_videos)
            time.sleep(2)  # 서버 부하 방지
    
    def save_to_excel(self, filename='influencer_data.xlsx'):
        """
        수집된 데이터를 Excel 파일로 저장
        
        Args:
            filename: 저장할 파일명
        """
        if not self.results:
            print("저장할 데이터가 없습니다.")
            return
        
        # 채널 정보 DataFrame
        channels_data = []
        videos_data = []
        
        for result in self.results:
            channel = result['channel']
            channels_data.append(channel)
            
            # 비디오 정보가 있으면 추가
            if 'videos' in result:
                for video in result['videos']:
                    video['채널명'] = channel['채널명']
                    videos_data.append(video)
        
        # Excel 파일로 저장
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # 채널 시트
            df_channels = pd.DataFrame(channels_data)
            df_channels.to_excel(writer, sheet_name='채널정보', index=False)
            
            # 비디오 시트
            if videos_data:
                df_videos = pd.DataFrame(videos_data)
                df_videos.to_excel(writer, sheet_name='비디오정보', index=False)
        
        print(f"\n✅ 데이터 저장 완료: {filename}")
        print(f"  - 채널: {len(channels_data)}개")
        print(f"  - 비디오: {len(videos_data)}개")
    
    def save_to_json(self, filename='influencer_data.json'):
        """
        수집된 데이터를 JSON 파일로 저장
        
        Args:
            filename: 저장할 파일명
        """
        if not self.results:
            print("저장할 데이터가 없습니다.")
            return
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ JSON 저장 완료: {filename}")
    
    def _format_number(self, num):
        """숫자를 읽기 쉬운 형식으로 변환"""
        if num >= 1000000:
            return f"{num/1000000:.1f}M"
        elif num >= 1000:
            return f"{num/1000:.1f}K"
        return str(num)


def main():
    """메인 실행 함수"""
    crawler = InfluencerCrawler()
    
    # 예제: 특정 채널들 크롤링
    sample_channels = [
        "https://www.youtube.com/@MrBeast",  # MrBeast
        "https://www.youtube.com/@PewDiePie",  # PewDiePie
        "https://www.youtube.com/@tseries",  # T-Series
    ]
    
    print("=" * 50)
    print("YouTube 인플루언서 크롤러")
    print("=" * 50)
    
    while True:
        print("\n메뉴를 선택하세요:")
        print("1. 단일 채널 크롤링")
        print("2. 여러 채널 크롤링 (샘플)")
        print("3. 키워드로 채널 검색 후 크롤링")
        print("4. 저장된 데이터 확인")
        print("5. 종료")
        
        choice = input("\n선택 (1-5): ").strip()
        
        if choice == '1':
            url = input("채널 URL 입력: ").strip()
            include_videos = input("비디오 정보도 수집할까요? (y/n): ").lower() == 'y'
            
            if include_videos:
                max_videos = int(input("수집할 비디오 수 (기본 5): ") or 5)
            else:
                max_videos = 0
            
            crawler.crawl_influencer(url, include_videos, max_videos)
            
            # 저장 옵션
            if input("\n데이터를 저장하시겠습니까? (y/n): ").lower() == 'y':
                crawler.save_to_excel()
                crawler.save_to_json()
        
        elif choice == '2':
            print("\n샘플 채널 크롤링을 시작합니다...")
            crawler.crawl_multiple(sample_channels, include_videos=True, max_videos=3)
            
            # 저장
            crawler.save_to_excel('sample_influencers.xlsx')
            crawler.save_to_json('sample_influencers.json')
        
        elif choice == '3':
            keyword = input("검색 키워드 입력: ").strip()
            max_results = int(input("검색할 채널 수 (기본 5): ") or 5)
            
            print(f"\n'{keyword}' 관련 채널 검색 중...")
            channels = crawler.search_channels(keyword, max_results)
            
            if channels:
                print(f"\n{len(channels)}개 채널 발견:")
                for i, ch in enumerate(channels, 1):
                    print(f"  {i}. {ch}")
                
                if input("\n모든 채널을 크롤링하시겠습니까? (y/n): ").lower() == 'y':
                    crawler.crawl_multiple(channels, include_videos=True, max_videos=3)
                    crawler.save_to_excel(f'{keyword}_influencers.xlsx')
        
        elif choice == '4':
            if crawler.results:
                print(f"\n현재 수집된 데이터: {len(crawler.results)}개 채널")
                for result in crawler.results:
                    print(f"  - {result['channel']['채널명']}: {result['channel']['구독자수']} 구독자")
            else:
                print("\n수집된 데이터가 없습니다.")
        
        elif choice == '5':
            print("\n프로그램을 종료합니다.")
            break
        
        else:
            print("\n잘못된 선택입니다.")


if __name__ == "__main__":
    main()