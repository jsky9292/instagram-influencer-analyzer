'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, Sparkles, Lightbulb, Hash, Clock, 
  MessageSquare, Heart, AlertCircle, 
  CheckCircle, Info, Zap, Trophy, Rocket,
  BarChart3, Activity, Brain, Wand2, PenTool, Target, Copy
} from 'lucide-react'
import { API_URL } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ViralPostAnalysis {
  post_url: string
  likes: number
  comments: number
  caption: string
  hashtags: string[]
  success_factors: string[]
  copywriting_patterns: {
    hook_type: string
    emotion: string
    cta: string
    storytelling: boolean
  }
  visual_elements: string[]
  posting_time: string
  engagement_rate: number
}

interface InfluencerViralAnalysis {
  username: string
  followers: number
  average_engagement: number
  viral_posts: ViralPostAnalysis[]
  growth_timeline: {
    period: string
    followers_gained: number
    key_event: string
  }[]
  success_formula: {
    content_type: string
    posting_frequency: string
    best_times: string[]
    key_themes: string[]
    unique_style: string
  }
  copywriting_insights: {
    common_hooks: string[]
    emoji_usage: string
    caption_length: string
    engagement_triggers: string[]
  }
}

interface CopywritingIdea {
  category: string
  hook: string
  main_content: string
  cta: string
  hashtags: string[]
  emoji_combination: string
  emotion_target: string
  expected_engagement: string
}

const ViralAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'viral' | 'copywriting' | 'ideas'>('viral')
  const [loading, setLoading] = useState(false)
  
  // 떡상 분석 상태
  const [targetUsername, setTargetUsername] = useState('')
  const [viralAnalysis, setViralAnalysis] = useState<InfluencerViralAnalysis | null>(null)
  
  // 카피라이팅 상태
  const [copywritingTopic, setCopywritingTopic] = useState('')
  const [copywritingCategory, setCopywritingCategory] = useState('먹방')
  const [copywritingIdeas, setCopywritingIdeas] = useState<CopywritingIdea[]>([])
  
  // 콘텐츠 아이디어 상태
  const [ideaCategory, setIdeaCategory] = useState('먹방')
  const [contentIdeas, setContentIdeas] = useState<any[]>([])
  
  // 떡상 인플루언서 분석
  const analyzeViralInfluencer = async () => {
    if (!targetUsername) {
      alert('분석할 인플루언서의 사용자명을 입력해주세요.')
      return
    }
    
    setLoading(true)
    try {
      // 인플루언서 데이터 수집
      const response = await fetch(`${API_URL}/analyze/viral-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUsername.replace('@', '') })
      })
      
      const data = await response.json()
      if (data.result) {
        // 분석 결과 처리
        setViralAnalysis({
          username: targetUsername,
          followers: data.result.profile?.followers || 0,
          average_engagement: data.result.profile?.avg_engagement || 0,
          viral_posts: data.result.viral_analysis?.top_posts || [],
          growth_timeline: [],
          success_formula: {
            content_type: data.result.viral_analysis?.content_patterns?.most_successful_type || '릴스',
            posting_frequency: data.result.viral_analysis?.content_patterns?.posting_frequency || '주 3-4회',
            best_times: data.result.viral_analysis?.best_posting_times || ['19:00-21:00'],
            key_themes: data.result.viral_analysis?.trending_themes || [],
            unique_style: data.result.viral_analysis?.unique_style || '개성있는 스타일'
          },
          copywriting_insights: {
            common_hooks: data.result.viral_analysis?.copywriting?.common_hooks || [],
            emoji_usage: data.result.viral_analysis?.copywriting?.emoji_usage || '적극 활용',
            caption_length: data.result.viral_analysis?.copywriting?.avg_length || '중간 길이',
            engagement_triggers: data.result.viral_analysis?.copywriting?.triggers || []
          }
        })
      }
    } catch (error) {
      console.error('분석 실패:', error)
      alert('분석 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }
  
  // 카피라이팅 아이디어 생성
  const generateCopywriting = async () => {
    if (!copywritingTopic) {
      alert('주제나 상품명을 입력해주세요.')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/copywriting/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: copywritingTopic,
          category: copywritingCategory
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setCopywritingIdeas(data.ideas || [])
      }
    } catch (error) {
      // 임시 더미 데이터
      setCopywritingIdeas([
        {
          category: copywritingCategory,
          hook: `🔥 ${copywritingTopic} 때문에 난리난 이유`,
          main_content: `오늘 소개해드릴 ${copywritingTopic}! 진짜 인생템이에요. 써보니까 완전 달라졌어요.`,
          cta: '👇 댓글로 궁금한 점 물어보세요!',
          hashtags: ['#' + copywritingTopic, '#인생템', '#강추', '#일상', '#추천'],
          emoji_combination: '🔥✨💝',
          emotion_target: '호기심 + 신뢰',
          expected_engagement: '높음'
        },
        {
          category: copywritingCategory,
          hook: `${copywritingTopic} 모르면 손해인 이유 3가지`,
          main_content: `1. 가성비 최고\n2. 효과 확실\n3. 만족도 200%\n\n진짜 써보면 압니다!`,
          cta: '더 자세한 후기는 프로필 링크!',
          hashtags: ['#' + copywritingTopic, '#꿀템', '#대박', '#후기', '#솔직리뷰'],
          emoji_combination: '💯👍🎯',
          emotion_target: 'FOMO (놓치는 것에 대한 두려움)',
          expected_engagement: '매우 높음'
        },
        {
          category: copywritingCategory,
          hook: `와... ${copywritingTopic} 이렇게 좋은 줄 몰랐어요`,
          main_content: `처음엔 반신반의했는데 직접 써보니까 진짜 대박이에요. 특히 [특징]이 정말 만족스러워요!`,
          cta: '❤️ 공감되면 좋아요 꾹!',
          hashtags: ['#' + copywritingTopic, '#신세계', '#만족', '#데일리', '#추천템'],
          emoji_combination: '😍🙌✨',
          emotion_target: '놀라움 + 만족',
          expected_engagement: '보통'
        }
      ])
    } finally {
      setLoading(false)
    }
  }
  
  // 콘텐츠 아이디어 생성
  const generateContentIdeas = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/content/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: ideaCategory })
      })
      
      const data = await response.json()
      if (data.success) {
        setContentIdeas(data.ideas || [])
      }
    } catch (error) {
      console.error('아이디어 생성 실패:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 카피라이팅 복사
  const copyCopywriting = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('클립보드에 복사되었습니다!')
  }
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🚀 AI 바이럴 분석 엔진
        </h1>
        <p className="text-gray-600 text-lg">
          떡상 인플루언서의 성공 비결을 분석하고 매력적인 카피라이팅을 생성합니다
        </p>
      </div>
      
      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('viral')}
          className={cn(
            "px-6 py-3 rounded-lg font-semibold transition-all",
            activeTab === 'viral' 
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
              : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <TrendingUp className="inline w-5 h-5 mr-2" />
          떡상 분석
        </button>
        <button
          onClick={() => setActiveTab('copywriting')}
          className={cn(
            "px-6 py-3 rounded-lg font-semibold transition-all",
            activeTab === 'copywriting' 
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
              : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <PenTool className="inline w-5 h-5 mr-2" />
          카피라이팅
        </button>
        <button
          onClick={() => setActiveTab('ideas')}
          className={cn(
            "px-6 py-3 rounded-lg font-semibold transition-all",
            activeTab === 'ideas' 
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg" 
              : "bg-white text-gray-600 hover:bg-gray-50"
          )}
        >
          <Lightbulb className="inline w-5 h-5 mr-2" />
          콘텐츠 아이디어
        </button>
      </div>
      
      {/* 떡상 인플루언서 분석 */}
      {activeTab === 'viral' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
                떡상 인플루언서 성공 비결 분석
              </CardTitle>
              <CardDescription>
                급성장한 인플루언서의 바이럴 전략을 상세히 분석합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  placeholder="@username (예: @matdori.world)"
                  className="flex-1 p-3 border rounded-lg"
                />
                <button
                  onClick={analyzeViralInfluencer}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? '분석 중...' : '떡상 비결 분석'}
                </button>
              </div>
              
              {viralAnalysis && (
                <div className="space-y-6">
                  {/* 프로필 요약 */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">@{viralAnalysis.username} 분석 결과</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">팔로워</p>
                        <p className="text-2xl font-bold">{viralAnalysis.followers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">평균 참여율</p>
                        <p className="text-2xl font-bold">{viralAnalysis.average_engagement}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">주력 콘텐츠</p>
                        <p className="text-lg font-semibold">{viralAnalysis.success_formula.content_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">게시 빈도</p>
                        <p className="text-lg font-semibold">{viralAnalysis.success_formula.posting_frequency}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 성공 공식 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>🎯 성공 공식</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="font-semibold">베스트 타임:</span>
                          <span className="ml-2">{viralAnalysis.success_formula.best_times.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-semibold">주요 테마:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {viralAnalysis.success_formula.key_themes.map((theme, i) => (
                              <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold">독특한 스타일:</span>
                          <span className="ml-2">{viralAnalysis.success_formula.unique_style}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* 카피라이팅 인사이트 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>✍️ 카피라이팅 패턴</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <span className="font-semibold">자주 사용하는 훅:</span>
                          <ul className="mt-2 space-y-1">
                            {viralAnalysis.copywriting_insights.common_hooks.map((hook, i) => (
                              <li key={i} className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                {hook}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold">이모지 사용:</span>
                          <span className="ml-2">{viralAnalysis.copywriting_insights.emoji_usage}</span>
                        </div>
                        <div>
                          <span className="font-semibold">캡션 길이:</span>
                          <span className="ml-2">{viralAnalysis.copywriting_insights.caption_length}</span>
                        </div>
                        <div>
                          <span className="font-semibold">참여 유발 요소:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {viralAnalysis.copywriting_insights.engagement_triggers.map((trigger, i) => (
                              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 카피라이팅 도우미 */}
      {activeTab === 'copywriting' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="w-6 h-6 mr-2 text-purple-600" />
                AI 카피라이팅 도우미
              </CardTitle>
              <CardDescription>
                주제만 입력하면 매력적인 문구 10개를 즉시 생성합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={copywritingTopic}
                    onChange={(e) => setCopywritingTopic(e.target.value)}
                    placeholder="주제/상품명 (예: 다이어트 도시락)"
                    className="md:col-span-2 p-3 border rounded-lg"
                  />
                  <select
                    value={copywritingCategory}
                    onChange={(e) => setCopywritingCategory(e.target.value)}
                    className="p-3 border rounded-lg"
                  >
                    <option value="먹방">먹방</option>
                    <option value="패션">패션</option>
                    <option value="뷰티">뷰티</option>
                    <option value="여행">여행</option>
                    <option value="운동">운동</option>
                    <option value="일상">일상</option>
                    <option value="반려동물">반려동물</option>
                    <option value="육아">육아</option>
                  </select>
                </div>
                <button
                  onClick={generateCopywriting}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? '생성 중...' : '✨ 매력적인 문구 10개 생성'}
                </button>
              </div>
              
              {copywritingIdeas.length > 0 && (
                <div className="mt-6 space-y-4">
                  {copywritingIdeas.map((idea, index) => (
                    <Card key={index} className="border-l-4 border-purple-500">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-lg">{idea.hook}</p>
                              <p className="mt-2 text-gray-700">{idea.main_content}</p>
                              <p className="mt-2 font-semibold text-purple-600">{idea.cta}</p>
                            </div>
                            <button
                              onClick={() => copyCopywriting(`${idea.hook}\n\n${idea.main_content}\n\n${idea.cta}`)}
                              className="p-2 hover:bg-gray-100 rounded"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {idea.hashtags.map((tag, i) => (
                              <span key={i} className="text-blue-600 text-sm">{tag}</span>
                            ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">이모지:</span>
                              <span className="ml-2">{idea.emoji_combination}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">감정:</span>
                              <span className="ml-2">{idea.emotion_target}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">예상 참여:</span>
                              <span className="ml-2 font-semibold">{idea.expected_engagement}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 콘텐츠 아이디어 */}
      {activeTab === 'ideas' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-6 h-6 mr-2 text-purple-600" />
                AI 콘텐츠 아이디어 생성
              </CardTitle>
              <CardDescription>
                카테고리별 트렌딩 콘텐츠 아이디어와 상세 가이드를 제공합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <select
                  value={ideaCategory}
                  onChange={(e) => setIdeaCategory(e.target.value)}
                  className="flex-1 p-3 border rounded-lg"
                >
                  <option value="먹방">먹방</option>
                  <option value="여행">여행</option>
                  <option value="패션">패션</option>
                  <option value="뷰티">뷰티</option>
                  <option value="운동">운동</option>
                  <option value="일상">일상</option>
                  <option value="반려동물">반려동물</option>
                  <option value="요리">요리</option>
                  <option value="육아">육아</option>
                  <option value="공부">공부</option>
                  <option value="인테리어">인테리어</option>
                  <option value="예술">예술</option>
                </select>
                <button
                  onClick={generateContentIdeas}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? '생성 중...' : '아이디어 생성'}
                </button>
              </div>
              
              {contentIdeas.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contentIdeas.map((idea, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{idea.description}</p>
                        <div className="space-y-2">
                          <div>
                            <span className="font-semibold">포맷:</span>
                            <span className="ml-2">{idea.format}</span>
                          </div>
                          <div>
                            <span className="font-semibold">핵심 포인트:</span>
                            <ul className="mt-1 ml-4 list-disc">
                              {idea.key_points?.map((point: string, i: number) => (
                                <li key={i} className="text-sm">{point}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-semibold">예상 참여율:</span>
                            <span className="ml-2 text-purple-600">{idea.expected_engagement}</span>
                          </div>
                          <div>
                            <span className="font-semibold">베스트 타임:</span>
                            <span className="ml-2">{idea.best_time}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ViralAnalyzer