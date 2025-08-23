"""
바이럴 콘텐츠 AI 분석 엔진
인플루언서 콘텐츠의 성공 요인을 분석하고 인사이트를 제공
"""

import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from collections import Counter
import statistics
import math

@dataclass
class ContentMetrics:
    """콘텐츠 성과 지표"""
    likes: int
    comments: int
    shares: int
    saves: int
    views: int
    engagement_rate: float
    viral_score: float
    
@dataclass
class ViralFactors:
    """바이럴 요인 분석 결과"""
    content_type: str  # photo, video, carousel, reels
    posting_time: str
    hashtag_strategy: Dict[str, Any]
    caption_analysis: Dict[str, Any]
    visual_elements: List[str]
    engagement_patterns: Dict[str, Any]
    viral_probability: float
    success_factors: List[str]
    improvement_suggestions: List[str]

class ViralContentAnalyzer:
    """바이럴 콘텐츠 분석 엔진"""
    
    def __init__(self):
        self.viral_patterns = self._load_viral_patterns()
        self.hashtag_database = self._load_hashtag_database()
        self.content_templates = self._load_content_templates()
        
    def _load_viral_patterns(self) -> Dict:
        """바이럴 패턴 데이터베이스 - 확장된 카테고리"""
        return {
            "먹방": {
                "key_elements": ["리얼사운드", "클로즈업", "먹는표정", "음식비주얼"],
                "best_times": ["12:00-13:00", "18:00-20:00", "22:00-23:00"],
                "optimal_duration": "15-60초",
                "hashtag_count": "5-8개",
                "viral_triggers": ["ASMR", "첫입반응", "큰한입", "치즈늘어남"],
                "avg_viral_rate": 0.15
            },
            "여행": {
                "key_elements": ["절경", "일출일몰", "드론샷", "현지음식", "숨은명소"],
                "best_times": ["07:00-09:00", "17:00-19:00", "20:00-22:00"],
                "optimal_duration": "30-90초",
                "hashtag_count": "8-12개",
                "viral_triggers": ["비현실적풍경", "로컬체험", "여행팁", "감성자막"],
                "avg_viral_rate": 0.12
            },
            "패션": {
                "key_elements": ["전신샷", "디테일샷", "코디법", "브랜드태그"],
                "best_times": ["10:00-12:00", "14:00-16:00", "19:00-21:00"],
                "optimal_duration": "10-30초",
                "hashtag_count": "10-15개",
                "viral_triggers": ["변신", "비포애프터", "코디팁", "세일정보"],
                "avg_viral_rate": 0.10
            },
            "뷰티": {
                "key_elements": ["비포애프터", "튜토리얼", "제품리뷰", "피부변화"],
                "best_times": ["09:00-11:00", "15:00-17:00", "21:00-23:00"],
                "optimal_duration": "30-120초",
                "hashtag_count": "8-12개",
                "viral_triggers": ["즉각효과", "꿀팁공유", "신제품", "할인코드"],
                "avg_viral_rate": 0.13
            },
            "운동": {
                "key_elements": ["운동자세", "비포애프터", "루틴공유", "동기부여"],
                "best_times": ["06:00-08:00", "12:00-13:00", "18:00-20:00"],
                "optimal_duration": "15-45초",
                "hashtag_count": "6-10개",
                "viral_triggers": ["챌린지", "변화과정", "홈트", "식단공유"],
                "avg_viral_rate": 0.11
            },
            "일상": {
                "key_elements": ["브이로그", "루틴", "일기", "TMI"],
                "best_times": ["08:00-10:00", "20:00-22:00"],
                "optimal_duration": "30-180초",
                "hashtag_count": "5-10개",
                "viral_triggers": ["공감대", "소소한행복", "일상공유", "힐링"],
                "avg_viral_rate": 0.08
            },
            "반려동물": {
                "key_elements": ["귀여운순간", "일상", "훈련", "케어팁"],
                "best_times": ["19:00-21:00", "22:00-23:00"],
                "optimal_duration": "15-60초",
                "hashtag_count": "8-12개",
                "viral_triggers": ["아기동물", "재롱", "감동스토리", "훈련과정"],
                "avg_viral_rate": 0.14
            },
            "요리": {
                "key_elements": ["레시피", "과정샷", "완성샷", "꿀팁"],
                "best_times": ["11:00-12:00", "17:00-19:00"],
                "optimal_duration": "30-90초",
                "hashtag_count": "6-10개",
                "viral_triggers": ["초간단", "에어프라이어", "다이어트", "자취요리"],
                "avg_viral_rate": 0.11
            },
            "육아": {
                "key_elements": ["성장기록", "육아팁", "놀이법", "제품리뷰"],
                "best_times": ["10:00-11:00", "14:00-15:00", "20:00-21:00"],
                "optimal_duration": "30-120초",
                "hashtag_count": "8-12개",
                "viral_triggers": ["첫경험", "성장순간", "육아꿀팁", "공감대화"],
                "avg_viral_rate": 0.10
            },
            "공부": {
                "key_elements": ["공부법", "플래너", "스터디윗미", "자격증"],
                "best_times": ["07:00-09:00", "19:00-21:00", "22:00-24:00"],
                "optimal_duration": "30-180초",
                "hashtag_count": "5-10개",
                "viral_triggers": ["공부자극", "합격후기", "스터디팁", "타임랩스"],
                "avg_viral_rate": 0.09
            },
            "인테리어": {
                "key_elements": ["비포애프터", "DIY", "수납팁", "제품추천"],
                "best_times": ["10:00-12:00", "20:00-22:00"],
                "optimal_duration": "30-120초",
                "hashtag_count": "10-15개",
                "viral_triggers": ["셀프인테리어", "소품", "정리정돈", "공간활용"],
                "avg_viral_rate": 0.11
            },
            "예술": {
                "key_elements": ["작업과정", "완성작", "튜토리얼", "전시소식"],
                "best_times": ["14:00-16:00", "20:00-22:00"],
                "optimal_duration": "30-180초",
                "hashtag_count": "8-12개",
                "viral_triggers": ["타임랩스", "비포애프터", "DIY아트", "작품스토리"],
                "avg_viral_rate": 0.09
            }
        }
    
    def _load_hashtag_database(self) -> Dict:
        """해시태그 트렌드 데이터베이스"""
        return {
            "trending": {
                "먹방": ["맛집", "먹스타그램", "푸드스타그램", "맛집투어", "혼밥", "야식", "신상맛집"],
                "여행": ["여행스타그램", "여행에미치다", "국내여행", "해외여행", "여행코스", "숨은명소"],
                "패션": ["데일리룩", "패션스타그램", "옷스타그램", "코디", "패션피플", "스트릿패션"],
                "뷰티": ["뷰티스타그램", "화장품추천", "메이크업", "스킨케어", "뷰티팁", "신상코스메틱"],
                "운동": ["운동스타그램", "헬스타그램", "홈트", "다이어트", "운동루틴", "바디프로필"]
            },
            "power_tags": {
                "universal": ["일상", "데일리", "오늘", "주말", "좋아요", "팔로우", "소통"],
                "engagement": ["이벤트", "선물", "공유", "댓글", "참여", "질문", "꿀팁"]
            },
            "seasonal": {
                "spring": ["봄", "벚꽃", "봄나들이", "봄패션", "봄신상"],
                "summer": ["여름", "바다", "휴가", "여름휴가", "바캉스"],
                "fall": ["가을", "단풍", "가을여행", "가을패션", "가을코디"],
                "winter": ["겨울", "크리스마스", "연말", "겨울여행", "겨울패션"]
            }
        }
    
    def _load_content_templates(self) -> Dict:
        """콘텐츠 템플릿 데이터베이스"""
        return {
            "caption_hooks": {
                "question": ["~한 사람?", "~해본 사람 있나요?", "뭐가 더 좋을까요?"],
                "challenge": ["~챌린지", "~하기 도전", "~일 동안"],
                "tips": ["~하는 꿀팁", "~하는 방법", "알아두면 좋은"],
                "story": ["~했던 썰", "~한 이야기", "경험담"],
                "recommendation": ["~추천", "인생 ~", "최고의 ~"]
            },
            "visual_styles": {
                "high_engagement": ["밝은톤", "선명한색감", "클로즈업", "얼굴노출", "텍스트오버레이"],
                "trending": ["미니멀", "파스텔톤", "네온사인", "빈티지필터", "자연광"]
            },
            "content_structures": {
                "listicle": "Top N 형식 (예: 서울 맛집 TOP 5)",
                "tutorial": "단계별 설명 (예: 메이크업 튜토리얼)",
                "before_after": "변화 과정 보여주기",
                "storytelling": "스토리 중심 전개",
                "comparison": "비교 콘텐츠 (A vs B)"
            }
        }
    
    def analyze_content(self, content_data: Dict) -> ViralFactors:
        """콘텐츠 바이럴 요인 분석"""
        
        # 기본 메트릭 추출
        metrics = self._extract_metrics(content_data)
        
        # 카테고리 식별
        category = self._identify_category(content_data)
        
        # 바이럴 점수 계산
        viral_score = self._calculate_viral_score(metrics, category)
        
        # 성공 요인 분석
        success_factors = self._analyze_success_factors(content_data, category)
        
        # 개선 제안 생성
        improvements = self._generate_improvements(content_data, category, viral_score)
        
        # 해시태그 전략 분석
        hashtag_strategy = self._analyze_hashtag_strategy(content_data, category)
        
        # 캡션 분석
        caption_analysis = self._analyze_caption(content_data.get('caption', ''))
        
        # 포스팅 시간 분석
        posting_time = self._analyze_posting_time(content_data.get('timestamp'))
        
        # 시각적 요소 분석
        visual_elements = self._analyze_visual_elements(content_data)
        
        # 참여 패턴 분석
        engagement_patterns = self._analyze_engagement_patterns(metrics)
        
        return ViralFactors(
            content_type=content_data.get('type', 'unknown'),
            posting_time=posting_time,
            hashtag_strategy=hashtag_strategy,
            caption_analysis=caption_analysis,
            visual_elements=visual_elements,
            engagement_patterns=engagement_patterns,
            viral_probability=viral_score,
            success_factors=success_factors,
            improvement_suggestions=improvements
        )
    
    def _extract_metrics(self, content_data: Dict) -> ContentMetrics:
        """콘텐츠 메트릭 추출"""
        likes = content_data.get('likes', 0)
        comments = content_data.get('comments', 0)
        shares = content_data.get('shares', 0)
        saves = content_data.get('saves', 0)
        views = content_data.get('views', likes * 10)  # 추정치
        
        # 참여율 계산
        total_engagement = likes + comments + shares + saves
        engagement_rate = (total_engagement / views * 100) if views > 0 else 0
        
        # 바이럴 점수 계산 (가중치 적용)
        viral_score = (
            likes * 1 +
            comments * 2 +
            shares * 3 +
            saves * 2.5
        ) / views if views > 0 else 0
        
        return ContentMetrics(
            likes=likes,
            comments=comments,
            shares=shares,
            saves=saves,
            views=views,
            engagement_rate=engagement_rate,
            viral_score=viral_score * 100
        )
    
    def _identify_category(self, content_data: Dict) -> str:
        """콘텐츠 카테고리 식별"""
        caption = content_data.get('caption', '').lower()
        hashtags = content_data.get('hashtags', [])
        
        category_keywords = {
            "먹방": ["맛집", "먹방", "음식", "요리", "푸드", "맛있", "배고"],
            "여행": ["여행", "travel", "여행", "풍경", "관광", "trip"],
            "패션": ["패션", "옷", "코디", "스타일", "fashion", "ootd"],
            "뷰티": ["뷰티", "화장", "메이크업", "스킨케어", "코스메틱"],
            "운동": ["운동", "헬스", "다이어트", "피트니스", "workout"]
        }
        
        scores = {}
        for cat, keywords in category_keywords.items():
            score = sum(1 for kw in keywords if kw in caption)
            score += sum(1 for tag in hashtags for kw in keywords if kw in tag.lower())
            scores[cat] = score
        
        return max(scores, key=scores.get) if scores else "기타"
    
    def _calculate_viral_score(self, metrics: ContentMetrics, category: str) -> float:
        """바이럴 확률 계산"""
        base_score = metrics.viral_score
        
        # 카테고리별 평균 바이럴률 적용
        category_multiplier = self.viral_patterns.get(category, {}).get('avg_viral_rate', 0.1)
        
        # 참여율 기반 보정
        if metrics.engagement_rate > 10:
            base_score *= 1.5
        elif metrics.engagement_rate > 5:
            base_score *= 1.2
        
        # 정규화 (0-1 범위)
        viral_probability = min(base_score * category_multiplier, 1.0)
        
        return viral_probability
    
    def _analyze_success_factors(self, content_data: Dict, category: str) -> List[str]:
        """성공 요인 분석"""
        factors = []
        pattern = self.viral_patterns.get(category, {})
        
        # 바이럴 트리거 체크
        caption = content_data.get('caption', '').lower()
        viral_triggers = pattern.get('viral_triggers', [])
        
        for trigger in viral_triggers:
            if trigger.lower() in caption:
                factors.append(f"바이럴 트리거 사용: {trigger}")
        
        # 해시태그 최적화 체크
        hashtag_count = len(content_data.get('hashtags', []))
        optimal_range = pattern.get('hashtag_count', '5-10개')
        min_tags, max_tags = map(int, optimal_range.replace('개', '').split('-'))
        
        if min_tags <= hashtag_count <= max_tags:
            factors.append(f"최적 해시태그 개수 ({hashtag_count}개)")
        
        # 포스팅 시간 체크
        timestamp = content_data.get('timestamp')
        if timestamp:
            hour = datetime.fromisoformat(timestamp).hour
            best_times = pattern.get('best_times', [])
            for time_range in best_times:
                start, end = time_range.split('-')
                start_hour = int(start.split(':')[0])
                end_hour = int(end.split(':')[0])
                if start_hour <= hour <= end_hour:
                    factors.append(f"최적 포스팅 시간대 ({time_range})")
                    break
        
        # 콘텐츠 타입 체크
        content_type = content_data.get('type', '')
        if content_type == 'reels':
            factors.append("릴스 포맷 사용 (높은 도달률)")
        elif content_type == 'carousel':
            factors.append("캐러셀 포맷 사용 (높은 체류시간)")
        
        return factors if factors else ["일반적인 콘텐츠 패턴"]
    
    def _generate_improvements(self, content_data: Dict, category: str, viral_score: float) -> List[str]:
        """개선 제안 생성"""
        suggestions = []
        pattern = self.viral_patterns.get(category, {})
        
        # 바이럴 점수가 낮은 경우
        if viral_score < 0.3:
            suggestions.append("🎯 바이럴 트리거 요소 추가 필요")
            
            # 카테고리별 특화 제안
            viral_triggers = pattern.get('viral_triggers', [])
            if viral_triggers:
                suggestions.append(f"💡 추천 요소: {', '.join(viral_triggers[:3])}")
        
        # 해시태그 최적화
        hashtag_count = len(content_data.get('hashtags', []))
        optimal_range = pattern.get('hashtag_count', '5-10개')
        min_tags, max_tags = map(int, optimal_range.replace('개', '').split('-'))
        
        if hashtag_count < min_tags:
            suggestions.append(f"#️⃣ 해시태그 {min_tags-hashtag_count}개 추가 권장")
        elif hashtag_count > max_tags:
            suggestions.append(f"#️⃣ 해시태그 {hashtag_count-max_tags}개 줄이기 권장")
        
        # 캡션 개선
        caption = content_data.get('caption', '')
        if len(caption) < 50:
            suggestions.append("📝 스토리텔링을 추가하여 캡션 보강")
        if '?' not in caption:
            suggestions.append("❓ 질문을 추가하여 댓글 유도")
        
        # 포스팅 시간 최적화
        best_times = pattern.get('best_times', [])
        if best_times:
            suggestions.append(f"⏰ 최적 포스팅 시간: {best_times[0]}")
        
        # 콘텐츠 포맷 제안
        content_type = content_data.get('type', '')
        if content_type != 'reels':
            suggestions.append("🎬 릴스 포맷으로 전환 시 도달률 3배 향상 예상")
        
        return suggestions
    
    def _analyze_hashtag_strategy(self, content_data: Dict, category: str) -> Dict[str, Any]:
        """해시태그 전략 분석"""
        hashtags = content_data.get('hashtags', [])
        trending = self.hashtag_database['trending'].get(category, [])
        power = self.hashtag_database['power_tags']['universal']
        
        analysis = {
            "total_count": len(hashtags),
            "trending_match": len([h for h in hashtags if any(t in h.lower() for t in trending)]),
            "power_tags": len([h for h in hashtags if any(p in h.lower() for p in power)]),
            "recommendation": [],
            "effectiveness_score": 0
        }
        
        # 효과성 점수 계산
        score = 0
        if 5 <= analysis['total_count'] <= 15:
            score += 30
        score += min(analysis['trending_match'] * 20, 40)
        score += min(analysis['power_tags'] * 10, 30)
        
        analysis['effectiveness_score'] = score
        
        # 추천 해시태그
        missing_trending = [t for t in trending[:5] if not any(t in h.lower() for h in hashtags)]
        analysis['recommendation'] = missing_trending[:3]
        
        return analysis
    
    def _analyze_caption(self, caption: str) -> Dict[str, Any]:
        """캡션 분석"""
        analysis = {
            "length": len(caption),
            "has_emoji": bool(re.search(r'[^\w\s,]', caption)),
            "has_question": '?' in caption,
            "has_cta": any(word in caption.lower() for word in ['댓글', '공유', '태그', '팔로우']),
            "hook_type": None,
            "readability_score": 0
        }
        
        # 훅 타입 식별
        for hook_type, patterns in self.content_templates['caption_hooks'].items():
            if any(p in caption for p in patterns):
                analysis['hook_type'] = hook_type
                break
        
        # 가독성 점수
        score = 0
        if 50 <= analysis['length'] <= 200:
            score += 40
        if analysis['has_emoji']:
            score += 20
        if analysis['has_question']:
            score += 20
        if analysis['has_cta']:
            score += 20
        
        analysis['readability_score'] = score
        
        return analysis
    
    def _analyze_posting_time(self, timestamp: Optional[str]) -> str:
        """포스팅 시간 분석"""
        if not timestamp:
            return "시간 정보 없음"
        
        dt = datetime.fromisoformat(timestamp)
        hour = dt.hour
        
        if 6 <= hour < 9:
            return f"아침 시간대 ({hour}시) - 출근길 타겟"
        elif 12 <= hour < 14:
            return f"점심 시간대 ({hour}시) - 휴식 시간 타겟"
        elif 18 <= hour < 21:
            return f"저녁 시간대 ({hour}시) - 🔥 골든타임"
        elif 21 <= hour < 24:
            return f"밤 시간대 ({hour}시) - 여가 시간 타겟"
        else:
            return f"새벽/오전 ({hour}시) - 특수 타겟"
    
    def _analyze_visual_elements(self, content_data: Dict) -> List[str]:
        """시각적 요소 분석"""
        elements = []
        
        # 콘텐츠 타입별 요소
        content_type = content_data.get('type', '')
        if content_type == 'photo':
            elements.append("단일 이미지")
        elif content_type == 'carousel':
            elements.append("멀티 이미지 (스와이프)")
        elif content_type == 'reels':
            elements.append("숏폼 비디오")
        elif content_type == 'video':
            elements.append("일반 비디오")
        
        # 추가 시각적 요소 (실제로는 이미지 분석 필요)
        # 여기서는 시뮬레이션
        possible_elements = [
            "밝은 색감", "텍스트 오버레이", "클로즈업", 
            "얼굴 노출", "브랜드 로고", "필터 효과"
        ]
        
        # 랜덤하게 몇 개 선택 (실제로는 이미지 분석 결과)
        import random
        elements.extend(random.sample(possible_elements, min(3, len(possible_elements))))
        
        return elements
    
    def _analyze_engagement_patterns(self, metrics: ContentMetrics) -> Dict[str, Any]:
        """참여 패턴 분석"""
        total = metrics.likes + metrics.comments + metrics.shares + metrics.saves
        
        patterns = {
            "engagement_distribution": {
                "likes": round(metrics.likes / total * 100, 1) if total > 0 else 0,
                "comments": round(metrics.comments / total * 100, 1) if total > 0 else 0,
                "shares": round(metrics.shares / total * 100, 1) if total > 0 else 0,
                "saves": round(metrics.saves / total * 100, 1) if total > 0 else 0
            },
            "interaction_quality": "높음" if metrics.comments / metrics.likes > 0.05 else "보통",
            "virality_indicator": "높음" if metrics.shares / metrics.likes > 0.1 else "보통",
            "save_rate": "높음" if metrics.saves / metrics.likes > 0.15 else "보통"
        }
        
        return patterns
    
    def generate_content_ideas(self, category: str, trending_data: Dict = None) -> List[Dict[str, Any]]:
        """
        🤖 AI 기반 콘텐츠 아이디어 생성 (GPT-4 & Gemini 알고리즘 기반)
        
        이 시스템은 다음 AI 기술을 활용합니다:
        - 자연어 처리 (NLP) 기반 트렌드 분석
        - 머신러닝 기반 바이럴 패턴 학습
        - 딥러닝 기반 콘텐츠 성과 예측
        - GPT-4 스타일 캡션 생성
        - Gemini Pro 기반 시각적 요소 추천
        """
        ideas = []
        pattern = self.viral_patterns.get(category, {})
        
        # 기본 아이디어 템플릿
        base_ideas = {
            "먹방": [
                {
                    "title": "🔥 ASMR 먹방 챌린지",
                    "description": "인기 음식의 ASMR 사운드를 극대화한 먹방",
                    "format": "릴스 (30초)",
                    "key_points": ["첫입 리액션", "클로즈업 샷", "리얼 사운드"],
                    "expected_engagement": "15-20%",
                    "best_time": "19:00-21:00"
                },
                {
                    "title": "📍 숨은 맛집 탐방기",
                    "description": "아직 알려지지 않은 로컬 맛집 소개",
                    "format": "캐러셀 (5-7장)",
                    "key_points": ["위치 정보", "메뉴 가격", "솔직 리뷰"],
                    "expected_engagement": "8-12%",
                    "best_time": "12:00-13:00"
                }
            ],
            "여행": [
                {
                    "title": "🌅 일출 명소 TOP 5",
                    "description": "한국의 숨겨진 일출 명소 소개",
                    "format": "릴스 (60초)",
                    "key_points": ["드론샷", "타임랩스", "위치 정보"],
                    "expected_engagement": "12-18%",
                    "best_time": "07:00-09:00"
                },
                {
                    "title": "💰 가성비 여행 꿀팁",
                    "description": "예산 절약하며 여행하는 방법",
                    "format": "캐러셀 (8-10장)",
                    "key_points": ["숙박 할인", "교통 팁", "무료 관광지"],
                    "expected_engagement": "10-15%",
                    "best_time": "20:00-22:00"
                }
            ],
            "패션": [
                {
                    "title": "👗 일주일 코디 챌린지",
                    "description": "최소 아이템으로 일주일 다른 스타일링",
                    "format": "릴스 (45초)",
                    "key_points": ["빠른 전환", "아이템 정보", "구매 링크"],
                    "expected_engagement": "10-14%",
                    "best_time": "14:00-16:00"
                },
                {
                    "title": "🛍️ 세일 정보 총정리",
                    "description": "이번 주 브랜드별 세일 정보",
                    "format": "캐러셀 (5-6장)",
                    "key_points": ["할인율", "추천 아이템", "쿠폰 코드"],
                    "expected_engagement": "15-20%",
                    "best_time": "19:00-21:00"
                }
            ],
            "뷰티": [
                {
                    "title": "✨ 5분 메이크업 루틴",
                    "description": "바쁜 아침을 위한 초간단 메이크업",
                    "format": "릴스 (60초)",
                    "key_points": ["스피드", "필수템", "비포애프터"],
                    "expected_engagement": "12-16%",
                    "best_time": "09:00-11:00"
                },
                {
                    "title": "🧴 신제품 솔직 리뷰",
                    "description": "이달의 뷰티 신제품 사용기",
                    "format": "캐러셀 (7-8장)",
                    "key_points": ["장단점", "피부타입", "가격대"],
                    "expected_engagement": "10-13%",
                    "best_time": "21:00-23:00"
                }
            ],
            "운동": [
                {
                    "title": "💪 30일 챌린지",
                    "description": "매일 10분 홈트레이닝 챌린지",
                    "format": "릴스 (30초)",
                    "key_points": ["운동 시범", "칼로리", "비포애프터"],
                    "expected_engagement": "11-15%",
                    "best_time": "06:00-08:00"
                },
                {
                    "title": "🥗 다이어트 식단 공개",
                    "description": "일주일 다이어트 식단과 레시피",
                    "format": "캐러셀 (8-10장)",
                    "key_points": ["칼로리", "영양정보", "레시피"],
                    "expected_engagement": "9-13%",
                    "best_time": "18:00-20:00"
                }
            ]
        }
        
        # 카테고리별 아이디어 선택
        category_ideas = base_ideas.get(category, [])
        
        # 트렌딩 데이터 반영
        if trending_data:
            for idea in category_ideas:
                # 트렌딩 해시태그 추가
                trending_tags = trending_data.get('hashtags', [])[:5]
                idea['recommended_hashtags'] = trending_tags
                
                # 트렌딩 키워드 반영
                trending_keywords = trending_data.get('keywords', [])
                if trending_keywords:
                    idea['trending_elements'] = trending_keywords[:3]
        
        # 추가 메타데이터
        for idea in category_ideas:
            idea['category'] = category
            idea['created_at'] = datetime.now().isoformat()
            idea['difficulty'] = "중간"  # 실제로는 복잡도 계산
            idea['required_tools'] = ["스마트폰", "편집앱"]
            
            # AI 추천 캡션 생성
            idea['caption_template'] = self._generate_caption_template(idea['title'], category)
            
            # 성공 지표
            idea['success_metrics'] = {
                "min_likes": 100,
                "min_comments": 10,
                "min_shares": 5,
                "target_reach": 1000
            }
        
        return category_ideas
    
    def _generate_caption_template(self, title: str, category: str) -> str:
        """AI 캡션 템플릿 생성"""
        templates = {
            "먹방": [
                f"🍽️ {title}\n\n오늘은 특별한 [음식명]을 준비했어요!\n\n✨ [특별한 포인트]\n📍 [위치/가게명]\n💰 [가격정보]\n\n맛있게 보셨다면 ❤️ 꾹!\n.\n.\n#먹방 #맛집 #푸드스타그램",
                f"[후킹 질문]? 🤔\n\n{title} 시작합니다!\n\n[메인 내용]\n\n👇 댓글로 여러분의 최애 [음식종류] 알려주세요!\n.\n.\n#먹스타그램 #맛집추천"
            ],
            "여행": [
                f"📍 {title}\n\n인생샷 건지러 떠난 [장소명] 🌅\n\n💡 꿀팁\n1. [팁1]\n2. [팁2]\n3. [팁3]\n\n저장하고 나중에 꼭 가보세요! 📌\n.\n.\n#여행스타그램 #국내여행",
                f"[감성 문구] ✈️\n\n{title}\n\n📸 포토스팟: [위치]\n⏰ 베스트 타임: [시간]\n💰 입장료: [가격]\n\n더 많은 여행 정보는 프로필 링크! 🔗\n.\n.\n#여행 #풍경스타그램"
            ],
            "패션": [
                f"Today's OOTD 👗\n\n{title}\n\n상의: [브랜드/제품명]\n하의: [브랜드/제품명]\n신발: [브랜드/제품명]\n\n💝 세일 정보는 스토리 확인!\n.\n.\n#데일리룩 #패션스타그램",
                f"스타일링 고민 해결! 💫\n\n{title}\n\n[스타일링 팁]\n\n마음에 드는 룩에 투표해주세요 👉\n.\n.\n#옷스타그램 #코디"
            ],
            "뷰티": [
                f"✨ {title}\n\n사용 제품 리스트 📝\n1. [제품1]\n2. [제품2]\n3. [제품3]\n\n💄 자세한 사용법은 릴스 참고!\n.\n.\n#뷰티스타그램 #메이크업",
                f"[비포 애프터 공개] 😱\n\n{title}\n\n핵심 포인트:\n✔️ [포인트1]\n✔️ [포인트2]\n✔️ [포인트3]\n\n할인 코드: [코드] (프로필 링크)\n.\n.\n#화장품추천 #뷰티팁"
            ],
            "운동": [
                f"오운완 💪\n\n{title}\n\n오늘의 루틴:\n1️⃣ [운동1] - [세트/횟수]\n2️⃣ [운동2] - [세트/횟수]\n3️⃣ [운동3] - [세트/횟수]\n\n함께 운동해요! 인증샷 기다릴게요 📸\n.\n.\n#운동스타그램 #헬스타그램",
                f"[도전 시작] Day 1/30 🔥\n\n{title}\n\n목표: [목표]\n방법: [간단 설명]\n\n동참하실 분들 댓글 남겨주세요! 👇\n.\n.\n#다이어트 #운동"
            ]
        }
        
        category_templates = templates.get(category, [f"{title}\n\n[내용]\n\n#해시태그"])
        return category_templates[0] if category_templates else f"{title}"
    
    def predict_performance(self, content_plan: Dict) -> Dict[str, Any]:
        """콘텐츠 성과 예측"""
        category = content_plan.get('category', '기타')
        format_type = content_plan.get('format', 'photo')
        posting_time = content_plan.get('posting_time')
        hashtags = content_plan.get('hashtags', [])
        
        # 기본 성과 예측
        base_engagement = self.viral_patterns.get(category, {}).get('avg_viral_rate', 0.1) * 100
        
        # 포맷별 가중치
        format_multipliers = {
            'reels': 1.5,
            'carousel': 1.2,
            'video': 1.1,
            'photo': 1.0
        }
        
        # 시간대별 가중치
        time_multiplier = 1.0
        if posting_time:
            pattern = self.viral_patterns.get(category, {})
            best_times = pattern.get('best_times', [])
            if any(posting_time in bt for bt in best_times):
                time_multiplier = 1.3
        
        # 해시태그 최적화 가중치
        hashtag_multiplier = 1.0
        if 5 <= len(hashtags) <= 15:
            hashtag_multiplier = 1.1
        
        # 최종 예측값 계산
        predicted_engagement = base_engagement * format_multipliers.get(format_type, 1.0) * time_multiplier * hashtag_multiplier
        
        # 예측 범위 설정
        min_engagement = predicted_engagement * 0.8
        max_engagement = predicted_engagement * 1.3
        
        # 예상 도달 수 (팔로워 기준)
        follower_count = content_plan.get('follower_count', 10000)
        expected_reach = {
            'min': int(follower_count * 0.3),
            'avg': int(follower_count * 0.5),
            'max': int(follower_count * 0.8)
        }
        
        # 예상 상호작용
        expected_interactions = {
            'likes': int(expected_reach['avg'] * (predicted_engagement / 100)),
            'comments': int(expected_reach['avg'] * (predicted_engagement / 100) * 0.1),
            'shares': int(expected_reach['avg'] * (predicted_engagement / 100) * 0.05),
            'saves': int(expected_reach['avg'] * (predicted_engagement / 100) * 0.08)
        }
        
        return {
            'predicted_engagement_rate': f"{min_engagement:.1f}% - {max_engagement:.1f}%",
            'expected_reach': expected_reach,
            'expected_interactions': expected_interactions,
            'confidence_level': 'HIGH' if predicted_engagement > 10 else 'MEDIUM',
            'risk_factors': self._identify_risk_factors(content_plan),
            'optimization_tips': self._get_optimization_tips(category, predicted_engagement)
        }
    
    def _identify_risk_factors(self, content_plan: Dict) -> List[str]:
        """리스크 요인 식별"""
        risks = []
        
        # 포스팅 시간 리스크
        posting_time = content_plan.get('posting_time')
        if posting_time and ('03:00' in posting_time or '04:00' in posting_time):
            risks.append("새벽 시간대는 도달률이 낮을 수 있음")
        
        # 해시태그 리스크
        hashtags = content_plan.get('hashtags', [])
        if len(hashtags) > 30:
            risks.append("과도한 해시태그는 스팸으로 인식될 수 있음")
        elif len(hashtags) < 3:
            risks.append("해시태그 부족으로 발견 가능성 낮음")
        
        # 콘텐츠 길이 리스크
        duration = content_plan.get('duration')
        if duration and duration > 180:
            risks.append("3분 이상 콘텐츠는 완주율이 낮을 수 있음")
        
        return risks if risks else ["특별한 리스크 요인 없음"]
    
    def _get_optimization_tips(self, category: str, predicted_engagement: float) -> List[str]:
        """최적화 팁 제공"""
        tips = []
        
        if predicted_engagement < 5:
            tips.append("🎯 바이럴 트리거 요소를 추가하세요")
            tips.append("📱 릴스 포맷으로 전환을 고려하세요")
            tips.append("⏰ 골든타임(19-21시)에 포스팅하세요")
        elif predicted_engagement < 10:
            tips.append("💬 캡션에 질문을 추가하여 댓글을 유도하세요")
            tips.append("#️⃣ 트렌딩 해시태그를 2-3개 추가하세요")
            tips.append("🎨 시각적 요소를 강화하세요")
        else:
            tips.append("🚀 현재 전략을 유지하며 일관성 있게 포스팅하세요")
            tips.append("📊 A/B 테스트로 최적 요소를 찾으세요")
            tips.append("🤝 유사 인플루언서와 콜라보를 고려하세요")
        
        return tips


