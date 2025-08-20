'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, TrendingUp, DollarSign, Target, Brain, Star } from 'lucide-react'

interface GeminiAnalysisResult {
  influencer_score: {
    overall_score: number
    engagement_score: number
    reach_score: number
    market_score: number
  }
  performance_prediction: {
    estimated_reach: {
      realistic: number
      min: number
      max: number
    }
    conversion_rate: {
      realistic: number
      optimistic: number
      conservative: number
    }
    roi_prediction: {
      expected: number
      min: number
      max: number
    }
  }
  brand_compatibility: {
    overall_compatibility: number
    target_audience_match: number
    content_quality_score: number
    brand_safety_score: number
    suitable_brand_types: string[]
    strengths: string[]
    red_flags: string[]
  }
  risk_assessment: {
    overall_risk_level: string
    fake_followers_risk: number
    engagement_authenticity: number
    brand_safety_risk: number
    mitigation_strategies: string[]
  }
  recommendations: {
    recommendation: string
    reasoning: string
    suggested_budget_range: {
      min: number
      max: number
      currency: string
    }
    optimal_campaign_type: string
    next_steps: string[]
  }
  cost_benefit_analysis: {
    estimated_cost_krw: number
    expected_return: number
    cost_effectiveness: string
    break_even_conversions: number
  }
}

