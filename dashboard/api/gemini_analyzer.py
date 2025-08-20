#!/usr/bin/env python3
"""
Google Gemini API를 활용한 현실적인 인플루언서 분석 모듈
- 실제 시장 동향과 연결된 분석
- 현실적인 ROI 예측
- 브랜드 적합성 평가
"""

import os
import google.generativeai as genai
from typing import Dict, List, Any, Optional
import json
from datetime import datetime, timedelta
import asyncio
import aiohttp
from dataclasses import dataclass

@dataclass
class InfluencerProfile:
    username: str
    followers: int
    engagement_rate: float
    category: str
    recent_posts: List[Dict]
    brand_collaborations: List[str]
    demographics: Dict[str, Any]

@dataclass
class MarketAnalysis:
    trend_score: float
    market_saturation: float
    seasonal_factors: Dict[str, float]
    competitor_activity: List[Dict]

class GeminiAnalyzer:
    def __init__(self):
        # Gemini API 설정
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro')
        
    async def analyze_influencer_realistically(self, profile: InfluencerProfile) -> Dict[str, Any]:
        """
        현실적인 인플루언서 분석
        - 실제 시장 데이터 기반
        - ROI 예측
        - 리스크 평가
        """
        
        # 1. 시장 컨텍스트 분석
        market_context = await self._get_market_context(profile.category)
        
        # 2. 퍼포먼스 예측
        performance_prediction = await self._predict_campaign_performance(profile, market_context)
        
        # 3. 브랜드 적합성 평가
        brand_fit = await self._evaluate_brand_compatibility(profile)
        
        # 4. 리스크 분석
        risk_assessment = await self._analyze_risks(profile)
        
        # 5. 현실적인 추천사항
        recommendations = await self._generate_realistic_recommendations(
            profile, performance_prediction, brand_fit, risk_assessment
        )
        
        return {
            "influencer_score": await self._calculate_realistic_score(profile, market_context),
            "performance_prediction": performance_prediction,
            "brand_compatibility": brand_fit,
            "risk_assessment": risk_assessment,
            "market_analysis": market_context,
            "recommendations": recommendations,
            "cost_benefit_analysis": await self._analyze_cost_benefit(profile, performance_prediction),
            "timeline_suggestions": await self._suggest_optimal_timing(profile),
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    async def _get_market_context(self, category: str) -> MarketAnalysis:
        """현재 시장 상황 분석"""
        
        prompt = f"""
        다음 카테고리의 현재 인플루언서 마케팅 시장 상황을 현실적으로 분석해주세요: {category}

        다음 요소들을 고려하여 분석해주세요:
        1. 현재 시장 포화도 (0-100%)
        2. 최근 3개월 트렌드 변화
        3. 계절적 요인들
        4. 주요 경쟁사들의 활동 수준
        5. 소비자 관심도 변화
        6. 광고 단가 변화 추세

        JSON 형태로 응답해주세요:
        {{
            "trend_score": 0-100,
            "market_saturation": 0-100,
            "seasonal_factors": {{"current_month": factor}},
            "competition_level": "low/medium/high",
            "cost_trend": "increasing/stable/decreasing",
            "consumer_sentiment": "positive/neutral/negative"
        }}
        """
        
        try:
            response = await self._call_gemini_async(prompt)
            return self._parse_market_analysis(response)
        except Exception as e:
            return self._get_default_market_analysis()
    
    async def _predict_campaign_performance(self, profile: InfluencerProfile, market: MarketAnalysis) -> Dict[str, Any]:
        """캠페인 성과 예측"""
        
        prompt = f"""
        다음 인플루언서의 캠페인 성과를 현실적으로 예측해주세요:

        인플루언서 정보:
        - 팔로워: {profile.followers:,}명
        - 참여율: {profile.engagement_rate:.2f}%
        - 카테고리: {profile.category}
        - 최근 브랜드 협업: {len(profile.brand_collaborations)}개

        시장 상황:
        - 트렌드 점수: {market.trend_score}/100
        - 시장 포화도: {market.market_saturation}%

        현실적인 예측을 위해 다음을 고려해주세요:
        1. 실제 업계 벤치마크
        2. 팔로워 대비 실제 도달률 (보통 10-30%)
        3. 구매 전환율 (보통 1-3%)
        4. 브랜드 인지도 상승률
        5. 예상 ROI 범위

        JSON으로 응답:
        {{
            "estimated_reach": {{
                "min": number,
                "max": number,
                "realistic": number
            }},
            "engagement_prediction": {{
                "likes": number,
                "comments": number,
                "shares": number
            }},
            "conversion_rate": {{
                "optimistic": percentage,
                "realistic": percentage,
                "conservative": percentage
            }},
            "roi_prediction": {{
                "min": ratio,
                "expected": ratio,
                "max": ratio
            }},
            "campaign_duration_recommendation": "days"
        }}
        """
        
        try:
            response = await self._call_gemini_async(prompt)
            return json.loads(response)
        except Exception as e:
            return self._get_default_performance_prediction(profile)
    
    async def _evaluate_brand_compatibility(self, profile: InfluencerProfile) -> Dict[str, Any]:
        """브랜드 적합성 평가"""
        
        prompt = f"""
        다음 인플루언서의 브랜드 적합성을 평가해주세요:

        인플루언서 정보:
        - 사용자명: {profile.username}
        - 카테고리: {profile.category}
        - 팔로워 수: {profile.followers:,}
        - 최근 협업 브랜드들: {profile.brand_collaborations}

        다음 관점에서 현실적으로 평가해주세요:
        1. 브랜드 이미지 일관성
        2. 타겟 오디언스 매칭도
        3. 콘텐츠 품질 및 전문성
        4. 협업 이력의 다양성과 품질
        5. 장기적 파트너십 가능성
        6. 리스크 요소들

        JSON으로 응답:
        {{
            "overall_compatibility": 0-100,
            "target_audience_match": 0-100,
            "content_quality_score": 0-100,
            "brand_safety_score": 0-100,
            "long_term_potential": 0-100,
            "suitable_brand_types": ["type1", "type2"],
            "red_flags": ["flag1", "flag2"],
            "strengths": ["strength1", "strength2"]
        }}
        """
        
        try:
            response = await self._call_gemini_async(prompt)
            return json.loads(response)
        except Exception as e:
            return self._get_default_brand_compatibility()
    
    async def _analyze_risks(self, profile: InfluencerProfile) -> Dict[str, Any]:
        """리스크 분석"""
        
        prompt = f"""
        다음 인플루언서와의 협업 시 발생할 수 있는 리스크를 현실적으로 분석해주세요:

        인플루언서 정보:
        - 팔로워 수: {profile.followers:,}
        - 참여율: {profile.engagement_rate:.2f}%
        - 협업 이력: {len(profile.brand_collaborations)}개

        다음 리스크 요소들을 평가해주세요:
        1. 가짜 팔로워 가능성
        2. 참여율 조작 위험
        3. 브랜드 이미지 손상 리스크
        4. 계약 불이행 가능성
        5. 시장 변화에 따른 영향력 감소
        6. 경쟁사 협업으로 인한 제약

        JSON으로 응답:
        {{
            "overall_risk_level": "low/medium/high",
            "fake_followers_risk": 0-100,
            "engagement_authenticity": 0-100,
            "brand_safety_risk": 0-100,
            "market_volatility_risk": 0-100,
            "contract_reliability": 0-100,
            "mitigation_strategies": ["strategy1", "strategy2"],
            "monitoring_recommendations": ["rec1", "rec2"]
        }}
        """
        
        try:
            response = await self._call_gemini_async(prompt)
            return json.loads(response)
        except Exception as e:
            return self._get_default_risk_assessment()
    
    async def _generate_realistic_recommendations(self, profile: InfluencerProfile, 
                                                performance: Dict, brand_fit: Dict, 
                                                risk: Dict) -> Dict[str, Any]:
        """현실적인 추천사항 생성"""
        
        prompt = f"""
        다음 분석 결과를 바탕으로 현실적이고 실행 가능한 추천사항을 제공해주세요:

        인플루언서: {profile.username}
        예상 ROI: {performance.get('roi_prediction', {}).get('expected', 'N/A')}
        브랜드 적합성: {brand_fit.get('overall_compatibility', 'N/A')}/100
        리스크 레벨: {risk.get('overall_risk_level', 'N/A')}

        다음을 포함하여 추천해주세요:
        1. 협업 여부 및 그 이유
        2. 적정 협업 비용 범위
        3. 최적 캠페인 유형
        4. 계약 조건 제안
        5. 성과 측정 방법
        6. 리스크 관리 방안

        JSON으로 응답:
        {{
            "recommendation": "proceed/caution/avoid",
            "reasoning": "상세한 이유",
            "suggested_budget_range": {{
                "min": amount,
                "max": amount,
                "currency": "KRW"
            }},
            "optimal_campaign_type": "type",
            "contract_terms": ["term1", "term2"],
            "success_metrics": ["metric1", "metric2"],
            "timeline": "추천 기간",
            "next_steps": ["step1", "step2"]
        }}
        """
        
        try:
            response = await self._call_gemini_async(prompt)
            return json.loads(response)
        except Exception as e:
            return self._get_default_recommendations()
    
    async def _calculate_realistic_score(self, profile: InfluencerProfile, market: MarketAnalysis) -> Dict[str, float]:
        """현실적인 종합 점수 계산"""
        
        # 기본 점수 계산 (가중치 적용)
        engagement_score = min(profile.engagement_rate * 10, 100)  # 참여율 10%면 100점
        follower_score = min((profile.followers / 100000) * 20, 100)  # 10만 팔로워면 20점
        market_score = market.trend_score * 0.8  # 시장 상황 반영
        
        # 현실성 조정
        saturation_penalty = market.market_saturation * 0.3
        realistic_score = (engagement_score * 0.4 + follower_score * 0.3 + market_score * 0.3) - saturation_penalty
        
        return {
            "overall_score": max(min(realistic_score, 100), 0),
            "engagement_score": engagement_score,
            "reach_score": follower_score,
            "market_score": market_score,
            "adjusted_for_saturation": realistic_score
        }
    
    async def _analyze_cost_benefit(self, profile: InfluencerProfile, performance: Dict) -> Dict[str, Any]:
        """비용 대비 효과 분석"""
        
        # 업계 평균 단가 기준 (팔로워 1K당)
        estimated_cost_per_1k = self._estimate_cost_per_1k_followers(profile.category)
        total_estimated_cost = (profile.followers / 1000) * estimated_cost_per_1k
        
        expected_roi = performance.get('roi_prediction', {}).get('expected', 1.5)
        
        return {
            "estimated_cost_krw": total_estimated_cost,
            "cost_per_engagement": total_estimated_cost / max(profile.followers * (profile.engagement_rate / 100), 1),
            "expected_return": total_estimated_cost * expected_roi,
            "break_even_conversions": int(total_estimated_cost / 50000),  # 5만원 평균 구매액 가정
            "cost_effectiveness": "high" if expected_roi > 3 else "medium" if expected_roi > 1.5 else "low"
        }
    
    async def _suggest_optimal_timing(self, profile: InfluencerProfile) -> Dict[str, Any]:
        """최적 타이밍 제안"""
        
        current_month = datetime.now().month
        
        # 카테고리별 계절성 고려
        seasonal_multipliers = {
            "패션": {1: 0.8, 2: 0.7, 3: 1.2, 4: 1.1, 5: 1.0, 6: 0.9, 
                   7: 0.8, 8: 0.9, 9: 1.1, 10: 1.3, 11: 1.4, 12: 1.2},
            "뷰티": {1: 1.1, 2: 1.0, 3: 1.2, 4: 1.1, 5: 1.3, 6: 1.2, 
                   7: 1.1, 8: 1.0, 9: 1.1, 10: 1.2, 11: 1.3, 12: 1.4},
            "푸드": {1: 1.0, 2: 0.9, 3: 1.1, 4: 1.2, 5: 1.1, 6: 1.0, 
                   7: 0.9, 8: 0.8, 9: 1.0, 10: 1.1, 11: 1.2, 12: 1.3}
        }
        
        category_seasonality = seasonal_multipliers.get(profile.category, {})
        current_factor = category_seasonality.get(current_month, 1.0)
        
        # 최적의 월 찾기
        best_months = sorted(category_seasonality.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "current_timing_score": current_factor,
            "best_months": [{"month": month, "factor": factor} for month, factor in best_months],
            "recommendation": "proceed" if current_factor > 1.0 else "wait" if current_factor < 0.9 else "acceptable",
            "optimal_launch_window": "1-2주 후" if current_factor > 1.1 else "다음 성수기까지 대기"
        }
    
    async def _call_gemini_async(self, prompt: str) -> str:
        """비동기 Gemini API 호출"""
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, self.model.generate_content, prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API 호출 실패: {str(e)}")
    
    def _estimate_cost_per_1k_followers(self, category: str) -> float:
        """카테고리별 팔로워 1K당 평균 비용 (KRW)"""
        cost_per_1k = {
            "패션": 15000,
            "뷰티": 18000,
            "푸드": 12000,
            "여행": 14000,
            "피트니스": 13000,
            "라이프스타일": 16000
        }
        return cost_per_1k.get(category, 15000)
    
    # 기본값 반환 메서드들
    def _parse_market_analysis(self, response: str) -> MarketAnalysis:
        try:
            data = json.loads(response)
            return MarketAnalysis(
                trend_score=data.get('trend_score', 50),
                market_saturation=data.get('market_saturation', 60),
                seasonal_factors=data.get('seasonal_factors', {}),
                competitor_activity=[]
            )
        except:
            return self._get_default_market_analysis()
    
    def _get_default_market_analysis(self) -> MarketAnalysis:
        return MarketAnalysis(
            trend_score=50.0,
            market_saturation=60.0,
            seasonal_factors={"current_month": 1.0},
            competitor_activity=[]
        )
    
    def _get_default_performance_prediction(self, profile: InfluencerProfile) -> Dict[str, Any]:
        realistic_reach = int(profile.followers * 0.2)  # 20% 도달률
        return {
            "estimated_reach": {
                "min": int(realistic_reach * 0.7),
                "max": int(realistic_reach * 1.3),
                "realistic": realistic_reach
            },
            "engagement_prediction": {
                "likes": int(realistic_reach * 0.05),
                "comments": int(realistic_reach * 0.01),
                "shares": int(realistic_reach * 0.005)
            },
            "conversion_rate": {
                "optimistic": 3.0,
                "realistic": 1.5,
                "conservative": 0.8
            },
            "roi_prediction": {
                "min": 1.2,
                "expected": 2.0,
                "max": 4.5
            },
            "campaign_duration_recommendation": "14"
        }
    
    def _get_default_brand_compatibility(self) -> Dict[str, Any]:
        return {
            "overall_compatibility": 70,
            "target_audience_match": 75,
            "content_quality_score": 80,
            "brand_safety_score": 85,
            "long_term_potential": 70,
            "suitable_brand_types": ["라이프스타일", "패션"],
            "red_flags": [],
            "strengths": ["높은 참여율", "일관된 콘텐츠"]
        }
    
    def _get_default_risk_assessment(self) -> Dict[str, Any]:
        return {
            "overall_risk_level": "medium",
            "fake_followers_risk": 30,
            "engagement_authenticity": 80,
            "brand_safety_risk": 20,
            "market_volatility_risk": 40,
            "contract_reliability": 85,
            "mitigation_strategies": ["정기 모니터링", "성과 기반 계약"],
            "monitoring_recommendations": ["월간 지표 확인", "댓글 품질 분석"]
        }
    
    def _get_default_recommendations(self) -> Dict[str, Any]:
        return {
            "recommendation": "proceed",
            "reasoning": "전반적으로 양호한 지표를 보임",
            "suggested_budget_range": {
                "min": 500000,
                "max": 1500000,
                "currency": "KRW"
            },
            "optimal_campaign_type": "제품 리뷰",
            "contract_terms": ["성과 기반 보상", "콘텐츠 소유권 협의"],
            "success_metrics": ["참여율", "전환율", "브랜드 인지도"],
            "timeline": "2-4주",
            "next_steps": ["파일럿 캠페인", "성과 측정"]
        }

# 사용 예시
async def main():
    analyzer = GeminiAnalyzer()
    
    # 예시 프로필
    profile = InfluencerProfile(
        username="example_influencer",
        followers=50000,
        engagement_rate=3.5,
        category="뷰티",
        recent_posts=[],
        brand_collaborations=["브랜드A", "브랜드B"],
        demographics={}
    )
    
    result = await analyzer.analyze_influencer_realistically(profile)
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(main())