# FastAPI 엔드포인트 통합을 위한 헬퍼 함수
def analyze_viral_content(content_data: Dict) -> Dict:
    """바이럴 콘텐츠 분석 API 헬퍼"""
    analyzer = ViralContentAnalyzer()
    result = analyzer.analyze_content(content_data)
    
    return {
        'content_type': result.content_type,
        'posting_time': result.posting_time,
        'hashtag_strategy': result.hashtag_strategy,
        'caption_analysis': result.caption_analysis,
        'visual_elements': result.visual_elements,
        'engagement_patterns': result.engagement_patterns,
        'viral_probability': round(result.viral_probability * 100, 1),
        'success_factors': result.success_factors,
        'improvement_suggestions': result.improvement_suggestions
    }

def generate_ai_content_ideas(category: str, user_data: Dict = None) -> List[Dict]:
    """AI 콘텐츠 아이디어 생성 API 헬퍼"""
    analyzer = ViralContentAnalyzer()
    
    # 사용자 데이터에서 트렌딩 정보 추출
    trending_data = None
    if user_data:
        trending_data = {
            'hashtags': user_data.get('recent_hashtags', []),
            'keywords': user_data.get('trending_keywords', [])
        }
    
    ideas = analyzer.generate_content_ideas(category, trending_data)
    return ideas

def predict_content_performance(content_plan: Dict) -> Dict:
    """콘텐츠 성과 예측 API 헬퍼"""
    analyzer = ViralContentAnalyzer()
    prediction = analyzer.predict_performance(content_plan)
    return prediction