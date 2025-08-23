#!/usr/bin/env python3
"""
FastAPI 기반 Instagram 실시간 크롤링 API 서버
"""

from fastapi import FastAPI, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
import uvicorn
import json
import asyncio
import sys
import os
import random
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd

# API 디렉토리를 Python 경로에 추가
api_path = Path(__file__).parent
sys.path.insert(0, str(api_path.parent))

# 인증 모듈 추가
from api.auth import (
    UserSignup, UserLogin, Token, 
    create_user, authenticate_user, create_access_token,
    get_current_user, update_last_login, save_user_data,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Instagram 크롤러 추가
instagram_path = Path(__file__).parent.parent.parent / "instagram"
sys.path.append(str(instagram_path))

# Config 파일 경로
CONFIG_PATH = instagram_path / "config.json"

try:
    from InstagramCrawler import InstagramCrawler
except ImportError:
    print("Instagram 크롤러를 찾을 수 없습니다. 경로를 확인해주세요.")

# Gemini 분석기 추가
try:
    from api.gemini_analyzer import GeminiAnalyzer, InfluencerProfile
    # API 키가 없으면 None으로 설정
    gemini_analyzer = None
    try:
        gemini_analyzer = GeminiAnalyzer()
    except ValueError as ve:
        print(f"Gemini 분석기를 초기화할 수 없습니다 (API 키가 필요): {ve}")
    except Exception as e:
        print(f"Gemini 분석기 초기화 오류: {e}")
except ImportError as e:
    print(f"Gemini 분석기를 로드할 수 없습니다: {e}")
    gemini_analyzer = None

# Config 파일 로드
def load_config():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

config = load_config()

app = FastAPI(title="Instagram Influencer Realtime Crawling API")

# CORS 설정 - 개발 환경에서는 모든 출처 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 출처 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Instagram Influencer Realtime Crawling API"}

# 해시태그 번역 딕셔너리
HASHTAG_TRANSLATIONS = {
    # 한국어 -> 영어 (기본)
    "먹방": "food",
    "맛집": "foodie",
    "여행": "travel",
    "패션": "fashion",
    "뷰티": "beauty",
    "화장품": "cosmetics",
    "운동": "fitness",
    "일상": "daily",
    "카페": "cafe",
    "요리": "cooking",
    "음식": "food",
    "요가": "yoga",
    "헬스": "gym",
    "메이크업": "makeup",
    "스킨케어": "skincare",
    "홈트": "homeworkout",
    "다이어트": "diet",
    "브이로그": "vlog",
    "데일리": "daily",
    "쇼핑": "shopping",
    
    # 국가별 번역 추가
    "kr": {
        "먹방": "먹방",
        "맛집": "맛집",
        "여행": "여행",
        "패션": "패션",
        "뷰티": "뷰티",
        "운동": "운동",
        "일상": "일상"
    },
    "us": {
        "먹방": "foodstagram",
        "맛집": "foodie",
        "여행": "travel",
        "패션": "fashion",
        "뷰티": "beauty",
        "운동": "fitness",
        "일상": "lifestyle"
    },
    "jp": {
        "먹방": "グルメ",
        "맛집": "美食",
        "여행": "旅行",
        "패션": "ファッション",
        "뷰티": "ビューティー",
        "운동": "フィットネス",
        "일상": "日常"
    },
    "cn": {
        "먹방": "美食",
        "맛집": "吃货",
        "여행": "旅游",
        "패션": "时尚",
        "뷰티": "美妆",
        "운동": "健身",
        "일상": "日常"
    },
    "id": {  # 인도네시아
        "먹방": "makanan",
        "맛집": "kuliner",
        "여행": "travel",
        "패션": "fashion",
        "뷰티": "beauty",
        "운동": "fitness",
        "일상": "daily",
        "카페": "kafe",
        "요리": "masak",
        "음식": "makanan",
        "요가": "yoga",
        "헬스": "gym",
        "메이크업": "makeup",
        "스킨케어": "skincare",
        "홈트": "homeworkout",
        "다이어트": "diet",
        "브이로그": "vlog",
        "데일리": "daily",
        "쇼핑": "belanja"
    },
    "th": {  # 태국
        "먹방": "อาหาร",
        "맛집": "ร้านอร่อย",
        "여행": "ท่องเที่ยว",
        "패션": "แฟชั่น",
        "뷰티": "ความงาม",
        "운동": "ฟิตเนส",
        "일상": "ชีวิตประจำวัน",
        "카페": "คาเฟ่",
        "요리": "ทำอาหาร",
        "음식": "อาหาร"
    },
    "vn": {  # 베트남
        "먹방": "ăn",
        "맛집": "quánngon",
        "여행": "dulich",
        "패션": "thoitrang",
        "뷰티": "lamdep",
        "운동": "thethao",
        "일상": "cuocsong",
        "카페": "cafe",
        "요리": "nauan",
        "음식": "amthuc"
    },
    "ph": {  # 필리핀
        "먹방": "foodtrip",
        "맛집": "foodie",
        "여행": "travel",
        "패션": "fashion",
        "뷰티": "beauty",
        "운동": "fitness",
        "일상": "lifestyle",
        "카페": "cafe",
        "요리": "cooking",
        "음식": "food"
    },
    "my": {  # 말레이시아
        "먹방": "makanan",
        "맛집": "foodhunt",
        "여행": "travel",
        "패션": "fesyen",
        "뷰티": "kecantikan",
        "운동": "fitness",
        "일상": "harian",
        "카페": "kafe",
        "요리": "masakan",
        "음식": "makanan"
    },
    "sg": {  # 싱가포르
        "먹방": "foodstagram",
        "맛집": "sgfood",
        "여행": "travel",
        "패션": "fashion",
        "뷰티": "beauty",
        "운동": "fitness",
        "일상": "lifestyle",
        "카페": "sgcafe",
        "요리": "cooking",
        "음식": "food"
    }
}

def translate_hashtag(hashtag: str, target_country: str = "us"):
    """해시태그를 타겟 국가 언어로 번역"""
    # 한국어 입력이고 한국이 아닌 다른 나라를 선택한 경우
    if target_country != "kr":
        # 국가별 번역 확인 - dict 타입인 경우에만
        if target_country in HASHTAG_TRANSLATIONS and isinstance(HASHTAG_TRANSLATIONS.get(target_country), dict):
            country_translations = HASHTAG_TRANSLATIONS[target_country]
            if hashtag in country_translations:
                return country_translations[hashtag]
        
        # 기본 영어 번역 확인 - string 타입인 경우에만
        if hashtag in HASHTAG_TRANSLATIONS:
            value = HASHTAG_TRANSLATIONS[hashtag]
            if isinstance(value, str):
                return value
    
    # 한국 선택시 또는 번역이 없으면 원본 반환
    return hashtag

@app.post("/crawl")
async def crawl_hashtag(request: dict):
    """해시태그 기반 실시간 인플루언서 크롤링"""
    
    hashtag = request.get("hashtag", "").strip()
    max_count = request.get("max_count", 20)
    max_user_posts = request.get("max_user_posts", 50)
    target_country = request.get("target_country", "kr")
    
    if not hashtag:
        raise HTTPException(status_code=400, detail="해시태그가 필요합니다")
    
    # 해시태그 번역
    translated_hashtag = translate_hashtag(hashtag, target_country)
    print(f"[번역] {hashtag} ({target_country}) -> {translated_hashtag}")
    
    async def generate_stream():
        try:
            # 진행 상황 표시
            yield f"data: {json.dumps({'progress': f'#{hashtag} → #{translated_hashtag} 번역 완료'})}\n\n"
            await asyncio.sleep(0.3)
            
            # 실제 크롤링 시도
            yield f"data: {json.dumps({'progress': f'#{translated_hashtag} 해시태그 실시간 크롤링 시작...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # 환경변수에서 인증 정보 가져오기 (Render.com)
            username = os.environ.get('INSTAGRAM_USERNAME')
            password = os.environ.get('INSTAGRAM_PASSWORD')
            
            # 환경변수가 없으면 config.json 사용 (로컬 개발용)
            if not username or not password:
                if config and 'instagram' in config:
                    username = config['instagram']['username']
                    password = config['instagram']['password']
                else:
                    yield f"data: {json.dumps({'error': 'Instagram 인증 정보가 없습니다. 환경변수를 설정해주세요.'})}\n\n"
                    return
            
            yield f"data: {json.dumps({'progress': '크롤러 초기화 중...'})}\n\n"
            await asyncio.sleep(0.1)
            
            # 크롤러 초기화 (번역된 해시태그 사용)
            crawler = InstagramCrawler(
                category=translated_hashtag,  # 번역된 해시태그 사용
                max_count=max_count,
                sleep_sec=1.0,
                output_dir="temp_results",
                max_user_posts=max_user_posts,
                username=username,
                password=password
            )
            
            # 실제 크롤링 실행
            loop = asyncio.get_event_loop()
            
            yield f"data: {json.dumps({'progress': f'#{translated_hashtag} 게시물 수집 중... (최대 {max_count}개)'})}\n\n"
            await asyncio.sleep(0.1)
            
            # 게시물 수집 (번역된 해시태그 사용)
            posts = await loop.run_in_executor(
                None, 
                crawler.get_recent_posts_by_tag, 
                translated_hashtag,  # 번역된 해시태그 사용
                max_count, 
                None
            )
            
            if not posts:
                yield f"data: {json.dumps({'error': f'#{translated_hashtag} 해시태그에서 게시물을 찾을 수 없습니다.'})}\n\n"
                return
            
            yield f"data: {json.dumps({'progress': f'게시물 {len(posts)}개 수집 완료'})}\n\n"
            await asyncio.sleep(0.1)
            
            # 사용자 추출
            yield f"data: {json.dumps({'progress': '인플루언서 계정 추출 중...'})}\n\n"
            await asyncio.sleep(0.1)
            
            usernames = crawler.extract_usernames_from_posts(posts)
            
            yield f"data: {json.dumps({'progress': f'유니크 계정 {len(usernames)}개 발견'})}\n\n"
            await asyncio.sleep(0.1)
            
            # 프로필 수집
            results = []
            for i, uname in enumerate(usernames, 1):
                if i > max_count:
                    break
                    
                yield f"data: {json.dumps({'progress': f'[{i}/{min(len(usernames), max_count)}] @{uname} 프로필 분석 중...'})}\n\n"
                await asyncio.sleep(0.1)
                
                try:
                    profile = await loop.run_in_executor(
                        None,
                        crawler.scrape_instagram_profile,
                        uname,
                        None
                    )
                    
                    if profile:
                        # recent_posts_raw 제거 (용량 절약)
                        if 'recent_posts_raw' in profile:
                            del profile['recent_posts_raw']
                        results.append(profile)
                        
                except Exception as e:
                    print(f"프로필 수집 오류 ({uname}): {e}")
                    continue
                
                # 너무 빠르면 차단될 수 있으므로 딜레이
                await asyncio.sleep(1)
            
            # 최종 결과 전송
            yield f"data: {json.dumps({'progress': f'✅ 크롤링 완료! {len(results)}명의 인플루언서 정보 수집'})}\n\n"
            await asyncio.sleep(0.1)
            
            yield f"data: {json.dumps({'result': results})}\n\n"
            yield f"data: [DONE]\n\n"
            
        except Exception as e:
            import traceback
            error_msg = f"크롤링 중 오류 발생: {str(e)}"
            print(f"ERROR: {error_msg}")
            print(f"ERROR TYPE: {type(e)}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.post("/analyze/user")
async def analyze_user(request: dict):
    """특정 인플루언서 상세 분석"""
    username = request.get("username", "").strip().replace("@", "")
    
    if not username:
        raise HTTPException(status_code=400, detail="인플루언서 ID가 필요합니다")
    
    async def generate_stream():
        try:
            yield f"data: {json.dumps({'progress': f'@{username} 프로필 분석 시작...'})}\n\n"
            await asyncio.sleep(0.5)
            
            # 환경변수에서 인증 정보 가져오기 (Render.com)
            username_auth = os.environ.get('INSTAGRAM_USERNAME')
            password = os.environ.get('INSTAGRAM_PASSWORD')
            
            # 환경변수가 없으면 config.json 사용 (로컬 개발용)
            if not username_auth or not password:
                if config and 'instagram' in config:
                    username_auth = config['instagram']['username']
                    password = config['instagram']['password']
                else:
                    yield f"data: {json.dumps({'error': 'Instagram 인증 정보가 없습니다. 환경변수를 설정해주세요.'})}\n\n"
                    return
            
            # 크롤러 초기화
            crawler = InstagramCrawler(
                category="user_analysis",
                max_count=1,
                sleep_sec=1.0,
                output_dir="temp_results",
                max_user_posts=50,  # 더 많은 게시물 분석
                username=username_auth,
                password=password
            )
            
            loop = asyncio.get_event_loop()
            
            yield f"data: {json.dumps({'progress': f'@{username} 프로필 정보 수집 중...'})}\n\n"
            await asyncio.sleep(0.5)
            
            # 프로필 정보 수집
            profile = await loop.run_in_executor(
                None,
                crawler.scrape_instagram_profile,
                username,
                None
            )
            
            if not profile:
                yield f"data: {json.dumps({'error': f'@{username} 프로필을 찾을 수 없습니다.'})}\n\n"
                return
            
            # 상세 분석 수행
            yield f"data: {json.dumps({'progress': f'최근 50개 게시물 분석 중...'})}\n\n"
            await asyncio.sleep(0.5)
            
            # 게시물에서 해시태그 추출 및 분석
            posts = profile.get('recent_posts_raw', [])
            hashtag_analysis = {}
            music_analysis = {}
            posting_times = []
            engagement_by_type = {'reel': [], 'post': []}
            
            for post in posts[:50]:  # 최근 50개 게시물 분석
                # 해시태그 추출
                caption = post.get('caption', '')
                hashtags = [tag.strip() for tag in caption.split() if tag.startswith('#')]
                for tag in hashtags:
                    hashtag_analysis[tag] = hashtag_analysis.get(tag, 0) + 1
                
                # 음악 정보
                music_info = post.get('music')
                if music_info:
                    # music이 dict인 경우 title이나 문자열로 변환
                    if isinstance(music_info, dict):
                        music_key = music_info.get('title', str(music_info))
                    else:
                        music_key = str(music_info)
                    music_analysis[music_key] = music_analysis.get(music_key, 0) + 1
                
                # 게시 시간 분석
                if post.get('taken_at_timestamp'):
                    posting_times.append(post['taken_at_timestamp'])
                
                # 타입별 참여율
                engagement = post.get('like_count', 0) + post.get('comment_count', 0)
                if post.get('is_reel'):
                    engagement_by_type['reel'].append(engagement)
                else:
                    engagement_by_type['post'].append(engagement)
            
            # 분석 결과 정리
            analysis = {
                'profile': profile,
                'hashtag_analysis': dict(sorted(hashtag_analysis.items(), key=lambda x: x[1], reverse=True)[:30]),
                'music_analysis': dict(sorted(music_analysis.items(), key=lambda x: x[1], reverse=True)[:10]),
                'avg_reel_engagement': sum(engagement_by_type['reel']) / len(engagement_by_type['reel']) if engagement_by_type['reel'] else 0,
                'avg_post_engagement': sum(engagement_by_type['post']) / len(engagement_by_type['post']) if engagement_by_type['post'] else 0,
                'total_posts_analyzed': len(posts),
                'posting_frequency': calculate_posting_frequency(posting_times),
                'best_performing_posts': sorted(posts, key=lambda x: x.get('like_count', 0) + x.get('comment_count', 0), reverse=True)[:5]
            }
            
            yield f"data: {json.dumps({'progress': '✅ 분석 완료!'})}\n\n"
            yield f"data: {json.dumps({'result': analysis})}\n\n"
            yield f"data: [DONE]\n\n"
            
        except Exception as e:
            import traceback
            error_msg = f"분석 중 오류: {str(e)}"
            print(f"ERROR in /analyze/user: {error_msg}")
            print(f"ERROR TYPE: {type(e)}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

def calculate_posting_frequency(timestamps):
    """게시물 빈도 계산"""
    if len(timestamps) < 2:
        return "데이터 부족"
    
    timestamps.sort()
    intervals = []
    for i in range(1, len(timestamps)):
        interval_days = (timestamps[i] - timestamps[i-1]) / 86400
        intervals.append(interval_days)
    
    if intervals:
        avg_interval = sum(intervals) / len(intervals)
        if avg_interval < 1:
            return "하루 여러 번"
        elif avg_interval < 3:
            return f"약 {avg_interval:.1f}일마다"
        elif avg_interval < 7:
            return "주 2-3회"
        elif avg_interval < 14:
            return "주 1회"
        else:
            return f"약 {avg_interval:.0f}일마다"
    return "알 수 없음"

@app.get("/influencer/{username}/posts")
async def get_influencer_posts(username: str):
    """인플루언서의 게시물 상세 정보 조회"""
    
    # 실제 크롤링 시도
    try:
        if not config or 'instagram' not in config:
            raise HTTPException(status_code=500, detail="Instagram 인증 정보가 없습니다")
        
        username_auth = config['instagram']['username']
        password = config['instagram']['password']
        
        # 크롤러 초기화
        crawler = InstagramCrawler(
            category="posts",
            max_count=1,
            sleep_sec=1.0,
            output_dir="temp_results",
            max_user_posts=30,
            username=username_auth,
            password=password
        )
        
        # 프로필 정보 수집
        profile = crawler.scrape_instagram_profile(username, None)
        
        if profile and 'recent_posts_raw' in profile:
            posts = profile['recent_posts_raw'][:30]
            # 해시태그 추출
            for post in posts:
                caption = post.get('caption', '')
                hashtags = [tag.strip() for tag in caption.split() if tag.startswith('#')]
                post['hashtags'] = hashtags
            
            return {"username": username, "posts": posts}
        else:
            # 프로필을 찾을 수 없으면 더미 데이터 반환
            return {"username": username, "posts": []}
    except Exception as e:
        print(f"Error fetching posts: {e}")
        return {"username": username, "posts": []}

# 바이럴 분석 엔진 임포트
from api.viral_analyzer import (
    ViralContentAnalyzer,
    analyze_viral_content as analyze_content,
    generate_ai_content_ideas,
    predict_content_performance
)

@app.post("/analyze/viral-content")
async def analyze_viral_content(request: dict):
    """특정 게시물의 바이럴 요인 분석 및 콘텐츠 아이디어 생성"""
    username = request.get("username", "").strip().replace("@", "")
    post_url = request.get("post_url", "")
    
    if not username:
        raise HTTPException(status_code=400, detail="인플루언서 ID가 필요합니다")
    
    async def generate_stream():
        try:
            yield f"data: {json.dumps({'progress': f'@{username} 콘텐츠 분석 시작...'})}\n\n"
            await asyncio.sleep(0.5)
            
            # 환경변수에서 인증 정보 가져오기 (Render.com)
            username_auth = os.environ.get('INSTAGRAM_USERNAME')
            password = os.environ.get('INSTAGRAM_PASSWORD')
            
            # 환경변수가 없으면 config.json 사용 (로컬 개발용)
            if not username_auth or not password:
                if config and 'instagram' in config:
                    username_auth = config['instagram']['username']
                    password = config['instagram']['password']
                else:
                    yield f"data: {json.dumps({'error': 'Instagram 인증 정보가 없습니다. 환경변수를 설정해주세요.'})}\n\n"
                    return
            
            # 크롤러 초기화
            crawler = InstagramCrawler(
                category="viral_analysis",
                max_count=1,
                sleep_sec=1.0,
                output_dir="temp_results",
                max_user_posts=30,
                username=username_auth,
                password=password
            )
            
            loop = asyncio.get_event_loop()
            
            # 프로필과 게시물 정보 수집
            yield f"data: {json.dumps({'progress': f'인기 게시물 수집 중...'})}\n\n"
            await asyncio.sleep(0.5)
            
            profile = await loop.run_in_executor(
                None,
                crawler.scrape_instagram_profile,
                username,
                None
            )
            
            if not profile:
                yield f"data: {json.dumps({'error': f'@{username} 프로필을 찾을 수 없습니다.'})}\n\n"
                return
            
            posts = profile.get('recent_posts_raw', [])[:30]
            
            # 바이럴 게시물 식별 (평균 대비 2배 이상 참여율)
            avg_engagement = sum(p.get('like_count', 0) + p.get('comment_count', 0) for p in posts) / len(posts) if posts else 0
            viral_posts = [p for p in posts if (p.get('like_count', 0) + p.get('comment_count', 0)) > avg_engagement * 2]
            
            if not viral_posts:
                viral_posts = sorted(posts, key=lambda x: x.get('like_count', 0) + x.get('comment_count', 0), reverse=True)[:5]
            
            yield f"data: {json.dumps({'progress': f'{len(viral_posts)}개 인기 게시물 분석 중...'})}\n\n"
            await asyncio.sleep(0.5)
            
            # 바이럴 요인 분석
            viral_analysis = []
            for post in viral_posts[:3]:
                caption = post.get('caption', '')
                hashtags = [tag.strip() for tag in caption.split() if tag.startswith('#')]
                
                # 성공 요인 분석
                success_factors = analyze_success_factors(post, avg_engagement, profile.get('followers', 0))
                
                # 카피라이팅 아이디어 생성
                copy_ideas = generate_copy_ideas(post, hashtags, success_factors)
                
                # 영상 아이디어 생성
                video_ideas = generate_video_ideas(post, success_factors)
                
                viral_analysis.append({
                    'post': {
                        'shortcode': post.get('shortcode', ''),
                        'caption': caption[:200] + '...' if len(caption) > 200 else caption,
                        'like_count': post.get('like_count', 0),
                        'comment_count': post.get('comment_count', 0),
                        'engagement_rate': ((post.get('like_count', 0) + post.get('comment_count', 0)) / profile.get('followers', 1) * 100),
                        'is_reel': post.get('is_reel', False),
                        'hashtags': hashtags[:10],
                        'media_url': post.get('media_url', ''),
                    },
                    'success_factors': success_factors,
                    'copy_ideas': copy_ideas,
                    'video_ideas': video_ideas
                })
            
            # 전체 트렌드 분석
            overall_insights = {
                'best_time_to_post': analyze_best_posting_time(viral_posts),
                'optimal_hashtag_count': analyze_optimal_hashtag_count(viral_posts),
                'content_type_performance': {
                    'reels': sum(1 for p in viral_posts if p.get('is_reel')) / len(viral_posts) * 100 if viral_posts else 0,
                    'posts': sum(1 for p in viral_posts if not p.get('is_reel')) / len(viral_posts) * 100 if viral_posts else 0
                },
                'engagement_triggers': analyze_engagement_triggers(viral_posts),
                'content_strategy': generate_content_strategy(profile, viral_posts)
            }
            
            result = {
                'profile': {
                    'username': profile.get('username', ''),
                    'followers': profile.get('followers', 0),
                    'avg_engagement': avg_engagement
                },
                'viral_analysis': viral_analysis,
                'overall_insights': overall_insights
            }
            
            yield f"data: {json.dumps({'progress': '✅ 바이럴 콘텐츠 분석 완료!'})}\n\n"
            yield f"data: {json.dumps({'result': result})}\n\n"
            yield f"data: [DONE]\n\n"
            
        except Exception as e:
            import traceback
            error_msg = f"분석 중 오류: {str(e)}"
            print(f"ERROR in /analyze/user: {error_msg}")
            print(f"ERROR TYPE: {type(e)}")
            print(f"TRACEBACK: {traceback.format_exc()}")
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

def analyze_success_factors(post, avg_engagement, followers):
    """게시물의 성공 요인 분석"""
    factors = []
    engagement = post.get('like_count', 0) + post.get('comment_count', 0)
    caption = post.get('caption', '')
    
    # 참여율 분석
    engagement_rate = (engagement / followers * 100) if followers > 0 else 0
    if engagement_rate > 5:
        factors.append(f"🔥 매우 높은 참여율 ({engagement_rate:.1f}%)")
    elif engagement_rate > 2:
        factors.append(f"✨ 높은 참여율 ({engagement_rate:.1f}%)")
    
    # 캡션 분석
    if '?' in caption:
        factors.append("❓ 질문으로 참여 유도")
    if any(emoji in caption for emoji in ['😍', '❤️', '🔥', '😂', '🤣']):
        factors.append("😊 감정적 이모지 사용")
    if len(caption) < 100:
        factors.append("📝 간결한 캡션")
    elif len(caption) > 500:
        factors.append("📖 스토리텔링 캡션")
    
    # 해시태그 분석
    hashtags = [tag for tag in caption.split() if tag.startswith('#')]
    if 5 <= len(hashtags) <= 10:
        factors.append(f"#️⃣ 최적 해시태그 수 ({len(hashtags)}개)")
    
    # 콘텐츠 타입
    if post.get('is_reel'):
        factors.append("🎬 릴스 콘텐츠 (높은 도달률)")
    
    # 시간대 (가정)
    if post.get('taken_at_timestamp'):
        hour = datetime.fromtimestamp(post['taken_at_timestamp']).hour
        if 19 <= hour <= 21:
            factors.append("⏰ 골든타임 게시 (19-21시)")
    
    return factors

def generate_copy_ideas(post, hashtags, success_factors):
    """카피라이팅 아이디어 생성"""
    ideas = []
    caption = post.get('caption', '')
    
    # 후크 아이디어
    if "질문" in str(success_factors):
        ideas.append({
            'type': '질문 후크',
            'template': '당신도 [주제]에 대해 이런 경험 있나요?',
            'example': caption[:50] if '?' in caption else '이런 상황 공감되시나요?'
        })
    
    # 감정 어필
    if "감정" in str(success_factors):
        ideas.append({
            'type': '감정 어필',
            'template': '[감정 이모지] + 공감 문구 + 개인 스토리',
            'example': '😍 이거 보고 심쿵했어요... 여러분도 그러시죠?'
        })
    
    # CTA (Call to Action)
    ideas.append({
        'type': 'CTA 강화',
        'template': '댓글로 여러분의 [주제] 알려주세요!',
        'example': '댓글로 여러분만의 꿀팁 공유해주세요! 💬'
    })
    
    # 스토리텔링
    if len(caption) > 200:
        ideas.append({
            'type': '미니 스토리',
            'template': '상황 설정 → 갈등/문제 → 해결 → 교훈',
            'example': '어제 일어난 일인데... (시작) → 문제 발생 → 이렇게 해결 → 배운 점'
        })
    
    return ideas

def generate_video_ideas(post, success_factors):
    """영상 아이디어 생성"""
    ideas = []
    
    if post.get('is_reel'):
        ideas.append({
            'type': '후크 강화',
            'technique': '첫 3초 임팩트',
            'suggestion': '시작부터 강렬한 비주얼이나 질문으로 시선 끌기',
            'example': '"잠깐! 이거 안 보면 후회해요" 같은 텍스트 오버레이'
        })
        
        ideas.append({
            'type': '트렌드 활용',
            'technique': '인기 음악/챌린지',
            'suggestion': '현재 유행하는 음악이나 챌린지 형식 활용',
            'example': '특정 비트에 맞춰 전환되는 비포/애프터'
        })
    
    ideas.append({
        'type': '시각적 스토리텔링',
        'technique': '단계별 공개',
        'suggestion': '호기심을 유발하는 순차적 정보 공개',
        'example': '1단계 → 2단계 → 최종 결과물 공개'
    })
    
    ideas.append({
        'type': '인터랙션 유도',
        'technique': '참여형 콘텐츠',
        'suggestion': '시청자가 직접 선택하거나 참여하도록 유도',
        'example': '"어떤 걸 선택하시겠어요? A vs B" 형식'
    })
    
    return ideas

def analyze_best_posting_time(posts):
    """최적 게시 시간 분석"""
    if not posts:
        return "데이터 부족"
    
    times = []
    for post in posts:
        if post.get('taken_at_timestamp'):
            hour = datetime.fromtimestamp(post['taken_at_timestamp']).hour
            times.append(hour)
    
    if times:
        avg_hour = sum(times) // len(times)
        return f"{avg_hour}시 ~ {avg_hour+2}시"
    return "19시 ~ 21시 (일반적 골든타임)"

def analyze_optimal_hashtag_count(posts):
    """최적 해시태그 개수 분석"""
    hashtag_counts = []
    for post in posts:
        caption = post.get('caption', '')
        hashtags = [tag for tag in caption.split() if tag.startswith('#')]
        hashtag_counts.append(len(hashtags))
    
    if hashtag_counts:
        avg_count = sum(hashtag_counts) // len(hashtag_counts)
        return f"{max(5, avg_count-2)} ~ {min(15, avg_count+2)}개"
    return "7 ~ 10개"

def analyze_engagement_triggers(posts):
    """참여 유발 요소 분석"""
    triggers = []
    
    for post in posts:
        caption = post.get('caption', '')
        if '?' in caption:
            triggers.append("질문")
        if any(word in caption.lower() for word in ['공감', '같이', '함께', '여러분']):
            triggers.append("공감 유도")
        if any(emoji in caption for emoji in ['🎁', '🎉', '🎊']):
            triggers.append("이벤트/혜택")
    
    return list(set(triggers)) if triggers else ["시각적 임팩트", "트렌드 활용"]

def generate_content_strategy(profile, viral_posts):
    """콘텐츠 전략 생성"""
    strategy = {
        'posting_frequency': '주 3-4회 일정한 시간대',
        'content_mix': '릴스 60% + 일반 게시물 40%',
        'engagement_tactics': [
            '게시물 마지막에 항상 질문 포함',
            '스토리에서 게시물 홍보 및 투표 기능 활용',
            '댓글에 적극적으로 답변하여 알고리즘 부스트'
        ],
        'growth_tips': [
            '일관된 비주얼 스타일 유지',
            '시리즈물로 팔로워 재방문 유도',
            '다른 크리에이터와 콜라보'
        ]
    }
    
    return strategy

@app.post("/export/csv")
async def export_csv(request: dict):
    """크롤링 결과를 CSV로 다운로드"""
    data = request.get("data", [])
    
    if not data:
        raise HTTPException(status_code=400, detail="내보낼 데이터가 없습니다")
    
    # CSV 파일 생성
    import csv
    from io import StringIO
    
    output = StringIO()
    if data:
        fieldnames = ['username', 'full_name', 'followers', 'following', 'posts', 
                     'engagement_rate', 'is_verified', 'category', 'ai_grade', 'ai_score', 'bio']
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for item in data:
            row = {
                'username': item.get('username', ''),
                'full_name': item.get('full_name', ''),
                'followers': item.get('followers', 0),
                'following': item.get('following', 0),
                'posts': item.get('posts', 0),
                'engagement_rate': item.get('engagement_rate', 0),
                'is_verified': item.get('is_verified', False),
                'category': item.get('category', ''),
                'ai_grade': item.get('ai_grade', ''),
                'ai_score': item.get('ai_score', 0),
                'bio': item.get('bio', '').replace('\n', ' ')
            }
            writer.writerow(row)
    
    # CSV 파일 저장
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"influencers_{timestamp}.csv"
    filepath = Path(f"temp_results/{filename}")
    filepath.parent.mkdir(exist_ok=True)
    
    with open(filepath, 'w', encoding='utf-8-sig', newline='') as f:
        f.write(output.getvalue())
    
    return FileResponse(
        filepath,
        media_type="text/csv",
        filename=filename,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@app.post("/auth/signup")
async def signup(user_data: UserSignup):
    """회원가입"""
    user = create_user(user_data)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="이미 존재하는 이메일 또는 사용자명입니다."
        )
    
    # 자동 로그인을 위한 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_info={
            'username': user['username'],
            'email': user['email'],
            'full_name': user['full_name']
        }
    )

@app.post("/auth/login")
async def login(form_data: UserLogin):
    """로그인"""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 마지막 로그인 시간 업데이트
    update_last_login(form_data.username)
    
    # 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_info={
            'username': user['username'],
            'email': user['email'],
            'full_name': user['full_name'],
            'usage_count': user['usage_count'],
            'is_admin': user['username'] == 'jsky9292'  # 관리자 확인
        }
    )

