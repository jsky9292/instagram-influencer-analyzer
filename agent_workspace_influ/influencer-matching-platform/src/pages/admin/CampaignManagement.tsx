import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatDate, formatCurrency, formatNumber, getStatusColor, getStatusText } from '../../lib/utils'
import { 
  Search, 
  Filter, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Eye,
  Ban,
  Play,
  Pause,
  MoreVertical,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react'

// Mock campaign data
const mockCampaigns = [
  {
    campaign_id: '1',
    title: '신제품 런칭 캠페인',
    brand_name: '뷰티컴퍼니',
    description: '새로운 립스틱 라인 소개를 위한 인플루언서 협업',
    budget: 5000000,
    start_date: '2025-01-20T00:00:00Z',
    end_date: '2025-02-20T00:00:00Z',
    application_deadline: '2025-01-18T00:00:00Z',
    status: 'RECRUITING',
    target_categories: ['뷰티', '패션'],
    applications_count: 15,
    selected_influencers: 3,
    created_at: '2025-01-10T09:00:00Z',
    reported_issues: 0
  },
  {
    campaign_id: '2',
    title: '여름 컨션 소개',
    brand_name: '패션브랜드',
    description: '여름 신상 컨션 소개 및 홍보',
    budget: 8000000,
    start_date: '2025-01-15T00:00:00Z',
    end_date: '2025-02-15T00:00:00Z',
    application_deadline: '2025-01-12T00:00:00Z',
    status: 'ONGOING',
    target_categories: ['패션', '라이프스타일'],
    applications_count: 25,
    selected_influencers: 5,
    created_at: '2025-01-05T10:30:00Z',
    reported_issues: 2
  },
  {
    campaign_id: '3',
    title: '레스토랑 홍보',
    brand_name: '맛집레스토랑',
    description: '맛집 레스토랑 신메뉴 소개',
    budget: 3000000,
    start_date: '2025-01-01T00:00:00Z',
    end_date: '2025-01-31T00:00:00Z',
    application_deadline: '2024-12-28T00:00:00Z',
    status: 'COMPLETED',
    target_categories: ['푸드', '맛집'],
    applications_count: 12,
    selected_influencers: 2,
    created_at: '2024-12-20T14:00:00Z',
    reported_issues: 0
  },
  {
    campaign_id: '4',
    title: '피트니스 챌린지',
    brand_name: '헬스에이전시',
    description: '30일 피트니스 챌린지 참여자 모집',
    budget: 6000000,
    start_date: '2025-02-01T00:00:00Z',
    end_date: '2025-03-03T00:00:00Z',
    application_deadline: '2025-01-25T00:00:00Z',
    status: 'CANCELLED',
    target_categories: ['피트니스', '헬스'],
    applications_count: 8,
    selected_influencers: 0,
    created_at: '2025-01-08T16:20:00Z',
    reported_issues: 1
  }
]

export function CampaignManagement() {
  const { userProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)
  
  // Check if user is admin
  if (userProfile?.user_type !== 'ADMIN') {
    return (
      <Layout>
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </Layout>
    )
  }
  
  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !selectedStatus || campaign.status === selectedStatus
    return matchesSearch && matchesStatus
  })
  
  const handleCampaignAction = (campaignId: string, action: string) => {
    console.log(`${action} campaign ${campaignId}`)
    // In real implementation, call API to perform action
  }
  
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">캠페인 관리</h1>
            <p className="text-gray-600">플랫폼에서 진행되는 모든 캠페인을 모니터링합니다</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="캠페인 제목 또는 브랜드 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">모든 상태</option>
                <option value="RECRUITING">모집중</option>
                <option value="ONGOING">진행중</option>
                <option value="COMPLETED">완료</option>
                <option value="CANCELLED">취소</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                고급 필터
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">전체 캠페인</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(mockCampaigns.length)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">진행중</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(mockCampaigns.filter(c => c.status === 'ONGOING').length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">완료</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(mockCampaigns.filter(c => c.status === 'COMPLETED').length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">문제 신고</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(mockCampaigns.reduce((sum, c) => sum + c.reported_issues, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Table */}
        <Card>
          <CardHeader>
            <CardTitle>캠페인 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">캠페인</th>
                    <th className="text-left py-3 px-4">브랜드</th>
                    <th className="text-left py-3 px-4">예산</th>
                    <th className="text-left py-3 px-4">상태</th>
                    <th className="text-left py-3 px-4">지원/선정</th>
                    <th className="text-left py-3 px-4">신고</th>
                    <th className="text-left py-3 px-4">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.campaign_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{campaign.title}</p>
                          <p className="text-xs text-gray-500">생성일: {formatDate(campaign.created_at)}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.target_categories.slice(0, 2).map((category, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{campaign.brand_name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{formatCurrency(campaign.budget)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                          {getStatusText(campaign.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600">
                          <div>지원: {campaign.applications_count}명</div>
                          <div>선정: {campaign.selected_influencers}명</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {campaign.reported_issues > 0 ? (
                          <span className="flex items-center text-red-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {campaign.reported_issues}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <div className="relative">
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Detail Modal */}
        {selectedCampaign && (
          <CampaignDetailModal 
            campaign={selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
            onAction={handleCampaignAction}
          />
        )}
      </div>
    </Layout>
  )
}

function CampaignDetailModal({ campaign, onClose, onAction }: {
  campaign: any
  onClose: () => void
  onAction: (campaignId: string, action: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">캠페인 상세 정보</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Campaign Header */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                  <p className="text-gray-600 mt-1">{campaign.brand_name}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getStatusColor(campaign.status)}`}>
                    {getStatusText(campaign.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(campaign.budget)}</p>
                  <p className="text-xs text-gray-500">예산</p>
                </div>
              </div>
            </div>
            
            {/* Campaign Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">캠페인 정보</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">시작일:</span>
                    <span className="font-medium">{formatDate(campaign.start_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">종료일:</span>
                    <span className="font-medium">{formatDate(campaign.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">지원 마감:</span>
                    <span className="font-medium">{formatDate(campaign.application_deadline)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">생성일:</span>
                    <span className="font-medium">{formatDate(campaign.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">참여 현황</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">지원자 수:</span>
                    <span className="font-medium">{campaign.applications_count}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">선정된 인플루언서:</span>
                    <span className="font-medium">{campaign.selected_influencers}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">문제 신고:</span>
                    <span className={`font-medium ${
                      campaign.reported_issues > 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {campaign.reported_issues}건
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">캠페인 설명</h4>
              <p className="text-gray-600 text-sm">{campaign.description}</p>
            </div>
            
            {/* Target Categories */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">대상 카테고리</h4>
              <div className="flex flex-wrap gap-2">
                {campaign.target_categories.map((category: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">관리 작업</h4>
              <div className="flex flex-wrap gap-3">
                {campaign.status === 'RECRUITING' && (
                  <>
                    <Button 
                      onClick={() => onAction(campaign.campaign_id, 'START')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      캠페인 시작
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => onAction(campaign.campaign_id, 'CANCEL')}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      캠페인 취소
                    </Button>
                  </>
                )}
                {campaign.status === 'ONGOING' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => onAction(campaign.campaign_id, 'PAUSE')}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      일시 중지
                    </Button>
                    <Button 
                      onClick={() => onAction(campaign.campaign_id, 'COMPLETE')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      캠페인 완료
                    </Button>
                  </>
                )}
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-1" />
                  참여자 목록
                </Button>
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  성과 분석
                </Button>
                {campaign.reported_issues > 0 && (
                  <Button 
                    variant="outline"
                    className="border-red-300 text-red-600"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    신고 처리 ({campaign.reported_issues})
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}