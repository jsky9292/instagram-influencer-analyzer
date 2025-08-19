'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { Users, TrendingUp, Award, Eye, Instagram, Heart, MessageCircle, Share2, Download } from 'lucide-react'
import { cn, formatNumber, formatPercentage } from '@/lib/utils'
import InfluencerDetail from './InfluencerDetail'

// 샘플 데이터
const influencerData = [
  { username: 'omuk_food', followers: 1372088, engagement_rate: 0.19, is_verified: true, category: 'Food' },
  { username: 'chang_bae_cc', followers: 143797, engagement_rate: 0.59, is_verified: true, category: 'Food' },
  { username: 'yeonsu222', followers: 41768, engagement_rate: 0.04, is_verified: false, category: 'Lifestyle' },
  { username: 'wild_guys__', followers: 38546, engagement_rate: 11.54, is_verified: false, category: 'Food' },
  { username: 'mywayflover', followers: 27368, engagement_rate: 49.06, is_verified: false, category: 'Entertainment' },
]

const followerRangeData = [
  { range: '~1K', count: 0, color: '#8b5cf6' },
  { range: '1K-10K', count: 3, color: '#06b6d4' },
  { range: '10K-100K', count: 4, color: '#10b981' },
  { range: '100K-1M', count: 2, color: '#f59e0b' },
  { range: '1M+', count: 1, color: '#ef4444' },
]

const categoryData = [
  { name: 'Food', value: 40, color: '#8b5cf6' },
  { name: 'Lifestyle', value: 20, color: '#06b6d4' },
  { name: 'Entertainment', value: 20, color: '#10b981' },
  { name: 'Business', value: 20, color: '#f59e0b' },
]

const trendData = [
  { month: 'Jan', followers: 800000, engagement: 2.1 },
  { month: 'Feb', followers: 950000, engagement: 2.3 },
  { month: 'Mar', followers: 1100000, engagement: 2.0 },
  { month: 'Apr', followers: 1300000, engagement: 2.5 },
  { month: 'May', followers: 1450000, engagement: 2.8 },
  { month: 'Jun', followers: 1620000, engagement: 3.1 },
]

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  trend: 'up' | 'down'
  gradient: string
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend, gradient }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-0">
      <div className={cn("p-6 text-white", gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className="opacity-80">
            {icon}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className={cn(
          "flex items-center text-sm font-medium",
          trend === 'up' ? "text-green-600" : "text-red-600"
        )}>
          <TrendingUp className={cn(
            "w-4 h-4 mr-1",
            trend === 'down' && "rotate-180"
          )} />
          {change} from last month
        </div>
      </div>
    </CardContent>
  </Card>
)

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
}

interface InfluencerDashboardProps {
  crawledData?: InfluencerData[]
}