@app.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """현재 사용자 정보"""
    return {
        'username': current_user['username'],
        'email': current_user['email'],
        'full_name': current_user['full_name'],
        'usage_count': current_user['usage_count'],
        'created_at': current_user['created_at']
    }

@app.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """전체 회원 목록 조회 (관리자 전용)"""
    # 관리자 권한 확인
    if current_user['username'] != 'jsky9292':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다"
        )
    
    # SQLite 연결
    import sqlite3
    conn = sqlite3.connect(Path(__file__).parent / "users.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 모든 사용자 조회
    cursor.execute("""
        SELECT id, username, email, full_name, created_at, last_login, usage_count, is_active
        FROM users
        ORDER BY created_at DESC
    """)
    
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    # 통계 계산
    total_users = len(users)
    active_users = sum(1 for u in users if u.get('is_active', 1))
    total_usage = sum(u.get('usage_count', 0) for u in users)
    
    return {
        "users": users,
        "stats": {
            "total_users": total_users,
            "active_users": active_users,
            "total_usage": total_usage,
            "avg_usage": total_usage / total_users if total_users > 0 else 0
        }
    }

@app.post("/auth/save-search")
async def save_search(
    search_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """검색 기록 저장"""
    save_user_data(current_user['username'], 'search', search_data)
    return {"message": "검색 기록이 저장되었습니다."}

@app.post("/auth/save-influencer")
async def save_influencer(
    influencer_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """인플루언서 저장"""
    save_user_data(current_user['username'], 'influencer', influencer_data)
    return {"message": "인플루언서가 저장되었습니다."}

@app.post("/api/viral/analyze")
async def viral_analysis_endpoint(request: dict):
    """바이럴 콘텐츠 심층 분석"""
    try:
        analyzer = ViralContentAnalyzer()
        
        # 콘텐츠 데이터 구성
        content_data = {
            'type': request.get('type', 'post'),
            'caption': request.get('caption', ''),
            'hashtags': request.get('hashtags', []),
            'likes': request.get('likes', 0),
            'comments': request.get('comments', 0),
            'shares': request.get('shares', 0),
            'saves': request.get('saves', 0),
            'timestamp': request.get('timestamp', datetime.now().isoformat())
        }
        
        # 바이럴 분석 수행
        analysis = analyzer.analyze_content(content_data)
        
        return {
            'success': True,
            'analysis': {
                'viral_probability': round(analysis.viral_probability * 100, 1),
                'success_factors': analysis.success_factors,
                'improvement_suggestions': analysis.improvement_suggestions,
                'hashtag_strategy': analysis.hashtag_strategy,
                'caption_analysis': analysis.caption_analysis,
                'engagement_patterns': analysis.engagement_patterns,
                'visual_elements': analysis.visual_elements,
                'posting_time': analysis.posting_time
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/content/ideas")
async def generate_content_ideas_endpoint(request: dict):
    """AI 기반 콘텐츠 아이디어 생성"""
    try:
        category = request.get('category', '먹방')
        user_data = request.get('user_data', {})
        
        ideas = generate_ai_content_ideas(category, user_data)
        
        return {
            'success': True,
            'category': category,
            'ideas': ideas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/content/predict")
async def predict_performance_endpoint(request: dict):
    """콘텐츠 성과 예측"""
    try:
        content_plan = {
            'category': request.get('category', '기타'),
            'format': request.get('format', 'post'),
            'posting_time': request.get('posting_time'),
            'hashtags': request.get('hashtags', []),
            'follower_count': request.get('follower_count', 10000)
        }
        
        prediction = predict_content_performance(content_plan)
        
        return {
            'success': True,
            'prediction': prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trending/hashtags")
async def get_trending_hashtags(category: str = None):
    """트렌딩 해시태그 조회"""
    try:
        analyzer = ViralContentAnalyzer()
        
        if category:
            hashtags = analyzer.hashtag_database['trending'].get(category, [])
        else:
            all_hashtags = []
            for cat_hashtags in analyzer.hashtag_database['trending'].values():
                all_hashtags.extend(cat_hashtags)
            hashtags = list(set(all_hashtags))[:30]
        
        return {
            'success': True,
            'category': category,
            'hashtags': hashtags,
            'power_tags': analyzer.hashtag_database['power_tags']['universal'][:10]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/patterns/{category}")
async def get_viral_patterns(category: str):
    """카테고리별 바이럴 패턴 조회"""
    try:
        analyzer = ViralContentAnalyzer()
        pattern = analyzer.viral_patterns.get(category)
        
        if not pattern:
            raise HTTPException(status_code=404, detail=f"카테고리 '{category}'를 찾을 수 없습니다")
        
        return {
            'success': True,
            'category': category,
            'pattern': pattern
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/gemini/analyze")
async def gemini_analysis_endpoint(request: dict, x_gemini_api_key: str = Header(None)):
    """Gemini AI를 활용한 현실적인 인플루언서 분석"""
    
    # API 키가 헤더에서 제공된 경우 해당 키로 새 analyzer 생성
    if x_gemini_api_key:
        try:
            analyzer = GeminiAnalyzer(api_key=x_gemini_api_key)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"잘못된 Gemini API 키: {str(e)}")
    elif gemini_analyzer:
        analyzer = gemini_analyzer
    else:
        raise HTTPException(
            status_code=503, 
            detail="Gemini API 키가 필요합니다. 설정에서 API 키를 입력해주세요."
        )
    
    try:
        # 요청 데이터 파싱
        username = request.get('username', '')
        followers = request.get('followers', 0)
        engagement_rate = request.get('engagement_rate', 0.0)
        category = request.get('category', '기타')
        recent_posts = request.get('recent_posts', [])
        brand_collaborations = request.get('brand_collaborations', [])
        
        # InfluencerProfile 객체 생성
        profile = InfluencerProfile(
            username=username,
            followers=followers,
            engagement_rate=engagement_rate,
            category=category,
            recent_posts=recent_posts,
            brand_collaborations=brand_collaborations,
            demographics=request.get('demographics', {})
        )
        
        # Gemini 분석 수행
        analysis_result = await analyzer.analyze_influencer_realistically(profile)
        
        return {
            'success': True,
            'analysis': analysis_result,
            'powered_by': 'Google Gemini AI'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini 분석 실패: {str(e)}")

@app.post("/api/gemini/market-analysis")
async def gemini_market_analysis_endpoint(request: dict, x_gemini_api_key: str = Header(None)):
    """Gemini AI를 활용한 시장 분석"""
    
    # API 키가 헤더에서 제공된 경우 해당 키로 새 analyzer 생성
    if x_gemini_api_key:
        try:
            analyzer = GeminiAnalyzer(api_key=x_gemini_api_key)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"잘못된 Gemini API 키: {str(e)}")
    elif gemini_analyzer:
        analyzer = gemini_analyzer
    else:
        raise HTTPException(
            status_code=503, 
            detail="Gemini API 키가 필요합니다. 설정에서 API 키를 입력해주세요."
        )
    
    try:
        category = request.get('category', '뷰티')
        
        # 시장 컨텍스트 분석
        market_analysis = await analyzer._get_market_context(category)
        
        return {
            'success': True,
            'market_analysis': {
                'category': category,
                'trend_score': market_analysis.trend_score,
                'market_saturation': market_analysis.market_saturation,
                'seasonal_factors': market_analysis.seasonal_factors,
                'recommendations': {
                    'optimal_timing': "지금" if market_analysis.trend_score > 70 else "다음 성수기",
                    'investment_level': "높음" if market_analysis.market_saturation < 50 else "보통" if market_analysis.market_saturation < 80 else "낮음",
                    'strategy': "공격적 마케팅" if market_analysis.trend_score > 70 and market_analysis.market_saturation < 60 else "차별화 전략"
                }
            },
            'powered_by': 'Google Gemini AI'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시장 분석 실패: {str(e)}")

@app.post("/api/gemini/roi-predict")
async def gemini_roi_prediction_endpoint(request: dict, x_gemini_api_key: str = Header(None)):
    """Gemini AI를 활용한 ROI 예측"""
    
    # API 키가 헤더에서 제공된 경우 해당 키로 새 analyzer 생성
    if x_gemini_api_key:
        try:
            analyzer = GeminiAnalyzer(api_key=x_gemini_api_key)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"잘못된 Gemini API 키: {str(e)}")
    elif gemini_analyzer:
        analyzer = gemini_analyzer
    else:
        raise HTTPException(
            status_code=503, 
            detail="Gemini API 키가 필요합니다. 설정에서 API 키를 입력해주세요."
        )
    
    try:
        # 캠페인 데이터
        campaign_budget = request.get('campaign_budget', 1000000)  # 기본 100만원
        influencer_data = request.get('influencer_data', {})
        campaign_type = request.get('campaign_type', '제품 리뷰')
        
        # 간단한 프로필 생성
        profile = InfluencerProfile(
            username=influencer_data.get('username', ''),
            followers=influencer_data.get('followers', 50000),
            engagement_rate=influencer_data.get('engagement_rate', 3.5),
            category=influencer_data.get('category', '뷰티'),
            recent_posts=[],
            brand_collaborations=[],
            demographics={}
        )
        
        # 시장 컨텍스트
        market_context = await analyzer._get_market_context(profile.category)
        
        # 성과 예측
        performance_prediction = await analyzer._predict_campaign_performance(profile, market_context)
        
        # 비용 대비 효과 분석
        cost_benefit = await analyzer._analyze_cost_benefit(profile, performance_prediction)
        
        # ROI 계산
        expected_roi = performance_prediction.get('roi_prediction', {}).get('expected', 2.0)
        expected_return = campaign_budget * expected_roi
        
        return {
            'success': True,
            'prediction': {
                'campaign_budget': campaign_budget,
                'campaign_type': campaign_type,
                'expected_reach': performance_prediction.get('estimated_reach', {}),
                'conversion_rates': performance_prediction.get('conversion_rate', {}),
                'roi_prediction': {
                    'investment': campaign_budget,
                    'expected_return': expected_return,
                    'roi_ratio': expected_roi,
                    'break_even_point': campaign_budget / expected_roi if expected_roi > 0 else campaign_budget,
                    'risk_level': "낮음" if expected_roi > 3 else "보통" if expected_roi > 1.5 else "높음"
                },
                'cost_analysis': cost_benefit,
                'market_factors': {
                    'trend_score': market_context.trend_score,
                    'saturation_impact': market_context.market_saturation
                }
            },
            'powered_by': 'Google Gemini AI'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ROI 예측 실패: {str(e)}")

@app.get("/api/gemini/status")
async def gemini_status():
    """Gemini API 상태 확인"""
    return {
        'available': gemini_analyzer is not None,
        'api_key_configured': bool(os.getenv('GEMINI_API_KEY')),
        'features': [
            'realistic_influencer_analysis',
            'market_context_analysis', 
            'roi_prediction',
            'brand_compatibility_assessment',
            'risk_analysis'
        ] if gemini_analyzer else []
    }

# 팔로워 크롤러 관련 엔드포인트 (간단한 구현)
# 실제 계정 관리를 위한 메모리 저장소
follower_accounts = []

@app.get("/api/accounts/list")
async def list_follower_accounts():
    """팔로워 크롤러용 계정 목록 조회"""
    return {"accounts": follower_accounts}

@app.post("/api/accounts/add")
async def add_follower_account(request: dict):
    """팔로워 크롤러용 계정 추가"""
    username = request.get("username", "")
    password = request.get("password", "")
    proxy = request.get("proxy", "")
    
    if not username or not password:
        return {"success": False, "message": "아이디와 비밀번호를 입력해주세요."}
    
    # 중복 체크
    for acc in follower_accounts:
        if acc["username"] == username:
            return {"success": False, "message": "이미 등록된 계정입니다."}
    
    # 계정 추가
    account = {
        "username": username,
        "password": password,  # 실제로는 암호화 필요
        "proxy": proxy if proxy else None,
        "status": "active",
        "request_count": 0,
        "last_used": None,
        "added_at": datetime.now().isoformat()
    }
    
    follower_accounts.append(account)
    return {"success": True, "message": f"계정 {username}이(가) 추가되었습니다."}

@app.delete("/api/accounts/{username}")
async def remove_follower_account(username: str):
    """팔로워 크롤러용 계정 삭제"""
    global follower_accounts
    follower_accounts = [acc for acc in follower_accounts if acc["username"] != username]
    return {"success": True, "message": f"계정 {username}이(가) 삭제되었습니다."}

@app.get("/api/check-ip")
async def check_ip_info():
    """IP 정보 확인 (VPN 체크)"""
    try:
        # 실제 IP 정보 확인 (간단한 구현)
        import socket
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        
        return {
            "ip": local_ip,
            "country": "KR",
            "city": "Seoul",
            "org": "Local Network",
            "is_vpn": False  # 실제로는 VPN 체크 로직 필요
        }
    except Exception as e:
        return {
            "ip": "Unknown",
            "country": "Unknown",
            "city": "Unknown", 
            "org": "Unknown",
            "is_vpn": False
        }

@app.post("/api/followers/crawl")
async def crawl_followers(request: dict):
    """팔로워 목록 크롤링 (시뮬레이션)"""
    target_username = request.get("target_username", "")
    max_count = request.get("max_count", 100)
    use_rotation = request.get("use_rotation", True)
    
    if not target_username:
        return {"success": False, "error": "대상 사용자명을 입력해주세요."}
    
    if len(follower_accounts) == 0:
        return {"success": False, "error": "먼저 계정을 등록해주세요."}
    
    # 실제 인스타그램 사용자처럼 보이는 데이터 생성
    sample_usernames = [
        "fashion_daily", "foodie_lover", "travel_dreams", "fitness_guru", "beauty_tips",
        "art_gallery", "music_vibes", "tech_news", "nature_photos", "pet_lovers",
        "cooking_pro", "style_icon", "adventure_time", "photo_art", "daily_mood",
        "life_style", "happy_moments", "creative_mind", "urban_explorer", "coffee_addict"
    ]
    
    sample_names = [
        "김민지", "이서연", "박지훈", "최유나", "정하은",
        "강민수", "조은비", "윤서준", "임채원", "한지우",
        "서예진", "김도윤", "이수민", "박서연", "최지호",
        "정민서", "강서윤", "조하린", "윤지안", "임서아"
    ]
    
    followers = []
    for i in range(min(max_count, 50)):  # 데모를 위해 최대 50개로 제한
        username = random.choice(sample_usernames) + str(random.randint(100, 999))
        follower = {
            "user_id": f"user_{random.randint(100000, 999999)}",
            "username": username,
            "full_name": random.choice(sample_names),
            "profile_pic_url": f"https://picsum.photos/150?random={i+1}",  # 랜덤 프로필 이미지
            "is_verified": random.choice([True, False]) if i < 5 else False,
            "is_private": random.choice([True, False]),
            "follower_count": random.randint(100, 50000),
            "collected_by": follower_accounts[i % len(follower_accounts)]["username"] if use_rotation else follower_accounts[0]["username"],
            "collected_at": datetime.now().isoformat()
        }
        followers.append(follower)
    
    return {
        "success": True,
        "target_username": target_username,
        "total_collected": len(followers),
        "followers": followers,
        "accounts_used": len(follower_accounts)
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    print("Instagram Realtime Crawling API Server")
    print("테스트 가능한 해시태그: 먹방, food, 맛집")
    print("기타 해시태그는 실시간 크롤링 시도")
    uvicorn.run(app, host="0.0.0.0", port=8000)