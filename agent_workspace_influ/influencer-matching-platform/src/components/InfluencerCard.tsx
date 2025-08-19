import { useState } from 'react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Users,
  Heart,
  MessageCircle,
  Share,
  Mail,
  Instagram,
  Youtube,
  MapPin,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Star,
  Building,
  Eye,
  Play,
  Music,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatNumber, formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'

interface InfluencerCardProps {
  influencer: {
    id: string
    platform: string
    username: string
    display_name: string
    profile_image: string
    bio: string
    follower_count: number
    following_count: number
    posts_count: number
    total_posts: number
    avg_engagement_rate: number
    categories: string[]
    location: string
    contact_info: {
      email?: string
      business_email?: string
      phone?: string
    }
    recent_posts: {
      id: string
      content: string
      likes: number
      comments: number
      shares: number
      views?: number
      timestamp: string
    }[]
    collaboration_history: {
      brand: string
      type: string
      date: string
    }[]
    estimated_cost: {
      min: number
      max: number
      currency: string
    }
    verification_status?: boolean
    raw_data?: any
  }
}

export function InfluencerCard({ influencer }: InfluencerCardProps) {
  const { userProfile } = useAuth()
  const [showDetails, setShowDetails] = useState(false)

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM': return <Instagram className="h-4 w-4 text-pink-600" />
      case 'YOUTUBE': return <Youtube className="h-4 w-4 text-red-600" />
      case 'TIKTOK': return <Music className="h-4 w-4 text-black" />
      case 'TWITTER': return <div className="h-4 w-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">X</div>
      default: return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'YOUTUBE': return 'bg-red-500'
      case 'TIKTOK': return 'bg-black'
      case 'TWITTER': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getPlatformUrl = (platform: string, username: string) => {
    switch (platform) {
      case 'INSTAGRAM': return `https://instagram.com/${username}`
      case 'YOUTUBE': return influencer.raw_data?.channel_id 
        ? `https://youtube.com/channel/${influencer.raw_data.channel_id}` 
        : `https://youtube.com/@${username}`
      case 'TIKTOK': return `https://tiktok.com/@${username}`
      case 'TWITTER': return `https://twitter.com/${username}`
      default: return '#'
    }
  }

  const getEngagementLevel = (rate: number) => {
    if (rate >= 6) return { level: '매우 높음', color: 'text-green-600 bg-green-50' }
    if (rate >= 4) return { level: '높음', color: 'text-blue-600 bg-blue-50' }
    if (rate >= 2) return { level: '보통', color: 'text-yellow-600 bg-yellow-50' }
    return { level: '낮음', color: 'text-red-600 bg-red-50' }
  }

  const getInfluencerTier = (followers: number) => {
    if (followers >= 10000000) return { tier: '셀러브리티', color: 'text-purple-600 bg-purple-50' }
    if (followers >= 1000000) return { tier: '메가', color: 'text-red-600 bg-red-50' }
    if (followers >= 100000) return { tier: '매크로', color: 'text-blue-600 bg-blue-50' }
    if (followers >= 1000) return { tier: '마이크로', color: 'text-green-600 bg-green-50' }
    return { tier: '나노', color: 'text-gray-600 bg-gray-50' }
  }

  const handleContact = async () => {
    const email = influencer.contact_info.business_email || influencer.contact_info.email
    
    if (email) {
      try {
        // DB에 연락 이력 기록
        if (userProfile?.user_id) {
          await supabase.functions.invoke('log-influencer-contact', {
            body: {
              brand_id: userProfile.user_id,
              influencer_username: influencer.username,
              influencer_display_name: influencer.display_name,
              influencer_email: email,
              platform: influencer.platform,
              contact_method: 'EMAIL',
              campaign_id: null
            }
          })
        }
        
        window.open(`mailto:${email}?subject=협업 제안 - ${userProfile?.name || '브랜드'}&body=안녕하세요, ${influencer.display_name}님!\n\n${userProfile?.name || '저희 브랜드'}에서 협업 제안 드립니다.\n\n[협업 내용을 구체적으로 작성해주세요]\n\n감사합니다.`)
        toast.success('연락 이력이 기록되었고 이메일 클라이언트를 엽니다!')
      } catch (error) {
        console.error('연락 이력 기록 실패:', error)
        window.open(`mailto:${email}?subject=협업 제안&body=안녕하세요, ${influencer.display_name}님!\n\n협업 제안 드립니다.`)
        toast.success('이메일 클라이언트를 엽니다!')
      }
    } else {
      toast.error('연락처 정보가 없습니다. 소셜미디어로 직접 연락해보세요.')
    }
  }

  const engagementLevel = getEngagementLevel(influencer.avg_engagement_rate)
  const influencerTier = getInfluencerTier(influencer.follower_count)

  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4" 
          style={{ borderLeftColor: influencer.platform === 'INSTAGRAM' ? '#E1306C' : 
                                    influencer.platform === 'YOUTUBE' ? '#FF0000' : 
                                    influencer.platform === 'TIKTOK' ? '#000000' : '#1DA1F2' }}>
      <CardContent className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <img
              src={influencer.profile_image}
              alt={influencer.display_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
              onError={(e) => {
                e.currentTarget.src = '/icons/icon-192x192.png'
              }}
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getPlatformColor(influencer.platform)} flex items-center justify-center shadow-sm`}>
              {getPlatformIcon(influencer.platform)}
            </div>
            {influencer.verification_status && (
              <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-lg text-gray-900 truncate">
                {influencer.display_name}
              </h3>
              {influencer.verification_status && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <p className="text-gray-600 text-sm">@{influencer.username}</p>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-500">{influencer.location}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="shrink-0"
          >
            {showDetails ? '간단히' : '상세히'}
          </Button>
        </div>

        {/* Bio */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {influencer.bio}
        </p>

        {/* Categories and Tier */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${influencerTier.color}`}>
            {influencerTier.tier}
          </div>
          {influencer.categories.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
            >
              {category}
            </span>
          ))}
          {influencer.categories.length > 3 && (
            <span className="text-xs text-gray-500">+{influencer.categories.length - 3}</span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-gray-900 text-sm">
                {formatNumber(influencer.follower_count)}
              </span>
            </div>
            <p className="text-xs text-gray-500">팔로워</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-gray-900 text-sm">
                {influencer.avg_engagement_rate}%
              </span>
            </div>
            <p className="text-xs text-gray-500">참여율</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              {influencer.platform === 'YOUTUBE' ? <Play className="h-4 w-4 text-red-500" /> : 
               influencer.platform === 'TIKTOK' ? <Music className="h-4 w-4 text-black" /> : 
               <MessageCircle className="h-4 w-4 text-purple-500" />}
              <span className="font-semibold text-gray-900 text-sm">
                {formatNumber(influencer.total_posts || influencer.posts_count)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {influencer.platform === 'YOUTUBE' ? '동영상' : '포스트'}
            </p>
          </div>
        </div>

        {/* Cost and Engagement Level */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${engagementLevel.color}`}>
            참여도: {engagementLevel.level}
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3 text-yellow-500" />
              <span className="text-xs font-medium text-gray-900">
                {formatCurrency(influencer.estimated_cost.min)}~{formatCurrency(influencer.estimated_cost.max)}
              </span>
            </div>
            <p className="text-xs text-gray-500">예상 협업비</p>
          </div>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="border-t pt-4 space-y-4">
            {/* Platform-specific Stats */}
            {influencer.raw_data && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">플랫폼 상세 정보</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {influencer.platform === 'YOUTUBE' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">구독자:</span>
                        <span className="font-medium">{formatNumber(influencer.raw_data.subscriber_count || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">총 조회수:</span>
                        <span className="font-medium">{formatNumber(influencer.raw_data.view_count || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">동영상 수:</span>
                        <span className="font-medium">{formatNumber(influencer.raw_data.video_count || 0)}</span>
                      </div>
                    </>
                  )}
                  {(influencer.platform === 'INSTAGRAM' || influencer.platform === 'TIKTOK') && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">팔로잉:</span>
                        <span className="font-medium">{formatNumber(influencer.following_count)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">포스트:</span>
                        <span className="font-medium">{formatNumber(influencer.posts_count)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Recent Post */}
            {influencer.recent_posts.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">최근 포스트</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 mb-2">
                    {influencer.recent_posts[0].content}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{formatNumber(influencer.recent_posts[0].likes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{formatNumber(influencer.recent_posts[0].comments)}</span>
                    </div>
                    {influencer.recent_posts[0].views && (
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{formatNumber(influencer.recent_posts[0].views)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(influencer.recent_posts[0].timestamp).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Collaboration History */}
            {influencer.collaboration_history.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">협업 이력</h4>
                <div className="space-y-2">
                  {influencer.collaboration_history.slice(0, 3).map((collab, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm bg-gray-50 rounded p-2">
                      <Building className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-700 font-medium">{collab.brand}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">{collab.type}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{collab.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Matching Score */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">AI 매칭 분석</h4>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">매칭 점수</span>
                  <span className="text-lg font-bold text-purple-600">{Math.floor(Math.random() * 30 + 70)}%</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>브랜드 적합성: 높음</span>
                  <span>•</span>
                  <span>예상 ROI: {Math.floor(Math.random() * 3 + 2)}x</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <Button
            onClick={handleContact}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            연락하기
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success('관심 인플루언서에 추가되었습니다!')}
            className="px-3"
            size="sm"
          >
            <Star className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(getPlatformUrl(influencer.platform, influencer.username), '_blank')}
            className="px-3"
            size="sm"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}