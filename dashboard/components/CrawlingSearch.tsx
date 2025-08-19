'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Loader2, Instagram, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfluencerData {
  username: string
  full_name: string
  bio: string
  followers: number
  following: number
  posts: number
  engagement_rate: number
  is_verified: boolean
  category: string
  ai_grade: string
  ai_score: number
}

interface CrawlingSearchProps {
  onCrawlingResult: (data: InfluencerData[]) => void
}

const CrawlingSearch: React.FC<CrawlingSearchProps> = ({ onCrawlingResult }) => {
  const [searchMode, setSearchMode] = useState<'hashtag' | 'user'>('hashtag')
  const [hashtag, setHashtag] = useState('')
  const [username, setUsername] = useState('')
  const [targetCountry, setTargetCountry] = useState('kr')
  const [maxCount, setMaxCount] = useState(20)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [results, setResults] = useState<InfluencerData[]>([])

  const handleCrawling = async () => {
    if (searchMode === 'hashtag' && !hashtag.trim()) {
      setError('해시태그를 입력해주세요')
      return
    }
    if (searchMode === 'user' && !username.trim()) {
      setError('인플루언서 ID를 입력해주세요')
      return
    }

    setIsLoading(true)
    setError('')
    setProgress('크롤링 준비 중...')
    setResults([])

    try {
      // FastAPI 서버로 요청
      const endpoint = searchMode === 'user' ? '/analyze/user' : '/crawl'
      const requestBody = searchMode === 'user' 
        ? { username: username.replace('@', '') }
        : { 
            hashtag: hashtag.replace('#', ''),
            max_count: maxCount,
            max_user_posts: 30,
            target_country: targetCountry
          }
      
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('크롤링 API 호출 실패')
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
              setProgress('✅ 크롤링 완료!')
              setIsLoading(false)
              return
            }
            
            try {
              const parsed = JSON.parse(data)
              
              if (parsed.progress) {
                setProgress(parsed.progress)
              } else if (parsed.result) {
                if (searchMode === 'user') {
                  // 특정 사용자 분석 결과 처리
                  const userProfile = parsed.result.profile
                  const analysisData = [{
                    ...userProfile,
                    analysis: parsed.result
                  }]
                  setResults(analysisData)
                  onCrawlingResult(analysisData)
                  setProgress(`✅ @${userProfile.username} 분석 완료!`)
                } else {
                  // 해시태그 검색 결과 처리
                  setResults(parsed.result)
                  onCrawlingResult(parsed.result)
                  setProgress(`✅ ${parsed.result.length}명의 인플루언서 정보 수집 완료!`)
                }
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
      setError(err instanceof Error ? err.message : '크롤링 중 오류가 발생했습니다')
      console.error('크롤링 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 검색 카드 */}
      <Card className="w-full max-w-4xl mx-auto shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="text-3xl flex items-center justify-center gap-3">
            <Instagram className="w-10 h-10" />
            Instagram 인플루언서 실시간 검색
          </CardTitle>
          <CardDescription className="text-purple-100 text-lg">
            해시태그를 입력하여 실시간으로 인플루언서 데이터를 크롤링합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {/* 검색 모드 선택 */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setSearchMode('hashtag')}
                className={cn(
                  "px-6 py-2 rounded-md font-medium transition-all",
                  searchMode === 'hashtag' 
                    ? "bg-purple-500 text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-100"
                )}
              >
                🏷️ 해시태그 검색
              </button>
              <button
                onClick={() => setSearchMode('user')}
                className={cn(
                  "px-6 py-2 rounded-md font-medium transition-all",
                  searchMode === 'user' 
                    ? "bg-purple-500 text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-100"
                )}
              >
                👤 특정 인플루언서 분석
              </button>
            </div>
          </div>
          
          {/* 타겟 국가 및 크롤링 설정 */}
          {searchMode === 'hashtag' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">타겟 국가</label>
              <select 
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                disabled={isLoading}
              >
                <option value="kr">🇰🇷 한국</option>
                <option value="us">🇺🇸 미국</option>
                <option value="jp">🇯🇵 일본</option>
                <option value="cn">🇨🇳 중국</option>
                <option value="uk">🇬🇧 영국</option>
                <option value="fr">🇫🇷 프랑스</option>
                <option value="de">🇩🇪 독일</option>
                <option value="es">🇪🇸 스페인</option>
                <option value="br">🇧🇷 브라질</option>
                <option value="in">🇮🇳 인도</option>
                <option value="id">🇮🇩 인도네시아</option>
                <option value="th">🇹🇭 태국</option>
                <option value="vn">🇻🇳 베트남</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">선택한 국가의 인플루언서를 검색합니다.</p>
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">크롤링 개수</label>
              <select 
                value={maxCount}
                onChange={(e) => setMaxCount(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                disabled={isLoading}
              >
                <option value={10}>10명</option>
                <option value={20}>20명 (권장)</option>
                <option value={30}>30명</option>
                <option value={50}>50명</option>
                <option value={100}>100명 (느림)</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">분석할 인플루언서 수를 선택합니다.</p>
            </div>
          </div>
          )}

          {/* 특정 인플루언서 검색 */}
          {searchMode === 'user' && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">인플루언서 ID</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">@</span>
                <input
                  type="text"
                  placeholder="분석할 인플루언서 ID 입력 (예: cristiano, selenagomez)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium"
                  disabled={isLoading}
                  onKeyPress={(e) => e.key === 'Enter' && handleCrawling()}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">특정 인플루언서의 최근 50개 게시물을 분석하여 협업 제안을 위한 상세 정보를 제공합니다.</p>
            </div>
          )}

          {/* 해시태그 검색창 */}
          {searchMode === 'hashtag' && (
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="해시태그 입력 (예: 먹방, 여행, 화장품, travel, fashion)"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-medium"
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleCrawling()}
              />
            </div>
            <button
              onClick={handleCrawling}
              disabled={isLoading || !hashtag.trim()}
              className={cn(
                "px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg",
                "hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transform hover:scale-105",
                "focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "🔍 검색 시작"
              )}
            </button>
          </div>
          )}

          {/* 특정 인플루언서 분석 버튼 */}
          {searchMode === 'user' && (
            <div className="flex justify-center">
              <button
                onClick={handleCrawling}
                disabled={isLoading || !username.trim()}
                className={cn(
                  "px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg",
                  "hover:from-purple-600 hover:to-pink-600 hover:shadow-xl transform hover:scale-105",
                  "focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "📊 분석 시작"
                )}
              </button>
            </div>
          )}

          {/* Progress */}
          {progress && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {isLoading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                  <span className="text-blue-700 font-semibold text-lg">{progress}</span>
                </div>
                {isLoading && (
                  <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-semibold">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 크롤링 안내 */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50">
            <CardContent className="p-6">
              <h4 className="font-bold text-lg mb-4 text-gray-800">🚀 크롤링 과정:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">해시태그 게시물 수집</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">인플루언서 계정 추출</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">프로필 정보 분석</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-700">참여율 계산</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-gray-700">AI 등급 평가</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-gray-700">결과 시각화</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* 빠른 결과 미리보기 */}
      {results.length > 0 && (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="w-8 h-8" />
              검색 결과 미리보기
            </CardTitle>
            <CardDescription className="text-green-100">
              총 {results.length}명의 인플루언서를 발견했습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.slice(0, 6).map((influencer, index) => (
                <div key={influencer.username} className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {influencer.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">@{influencer.username}</p>
                      <p className="text-sm text-gray-500">{influencer.full_name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">팔로워:</span>
                      <span className="font-semibold text-blue-600">{influencer.followers?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">참여율:</span>
                      <span className="font-semibold text-green-600">{influencer.engagement_rate?.toFixed(2) || 'N/A'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI 등급:</span>
                      <span className={cn(
                        "font-bold px-2 py-1 rounded text-xs",
                        influencer.ai_grade === 'S' && "bg-purple-100 text-purple-800",
                        influencer.ai_grade === 'A' && "bg-blue-100 text-blue-800",
                        influencer.ai_grade === 'B' && "bg-green-100 text-green-800",
                        influencer.ai_grade === 'C' && "bg-yellow-100 text-yellow-800"
                      )}>
                        {influencer.ai_grade || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {results.length > 6 && (
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  +{results.length - 6}명 더 있습니다. 아래 대시보드에서 전체 결과를 확인하세요.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CrawlingSearch