'use client'

import React, { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, TrendingUp, Download, Activity, Calendar, Search, 
  BarChart, PieChart, Clock, Hash, Target, Lightbulb,
  FileDown, AlertCircle, CheckCircle, XCircle
} from 'lucide-react'
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts'

interface SearchHistory {
  id: number
  query: string
  type: string
  timestamp: string
  results_count: number
}

interface AnalysisResult {
  hashtag: string
  avg_engagement: number
  top_influencers: string[]
  best_time: string
  content_tips: string[]
}

const UserDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [stats, setStats] = useState({
    total_searches: 0,
    total_analyses: 0,
    favorite_hashtags: [] as string[],
    usage_trend: [] as any[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
        
        // 사용자 통계 가져오기 (실제로는 API 호출)
        generateMockData(userData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (user: any) => {
    // 검색 기록 샘플 데이터
    const mockHistory: SearchHistory[] = [
      { id: 1, query: '먹방', type: 'hashtag', timestamp: new Date().toISOString(), results_count: 25 },
      { id: 2, query: '여행', type: 'hashtag', timestamp: new Date(Date.now() - 86400000).toISOString(), results_count: 18 },
      { id: 3, query: 'cristiano', type: 'user', timestamp: new Date(Date.now() - 172800000).toISOString(), results_count: 1 },
      { id: 4, query: '패션', type: 'hashtag', timestamp: new Date(Date.now() - 259200000).toISOString(), results_count: 32 },
      { id: 5, query: '뷰티', type: 'hashtag', timestamp: new Date(Date.now() - 345600000).toISOString(), results_count: 28 }
    ]
    setSearchHistory(mockHistory)

    // 분석 결과 샘플
    const mockAnalysis: AnalysisResult[] = [
      {
        hashtag: '먹방',
        avg_engagement: 4.8,
        top_influencers: ['omuk_food', 'wild_guys__', 'mywayflover'],
        best_time: '오후 7-9시',
        content_tips: ['리얼 먹방 사운드 강조', '썸네일에 음식 클로즈업', '15-30초 쇼츠 활용']
      },
      {
        hashtag: '여행',
        avg_engagement: 3.2,
        top_influencers: ['travel_korea', 'world_tour', 'backpacker'],
        best_time: '오후 8-10시',
        content_tips: ['풍경 + 인물 조합', '현지 문화 체험 강조', '여행 팁 공유']
      }
    ]
    setAnalysisResults(mockAnalysis)

    // 사용 트렌드 데이터
    const usageTrend = [
      { date: '월', searches: 5, analyses: 2 },
      { date: '화', searches: 8, analyses: 3 },
      { date: '수', searches: 12, analyses: 5 },
      { date: '목', searches: 10, analyses: 4 },
      { date: '금', searches: 15, analyses: 7 },
      { date: '토', searches: 20, analyses: 9 },
      { date: '일', searches: 18, analyses: 8 }
    ]

    setStats({
      total_searches: mockHistory.length,
      total_analyses: mockAnalysis.length,
      favorite_hashtags: ['먹방', '여행', '패션'],
      usage_trend: usageTrend
    })
  }

  const downloadCSV = (data: any[], filename: string) => {
    const csvContent = convertToCSV(data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0,10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header]
        return typeof value === 'object' ? JSON.stringify(value) : value
      }).join(',')
    })
    
    return csvHeaders + '\n' + csvRows.join('\n')
  }

  const downloadAnalysisReport = () => {
    const report = {
      user: currentUser?.username,
      date: new Date().toISOString(),
      total_searches: stats.total_searches,
      total_analyses: stats.total_analyses,
      search_history: searchHistory,
      analysis_results: analysisResults,
      recommendations: [
        '오후 7-9시 게시물 업로드 권장',
        '리얼 콘텐츠와 사운드 활용',
        '15-30초 쇼츠 형식 활용',
        '해시태그 5-10개 사용'
      ]
    }
    
    const jsonStr = JSON.stringify(report, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analysis_report_${new Date().toISOString().slice(0,10)}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const pieData = analysisResults.map((result, index) => ({
    name: result.hashtag,
    value: result.avg_engagement,
    color: ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981'][index % 4]
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-center text-gray-600">로그인이 필요합니다</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">안녕하세요, {currentUser.username}님!</h1>
                <p className="text-gray-600">회원 대시보드</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => downloadCSV(searchHistory, 'search_history')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                검색 기록 다운로드
              </button>
              <button
                onClick={downloadAnalysisReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                분석 리포트 다운로드
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-6 h-6" />
                총 검색 횟수
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{stats.total_searches}회</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-6 h-6" />
                분석 완료
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{stats.total_analyses}건</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                평균 참여율
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">4.2%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-6 h-6" />
                인기 해시태그
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-2 flex-wrap">
                {stats.favorite_hashtags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">주간 사용 트렌드</CardTitle>
            <CardDescription>최근 7일간 서비스 이용 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.usage_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="searches" stroke="#8b5cf6" name="검색" strokeWidth={2} />
                <Line type="monotone" dataKey="analyses" stroke="#ec4899" name="분석" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                주요 분석 인사이트
              </CardTitle>
              <CardDescription>해시태그별 성과 분석 결과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResults.map((result, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">#{result.hashtag}</h4>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        참여율 {result.avg_engagement}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">최적 게시 시간: {result.best_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">상위 인플루언서: {result.top_influencers.join(', ')}</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold mb-1">콘텐츠 팁:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {result.content_tips.map((tip, tipIdx) => (
                            <li key={tipIdx} className="flex items-start gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">참여율 분포</CardTitle>
              <CardDescription>해시태그별 평균 참여율 비교</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">최근 검색 기록</CardTitle>
            <CardDescription>최근 검색한 해시태그 및 인플루언서</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-2">검색어</th>
                    <th className="text-left py-3 px-2">유형</th>
                    <th className="text-left py-3 px-2">검색 시간</th>
                    <th className="text-left py-3 px-2">결과 수</th>
                    <th className="text-left py-3 px-2">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {searchHistory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <span className="font-semibold">
                          {item.type === 'hashtag' ? '#' : '@'}{item.query}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.type === 'hashtag' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type === 'hashtag' ? '해시태그' : '사용자'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(item.timestamp).toLocaleString('ko-KR')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-bold text-green-600">{item.results_count}개</span>
                      </td>
                      <td className="py-3 px-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          재검색
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Recommendations */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              맞춤 추천 액션
            </CardTitle>
            <CardDescription>데이터 분석 기반 개인화 추천</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">최적 게시 시간</p>
                  <p className="text-sm text-gray-600">오후 7-9시에 게시물을 업로드하면 참여율이 평균 32% 증가합니다</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">해시태그 전략</p>
                  <p className="text-sm text-gray-600">#먹방 #맛집 조합 사용 시 도달률 45% 향상</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">콘텐츠 형식</p>
                  <p className="text-sm text-gray-600">15-30초 릴스가 일반 게시물보다 3배 높은 참여율 기록</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold">협업 추천</p>
                  <p className="text-sm text-gray-600">@omuk_food와 협업 시 예상 도달률 250K+</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserDashboard