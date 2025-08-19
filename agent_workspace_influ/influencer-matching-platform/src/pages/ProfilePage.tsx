import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatNumber, formatCurrency } from '../lib/utils'
import { 
  User, 
  Edit, 
  Camera, 
  Plus, 
  X,
  Instagram,
  Youtube,
  Globe,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react'

// Mock data for SNS accounts
const mockSNSAccounts = [
  {
    id: '1',
    platform: 'INSTAGRAM',
    account_url: 'https://instagram.com/example',
    followers_count: 45000,
    avg_engagement_rate: 0.045,
    verified: true
  },
  {
    id: '2',
    platform: 'YOUTUBE',
    account_url: 'https://youtube.com/example',
    followers_count: 12000,
    avg_engagement_rate: 0.032,
    verified: false
  }
]

export function ProfilePage() {
  const { userProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showAddSNS, setShowAddSNS] = useState(false)
  
  const isInfluencer = userProfile?.user_type === 'INFLUENCER'
  const isBrand = userProfile?.user_type === 'BRAND' || userProfile?.user_type === 'AGENCY'
  
  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {userProfile?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{userProfile?.name || '사용자'}</h1>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? '저장' : '편집'}
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {userProfile?.email}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {userProfile?.user_type === 'INFLUENCER' ? '인플루언서' : 
                     userProfile?.user_type === 'BRAND' ? '브랜드' : '에이전시'}
                  </div>
                </div>
                
                {isInfluencer && (
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">총 팔로워</span>
                      <span className="font-medium">{formatNumber(mockSNSAccounts.reduce((sum, acc) => sum + acc.followers_count, 0))}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-600">평균 참여율</span>
                      <span className="font-medium">
                        {(mockSNSAccounts.reduce((sum, acc) => sum + acc.avg_engagement_rate, 0) / mockSNSAccounts.length * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                    <input
                      type="text"
                      defaultValue={userProfile?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
                    <textarea
                      defaultValue="패션과 라이프스타일을 사랑하는 인플루언서입니다. 일상 속 소소한 행복을 나누어요!"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">위치</label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <input
                        type="text"
                        defaultValue="서울특별시"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <input
                        type="tel"
                        defaultValue="010-1234-5678"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {isInfluencer && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">관심 카테고리</label>
                        <div className="flex flex-wrap gap-2">
                          {['패션', '뷰티', '라이프스타일', '요리', 'IT', '여행', '피트니스'].map((category) => (
                            <button
                              key={category}
                              className="px-3 py-1 text-sm border border-purple-300 text-purple-700 rounded-full hover:bg-purple-50 transition-colors"
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">최소 협업 비용</label>
                          <input
                            type="number"
                            defaultValue="500000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">최대 협업 비용</label>
                          <input
                            type="number"
                            defaultValue="1500000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">소개</h4>
                    <p className="text-gray-900">
                      패션과 라이프스타일을 사랑하는 인플루언서입니다. 일상 속 소소한 행복을 나누어요!
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">위치</h4>
                    <div className="flex items-center text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      서울특별시
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">연락처</h4>
                    <div className="flex items-center text-gray-900">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      010-1234-5678
                    </div>
                  </div>
                  {isInfluencer && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">관심 카테고리</h4>
                        <div className="flex flex-wrap gap-2">
                          {['패션', '뷰티', '라이프스타일'].map((category) => (
                            <span
                              key={category}
                              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">협업 비용 범위</h4>
                        <p className="text-gray-900">{formatCurrency(500000)} ~ {formatCurrency(1500000)}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SNS Accounts (Influencer only) */}
          {isInfluencer && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>SNS 계정</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddSNS(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSNSAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {account.platform === 'INSTAGRAM' && <Instagram className="h-5 w-5 text-pink-600" />}
                        {account.platform === 'YOUTUBE' && <Youtube className="h-5 w-5 text-red-600" />}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{account.platform}</span>
                            {account.verified && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">인증됨</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            팔로워 {formatNumber(account.followers_count)} • 참여율 {(account.avg_engagement_rate * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Information (Brand only) */}
          {isBrand && (
            <Card>
              <CardHeader>
                <CardTitle>회사 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">회사명</label>
                        <input
                          type="text"
                          defaultValue="브랜드 컴퍼니"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">업종</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                          <option>패션/뷰티</option>
                          <option>식품/음료</option>
                          <option>IT/전자</option>
                          <option>여행/레저</option>
                          <option>기타</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">웹사이트</label>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-gray-400 mr-2" />
                          <input
                            type="url"
                            defaultValue="https://brandcompany.com"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">회사 설명</label>
                        <textarea
                          defaultValue="혁신적인 제품과 서비스로 고객에게 새로운 가치를 제공하는 브랜드입니다."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">회사명</h4>
                        <p className="text-gray-900">브랜드 컴퍼니</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">업종</h4>
                        <p className="text-gray-900">패션/뷰티</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">웹사이트</h4>
                        <div className="flex items-center text-gray-900">
                          <Globe className="h-4 w-4 text-gray-400 mr-2" />
                          <a href="https://brandcompany.com" className="text-purple-600 hover:text-purple-700">
                            https://brandcompany.com
                          </a>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">회사 설명</h4>
                        <p className="text-gray-900">
                          혁신적인 제품과 서비스로 고객에게 새로운 가치를 제공하는 브랜드입니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add SNS Modal */}
        {showAddSNS && (
          <AddSNSModal onClose={() => setShowAddSNS(false)} />
        )}
      </div>
    </Layout>
  )
}

function AddSNSModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    platform: 'INSTAGRAM',
    account_url: '',
    followers_count: '',
    avg_engagement_rate: ''
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Add SNS account:', formData)
    onClose()
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">SNS 계정 추가</h2>
            <button onClick={onClose}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">플랫폼</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="INSTAGRAM">Instagram</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="TIKTOK">TikTok</option>
                <option value="TWITTER">Twitter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">계정 URL</label>
              <input
                type="url"
                value={formData.account_url}
                onChange={(e) => setFormData({ ...formData, account_url: e.target.value })}
                placeholder="https://instagram.com/username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">팔로워 수</label>
              <input
                type="number"
                value={formData.followers_count}
                onChange={(e) => setFormData({ ...formData, followers_count: e.target.value })}
                placeholder="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">평균 참여율 (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.avg_engagement_rate}
                onChange={(e) => setFormData({ ...formData, avg_engagement_rate: e.target.value })}
                placeholder="4.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">
                추가
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}