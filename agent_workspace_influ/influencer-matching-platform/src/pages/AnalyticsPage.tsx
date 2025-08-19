import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Layout } from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatNumber } from '../lib/utils'
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart,
  MessageCircle,
  Share,
  DollarSign,
  Calendar,
  Download,
  Filter
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

// Mock data for charts
const performanceData = [
  { date: '1월 1주', reach: 45000, engagement: 1800, clicks: 450, conversions: 23 },
  { date: '1월 2주', reach: 52000, engagement: 2100, clicks: 520, conversions: 31 },
  { date: '1월 3주', reach: 48000, engagement: 1950, clicks: 480, conversions: 28 },
  { date: '1월 4주', reach: 58000, engagement: 2400, clicks: 580, conversions: 35 },
  { date: '2월 1주', reach: 61000, engagement: 2550, clicks: 610, conversions: 41 },
  { date: '2월 2주', reach: 55000, engagement: 2200, clicks: 550, conversions: 33 }
]

const categoryData = [
  { name: '패션', value: 35, color: '#8B5CF6' },
  { name: '뷰티', value: 25, color: '#06B6D4' },
  { name: '라이프스타일', value: 20, color: '#10B981' },
  { name: 'IT', value: 12, color: '#F59E0B' },
  { name: '기타', value: 8, color: '#EF4444' }
]

const campaignROIData = [
  { name: '캠페인 A', roi: 285, spent: 1500000, earned: 4275000 },
  { name: '캠페인 B', roi: 340, spent: 2000000, earned: 6800000 },
  { name: '캠페인 C', roi: 195, spent: 1800000, earned: 3510000 },
  { name: '캠페인 D', roi: 420, spent: 1200000, earned: 5040000 },
  { name: '캠페인 E', roi: 315, spent: 2500000, earned: 7875000 }
]

export function AnalyticsPage() {
  const { userProfile } = useAuth()
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('reach')
  
  const isInfluencer = userProfile?.user_type === 'INFLUENCER'
  const isBrand = userProfile?.user_type === 'BRAND' || userProfile?.user_type === 'AGENCY'
  
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">성과 분석</h1>
            <p className="text-gray-600">
              {isInfluencer 
                ? '내 콘텐츠의 성과와 인사이트를 확인하세요.' 
                : '캠페인의 성과와 ROI를 분석하세요.'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">최근 7일</option>
              <option value="30d">최근 30일</option>
              <option value="90d">최근 90일</option>
              <option value="1y">최근 1년</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
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
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 도달수</p>
                  <p className="text-2xl font-bold text-gray-900">2.4M</p>
                  <p className="text-xs text-green-600">↑ 12.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 참여수</p>
                  <p className="text-2xl font-bold text-gray-900">156K</p>
                  <p className="text-xs text-green-600">↑ 8.3%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">평균 참여율</p>
                  <p className="text-2xl font-bold text-gray-900">6.5%</p>
                  <p className="text-xs text-green-600">↑ 2.1%</p>
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
                  <p className="text-sm font-medium text-gray-600">
                    {isInfluencer ? '총 수익' : '평균 ROI'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isInfluencer ? '₩8.5M' : '284%'}
                  </p>
                  <p className="text-xs text-green-600">↑ 15.7%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>성과 추이</CardTitle>
              <div className="flex space-x-4">
                {['reach', 'engagement', 'clicks', 'conversions'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedMetric === metric
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {metric === 'reach' && '도달수'}
                    {metric === 'engagement' && '참여수'}
                    {metric === 'clicks' && '클릭수'}
                    {metric === 'conversions' && '전환수'}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 성과</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: category.color }}></div>
                      <span className="text-gray-600">{category.name}</span>
                    </div>
                    <span className="font-medium">{category.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign ROI Analysis (Brand only) */}
        {isBrand && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>캠페인별 ROI 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignROIData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'roi') return `${value}%`
                      return formatCurrency(value as number)
                    }}
                  />
                  <Bar dataKey="roi" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Detailed Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>{isInfluencer ? '콘텐츠별 상세 성과' : '캠페인별 상세 성과'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">{isInfluencer ? '콘텐츠' : '캠페인'}</th>
                    <th className="text-left py-3 px-4">날짜</th>
                    <th className="text-left py-3 px-4">도달수</th>
                    <th className="text-left py-3 px-4">참여수</th>
                    <th className="text-left py-3 px-4">참여율</th>
                    <th className="text-left py-3 px-4">클릭수</th>
                    <th className="text-left py-3 px-4">전환수</th>
                    {isBrand && <th className="text-left py-3 px-4">ROI</th>}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">
                        {isInfluencer ? `콘텐츠 ${index}` : `캠페인 ${index}`}
                      </td>
                      <td className="py-3 px-4 text-gray-600">2025-01-{10 + index}</td>
                      <td className="py-3 px-4">{formatNumber(45000 + index * 3000)}</td>
                      <td className="py-3 px-4">{formatNumber(1800 + index * 200)}</td>
                      <td className="py-3 px-4">{(4.0 + index * 0.5).toFixed(1)}%</td>
                      <td className="py-3 px-4">{formatNumber(450 + index * 50)}</td>
                      <td className="py-3 px-4">{23 + index * 5}</td>
                      {isBrand && <td className="py-3 px-4 font-medium text-green-600">{(250 + index * 20)}%</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}