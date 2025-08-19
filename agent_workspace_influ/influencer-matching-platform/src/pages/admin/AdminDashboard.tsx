import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatCurrency, formatNumber } from '../../lib/utils'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  UserCheck,
  UserX,
  Calendar,
  Target,
  AlertTriangle,
  Download
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

// Mock admin data
const platformStats = {
  totalUsers: 15847,
  totalInfluencers: 8932,
  totalBrands: 4865,
  totalAgencies: 2050,
  totalCampaigns: 3421,
  activeCampaigns: 245,
  completedCampaigns: 2987,
  cancelledCampaigns: 189,
  totalRevenue: 2450000000,
  platformFees: 147000000,
  newUsersThisMonth: 1247,
  activeUsersThisMonth: 9832
}

const userGrowthData = [
  { month: '1월', influencers: 7200, brands: 4100, agencies: 1800 },
  { month: '2월', influencers: 7650, brands: 4300, agencies: 1850 },
  { month: '3월', influencers: 8100, brands: 4450, agencies: 1900 },
  { month: '4월', influencers: 8400, brands: 4600, agencies: 1950 },
  { month: '5월', influencers: 8700, brands: 4750, agencies: 2000 },
  { month: '6월', influencers: 8932, brands: 4865, agencies: 2050 }
]

const campaignStatusData = [
  { name: '진행중', value: 245, color: '#3B82F6' },
  { name: '완료', value: 2987, color: '#10B981' },
  { name: '취소', value: 189, color: '#EF4444' }
]

const revenueData = [
  { month: '1월', revenue: 380000000, fees: 22800000 },
  { month: '2월', revenue: 420000000, fees: 25200000 },
  { month: '3월', revenue: 450000000, fees: 27000000 },
  { month: '4월', revenue: 480000000, fees: 28800000 },
  { month: '5월', revenue: 510000000, fees: 30600000 },
  { month: '6월', revenue: 520000000, fees: 31200000 }
]

export function AdminDashboard() {
  const { userProfile } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  
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
  
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600">플랫폼 운영 현황을 한눈에 확인하세요</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
              <option value="90d">최근 90일</option>
              <option value="1y">최근 1년</option>
            </select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              리포트 다운로드
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(platformStats.totalUsers)}</p>
                  <p className="text-xs text-green-600">↑ {formatNumber(platformStats.newUsersThisMonth)} 이번 달</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 캠페인</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(platformStats.totalCampaigns)}</p>
                  <p className="text-xs text-blue-600">{formatNumber(platformStats.activeCampaigns)} 진행중</p>
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
                  <p className="text-sm font-medium text-gray-600">총 거래액</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(platformStats.totalRevenue)}</p>
                  <p className="text-xs text-green-600">↑ 12.5% 전월 대비</p>
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
                  <p className="text-sm font-medium text-gray-600">플랫폼 수수료</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(platformStats.platformFees)}</p>
                  <p className="text-xs text-green-600">6% 수수료율</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Stats */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>사용자 증가 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                  <Area 
                    type="monotone" 
                    dataKey="influencers" 
                    stackId="1"
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.6}
                    name="인플루언서"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="brands" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="브랜드"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="agencies" 
                    stackId="1"
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.6}
                    name="에이전시"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>사용자 유형별 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">인플루언서</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatNumber(platformStats.totalInfluencers)}</span>
                    <span className="text-xs text-gray-500 block">{((platformStats.totalInfluencers / platformStats.totalUsers) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">브랜드</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatNumber(platformStats.totalBrands)}</span>
                    <span className="text-xs text-gray-500 block">{((platformStats.totalBrands / platformStats.totalUsers) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">에이전시</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{formatNumber(platformStats.totalAgencies)}</span>
                    <span className="text-xs text-gray-500 block">{((platformStats.totalAgencies / platformStats.totalUsers) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">이번 달 활성 사용자</span>
                  <span className="font-medium text-green-600">{formatNumber(platformStats.activeUsersThisMonth)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign and Revenue Stats */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>캠페인 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={campaignStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {campaignStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {campaignStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-medium">{formatNumber(item.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>수익 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="revenue" fill="#8B5CF6" name="총 거래액" />
                  <Bar dataKey="fees" fill="#10B981" name="플랫폼 수수료" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'new_user', message: '새로운 인플루언서 "김인플루"님이 가입했습니다.', time: '5분 전' },
                { type: 'campaign', message: '"신제품 런칭 캠페인"이 완료되었습니다.', time: '1시간 전' },
                { type: 'payment', message: '₩2,500,000 결제가 완료되었습니다.', time: '3시간 전' },
                { type: 'report', message: '부적절한 콘텐츠에 대한 신고가 접수되었습니다.', time: '5시간 전' },
                { type: 'new_user', message: '새로운 브랜드 "테크컴퍼니"가 가입했습니다.', time: '1일 전' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'new_user' ? 'bg-blue-100' :
                    activity.type === 'campaign' ? 'bg-green-100' :
                    activity.type === 'payment' ? 'bg-purple-100' :
                    'bg-red-100'
                  }`}>
                    {activity.type === 'new_user' && <UserCheck className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'campaign' && <Target className="h-4 w-4 text-green-600" />}
                    {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-purple-600" />}
                    {activity.type === 'report' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}