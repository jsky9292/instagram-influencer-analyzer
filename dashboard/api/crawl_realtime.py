#!/usr/bin/env python3
"""
FastAPI 기반 Instagram 실시간 크롤링 API 서버
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
import uvicorn
import json
import asyncio
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd

# 인증 모듈 추가
from auth import (
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

# Config 파일 로드
def load_config():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

config = load_config()

app = FastAPI(title="Instagram Influencer Realtime Crawling API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    }
}

def translate_hashtag(hashtag: str, target_country: str = "us"):
    """해시태그를 타겟 국가 언어로 번역"""
    # 한국어 입력이고 한국이 아닌 다른 나라를 선택한 경우
    if target_country != "kr":
        # 국가별 번역 확인
        if target_country in HASHTAG_TRANSLATIONS:
            country_translations = HASHTAG_TRANSLATIONS[target_country]
            if hashtag in country_translations:
                return country_translations[hashtag]
        
        # 기본 영어 번역 확인
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
    max_user_posts = request.get("max_user_posts", 30)
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
            error_msg = f"크롤링 중 오류 발생: {str(e)}"
            print(error_msg)
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
                if post.get('music'):
                    music_analysis[post['music']] = music_analysis.get(post['music'], 0) + 1
                
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
            yield f"data: {json.dumps({'error': f'분석 중 오류: {str(e)}'})}\n\n"
    
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
                    'username': profile.get('username'),
                    'followers': profile.get('followers'),
                    'avg_engagement': avg_engagement
                },
                'viral_analysis': viral_analysis,
                'overall_insights': overall_insights
            }
            
            yield f"data: {json.dumps({'progress': '✅ 바이럴 콘텐츠 분석 완료!'})}\n\n"
            yield f"data: {json.dumps({'result': result})}\n\n"
            yield f"data: [DONE]\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': f'분석 중 오류: {str(e)}'})}\n\n"
    
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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    print("Instagram Realtime Crawling API Server")
    print("테스트 가능한 해시태그: 먹방, food, 맛집")
    print("기타 해시태그는 실시간 크롤링 시도")
    uvicorn.run(app, host="0.0.0.0", port=8000)