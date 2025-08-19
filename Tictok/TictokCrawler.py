from TikTokApi import TikTokApi
from openpyxl import Workbook
import asyncio

class TikTokCrawler:
    def __init__(self):
        self.api = TikTokApi()

    async def create_sessions(self, num_sessions=1):
        await self.api.create_sessions(
            num_sessions=num_sessions,
            headless=False,
            browser="webkit",
            proxies=[
                {
                    "server": "http://123.45.67.89:8080",  # ← 여기에 실제 프록시 주소:포트 입력!
                    # "username": "proxy_user",             # 필요시 주석 해제
                    # "password": "proxy_pass",
                }
            ]
        )
        print(f"세션 {num_sessions}개 생성 완료 (headless=False, browser='webkit', proxy 적용)")

    async def crawl_hashtag(self, hashtag: str, limit: int = 50):
        hashtag_obj = self.api.hashtag(name=hashtag)
        videos = []
        count = 0
        async for video in hashtag_obj.videos(count=limit):
            info = self.extract_video_info(video)
            if info:
                videos.append(info)
            count += 1
            if count >= limit:
                break
        return videos

    async def crawl_user(self, username: str, limit: int = 50):
        user_obj = self.api.user(username=username)
        videos = []
        count = 0
        async for video in user_obj.videos(count=limit):
            info = self.extract_video_info(video)
            if info:
                videos.append(info)
            count += 1
            if count >= limit:
                break
        return videos

    def extract_video_info(self, video):
        try:
            return {
                'video_id': video.id,
                'desc': video.desc,
                'create_time': video.create_time,
                'author_name': video.author.nickname,
                'author_id': video.author.unique_id,
                'follower_count': getattr(video.author.stats, 'follower_count', 0),
                'digg_count': video.stats.digg_count,
                'comment_count': video.stats.comment_count,
                'share_count': video.stats.share_count,
                'play_count': video.stats.play_count,
                'video_url': video.video.play_addr,
                'cover_url': video.video.cover,
                'music_title': getattr(video.music, 'title', ''),
                'hashtags': [tag.name for tag in getattr(video, 'challenges', [])],
            }
        except Exception as e:
            print(f"데이터 파싱 실패: {e}")
            return None

    def save_to_excel(self, videos, keyword):
        if not videos:
            print("저장할 데이터 없음")
            return ""
        try:
            wb = Workbook()
            ws = wb.active
            ws.title = "TikTok 검색 결과"
            headers = [
                "영상ID", "작성자명", "작성자ID", "팔로워수", "설명",
                "좋아요수", "댓글수", "공유수", "조회수",
                "생성일", "영상링크", "커버링크", "음악", "해시태그"
            ]
            ws.append(headers)
            for video in videos:
                ws.append([
                    video.get('video_id', ''),
                    video.get('author_name', ''),
                    video.get('author_id', ''),
                    video.get('follower_count', ''),
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
            filename = f"TikTok_{keyword}_{len(videos)}개.xlsx"
            wb.save(filename)
            print(f"저장 완료: {filename}")
            return filename
        except Exception as e:
            print(f"Excel 저장 실패: {e}")
            return ""

async def main():
    crawler = TikTokCrawler()
    # 세션 생성 필수!
    await crawler.create_sessions(num_sessions=1)
    keyword = input('해시태그(예: fashion) 입력: ')
    limit = int(input('수집 개수 입력 (최대 50개 권장): '))
    videos = await crawler.crawl_hashtag(keyword, limit)
    crawler.save_to_excel(videos, keyword)

if __name__ == "__main__":
    asyncio.run(main())
