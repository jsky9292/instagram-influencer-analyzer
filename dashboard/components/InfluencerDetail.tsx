'use client'

import React, { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Instagram, TrendingUp, Heart, MessageCircle, Eye, Music, Calendar, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Post {
  id: string
  shortcode: string
  caption: string
  like_count: number
  comment_count: number
  view_count?: number
  is_reel: boolean
  post_type: string
  media_url: string
  taken_at_timestamp: number
  engagement_rate?: number
  hashtags?: string[]
  music?: {
    song_name?: string
    artist_name?: string
    should_mute_audio?: boolean
  } | string
}

interface InfluencerData {
  username: string
  full_name?: string
  bio?: string
  followers: number
  following?: number
  posts?: number
  engagement_rate: number
  is_verified: boolean
  category?: string
  ai_grade?: string
  ai_score?: number
  profile_pic_url?: string
  external_url?: string
  recent_posts?: Post[]
  analysis?: {
    hashtag_analysis?: Record<string, number>
    music_analysis?: Record<string, number>
    avg_reel_engagement?: number
    avg_post_engagement?: number
    total_posts_analyzed?: number
    posting_frequency?: string
    best_performing_posts?: Post[]
  }
}

interface InfluencerDetailProps {
  influencer: InfluencerData | null
  isOpen: boolean
  onClose: () => void
}

const InfluencerDetail: React.FC<InfluencerDetailProps> = ({ influencer, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'analysis' | 'contact'>('overview')
  const [postsData, setPostsData] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (influencer && isOpen) {
      // analysis 데이터가 있으면 더 상세한 분석 사용
      if (influencer.analysis) {
        const { best_performing_posts = [] } = influencer.analysis
        setPostsData(best_performing_posts)
      } else {
        fetchPostsData()
      }
    }
  }, [influencer, isOpen])

  const fetchPostsData = async () => {
    if (!influencer) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/influencer/${influencer.username}/posts`)
      if (response.ok) {
        const data = await response.json()
        setPostsData(data.posts || [])
      }
    } catch (error) {
      console.error('게시물 데이터 로드 실패:', error)
      // 더미 데이터 사용
      setPostsData(generateDummyPosts())
    } finally {
      setIsLoading(false)
    }
  }

  const generateDummyPosts = (): Post[] => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: `post_${i}`,
      shortcode: `ABC${i}`,
      caption: `게시물 #${i + 1} 캡션 텍스트 #먹방 #맛집 #인스타그램`,
      like_count: Math.floor(Math.random() * 10000) + 1000,
      comment_count: Math.floor(Math.random() * 500) + 50,
      view_count: Math.floor(Math.random() * 50000) + 5000,
      is_reel: i % 3 === 0,
      post_type: i % 3 === 0 ? 'reel' : 'post',
      media_url: `https://picsum.photos/400/400?random=${i}`,
      taken_at_timestamp: Date.now() - i * 86400000,
      engagement_rate: Math.random() * 10,
      hashtags: ['먹방', '맛집', '인스타그램', '일상'],
      music: i % 3 === 0 ? 'Trending Song' : undefined
    }))
  }

  if (!isOpen || !influencer) return null

  const topPosts = [...postsData]
    .sort((a, b) => (b.like_count + b.comment_count) - (a.like_count + a.comment_count))
    .slice(0, 3)

  const postTypeData = [
    { name: '일반 게시물', value: postsData.filter(p => !p.is_reel).length, color: '#8b5cf6' },
    { name: '릴스', value: postsData.filter(p => p.is_reel).length, color: '#ec4899' }
  ]

  const engagementTrend = postsData.slice(0, 7).reverse().map((post, idx) => ({
    day: `Day ${idx + 1}`,
    likes: post.like_count,
    comments: post.comment_count,
    engagement: ((post.like_count + post.comment_count) / influencer.followers * 100).toFixed(2)
  }))

  const generateDMTemplate = () => {
    const templates = {
      ko: `안녕하세요 @${influencer.username}님! 👋\n\n귀하의 콘텐츠에 깊은 인상을 받았습니다.\n특히 ${influencer.category || '귀하의 분야'}에서의 영향력이 인상적입니다.\n\n협업 제안을 드리고 싶은데, 관심 있으신가요?\n\n감사합니다.`,
      en: `Hello @${influencer.username}! 👋\n\nI'm impressed by your content.\nEspecially your influence in ${influencer.category || 'your field'}.\n\nWould you be interested in a collaboration?\n\nBest regards,`,
      ja: `こんにちは @${influencer.username}さん! 👋\n\n素晴らしいコンテンツに感銘を受けました。\n特に${influencer.category || 'あなたの分野'}での影響力が印象的です。\n\nコラボレーションにご興味はありますか？\n\nよろしくお願いします。`
    }
    return templates.ko
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {influencer.profile_pic_url ? (
                <img 
                  src={influencer.profile_pic_url} 
                  alt={influencer.username}
                  className="w-20 h-20 rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Instagram className="w-10 h-10" />
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold">@{influencer.username}</h2>
                <p className="text-white/80">{influencer.full_name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">팔로워 {influencer.followers.toLocaleString()}</span>
                  <span className="text-sm">참여율 {influencer.engagement_rate.toFixed(2)}%</span>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs">AI 등급 {influencer.ai_grade}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-white/80">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {(['overview', 'posts', 'analysis', 'contact'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 px-4 font-medium transition-colors",
                activeTab === tab 
                  ? "text-purple-600 border-b-2 border-purple-600" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {tab === 'overview' && '개요'}
              {tab === 'posts' && '게시물'}
              {tab === 'analysis' && '분석'}
              {tab === 'contact' && '연락'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>프로필 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{influencer.bio}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">카테고리</span>
                      <p className="font-semibold">{influencer.category || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">인증 여부</span>
                      <p className="font-semibold">{influencer.is_verified ? '✓ 인증됨' : '미인증'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">게시물 수</span>
                      <p className="font-semibold">{influencer.posts?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">팔로잉</span>
                      <p className="font-semibold">{influencer.following?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a 
                      href={`https://instagram.com/${influencer.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
                    >
                      <Instagram className="w-4 h-4" />
                      프로필 방문
                    </a>
                    {influencer.external_url && (
                      <a 
                        href={influencer.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        웹사이트
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>참여율 트렌드</CardTitle>
                  <CardDescription>최근 7개 게시물 참여율 변화</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={engagementTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" name="참여율 %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>인기 게시물 TOP 3</CardTitle>
                  <CardDescription>참여율이 가장 높은 게시물</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {topPosts.map((post, idx) => (
                      <div key={post.id} className="relative group">
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs z-10">
                          #{idx + 1}
                        </div>
                        <img 
                          src={post.media_url} 
                          alt={`Post ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="flex items-center gap-4 justify-center">
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {post.like_count.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {post.comment_count.toLocaleString()}
                              </span>
                            </div>
                            {post.is_reel && (
                              <div className="flex items-center gap-1 mt-2">
                                <Eye className="w-4 h-4" />
                                {post.view_count?.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>게시물 타입 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={200} height={200}>
                      <PieChart>
                        <Pie
                          data={postTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {postTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {postTypeData.map((type) => (
                        <div key={type.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: type.color }} />
                          <span className="text-sm">{type.name}: {type.value}개</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>개인화된 콘텐츠 분석</CardTitle>
                  <CardDescription>@{influencer.username}님의 콘텐츠 전략 분석</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 실제 해시태그 분석 */}
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold mb-2">#️⃣ 자주 사용하는 해시태그</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(() => {
                          const hashtagCounts: Record<string, number> = {}
                          postsData.forEach(post => {
                            const caption = post.caption || ''
                            const hashtags = caption.match(/#[^\s#]+/g) || []
                            hashtags.forEach(tag => {
                              hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1
                            })
                          })
                          const sortedTags = Object.entries(hashtagCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 10)
                          
                          return sortedTags.length > 0 ? (
                            sortedTags.map(([tag, count]) => (
                              <span key={tag} className="px-2 py-1 bg-white rounded text-xs">
                                {tag} ({count})
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-600">해시태그 정보 수집 중...</span>
                          )
                        })()}
                      </div>
                    </div>
                    
                    {/* 릴스 음악 분석 */}
                    <div className="p-4 bg-pink-50 rounded-lg">
                      <h4 className="font-semibold mb-2">🎵 사용한 음악</h4>
                      <div className="space-y-1">
                        {(() => {
                          // 음악 정보가 있는 게시물 필터링
                          const musicPosts = postsData.filter(post => {
                            if (typeof post.music === 'object' && post.music) {
                              return post.music.song_name || post.music.artist_name
                            }
                            return false
                          })
                          
                          // 중복 제거를 위한 Map 사용
                          const uniqueMusic = new Map()
                          musicPosts.forEach(post => {
                            if (post.music && typeof post.music === 'object') {
                              const key = `${post.music.song_name}-${post.music.artist_name}`
                              if (!uniqueMusic.has(key)) {
                                uniqueMusic.set(key, {
                                  song_name: post.music.song_name || '제목 없음',
                                  artist_name: post.music.artist_name || '아티스트 미상',
                                  count: 1
                                })
                              } else {
                                uniqueMusic.get(key).count++
                              }
                            }
                          })
                          
                          // 사용 횟수순으로 정렬
                          const sortedMusic = Array.from(uniqueMusic.values())
                            .sort((a, b) => b.count - a.count)
                            .slice(0, 5)
                          
                          return sortedMusic.length > 0 ? (
                            sortedMusic.map((music, idx) => (
                              <div key={idx} className="text-sm text-gray-600">
                                <p className="font-medium">• {music.song_name}</p>
                                {music.artist_name && (
                                  <p className="ml-3 text-xs text-gray-500">by {music.artist_name} {music.count > 1 && `(${music.count}회)`}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">릴스 음악 정보 없음</p>
                          )
                        })()}
                      </div>
                    </div>
                    
                    {/* 게시물 타입별 성과 */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">📊 콘텐츠 유형별 평균 참여율</h4>
                      <div className="space-y-2">
                        {(() => {
                          const reelsPosts = postsData.filter(p => p.is_reel)
                          const normalPosts = postsData.filter(p => !p.is_reel)
                          
                          const reelsAvgEngagement = reelsPosts.length > 0 
                            ? reelsPosts.reduce((sum, p) => sum + (p.like_count + p.comment_count), 0) / reelsPosts.length
                            : 0
                          const normalAvgEngagement = normalPosts.length > 0
                            ? normalPosts.reduce((sum, p) => sum + (p.like_count + p.comment_count), 0) / normalPosts.length
                            : 0
                          
                          return (
                            <>
                              <div className="flex justify-between text-sm">
                                <span>릴스 ({reelsPosts.length}개)</span>
                                <span className="font-bold">{reelsAvgEngagement.toFixed(0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>일반 게시물 ({normalPosts.length}개)</span>
                                <span className="font-bold">{normalAvgEngagement.toFixed(0).toLocaleString()}</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>협업 제안을 위한 핵심 인사이트</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 게시 빈도 분석 */}
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-sm mb-1">📅 게시 빈도</h5>
                      <p className="text-sm text-gray-600">
                        {influencer.analysis?.posting_frequency || '주 2-3회'}
                      </p>
                    </div>
                    
                    {/* 최고 성과 게시물 시간대 */}
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <h5 className="font-semibold text-sm mb-1">⏰ 최적 게시 시간</h5>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          const bestPosts = influencer.analysis?.best_performing_posts || postsData
                          if (bestPosts.length > 0) {
                            const hours = bestPosts
                              .filter(p => p.taken_at_timestamp)
                              .map(p => new Date(p.taken_at_timestamp * 1000).getHours())
                            const avgHour = Math.round(hours.reduce((a, b) => a + b, 0) / hours.length)
                            return `${avgHour}시 전후가 가장 활발`
                          }
                          return '오후 7-9시'
                        })()}
                      </p>
                    </div>
                    
                    {/* 협업 적합도 점수 */}
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="font-semibold text-sm mb-1">🤝 협업 적합도</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>참여율</span>
                          <span className="font-bold">{influencer.engagement_rate?.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>콘텐츠 품질</span>
                          <span className="font-bold">AI 등급 {influencer.ai_grade}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>팔로워 규모</span>
                          <span className="font-bold">{influencer.followers?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 주요 타겟층 분석 */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-sm mb-1">🎯 예상 타겟층</h5>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          const hashtags = influencer.analysis?.hashtag_analysis || {}
                          const topTags = Object.keys(hashtags).slice(0, 5)
                          if (topTags.some(tag => tag.includes('food') || tag.includes('먹'))) {
                            return '20-30대 푸드 애호가'
                          } else if (topTags.some(tag => tag.includes('fashion') || tag.includes('패션'))) {
                            return '20-30대 패션 관심층'
                          } else if (topTags.some(tag => tag.includes('travel') || tag.includes('여행'))) {
                            return '20-40대 여행 애호가'
                          }
                          return '20-30대 라이프스타일 관심층'
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>협업 체크포인트</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm">평균 참여율: {influencer.engagement_rate?.toFixed(2)}% {influencer.engagement_rate > 3 ? '(우수)' : influencer.engagement_rate > 1 ? '(양호)' : '(개선 필요)'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm">콘텐츠 일관성: {influencer.analysis?.total_posts_analyzed || 30}개 게시물 분석 완료</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm">브랜드 안전성: {influencer.is_verified ? '인증 계정 ✓' : '일반 계정'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm">예상 도달률: 팔로워 {influencer.followers?.toLocaleString()}명 × 참여율 {influencer.engagement_rate?.toFixed(1)}%</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>DM 템플릿</CardTitle>
                  <CardDescription>협업 제안을 위한 메시지 템플릿</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <textarea 
                      className="w-full h-40 p-4 border rounded-lg resize-none"
                      defaultValue={generateDMTemplate()}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigator.clipboard.writeText(generateDMTemplate())}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Copy className="w-4 h-4" />
                        복사
                      </button>
                      <a
                        href={`https://instagram.com/direct/t/${influencer.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
                      >
                        <Instagram className="w-4 h-4" />
                        DM 보내기
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>협업 체크리스트</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">프로필과 브랜드 이미지 일치 확인</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">타겟 오디언스 분석 완료</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">협업 조건 및 예산 설정</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">콘텐츠 가이드라인 준비</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">계약서 및 법적 검토</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InfluencerDetail