const InfluencerDashboard: React.FC<InfluencerDashboardProps> = ({ crawledData = [] }) => {
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  const handleExportCSV = async () => {
    if (currentData.length === 0) {
      alert('내보낼 데이터가 없습니다')
      return
    }
    
    try {
      const response = await fetch('http://localhost:8000/export/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: currentData }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `influencers_${new Date().toISOString().slice(0,10)}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('CSV 다운로드 실패:', error)
      alert('CSV 다운로드에 실패했습니다')
    }
  }
  
  // 크롤링 데이터가 있으면 사용, 없으면 샘플 데이터 사용
  const currentData = crawledData.length > 0 ? crawledData : influencerData
  
  const totalFollowers = currentData.reduce((sum, inf) => sum + inf.followers, 0)
  const avgEngagement = currentData.reduce((sum, inf) => sum + (inf.engagement_rate || 0), 0) / currentData.length
  const verifiedCount = currentData.filter(inf => inf.is_verified).length

  // 동적으로 차트 데이터 생성
  const dynamicFollowerRangeData = React.useMemo(() => {
    if (crawledData.length === 0) return followerRangeData
    
    const ranges = {
      '~1K': 0,
      '1K-10K': 0,
      '10K-100K': 0,
      '100K-1M': 0,
      '1M+': 0
    }
    
    currentData.forEach(inf => {
      const followers = inf.followers
      if (followers < 1000) ranges['~1K']++
      else if (followers < 10000) ranges['1K-10K']++
      else if (followers < 100000) ranges['10K-100K']++
      else if (followers < 1000000) ranges['100K-1M']++
      else ranges['1M+']++
    })
    
    return [
      { range: '~1K', count: ranges['~1K'], color: '#8b5cf6' },
      { range: '1K-10K', count: ranges['1K-10K'], color: '#06b6d4' },
      { range: '10K-100K', count: ranges['10K-100K'], color: '#10b981' },
      { range: '100K-1M', count: ranges['100K-1M'], color: '#f59e0b' },
      { range: '1M+', count: ranges['1M+'], color: '#ef4444' },
    ]
  }, [currentData, crawledData.length])

  const dynamicCategoryData = React.useMemo(() => {
    if (crawledData.length === 0) return categoryData
    
    const categories: Record<string, number> = {}
    currentData.forEach(inf => {
      const cat = inf.category || 'Unknown'
      categories[cat] = (categories[cat] || 0) + 1
    })
    
    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#84cc16']
    return Object.entries(categories).map(([name, count], index) => ({
      name,
      value: Math.round((count / currentData.length) * 100),
      color: colors[index % colors.length]
    }))
  }, [currentData, crawledData.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Instagram className="w-12 h-12 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Instagram 인플루언서 분석 대시보드
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            실시간 인플루언서 데이터 분석 및 성과 측정 플랫폼
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="총 인플루언서"
            value={currentData.length.toString()}
            change="+12%"
            icon={<Users className="w-8 h-8" />}
            trend="up"
            gradient="gradient-primary"
          />
          <MetricCard
            title="총 팔로워"
            value={formatNumber(totalFollowers)}
            change="+23%"
            icon={<Eye className="w-8 h-8" />}
            trend="up"
            gradient="gradient-secondary"
          />
          <MetricCard
            title="평균 참여율"
            value={formatPercentage(avgEngagement)}
            change="+8%"
            icon={<Heart className="w-8 h-8" />}
            trend="up"
            gradient="gradient-success"
          />
          <MetricCard
            title="인증 계정"
            value={verifiedCount.toString()}
            change="+2"
            icon={<Award className="w-8 h-8" />}
            trend="up"
            gradient="gradient-warning"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Follower Range Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">팔로워 규모별 분포</CardTitle>
              <CardDescription>인플루언서들의 팔로워 수 구간별 분포</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dynamicFollowerRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]}>
                    {dynamicFollowerRangeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">카테고리 분포</CardTitle>
              <CardDescription>인플루언서 카테고리별 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dynamicCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    labelLine={true}
                  >
                    {dynamicCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Growth Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">성장 트렌드</CardTitle>
              <CardDescription>월별 팔로워 및 참여율 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="followers" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">참여율 트렌드</CardTitle>
              <CardDescription>월별 평균 참여율 변화</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Influencers Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Top 인플루언서</CardTitle>
                <CardDescription>팔로워 수 기준 상위 인플루언서들</CardDescription>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV 다운로드
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-2 font-bold text-lg">순위</th>
                    <th className="text-left py-4 px-2 font-bold text-lg">계정명</th>
                    <th className="text-left py-4 px-2 font-bold text-lg">팔로워</th>
                    <th className="text-left py-4 px-2 font-bold text-lg">참여율</th>
                    <th className="text-left py-4 px-2 font-bold text-lg">카테고리</th>
                    <th className="text-left py-4 px-2 font-bold text-lg">인증</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData
                    .sort((a, b) => b.followers - a.followers)
                    .map((influencer, index) => (
                    <tr 
                      key={influencer.username} 
                      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedInfluencer(influencer)
                        setIsDetailOpen(true)
                      }}
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <span className="text-2xl font-bold text-gray-600">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {influencer.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <a 
                            href={`https://instagram.com/${influencer.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-lg hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            @{influencer.username}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-lg font-bold text-blue-600">
                          {formatNumber(influencer.followers)}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold">
                            {formatPercentage(influencer.engagement_rate || 0)}
                          </span>
                          <Heart className="w-4 h-4 text-red-500" />
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {influencer.category || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {influencer.is_verified ? (
                          <Award className="w-6 h-6 text-yellow-500" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500">
            © 2024 Instagram 인플루언서 분석 대시보드. Made with ❤️
          </p>
        </div>
      </div>
      
      {/* Influencer Detail Modal */}
      <InfluencerDetail 
        influencer={selectedInfluencer}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  )
}

export default InfluencerDashboard