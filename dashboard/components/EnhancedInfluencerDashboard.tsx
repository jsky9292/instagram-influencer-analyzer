'use client'

import React, { useState, useEffect } from 'react'
import InfluencerDashboard from './InfluencerDashboard'
import CrawlingSearch from './CrawlingSearch'
import ViralContentAnalyzer from './ViralContentAnalyzer'
import ViralAnalyzer from './ViralAnalyzer'
import SimpleGeminiAnalyzer from './SimpleGeminiAnalyzer'
import SimpleSettings from './SimpleSettings'
import AdminDashboard from './AdminDashboard'
import AuthModal from './AuthModal'
import FollowerCrawler from './FollowerCrawler'
import ApiConnectionError from './ApiConnectionError'
import { TrendingUp, Search, BarChart, User, LogOut, Shield, Brain, Settings as SettingsIcon, Users } from 'lucide-react'

interface InfluencerData {
  username: string
  full_name: string
  bio: string
  followers: number
  following: number
  posts: number
  engagement_rate: number
  is_verified: boolean
  category: string
  ai_grade: string
  ai_score: number
}

const EnhancedInfluencerDashboard: React.FC = () => {
  const [crawledData, setCrawledData] = useState<InfluencerData[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'viral' | 'ai' | 'gemini' | 'settings' | 'admin' | 'followers'>('search')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [])

  const handleCrawlingResult = (data: InfluencerData[]) => {
    setCrawledData(data)
    // 스크롤을 대시보드로 이동
    setTimeout(() => {
      const dashboardElement = document.getElementById('dashboard-section')
      if (dashboardElement) {
        dashboardElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 500)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
  }

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* API 연결 체크 */}
      <ApiConnectionError />
      
      {/* 탭 네비게이션 */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="w-full px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center py-2 sm:py-3 gap-2">
            <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="w-3 sm:w-4 h-3 sm:h-4" />
                <span className="hidden sm:inline">인플루언서</span>
                <span className="sm:hidden">검색</span>
              </button>
              <button
                onClick={() => setActiveTab('viral')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'viral'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4" />
                <span className="hidden sm:inline">바이럴 콘텐츠</span>
                <span className="sm:hidden">바이럴</span>
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'ai'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Brain className="w-3 sm:w-4 h-3 sm:h-4" />
                <span className="hidden sm:inline">AI 바이럴</span>
                <span className="sm:hidden">AI</span>
              </button>
              <button
                onClick={() => setActiveTab('gemini')}
                className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'gemini'
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Brain className="w-3 sm:w-4 h-3 sm:h-4" />
                <span className="text-xs sm:text-sm">Gemini</span>
              </button>
              {/* 팔로워 크롤러 버튼 - 로그인한 사용자만 표시 */}
              {currentUser && (
                <button
                  onClick={() => setActiveTab('followers')}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'followers'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="text-xs sm:text-sm">팔로워</span>
                </button>
              )}
            </div>
            
            {/* 사용자 메뉴 */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  {/* 설정 버튼 */}
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`p-2 rounded-lg transition-all ${
                      activeTab === 'settings'
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="설정"
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </button>
                  
                  {/* 관리자 버튼 (jsky9292만 표시) */}
                  {currentUser.username === 'jsky9292' && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`p-2 rounded-lg transition-all ${
                        activeTab === 'admin'
                          ? 'bg-purple-600 text-white'
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                      title="관리자"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  )}
                  <div className="hidden sm:block text-xs">
                    <p className="font-semibold">{currentUser.username}</p>
                    <p className="text-gray-500">사용: {currentUser.usage_count || 0}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">로그인</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'search' ? (
        <>
          {/* 검색 섹션 */}
          <div className="py-12">
            <CrawlingSearch onCrawlingResult={handleCrawlingResult} />
          </div>
          
          {/* 대시보드 섹션 */}
          <div id="dashboard-section" className="py-8">
            <InfluencerDashboard crawledData={crawledData} />
          </div>
        </>
      ) : activeTab === 'viral' ? (
        /* 바이럴 콘텐츠 분석 섹션 */
        <div className="py-12">
          <ViralContentAnalyzer />
        </div>
      ) : activeTab === 'ai' ? (
        /* AI 바이럴 분석 섹션 */
        <div className="py-12">
          <ViralAnalyzer />
        </div>
      ) : activeTab === 'gemini' ? (
        /* Gemini AI 분석 섹션 */
        <div className="py-12">
          <SimpleGeminiAnalyzer />
        </div>
      ) : activeTab === 'settings' ? (
        /* 설정 섹션 */
        <div className="py-12">
          <SimpleSettings />
        </div>
      ) : activeTab === 'admin' && currentUser?.username === 'jsky9292' ? (
        /* 관리자 대시보드 */
        <AdminDashboard />
      ) : activeTab === 'followers' && currentUser ? (
        /* 팔로워 크롤러 */
        <div className="py-12">
          <FollowerCrawler />
        </div>
      ) : null}

      {/* 인증 모달 */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default EnhancedInfluencerDashboard