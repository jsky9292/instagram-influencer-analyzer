'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, Sparkles, Lightbulb, Target, Hash, Clock, 
  MessageSquare, Heart, Share2, Bookmark, AlertCircle, 
  CheckCircle, XCircle, Info, Zap, Trophy, Rocket,
  BarChart3, PieChart, Activity, Brain, Wand2
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ViralAnalysis {
  viral_probability: number
  success_factors: string[]
  improvement_suggestions: string[]
  hashtag_strategy: {
    total_count: number
    trending_match: number
    power_tags: number
    recommendation: string[]
    effectiveness_score: number
  }
  caption_analysis: {
    length: number
    has_emoji: boolean
    has_question: boolean
    has_cta: boolean
    hook_type: string | null
    readability_score: number
  }
  engagement_patterns: {
    engagement_distribution: {
      likes: number
      comments: number
      shares: number
      saves: number
    }
    interaction_quality: string
    virality_indicator: string
    save_rate: string
  }
  visual_elements: string[]
  posting_time: string
}

interface ContentIdea {
  title: string
  description: string
  format: string
  key_points: string[]
  expected_engagement: string
  best_time: string
  category: string
  caption_template: string
  recommended_hashtags?: string[]
  trending_elements?: string[]
  difficulty: string
  required_tools: string[]
  success_metrics: {
    min_likes: number
    min_comments: number
    min_shares: number
    target_reach: number
  }
}

interface PerformancePrediction {
  predicted_engagement_rate: string
  expected_reach: {
    min: number
    avg: number
    max: number
  }
  expected_interactions: {
    likes: number
    comments: number
    shares: number
    saves: number
  }
  confidence_level: string
  risk_factors: string[]
  optimization_tips: string[]
}

const ViralAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'ideas' | 'predict'>('analyze')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null)
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([])
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null)
  
  // 분석 입력 폼 상태
  const [contentData, setContentData] = useState({
    type: 'reels',
    caption: '',
    hashtags: '',
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0
  })
  
  // 아이디어 생성 폼 상태
  const [ideaCategory, setIdeaCategory] = useState('먹방')
  
  // 성과 예측 폼 상태
  const [predictionData, setPredictionData] = useState({
    category: '먹방',
    format: 'reels',
    posting_time: '19:00',
    hashtags: '',
    follower_count: 10000
  })
  
  const analyzeContent = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/viral/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentData,
          hashtags: contentData.hashtags.split(' ').filter(h => h.startsWith('#'))
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('분석 실패:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const generateIdeas = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/content/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: ideaCategory,
          user_data: {}
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setContentIdeas(data.ideas)
      }
    } catch (error) {
      console.error('아이디어 생성 실패:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const predictPerformance = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/content/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...predictionData,
          hashtags: predictionData.hashtags.split(' ').filter(h => h.startsWith('#'))
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setPrediction(data.prediction)
      }
    } catch (error) {
      console.error('예측 실패:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI 바이럴 분석 엔진
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            인공지능이 분석하는 바이럴 요인과 맞춤형 콘텐츠 전략
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('analyze')}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-all",
              activeTab === 'analyze' 
                ? "bg-purple-600 text-white shadow-lg" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <BarChart3 className="inline w-5 h-5 mr-2" />
            바이럴 분석
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-all",
              activeTab === 'ideas' 
                ? "bg-purple-600 text-white shadow-lg" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <Lightbulb className="inline w-5 h-5 mr-2" />
            콘텐츠 아이디어
          </button>
          <button
            onClick={() => setActiveTab('predict')}
            className={cn(
              "px-6 py-3 rounded-lg font-semibold transition-all",
              activeTab === 'predict' 
                ? "bg-purple-600 text-white shadow-lg" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <Target className="inline w-5 h-5 mr-2" />
            성과 예측
          </button>
        </div>
        
        {/* Content Analysis Tab */}
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>콘텐츠 정보 입력</CardTitle>
                <CardDescription>분석할 콘텐츠의 정보를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">콘텐츠 타입</label>
                  <select 
                    value={contentData.type}
                    onChange={(e) => setContentData({...contentData, type: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="reels">릴스</option>
                    <option value="post">일반 게시물</option>
                    <option value="carousel">캐러셀</option>
                    <option value="video">비디오</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">캡션</label>
                  <textarea
                    value={contentData.caption}
                    onChange={(e) => setContentData({...contentData, caption: e.target.value})}
                    className="w-full p-2 border rounded-lg h-24"
                    placeholder="캡션 내용을 입력하세요..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">해시태그</label>
                  <input
                    type="text"
                    value={contentData.hashtags}
                    onChange={(e) => setContentData({...contentData, hashtags: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="#먹방 #맛집 #푸드스타그램"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">좋아요</label>
                    <input
                      type="number"
                      value={contentData.likes}
                      onChange={(e) => setContentData({...contentData, likes: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">댓글</label>
                    <input
                      type="number"
                      value={contentData.comments}
                      onChange={(e) => setContentData({...contentData, comments: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">공유</label>
                    <input
                      type="number"
                      value={contentData.shares}
                      onChange={(e) => setContentData({...contentData, shares: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">저장</label>
                    <input
                      type="number"
                      value={contentData.saves}
                      onChange={(e) => setContentData({...contentData, saves: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>
                
                <button
                  onClick={analyzeContent}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? '분석 중...' : '바이럴 분석 시작'}
                </button>
              </CardContent>
            </Card>
            
            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-6">
                {/* Viral Score */}
                <Card className="border-2 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-purple-600" />
                      바이럴 확률
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {analysis.viral_probability}%
                      </div>
                      <div className="mt-2 text-gray-600">
                        {analysis.viral_probability > 70 ? '🔥 매우 높음' :
                         analysis.viral_probability > 40 ? '✨ 높음' :
                         analysis.viral_probability > 20 ? '💫 보통' : '💭 낮음'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Success Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      성공 요인
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.success_factors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <span className="text-sm">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Improvement Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      개선 제안
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.improvement_suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Hashtag Strategy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-blue-600" />
                      해시태그 전략
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">효과성 점수</span>
                        <span className="font-semibold">{analysis.hashtag_strategy.effectiveness_score}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">트렌딩 매치</span>
                        <span className="font-semibold">{analysis.hashtag_strategy.trending_match}개</span>
                      </div>
                      {analysis.hashtag_strategy.recommendation.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">추천 해시태그</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.hashtag_strategy.recommendation.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
        
        {/* Content Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="space-y-6">
            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle>카테고리 선택</CardTitle>
                <CardDescription>콘텐츠 아이디어를 생성할 카테고리를 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                  {['먹방', '여행', '패션', '뷰티', '운동'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setIdeaCategory(cat)}
                      className={cn(
                        "px-4 py-2 rounded-lg transition-all",
                        ideaCategory === cat
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  onClick={generateIdeas}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? '생성 중...' : 'AI 아이디어 생성'}
                </button>
              </CardContent>
            </Card>
            
            {/* Generated Ideas */}
            {contentIdeas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contentIdeas.map((idea, idx) => (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <CardDescription>{idea.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {idea.format}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          {idea.expected_engagement}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {idea.best_time}
                        </span>
                      </div>
                      
                      <div>
                        <p className="font-semibold text-sm mb-2">핵심 포인트</p>
                        <ul className="space-y-1">
                          {idea.key_points.map((point, pidx) => (
                            <li key={pidx} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                              <span className="text-xs text-gray-600">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {idea.recommended_hashtags && (
                        <div>
                          <p className="font-semibold text-sm mb-2">추천 해시태그</p>
                          <div className="flex flex-wrap gap-1">
                            {idea.recommended_hashtags.map((tag, tidx) => (
                              <span key={tidx} className="text-xs text-blue-600">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-4 border-t">
                        <p className="text-xs text-gray-500 mb-2">캡션 템플릿</p>
                        <p className="text-xs text-gray-600 italic">
                          {idea.caption_template.substring(0, 150)}...
                        </p>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>난이도: {idea.difficulty}</span>
                        <span>필요 도구: {idea.required_tools.join(', ')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Performance Prediction Tab */}
        {activeTab === 'predict' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prediction Form */}
            <Card>
              <CardHeader>
                <CardTitle>콘텐츠 계획 입력</CardTitle>
                <CardDescription>예측할 콘텐츠의 계획을 입력하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">카테고리</label>
                  <select 
                    value={predictionData.category}
                    onChange={(e) => setPredictionData({...predictionData, category: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="먹방">먹방</option>
                    <option value="여행">여행</option>
                    <option value="패션">패션</option>
                    <option value="뷰티">뷰티</option>
                    <option value="운동">운동</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">콘텐츠 포맷</label>
                  <select 
                    value={predictionData.format}
                    onChange={(e) => setPredictionData({...predictionData, format: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="reels">릴스</option>
                    <option value="carousel">캐러셀</option>
                    <option value="photo">사진</option>
                    <option value="video">비디오</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">포스팅 시간</label>
                  <input
                    type="text"
                    value={predictionData.posting_time}
                    onChange={(e) => setPredictionData({...predictionData, posting_time: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="19:00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">해시태그</label>
                  <input
                    type="text"
                    value={predictionData.hashtags}
                    onChange={(e) => setPredictionData({...predictionData, hashtags: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    placeholder="#먹방 #맛집 #푸드스타그램"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">팔로워 수</label>
                  <input
                    type="number"
                    value={predictionData.follower_count}
                    onChange={(e) => setPredictionData({...predictionData, follower_count: parseInt(e.target.value) || 0})}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                
                <button
                  onClick={predictPerformance}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? '예측 중...' : '성과 예측 시작'}
                </button>
              </CardContent>
            </Card>
            
            {/* Prediction Results */}
            {prediction && (
              <div className="space-y-6">
                {/* Engagement Prediction */}
                <Card className="border-2 border-green-200">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-6 h-6 text-green-600" />
                      예상 참여율
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {prediction.predicted_engagement_rate}
                      </div>
                      <div className="mt-2">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium",
                          prediction.confidence_level === 'HIGH' 
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        )}>
                          신뢰도: {prediction.confidence_level}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Expected Reach */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      예상 도달 수
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">최소</span>
                        <span className="font-semibold">{prediction.expected_reach.min.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">평균</span>
                        <span className="font-semibold text-lg text-blue-600">
                          {prediction.expected_reach.avg.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">최대</span>
                        <span className="font-semibold">{prediction.expected_reach.max.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Expected Interactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      예상 상호작용
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{prediction.expected_interactions.likes.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">좋아요</p>
                      </div>
                      <div className="text-center">
                        <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{prediction.expected_interactions.comments.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">댓글</p>
                      </div>
                      <div className="text-center">
                        <Share2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{prediction.expected_interactions.shares.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">공유</p>
                      </div>
                      <div className="text-center">
                        <Bookmark className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{prediction.expected_interactions.saves.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">저장</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Risk Factors */}
                {prediction.risk_factors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        리스크 요인
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {prediction.risk_factors.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                            <span className="text-sm text-gray-600">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {/* Optimization Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      최적화 팁
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prediction.optimization_tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Wand2 className="w-4 h-4 text-purple-500 mt-0.5" />
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ViralAnalyzer