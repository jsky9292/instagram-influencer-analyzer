
from datetime import datetime
from pathlib import Path
import argparse
import requests
import pandas as pd
import time
import json
from urllib.parse import quote
from cookie_getter import get_instagram_cookies
from fake_useragent import UserAgent
import random
import os


class InstagramCrawler:
    def __init__(self, category, max_count=50, sleep_sec=2.0, output_dir="results", max_user_posts=100, username=None, password=None):
        self.category = category
        self.max_count = max_count
        self.sleep_sec = sleep_sec
        self.base_output_dir = None
        self.USER_AGENTS = UserAgent()
        self.cookie_file_path = "ig_cookies.json"
        self.OUTPUT_DIR = Path(output_dir)
        self.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        self.cookies = None
        self.cookie_header_str = ""
        self.headers = {}
        self.max_user_posts = max_user_posts
        self.username = username
        self.password = password
        self._setup_cookies_and_headers()

    def _cookie_dict_to_str(self, cookie_dict):
        return "; ".join(f"{k}={v}" for k, v in cookie_dict.items())

    def _setup_cookies_and_headers(self):
        if not os.path.exists(self.cookie_file_path):
            print("[INFO] 쿠키 파일이 존재하지 않습니다.")
            # username과 password가 제공되었으면 사용, 아니면 input으로 받기
            if self.username and self.password:
                username = self.username
                password = self.password
                print(f"[INFO] 제공된 계정으로 로그인 시도: {username}")
                
                # 비동기 환경 감지 및 동기 실행
                import asyncio
                try:
                    # 이미 실행 중인 루프가 있는지 확인
                    loop = asyncio.get_running_loop()
                    print("[INFO] 비동기 환경에서 실행 중... 동기 모드로 전환")
                    # 새 스레드에서 동기 함수 실행
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as executor:
                        future = executor.submit(get_instagram_cookies, username, password, self.cookie_file_path)
                        future.result()  # 완료 대기
                except RuntimeError:
                    # 루프가 없으면 일반 동기 실행
                    get_instagram_cookies(username, password, save_path=self.cookie_file_path)
                print("[INFO] 쿠키 파일이 생성되었습니다.")
            else:
                print("[INFO] Instagram 로그인 정보를 입력해주세요.")
                username = input("Instagram 아이디: ").strip()
                password = input("Instagram 비밀번호: ").strip()
                try:
                    get_instagram_cookies(username, password, save_path=self.cookie_file_path)
                    print("[INFO] 쿠키 파일이 생성되었습니다.")
                except Exception as e:
                    print("[에러] 쿠키 생성 실패:", e)
        try:
            with open(self.cookie_file_path, "r") as f:
                self.cookies = json.load(f)
            self.cookie_header_str = self._cookie_dict_to_str(self.cookies)
        except Exception as e:
            print("[에러] 쿠키 파일(ig_cookies.json) 로딩 실패:", e)
            self.cookie_header_str = ""
        self.headers = {
            "x-ig-app-id": "936619743392459",
            "User-Agent": self.USER_AGENTS.random,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "cookie": self.cookie_header_str
        }

    def parse_post_node(self, node):
        media_product_type = node.get('media_product_type', '')
        shortcode = node.get('shortcode', '')
        is_reel = (media_product_type == 'REELS') or ('/reel/' in f"/{shortcode}/")
        like_count = node.get('edge_media_preview_like', {}).get('count', 0)
        comment_count = node.get('edge_media_to_comment', {}).get('count', 0)
        view_count = node.get('video_view_count', None)
        media_type = node.get('__typename', None) or node.get('typename', None)
        thumbnail_url = node.get('display_url', '')
        media_url = thumbnail_url
        video_url = node.get('video_url', None)
        caption = ""
        try:
            caption = node.get('edge_media_to_caption', {}).get('edges', [{}])[0].get('node', {}).get('text', '')
        except Exception:
            pass
        post_type = "reel" if is_reel else "post"
        return {
            'id': node.get('id'),
            'shortcode': shortcode,
            'is_reel': is_reel,
            'post_type': post_type,
            'media_type': media_type,
            'caption': caption,
            'like_count': like_count,
            'comment_count': comment_count,
            'view_count': view_count,
            'thumbnail_url': thumbnail_url,
            'media_url': media_url,
            'video_url': video_url,
            'taken_at_timestamp': node.get('taken_at_timestamp')
        }

    def get_recent_posts_by_tag(self, tag, max_count=50, output_dir=None):
        posts = []
        tag_encoded = quote(tag)
        url = f"https://i.instagram.com/api/v1/tags/web_info/?tag_name={tag_encoded}"
        if output_dir is None:
            output_dir = self.OUTPUT_DIR
        for attempt in range(3):
            try:
                self.headers["User-Agent"] = self.USER_AGENTS.random
                resp = requests.get(url, headers=self.headers)
                if resp.status_code != 200:
                    print(f"[{tag_encoded}] 게시물 수집 실패 (status: {resp.status_code})")
                    return posts
                data = resp.json()
                print(f"[DEBUG] API 응답(일부): {str(data)[:300]}")
                with open(output_dir / f"ig_tag_{tag}_api_response.json", "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                sections = data.get("data", {}).get("top", {}).get("sections", [])
                if not sections:
                    sections = data.get("data", {}).get("recent", {}).get("sections", [])
                if not sections:
                    medias = data.get("data", {}).get("top", {}).get("layout_content", {}).get("medias", [])
                    posts.extend(medias)
                    medias2 = data.get("data", {}).get("recent", {}).get("layout_content", {}).get("medias", [])
                    posts.extend(medias2)
                    print(f"[{tag_encoded}] fallback로 medias에서 {len(posts)}개 추출")
                    return posts[:max_count]
                medias = []
                for sec in sections:
                    medias.extend(sec.get("layout_content", {}).get("medias", []))
                posts.extend(medias)
                return posts[:max_count]
            except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
                print(f"[{tag_encoded}] 요청 또는 JSON 파싱 실패: {e} (재시도 {attempt+1}/3)")
                time.sleep(random.uniform(2,5))
            except Exception as e:
                print(f"[{tag_encoded}] 예기치 않은 오류: {e} (재시도 {attempt+1}/3)")
                time.sleep(random.uniform(2,5))
        return posts

    def extract_usernames_from_posts(self, posts):
        usernames = set()
        for post in posts:
            media = post.get('media', {})
            user = media.get('user', {})
            username = user.get('username')
            if username:
                usernames.add(username)
        return list(usernames)

    def fetch_recent_posts_rest_api(self, username, user_id, max_count=None, headers=None, user_dir=None):
        # max_count가 None이면 self.max_user_posts 사용
        if max_count is None:
            max_count = self.max_user_posts
        all_posts = []
        next_max_id = None
        if headers is None:
            headers = self.headers
        for _ in range((max_count // 12) + 2):
            posts_url = f"https://i.instagram.com/api/v1/feed/user/{user_id}/?count=12"
            if next_max_id:
                posts_url += f"&max_id={next_max_id}"
            posts_headers = headers.copy()
            posts_headers["Referer"] = f"https://www.instagram.com/{username}/"
            resp = requests.get(posts_url, headers=posts_headers)
            if resp.status_code == 200:
                posts_data = resp.json()
                items = posts_data.get("items", [])
                all_posts.extend(items)
                next_max_id = posts_data.get("next_max_id")
                print(f"누적 {len(all_posts)}개 수집 (이번에 {len(items)}개)")
                if not next_max_id or not items or len(all_posts) >= max_count:
                    break
                time.sleep(1)
            else:
                print(f"[ERROR] 게시물 status_code: {resp.status_code}, message: {resp.text}")
                break
        all_posts = all_posts[:max_count]
        if user_dir is not None:
            posts_file_path = user_dir / f"ig_posts_{username}_max{max_count}.json"
        else:
            posts_file_path = self.OUTPUT_DIR / f"ig_posts_{username}_max{max_count}.json"
        with open(posts_file_path, "w", encoding="utf-8") as f:
            json.dump({"items": all_posts}, f, ensure_ascii=False, indent=2)
        print(f"최종 저장된 게시물 개수: {len(all_posts)}개")
        return all_posts

    def scrape_instagram_profile(self, username, user_dir=None):
        url = f"https://i.instagram.com/api/v1/users/web_profile_info/?username={username}"
        for attempt in range(3):
            try:
                self.headers["User-Agent"] = self.USER_AGENTS.random
                resp = requests.get(url, headers=self.headers)
                if resp.status_code != 200:
                    print(f"[{username}] 프로필 수집 실패 (status: {resp.status_code})")
                    return None
                # ★ 추가: 전체 API 응답을 username별로 저장
                if user_dir is not None:
                    with open(user_dir / f"ig_profile_{username}_raw.json", "w", encoding="utf-8") as f:
                        json.dump(resp.json(), f, ensure_ascii=False, indent=2)
                else:
                    with open(self.OUTPUT_DIR / f"ig_profile_{username}_raw.json", "w", encoding="utf-8") as f:
                        json.dump(resp.json(), f, ensure_ascii=False, indent=2)
                data = resp.json().get('data', {}).get('user', {})

                if not data:
                    print(f"[{username}] 데이터 없음 (존재X/비공개/차단일 수 있음)")
                    return None

                profile_info = {
                    'username': username,
                    'full_name': data.get('full_name', ''),
                    'bio': data.get('biography', ''),
                    'is_verified': data.get('is_verified', False),
                    'is_private': data.get('is_private', False),
                    'followers': data.get('edge_followed_by', {}).get('count', 0),
                    'following': data.get('edge_follow', {}).get('count', 0),
                    'posts': data.get('edge_owner_to_timeline_media', {}).get('count', 0),
                    'profile_pic_url': data.get('profile_pic_url_hd', ''),
                    'category': data.get('category_name', ''),
                }
                user_id = data.get('id', None)
                recent_posts = data.get('edge_owner_to_timeline_media', {}).get('edges', [])
                print(f"[DEBUG] {username} recent_posts 개수: {len(recent_posts)}")

                # recent_posts가 없을 경우 REST API(i.instagram.com)로 self.max_user_posts개 수집
                if (not recent_posts) and user_id and (not profile_info['is_private']):
                    print(f"[{username}] REST API로 최근 게시물 fetch 시도 (최대 {self.max_user_posts}개, i.instagram.com 방식)")
                    recent_posts_raw = self.fetch_recent_posts_rest_api(
                        username, user_id, max_count=self.max_user_posts, headers=self.headers, user_dir=user_dir
                    )
                    print(f"[DEBUG] {username} REST API recent_posts 개수: {len(recent_posts_raw)}")
                    # 필요 시 가공
                    parsed_posts = []
                    for post in recent_posts_raw:
                        parsed = {
                            'id': post.get('id'),
                            'shortcode': post.get('code', ''),
                            'is_reel': post.get('media_type', '') == 2,
                            'post_type': 'reel' if post.get('media_type', '') == 2 else 'post',
                            'media_type': post.get('media_type', ''),
                            'caption': post.get('caption', {}).get('text', ''),
                            'like_count': post.get('like_count', 0),
                            'comment_count': post.get('comment_count', 0),
                            'view_count': post.get('view_count', None),
                            'thumbnail_url': post.get('image_versions2', {}).get('candidates', [{}])[0].get('url', ''),
                            'media_url': post.get('image_versions2', {}).get('candidates', [{}])[0].get('url', ''),
                            'video_url': post.get('video_versions', [{}])[0].get('url', None) if post.get('video_versions') else None,
                            'taken_at_timestamp': post.get('taken_at', None)
                        }
                        parsed_posts.append(parsed)
                    recent_posts = parsed_posts
                else:
                    # recent_posts가 API에서 바로 넘어온 경우, parse_post_node로 변환 필요
                    if recent_posts:
                        parsed_posts = []
                        for post in recent_posts:
                            node = post.get('node', {})
                            parsed = self.parse_post_node(node)
                            parsed_posts.append(parsed)
                        recent_posts = parsed_posts

                if recent_posts and profile_info['followers'] > 0:
                    total_likes = sum(post.get('like_count', 0) for post in recent_posts)
                    total_comments = sum(post.get('comment_count', 0) for post in recent_posts)
                    count_posts = len(recent_posts)
                    avg_engagement = (total_likes + total_comments) / count_posts if count_posts > 0 else 0
                    engagement_rate = (avg_engagement / profile_info['followers']) * 100 if profile_info['followers'] > 0 else 0.0
                    profile_info['engagement_rate'] = round(engagement_rate, 2)
                else:
                    profile_info['engagement_rate'] = 0.0 if profile_info['followers'] > 0 else None

                profile_info['ai_grade'], profile_info['ai_score'] = self.get_ai_grade(
                    profile_info.get('followers', 0), profile_info.get('engagement_rate', 0.0)
                )
                # 3. recent_posts_raw는 parse 결과로 저장
                profile_info['recent_posts_raw'] = recent_posts
                return profile_info
            except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
                print(f"[{username}] 요청 또는 JSON 파싱 실패: {e} (재시도 {attempt+1}/3)")
                time.sleep(random.uniform(2,5))
            except Exception as e:
                print(f"[{username}] 예기치 않은 오류: {e} (재시도 {attempt+1}/3)")
                time.sleep(random.uniform(2,5))
        return None

    def get_ai_grade(self, followers, engagement_rate):
        if followers is None:
            followers = 0
        if engagement_rate is None:
            engagement_rate = 0.0
        if followers >= 1000000 and engagement_rate >= 4:
            return "S", 92
        elif followers >= 100000 and engagement_rate >= 2:
            return "A", 85
        elif followers >= 10000 and engagement_rate >= 1:
            return "B", 78
        else:
            return "C", 70

    def run(self):
        today_str = datetime.now().strftime("%Y-%m-%d_%H_%M")
        self.base_output_dir = self.OUTPUT_DIR / f"{today_str}_{self.category}"
        self.base_output_dir.mkdir(parents=True, exist_ok=True)

        print(f"[INFO] 해시태그 #{self.category} 최신 게시물 {self.max_count}개 수집 중...")
        posts = self.get_recent_posts_by_tag(self.category, max_count=self.max_count, output_dir=self.base_output_dir)
        print(f"[INFO] 게시물 {len(posts)}개 수집")

        usernames = self.extract_usernames_from_posts(posts)
        print(f"[INFO] 유니크 계정 {len(usernames)}개 추출")

        results = []
        recent_posts_json = {}
        for i, uname in enumerate(usernames, 1):
            print(f"[{i}/{len(usernames)}] {uname} 프로필 크롤링 중...")
            user_dir = self.base_output_dir / uname
            user_dir.mkdir(exist_ok=True)
            profile = self.scrape_instagram_profile(uname, user_dir=user_dir)
            if profile:
                results.append(profile)
                recent_posts_json[uname] = profile.get('recent_posts_raw', [])
            time.sleep(random.uniform(self.sleep_sec, self.sleep_sec + 2.5))

        if results:
            fname = f"insta_{self.category}_profiles.csv"
            columns = [
                'username', 'full_name', 'bio', 'is_verified', 'is_private',
                'followers', 'following', 'posts', 'profile_pic_url', 'category',
                'engagement_rate', 'ai_grade', 'ai_score'
            ]
            df = pd.DataFrame(results)
            for col in columns:
                if col not in df.columns:
                    df[col] = None
            df = df[columns]
            df.to_csv(self.base_output_dir / fname, index=False, encoding='utf-8-sig')
            print(f"[INFO] {len(results)}개 계정 정보가 {(self.base_output_dir / fname)}에 저장되었습니다.")

            recent_posts_fname = f"insta_{self.category}_recent_posts_full.json"
            with open(self.base_output_dir / recent_posts_fname, "w", encoding="utf-8") as f:
                json.dump(recent_posts_json, f, ensure_ascii=False, indent=2)
            print(f"[INFO] 각 계정별 최근 게시물 원본 데이터가 {(self.base_output_dir / recent_posts_fname)}에 저장되었습니다.")
        else:
            print("수집된 프로필 데이터가 없습니다.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=str, default="results", help="저장할 디렉토리 (기본값: results)")
    parser.add_argument("--max-user-posts", type=int, default=100, help="계정별 최대 게시물 수 (기본값: 100)")
    args, unknown = parser.parse_known_args()
    output_dir = args.output_dir
    max_user_posts = args.max_user_posts

    print("인스타그램 인플루언서 카테고리(해시태그) 크롤러")
    category = input("크롤링할 카테고리(해시태그, 예: fashion, 헬스, 여행 등)를 입력하세요: ").strip().replace("#", "")
    if not category:
        print("카테고리를 입력해주세요.")
        exit(1)
    try:
        max_count = int(input("수집할 게시물(작성자) 최대 개수 (기본 50): ") or "50")
    except:
        max_count = 50
    try:
        sleep_sec = float(input("요청 간 딜레이(초, 기본 2.0): ") or "2.0")
    except:
        sleep_sec = 2.0
    try:
        max_user_posts = int(input("계정별 최대 게시물 수 (기본 100): ") or "100")
    except:
        max_user_posts = 100
    crawler = InstagramCrawler(category, max_count=max_count, sleep_sec=sleep_sec, output_dir=output_dir, max_user_posts=max_user_posts)
    crawler.run()