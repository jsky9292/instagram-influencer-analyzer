import requests
import json
import urllib.parse

# 입력: 해시태그명 (공백/한글 가능)
HASHTAG = "fashion"
tag_encoded = urllib.parse.quote(HASHTAG)
cookie_file_path = "ig_cookies.json"

# count, limit 파라미터 붙여보기
url = f"https://i.instagram.com/api/v1/tags/web_info/?tag_name={tag_encoded}&count=100&limit=100"

def cookie_dict_to_str(cookie_dict):
    return "; ".join([f"{k}={v}" for k, v in cookie_dict.items()])

with open(cookie_file_path, "r", encoding="utf-8") as f:
    cookie_dict = json.load(f)
INSTAGRAM_COOKIE = cookie_dict_to_str(cookie_dict)

headers = {
    "User-Agent": "Instagram 219.0.0.12.117 (iPhone12,1; iOS 14_4; ...)",
    "Cookie": INSTAGRAM_COOKIE,
    "X-IG-App-ID": "936619743392459",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9"
}

response = requests.get(url, headers=headers)

print("status_code:", response.status_code)
if response.status_code == 200:
    data = response.json()
    # 인기 게시물
    top_medias = []
    try:
        top_sections = data["data"]["top"]["sections"]
        for section in top_sections:
            medias = section.get("layout_content", {}).get("medias", [])
            for m in medias:
                top_medias.append(m.get("media"))
    except Exception as e:
        print("인기 게시물 파싱 오류:", e)

    # 최신 게시물
    recent_medias = []
    try:
        recent_sections = data["data"]["recent"]["sections"]
        for section in recent_sections:
            medias = section.get("layout_content", {}).get("medias", [])
            for m in medias:
                recent_medias.append(m.get("media"))
    except Exception as e:
        print("최신 게시물 파싱 오류:", e)

    print(f"인기 게시물 개수: {len(top_medias)}")
    print(f"최신 게시물 개수: {len(recent_medias)}")
    # 결과를 파일로 저장(옵션)
    with open(f"ig_webinfo_{HASHTAG}.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("응답 데이터 json 저장 완료.")
else:
    print("에러 응답:", response.text)

# import requests
# import os
# import json
# import time

# username = "matdori.world"
# INSTAGRAM_UA = (
#     "Instagram 219.0.0.12.117 (iPhone12,1; iOS 14_4; en_US; en-US; scale=2.00; 828x1792; 190542906)"
# )
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# cookie_file_path = os.path.join("ig_cookies.json")

# def cookie_dict_to_str(cookie_dict):
#     return "; ".join([f"{k}={v}" for k, v in cookie_dict.items()])

# try:
#     with open(cookie_file_path, "r", encoding="utf-8") as f:
#         cookie_dict = json.load(f)
#     INSTAGRAM_COOKIE = cookie_dict_to_str(cookie_dict)
# except Exception as e:
#     print(f"[ERROR] 쿠키 파일 불러오기 실패: {e}")
#     INSTAGRAM_COOKIE = ""

# url = f"https://i.instagram.com/api/v1/users/web_profile_info/?username={username}"

# headers = {
#     "User-Agent": INSTAGRAM_UA,
#     "Cookie": INSTAGRAM_COOKIE,
#     "Accept": "*/*",
#     "Accept-Language": "en-US,en;q=0.9",
#     "X-IG-App-ID": "936619743392459",
# }

# response = requests.get(url, headers=headers)

# if response.status_code == 200:
#     data = response.json()
#     print("응답 데이터 일부:", str(data)[:300])

#     # 저장
#     output_file_path = os.path.join(BASE_DIR, f"ig_profile_{username}.json")
#     with open(output_file_path, "w", encoding="utf-8") as f:
#         json.dump(data, f, ensure_ascii=False, indent=2)

#     # ---- 게시물 수집 ----
#     try:
#         user_id = data["data"]["user"]["id"]
#     except Exception as e:
#         print("[ERROR] user_id 추출 실패:", e)
#         user_id = None

#     if user_id:
#         all_posts = []
#         max_count = 100
#         next_max_id = None
#         while len(all_posts) < max_count:
#             posts_url = f"https://i.instagram.com/api/v1/feed/user/{user_id}/?count=12"
#             if next_max_id:
#                 posts_url += f"&max_id={next_max_id}"

#             posts_headers = headers.copy()
#             posts_headers["Referer"] = f"https://www.instagram.com/{username}/"
#             posts_resp = requests.get(posts_url, headers=posts_headers)

#             if posts_resp.status_code == 200:
#                 posts_data = posts_resp.json()
#                 items = posts_data.get("items", [])
#                 all_posts.extend(items)
#                 next_max_id = posts_data.get("next_max_id")
#                 print(f"누적 {len(all_posts)}개 수집 (이번에 {len(items)}개)")

#                 if not next_max_id or not items:
#                     break  # 더 이상 게시물이 없음

#                 time.sleep(1)  # 크롤링 간 딜레이(과도한 요청 방지)
#             else:
#                 print(f"[ERROR] 게시물 status_code: {posts_resp.status_code}, message: {posts_resp.text}")
#                 break

#         # 최대 100개까지 자르기
#         all_posts = all_posts[:max_count]
#         posts_file_path = os.path.join(BASE_DIR, f"ig_posts_{username}_max100.json")
#         with open(posts_file_path, "w", encoding="utf-8") as f:
#             json.dump({"items": all_posts}, f, ensure_ascii=False, indent=2)
#         print(f"최종 저장된 게시물 개수: {len(all_posts)}개")
# else:
#     print(f"[ERROR] status_code: {response.status_code}, message: {response.text}")