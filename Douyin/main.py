import time
import json
from DrissionPage import ChromiumPage
from DrissionPage.common import Actions
from urllib.parse import quote
from openpyxl import Workbook
import threading
from typing import List, Dict, Optional
from datetime import datetime

class DouyinCrawler:
    def __init__(self):
        self.browser = None
        self.stop_event = threading.Event()

    def init_browser(self):
        try:
            print("브라우저 초기화 중...")
            self.browser = ChromiumPage()
            self.browser.get("https://www.baidu.com")
            time.sleep(2)
            print("브라우저 초기화 성공")
            return True
        except Exception as e:
            print(f"브라우저 초기화 실패: {e}")
            return False

    def setup_search_listener(self):
        if not self.browser:
            print("브라우저 미초기화")
            return False
        try:
            try:
                self.browser.listen.stop()
            except:
                pass
            self.browser.listen.start('/aweme/v1/web/search/item/')
            print("API 패킷 청취 성공")
            return True
        except Exception as e:
            print(f"API 패킷 청취 실패: {e}")
            return False

    def search_keyword(self, keyword: str):
        try:
            encoded_keyword = quote(keyword)
            search_url = f"https://www.douyin.com/search/{encoded_keyword}?type=video"
            print(f"검색페이지 이동: {search_url}")
            self.browser.get(search_url)
            time.sleep(5)
            return True
        except Exception as e:
            print(f"검색페이지 이동 실패: {e}")
            return False

    def scroll_and_collect_data(self, target_count: int) -> List[Dict]:
        ac = Actions(self.browser)
        all_videos = []
        scroll_count = 0
        max_scrolls = 30
        consecutive_failures = 0
        max_consecutive_failures = 5

        while len(all_videos) < target_count and scroll_count < max_scrolls:
            if self.stop_event.is_set():
                break
            try:
                ret = self.browser.listen.wait(timeout=10)
                if ret and ret.response and ret.response.body:
                    response_data = ret.response.body
                    consecutive_failures = 0
                    if isinstance(response_data, dict):
                        if 'data' in response_data and isinstance(response_data['data'], list):
                            for item in response_data['data']:
                                if isinstance(item, dict) and 'aweme_info' in item:
                                    all_videos.append(item['aweme_info'])
                            print(f"현재까지 {len(all_videos)}개 영상")
            except Exception as e:
                consecutive_failures += 1
                print(f"패킷 대기/파싱 실패 {consecutive_failures}회: {e}")
                if consecutive_failures >= max_consecutive_failures:
                    print("패킷 파싱 연속 실패, 중단")
                    break
            try:
                ac.scroll(delta_y=1500)
                time.sleep(2)
                scroll_count += 1
            except Exception as e:
                print(f"스크롤 실패: {e}")
                break
        return all_videos[:target_count]

    def extract_video_info(self, video_data: Dict) -> Optional[Dict]:
        try:
            video_info = {
                'aweme_id': video_data.get('aweme_id', ''),
                'desc': video_data.get('desc', ''),
                'create_time': self.timestamp_to_datetime(video_data.get('create_time', 0)),
                'author_name': video_data.get('author', {}).get('nickname', ''),
                'author_id': video_data.get('author', {}).get('uid', ''),
                'digg_count': video_data.get('statistics', {}).get('digg_count', 0),
                'comment_count': video_data.get('statistics', {}).get('comment_count', 0),
                'share_count': video_data.get('statistics', {}).get('share_count', 0),
                'play_count': video_data.get('statistics', {}).get('play_count', 0),
                'video_url': (video_data.get('video', {}).get('play_addr', {}).get('url_list') or [""])[0],
                'cover_url': (video_data.get('video', {}).get('cover', {}).get('url_list') or [""])[0],
                'music_title': video_data.get('music', {}).get('title', ''),
                'hashtags': [x.get('hashtag_name', '') for x in video_data.get('text_extra', []) if x.get('type') == 1]
            }
            return video_info
        except Exception as e:
            print(f"데이터 파싱 실패: {e}")
            return None

    def timestamp_to_datetime(self, ts):
        try:
            return datetime.fromtimestamp(int(ts)).strftime('%Y-%m-%d %H:%M:%S')
        except:
            return ""

    def save_to_excel(self, videos: List[Dict], keyword: str) -> str:
        if not videos:
            print("저장할 데이터 없음")
            return ""
        try:
            wb = Workbook()
            ws = wb.active
            ws.title = "Douyin 검색 결과"
            headers = [
                "영상ID", "작성자명", "작성자ID", "설명",
                "좋아요수", "댓글수", "공유수", "조회수",
                "생성일", "영상링크", "커버링크", "음악", "해시태그"
            ]
            ws.append(headers)
            for video in videos:
                ws.append([
                    video.get('aweme_id', ''),
                    video.get('author_name', ''),
                    video.get('author_id', ''),
                    video.get('desc', ''),
                    video.get('digg_count', 0),
                    video.get('comment_count', 0),
                    video.get('share_count', 0),
                    video.get('play_count', 0),
                    video.get('create_time', ''),
                    video.get('video_url', ''),
                    video.get('cover_url', ''),
                    video.get('music_title', ''),
                    ','.join(video.get('hashtags', [])),
                ])
            filename = f"Douyin_{keyword}_{len(videos)}개.xlsx"
            wb.save(filename)
            print(f"저장 완료: {filename}")
            return filename
        except Exception as e:
            print(f"Excel 저장 실패: {e}")
            return ""

    def crawl_douyin_search(self, keyword: str, limit: int = 50):
        try:
            print("크롤링 시작")
            if not self.init_browser():
                return False
            if not self.setup_search_listener():
                return False
            if not self.search_keyword(keyword):
                return False
            videos_data = self.scroll_and_collect_data(limit)
            videos = [self.extract_video_info(v) for v in videos_data if self.extract_video_info(v)]
            self.save_to_excel(videos, keyword)
            return True
        finally:
            if self.browser:
                try:
                    self.browser.quit()
                except:
                    pass

if __name__ == "__main__":
    crawler = DouyinCrawler()
    keyword = input('검색어 입력: ')
    limit = int(input('수집 개수 입력: '))
    crawler.crawl_douyin_search(keyword=keyword, limit=limit)