export default function GeminiAnalyzer() {
  const [analysisData, setAnalysisData] = useState({
    username: '',
    followers: '',
    engagement_rate: '',
    category: '뷰티',
    brand_collaborations: ''
  })
  
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    '뷰티', '패션', '푸드', '여행', '피트니스', '라이프스타일', '기타'
  ]

  const handleInputChange = (field: string, value: string) => {
    setAnalysisData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const performGeminiAnalysis = async () => {
    if (!analysisData.username || !analysisData.followers || !analysisData.engagement_rate) {
      setError('모든 필수 정보를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      const requestData = {
        username: analysisData.username,
        followers: parseInt(analysisData.followers),
        engagement_rate: parseFloat(analysisData.engagement_rate),
        category: analysisData.category,
        recent_posts: [],
        brand_collaborations: analysisData.brand_collaborations.split(',').map(s => s.trim()).filter(s => s),
        demographics: {}
      }

      const response = await fetch(`${API_URL}/api/gemini/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalysis(result.analysis)
      } else {
        throw new Error('분석 결과를 받지 못했습니다.')
      }
    } catch (err: any) {
      console.error('Gemini 분석 실패:', err)
      setError(err.message || '분석 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'proceed': return 'bg-green-100 text-green-800'
      case 'caution': return 'bg-yellow-100 text-yellow-800'
      case 'avoid': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Gemini AI 현실적 분석
          </CardTitle>
          <CardDescription>
            Google Gemini AI를 활용한 시장 데이터 기반 현실적인 인플루언서 분석
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">인플루언서 사용자명</Label>
              <Input
                id="username"
                placeholder="@username"
                value={analysisData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="followers">팔로워 수</Label>
              <Input
                id="followers"
                type="number"
                placeholder="50000"
                value={analysisData.followers}
                onChange={(e) => handleInputChange('followers', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="engagement">참여율 (%)</Label>
              <Input
                id="engagement"
                type="number"
                step="0.1"
                placeholder="3.5"
                value={analysisData.engagement_rate}
                onChange={(e) => handleInputChange('engagement_rate', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select value={analysisData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="collaborations">브랜드 협업 이력 (쉼표로 구분)</Label>
            <Input
              id="collaborations"
              placeholder="브랜드A, 브랜드B, 브랜드C"
              value={analysisData.brand_collaborations}
              onChange={(e) => handleInputChange('brand_collaborations', e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <Button 
            onClick={performGeminiAnalysis} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Gemini AI 분석 중...' : 'Gemini AI 분석 시작'}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* 종합 점수 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                종합 분석 점수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.influencer_score.overall_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">종합 점수</div>
                  <Progress value={analysis.influencer_score.overall_score} className="mt-2" />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.influencer_score.engagement_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">참여도</div>
                  <Progress value={analysis.influencer_score.engagement_score} className="mt-2" />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis.influencer_score.reach_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">도달률</div>
                  <Progress value={analysis.influencer_score.reach_score} className="mt-2" />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysis.influencer_score.market_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-500">시장 적합도</div>
                  <Progress value={analysis.influencer_score.market_score} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 성과 예측 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                캠페인 성과 예측
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">예상 도달률</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.performance_prediction.estimated_reach.realistic.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {analysis.performance_prediction.estimated_reach.min.toLocaleString()} - {analysis.performance_prediction.estimated_reach.max.toLocaleString()}
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">전환율</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.performance_prediction.conversion_rate.realistic}%
                  </div>
                  <div className="text-sm text-gray-500">
                    보수적: {analysis.performance_prediction.conversion_rate.conservative}% | 
                    낙관적: {analysis.performance_prediction.conversion_rate.optimistic}%
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2">예상 ROI</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis.performance_prediction.roi_prediction.expected.toFixed(1)}x
                  </div>
                  <div className="text-sm text-gray-500">
                    {analysis.performance_prediction.roi_prediction.min.toFixed(1)}x - {analysis.performance_prediction.roi_prediction.max.toFixed(1)}x
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 브랜드 적합성 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                브랜드 적합성 평가
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">적합성 지표</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>전체 적합성</span>
                      <span className="font-semibold">{analysis.brand_compatibility.overall_compatibility}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>타겟 매칭</span>
                      <span className="font-semibold">{analysis.brand_compatibility.target_audience_match}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>콘텐츠 품질</span>
                      <span className="font-semibold">{analysis.brand_compatibility.content_quality_score}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>브랜드 안전성</span>
                      <span className="font-semibold">{analysis.brand_compatibility.brand_safety_score}/100</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">적합한 브랜드 유형</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {analysis.brand_compatibility.suitable_brand_types.map((type, index) => (
                      <Badge key={index} variant="secondary">{type}</Badge>
                    ))}
                  </div>
                  
                  <h4 className="font-semibold mb-2">강점</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {analysis.brand_compatibility.strengths.map((strength, index) => (
                      <li key={index} className="text-green-600">{strength}</li>
                    ))}
                  </ul>
                  
                  {analysis.brand_compatibility.red_flags.length > 0 && (
                    <>
                      <h4 className="font-semibold mb-2 mt-3">주의사항</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {analysis.brand_compatibility.red_flags.map((flag, index) => (
                          <li key={index} className="text-red-600">{flag}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 리스크 평가 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                리스크 평가
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span>전체 리스크 레벨:</span>
                <Badge className={getRiskColor(analysis.risk_assessment.overall_risk_level)}>
                  {analysis.risk_assessment.overall_risk_level.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">리스크 지표</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>가짜 팔로워 위험</span>
                      <span className="font-semibold">{analysis.risk_assessment.fake_followers_risk}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>참여도 신뢰성</span>
                      <span className="font-semibold">{analysis.risk_assessment.engagement_authenticity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>브랜드 안전 위험</span>
                      <span className="font-semibold">{analysis.risk_assessment.brand_safety_risk}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">완화 전략</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {analysis.risk_assessment.mitigation_strategies.map((strategy, index) => (
                      <li key={index}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 비용 대비 효과 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                비용 대비 효과 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">예상 비용</h4>
                  <div className="text-xl font-bold">
                    {formatCurrency(analysis.cost_benefit_analysis.estimated_cost_krw)}
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">예상 수익</h4>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(analysis.cost_benefit_analysis.expected_return)}
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">비용 효율성</h4>
                  <div className="text-xl font-bold text-blue-600">
                    {analysis.cost_benefit_analysis.cost_effectiveness.toUpperCase()}
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2">손익분기점</h4>
                  <div className="text-xl font-bold text-purple-600">
                    {analysis.cost_benefit_analysis.break_even_conversions}건
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 추천사항 */}
          <Card>
            <CardHeader>
              <CardTitle>AI 추천사항</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span>추천 결과:</span>
                <Badge className={getRecommendationColor(analysis.recommendations.recommendation)}>
                  {analysis.recommendations.recommendation.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-gray-700">{analysis.recommendations.reasoning}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">제안 예산 범위</h4>
                  <div className="text-lg">
                    {formatCurrency(analysis.recommendations.suggested_budget_range.min)} - {formatCurrency(analysis.recommendations.suggested_budget_range.max)}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">최적 캠페인 유형</h4>
                  <div className="text-lg">{analysis.recommendations.optimal_campaign_type}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">다음 단계</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.recommendations.next_steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}