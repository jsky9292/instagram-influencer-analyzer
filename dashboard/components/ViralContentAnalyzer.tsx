'use client'

import React, { useState } from 'react'
import { API_ENDPOINTS } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Lightbulb, Video, Edit3, Target, Clock, Hash, Zap, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyIdea {
  type: string
  template: string
  example: string
}

interface VideoIdea {
  type: string
  technique: string
  suggestion: string
  example: string
}

interface ViralPost {
  post: {
    shortcode: string
    caption: string
    like_count: number
    comment_count: number
    engagement_rate: number
    is_reel: boolean
    hashtags: string[]
    media_url: string
  }
  success_factors: string[]
  copy_ideas: CopyIdea[]
  video_ideas: VideoIdea[]
}

interface ContentStrategy {
  posting_frequency: string
  content_mix: string
  engagement_tactics: string[]
  growth_tips: string[]
}

interface ViralAnalysis {
  profile: {
    username: string
    followers: number
    avg_engagement: number
  }
  viral_analysis: ViralPost[]
  overall_insights: {
    best_time_to_post: string
    optimal_hashtag_count: string
    content_type_performance: {
      reels: number
      posts: number
    }
    engagement_triggers: string[]
    content_strategy: ContentStrategy
  }
}

const ViralContentAnalyzer: React.FC = () => {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ViralAnalysis | null>(null)
  const [expandedPost, setExpandedPost] = useState<number | null>(0)
  const [error, setError] = useState('')

  const analyzeContent = async () => {
    if (!username.trim()) {
      setError('인플루언서 ID를 입력해주세요')
      return
    }

    setIsLoading(true)
    setError('')
    setAnalysis(null)

    try {
      const response = await fetch(API_ENDPOINTS.analyzeViral, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.replace('@', '') }),
      })

      if (!response.ok) {
        throw new Error('분석 API 호출 실패')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('응답 스트림을 읽을 수 없습니다')

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') {
              setIsLoading(false)
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              
              if (parsed.result) {
                setAnalysis(parsed.result)
              } else if (parsed.error) {
                setError(parsed.error)
                setIsLoading(false)
                return
              }
            } catch (e) {
              console.log('JSON 파싱 실패:', data)
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다')
      console.error('분석 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('복사되었습니다!')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 검색 섹션 */}
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
          <CardTitle className="text-3xl flex items-center gap-3">
            <TrendingUp className="w-10 h-10" />
            바이럴 콘텐츠 분석 & 아이디어 생성
          </CardTitle>
          <CardDescription className="text-orange-100 text-lg">
            인플루언서의 인기 콘텐츠를 분석하여 성공 요인을 파악하고 카피라이팅과 영상 아이디어를 제공합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">인플루언서 ID</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">@</span>
                <input
                  type="text"
                  placeholder="분석할 인플루언서 ID 입력"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-medium"
                  disabled={isLoading}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeContent()}
                />
              </div>
            </div>
            <button
              onClick={analyzeContent}
              disabled={isLoading || !username.trim()}
              className={cn(
                "px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg",
                "hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isLoading ? '분석 중...' : '🚀 분석 시작'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 분석 결과 */}
      {analysis && (
        <>
          {/* 전체 인사이트 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  최적 게시 시간
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-center">
                  {analysis.overall_insights.best_time_to_post}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  최적 해시태그 수
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-center">
                  {analysis.overall_insights.optimal_hashtag_count}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  참여 유발 요소
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {analysis.overall_insights.engagement_triggers.map((trigger, idx) => (
                    <span key={idx} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                      {trigger}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 바이럴 게시물 분석 */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">🔥 Top 바이럴 콘텐츠 분석</CardTitle>
              <CardDescription>평균 대비 2배 이상의 참여율을 기록한 게시물들</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysis.viral_analysis.map((viral, index) => (
                <Card key={index} className="border-2 border-orange-200">
                  <CardHeader 
                    className="cursor-pointer hover:bg-orange-50 transition-colors"
                    onClick={() => setExpandedPost(expandedPost === index ? null : index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-2xl font-bold text-orange-500">#{index + 1}</span>
                          {viral.post.is_reel && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                              REEL
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            참여율: {viral.post.engagement_rate.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{viral.post.caption}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <span>❤️ {viral.post.like_count.toLocaleString()}</span>
                          <span>💬 {viral.post.comment_count.toLocaleString()}</span>
                        </div>
                      </div>
                      {expandedPost === index ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </CardHeader>
                  
                  {expandedPost === index && (
                    <CardContent className="space-y-6 bg-gray-50">
                      {/* 성공 요인 */}
                      <div>
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-500" />
                          성공 요인 분석
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {viral.success_factors.map((factor, idx) => (
                            <span key={idx} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 카피라이팅 아이디어 */}
                      <div>
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <Edit3 className="w-5 h-5 text-blue-500" />
                          카피라이팅 아이디어
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {viral.copy_ideas.map((idea, idx) => (
                            <Card key={idx} className="bg-white">
                              <CardContent className="p-4">
                                <h5 className="font-semibold text-blue-600 mb-2">{idea.type}</h5>
                                <p className="text-sm text-gray-600 mb-2">템플릿: {idea.template}</p>
                                <div className="p-2 bg-blue-50 rounded text-sm">
                                  <p className="italic">{idea.example}</p>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(idea.example)}
                                  className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  <Copy className="w-3 h-3" />
                                  복사
                                </button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* 영상 아이디어 */}
                      <div>
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <Video className="w-5 h-5 text-purple-500" />
                          영상 제작 아이디어
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {viral.video_ideas.map((idea, idx) => (
                            <Card key={idx} className="bg-white">
                              <CardContent className="p-4">
                                <h5 className="font-semibold text-purple-600 mb-1">{idea.type}</h5>
                                <p className="text-sm font-medium text-gray-700 mb-2">{idea.technique}</p>
                                <p className="text-sm text-gray-600 mb-2">{idea.suggestion}</p>
                                <div className="p-2 bg-purple-50 rounded text-sm">
                                  <p className="italic">{idea.example}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* 해시태그 */}
                      <div>
                        <h4 className="font-bold text-sm mb-2">사용된 해시태그</h4>
                        <div className="flex flex-wrap gap-1">
                          {viral.post.hashtags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* 콘텐츠 전략 */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Lightbulb className="w-8 h-8" />
                맞춤형 콘텐츠 전략
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-3">📅 게시 전략</h4>
                  <p className="mb-2">빈도: {analysis.overall_insights.content_strategy.posting_frequency}</p>
                  <p>콘텐츠 믹스: {analysis.overall_insights.content_strategy.content_mix}</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-lg mb-3">💡 참여율 향상 전략</h4>
                  <ul className="space-y-1">
                    {analysis.overall_insights.content_strategy.engagement_tactics.map((tactic, idx) => (
                      <li key={idx} className="text-sm text-gray-700">• {tactic}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="font-bold text-lg mb-3">🚀 성장 팁</h4>
                  <div className="flex flex-wrap gap-3">
                    {analysis.overall_insights.content_strategy.growth_tips.map((tip, idx) => (
                      <span key={idx} className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-lg text-sm">
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default ViralContentAnalyzer