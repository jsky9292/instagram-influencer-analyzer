import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useCampaigns, useApplications } from '../hooks/useApi'
import { formatCurrency, formatNumber, getStatusColor, getStatusText } from '../lib/utils'
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Calendar,
  Plus,
  Eye,
  Award,
  DollarSign
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { userProfile } = useAuth()
  
  const isInfluencer = userProfile?.user_type === 'INFLUENCER'
  const isBrand = userProfile?.user_type === 'BRAND' || userProfile?.user_type === 'AGENCY'
  
  return (
    <Layout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            안녕하세요, {userProfile?.name}님! 👋
          </h1>
          <p className="text-gray-600">
            {isInfluencer 
              ? '오늘도 멋진 콘텐츠로 팬들과 소통해보세요!' 
              : '브랜드의 성장을 위한 최적의 인플루언서를 찾아보세요!'
            }
          </p>
        </div>

        {/* Stats Cards */}
        {isInfluencer ? <InfluencerDashboard /> : <BrandDashboard />}
      </div>
    </Layout>
  )
}

function InfluencerDashboard() {
  const { userProfile } = useAuth()
  const { data: applications = [] } = useApplications(userProfile?.user_id)
  
  const activeApps = applications.filter(app => ['CONTRACTED', 'ACCEPTED'].includes(app.status))
  const completedApps = applications.filter(app => app.status === 'COMPLETED')
  const totalEarnings = completedApps.reduce((sum, app) => sum + (app.proposed_cost || 0), 0)
  
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">진행 중인 캠페인</p>
                <p className="text-2xl font-bold text-gray-900">{activeApps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료된 캠페인</p>
                <p className="text-2xl font-bold text-gray-900">{completedApps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 수익</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">지원 현황</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/campaigns" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  새로운 캠페인 찾아보기
                </Button>
              </Link>
              <Link to="/profile" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  프로필 업데이트
                </Button>
              </Link>
              <Link to="/chat" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  메시지 확인
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>최근 지원 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div key={app.application_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">캠페인 #{app.campaign_id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(app.proposed_cost || 0)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                    {getStatusText(app.status)}
                  </span>
                </div>
              ))}
              {applications.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">아직 지원한 캠페인이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function BrandDashboard() {
  const { userProfile } = useAuth()
  const { data: campaigns = [] } = useCampaigns(userProfile?.user_id)
  
  const activeCampaigns = campaigns.filter(c => c.status === 'ONGOING')
  const recruitingCampaigns = campaigns.filter(c => c.status === 'RECRUITING')
  const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED')
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
  
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">진행 중인 캠페인</p>
                <p className="text-2xl font-bold text-gray-900">{activeCampaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">모집 중인 캠페인</p>
                <p className="text-2xl font-bold text-gray-900">{recruitingCampaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료된 캠페인</p>
                <p className="text-2xl font-bold text-gray-900">{completedCampaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 예산</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/campaigns" className="block">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  새 캠페인 만들기
                </Button>
              </Link>
              <Link to="/influencers" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  인플루언서 찾아보기
                </Button>
              </Link>
              <Link to="/analytics" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  성과 분석 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>최근 캠페인</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.campaign_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{campaign.title}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(campaign.budget)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                    {getStatusText(campaign.status)}
                  </span>
                </div>
              ))}
              {campaigns.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">아직 생성한 캠페인이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}