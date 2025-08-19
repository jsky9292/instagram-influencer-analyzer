import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { AdvancedInfluencerSearch } from '../components/AdvancedInfluencerSearch'
import { useAIMatching } from '../hooks/useApi'
import { formatNumber, formatCurrency } from '../lib/utils'
import { 
  Search, 
  Filter, 
  Users, 
  MessageCircle,
  TrendingUp,
  Instagram,
  Youtube,
  Zap,
  Star,
  MapPin,
  ExternalLink,
  Sparkles
} from 'lucide-react'

// Mock data for demonstration
const mockInfluencers = [
  {
    id: '1',
    name: '김인플루',
    channel_name: '@kiminflu',
    description: '패션&라이프스타일 인플루언서 👗✨ 일상 속 소소한 행복을 나누어요',
    profile_image: null,
    categories: ['패션', '라이프스타일', '뷰티'],
    location: '서울',
    sns_accounts: [
      { platform: 'INSTAGRAM', followers_count: 45000, avg_engagement_rate: 0.045 },
      { platform: 'YOUTUBE', followers_count: 12000, avg_engagement_rate: 0.032 }
    ],
    min_price: 500000,
    max_price: 1500000,
    matching_score: 92
  },
  {
    id: '2',
    name: '요리왕이준',
    channel_name: '@cookingjun',
    description: '집에서 만드는 맛있는 요리 🍳 초보도 쉽게 따라 할 수 있는 레시피',
    profile_image: null,
    categories: ['요리', '푸드', '라이프스타일'],
    location: '부산',
    sns_accounts: [
      { platform: 'INSTAGRAM', followers_count: 28000, avg_engagement_rate: 0.038 },
      { platform: 'YOUTUBE', followers_count: 85000, avg_engagement_rate: 0.062 }
    ],
    min_price: 800000,
    max_price: 2000000,
    matching_score: 87
  },
  {
    id: '3',
    name: '테크리뷰어',
    channel_name: '@techreviewer',
    description: '최신 IT 제품 리뷰와 테크 뉴스 📱💻 신뢰할 수 있는 리뷰',
    profile_image: null,
    categories: ['IT', '테크', '게임', '리뷰'],
    location: '대구',
    sns_accounts: [
      { platform: 'YOUTUBE', followers_count: 156000, avg_engagement_rate: 0.028 },
      { platform: 'INSTAGRAM', followers_count: 34000, avg_engagement_rate: 0.041 }
    ],
    min_price: 1200000,
    max_price: 3000000,
    matching_score: 95
  }
]

export function InfluencersPage() {
  const { userProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('matching_score')
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic')
  
  const isInfluencer = userProfile?.user_type === 'INFLUENCER'
  const isBrand = userProfile?.user_type === 'BRAND' || userProfile?.user_type === 'AGENCY'
  
  const categories = ['전체', '패션', '뷰티', '요리', '푸드', 'IT', '테크', '게임', '라이프스타일', '여행', '피트니스']
  
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isInfluencer ? '인플루언서 커뮤니티' : '인플루언서 발견'}
          </h1>
          <p className="text-gray-600">
            {isInfluencer 
              ? '다른 인플루언서들과 네트워크를 만들고 인사이트를 공유하세요.' 
              : '브랜드에 맞는 완벽한 인플루언서를 찾아보세요.'
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              기본 검색
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'advanced'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              AI 실시간 검색
            </button>
          </nav>
        </div>

        {activeTab === 'basic' ? (
          <>
            {/* Basic Search and Filters */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="인플루언서 이름 또는 채널명 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category === '전체' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="matching_score">매칭 점수순</option>
                <option value="followers">팔로워 순</option>
                <option value="engagement">참여율순</option>
                <option value="price_low">가격 낮은순</option>
                <option value="price_high">가격 높은순</option>
              </select>
            </div>

            {/* Basic Influencers Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockInfluencers.map((influencer) => (
                <InfluencerCard 
                  key={influencer.id} 
                  influencer={influencer} 
                  showContactButton={isBrand}
                />
              ))}
            </div>
          </>
        ) : (
          /* Advanced Search */
          <AdvancedInfluencerSearch />
        )}
      </div>
    </Layout>
  )
}

function InfluencerCard({ influencer, showContactButton = false }: { 
  influencer: any, 
  showContactButton?: boolean 
}) {
  const { runMatching, isMatching } = useAIMatching()
  
  const totalFollowers = influencer.sns_accounts.reduce(
    (sum: number, account: any) => sum + account.followers_count, 0
  )
  
  const avgEngagement = influencer.sns_accounts.reduce(
    (sum: number, account: any) => sum + account.avg_engagement_rate, 0
  ) / influencer.sns_accounts.length
  
  const handleContact = () => {
    console.log('Contact influencer:', influencer.id)
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {influencer.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{influencer.name}</h3>
              <p className="text-sm text-gray-500">{influencer.channel_name}</p>
            </div>
          </div>
          {influencer.matching_score && (
            <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {influencer.matching_score}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {influencer.description}
        </p>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {influencer.categories.slice(0, 3).map((category: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              {category}
            </span>
          ))}
          {influencer.categories.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{influencer.categories.length - 3}
            </span>
          )}
        </div>
        
        {/* Location */}
        {influencer.location && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {influencer.location}
          </div>
        )}
        
        {/* SNS Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">총 팔로워</span>
            <span className="font-medium">{formatNumber(totalFollowers)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">평균 참여율</span>
            <span className="font-medium">{(avgEngagement * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">협업 비용</span>
            <span className="font-medium">
              {formatCurrency(influencer.min_price)} ~ {formatCurrency(influencer.max_price)}
            </span>
          </div>
        </div>
        
        {/* SNS Platforms */}
        <div className="flex space-x-4 mb-4">
          {influencer.sns_accounts.map((account: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              {account.platform === 'INSTAGRAM' && <Instagram className="h-4 w-4 text-pink-600" />}
              {account.platform === 'YOUTUBE' && <Youtube className="h-4 w-4 text-red-600" />}
              <div className="text-xs">
                <div className="font-medium">{formatNumber(account.followers_count)}</div>
                <div className="text-gray-500">{(account.avg_engagement_rate * 100).toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="h-4 w-4 mr-1" />
            프로필 보기
          </Button>
          {showContactButton && (
            <Button size="sm" className="flex-1" onClick={handleContact}>
              <MessageCircle className="h-4 w-4 mr-1" />
              연락하기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}