import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CreateCampaignModal } from '../components/CreateCampaignModal'
import { useCampaigns, useApplications, useAIMatching } from '../hooks/useApi'
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../lib/utils'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Users, 
  Calendar,
  DollarSign,
  Zap,
  Send
} from 'lucide-react'

export function CampaignsPage() {
  const { userProfile } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  
  const isInfluencer = userProfile?.user_type === 'INFLUENCER'
  const isBrand = userProfile?.user_type === 'BRAND' || userProfile?.user_type === 'AGENCY'
  
  const { data: campaigns = [] } = useCampaigns(isBrand ? userProfile?.user_id : undefined)
  const { data: applications = [] } = useApplications(isInfluencer ? userProfile?.user_id : undefined)
  
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isInfluencer ? '캠페인 발견' : '캠페인 관리'}
            </h1>
            <p className="text-gray-600">
              {isInfluencer 
                ? '당신에게 맞는 완벽한 캠페인을 찾아보세요!' 
                : '브랜드의 성장을 위한 캠페인을 관리하세요.'
              }
            </p>
          </div>
          {isBrand && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              새 캠페인 만들기
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="캠페인 검색..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
        </div>

        {/* Content based on user type */}
        {isInfluencer ? <InfluencerCampaigns campaigns={campaigns} /> : <BrandCampaigns campaigns={campaigns} />}
        
        {/* Create Campaign Modal */}
        <CreateCampaignModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            // Refresh campaigns
            window.location.reload()
          }}
        />
      </div>
    </Layout>
  )
}

function InfluencerCampaigns({ campaigns }: { campaigns: any[] }) {
  const { data: applications = [] } = useApplications()
  
  // Filter campaigns that are recruiting and not already applied to
  const availableCampaigns = campaigns.filter(campaign => 
    campaign.status === 'RECRUITING' && 
    !applications.some(app => app.campaign_id === campaign.campaign_id)
  )
  
  return (
    <>
      {/* My Applications */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">내 지원 현황</h2>
        <div className="grid gap-4">
          {applications.slice(0, 3).map((application) => (
            <Card key={application.application_id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">캠페인 #{application.campaign_id.slice(0, 8)}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      제안 금액: {formatCurrency(application.proposed_cost || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(application.applied_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Available Campaigns */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">지원 가능한 캠페인</h2>
        <div className="grid gap-4">
          {availableCampaigns.map((campaign) => (
            <CampaignCard key={campaign.campaign_id} campaign={campaign} showApplyButton />
          ))}
          {availableCampaigns.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">지원 가능한 캠페인이 없습니다</h3>
                <p className="text-gray-600">새로운 캠페인이 등록되면 알림을 보내드릴게요.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

function BrandCampaigns({ campaigns }: { campaigns: any[] }) {
  const { runMatching, isMatching } = useAIMatching()
  
  const handleRunMatching = (campaignId: string) => {
    runMatching({ campaignId })
  }
  
  return (
    <div className="grid gap-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.campaign_id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                    {getStatusText(campaign.status)}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{campaign.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(campaign.budget)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {campaign.start_date && formatDate(campaign.start_date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    모집 마감: {campaign.application_deadline && formatDate(campaign.application_deadline)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {campaign.status === 'RECRUITING' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRunMatching(campaign.campaign_id)}
                    loading={isMatching}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    AI 매칭
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  상세보기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {campaigns.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">첫 번째 캠페인을 만들어보세요</h3>
            <p className="text-gray-600 mb-4">당신의 브랜드에 맞는 인플루언서를 찾아보세요.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              캠페인 만들기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CampaignCard({ campaign, showApplyButton = false }: { campaign: any, showApplyButton?: boolean }) {
  const handleApply = () => {
    // Apply to campaign logic
    console.log('Apply to campaign:', campaign.campaign_id)
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
            <p className="text-gray-600 mb-4">{campaign.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(campaign.budget)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {campaign.start_date && formatDate(campaign.start_date)}
              </div>
            </div>
            
            {campaign.target_categories && (
              <div className="flex flex-wrap gap-2">
                {campaign.target_categories.map((category: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              상세보기
            </Button>
            {showApplyButton && (
              <Button size="sm" onClick={handleApply}>
                <Send className="h-4 w-4 mr-1" />
                지원하기
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

