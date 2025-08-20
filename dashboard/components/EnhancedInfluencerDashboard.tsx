'use client'

import React, { useState, useEffect } from 'react'
import InfluencerDashboard from './InfluencerDashboard'
import CrawlingSearch from './CrawlingSearch'
import ViralContentAnalyzer from './ViralContentAnalyzer'
import ViralAnalyzer from './ViralAnalyzer'
import GeminiAnalyzer from './GeminiAnalyzer'
import Settings from './Settings'
import AdminDashboard from './AdminDashboard'
import AuthModal from './AuthModal'
import { TrendingUp, Search, BarChart, User, LogOut, Shield, Brain, Settings as SettingsIcon } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<'search' | 'viral' | 'ai' | 'gemini' | 'settings' | 'admin'>('search')
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
      {/* 탭 네비게이션 */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Search className="w-5 h-5" />
                인플루언서 검색 & 분석
              </button>
              <button
                onClick={() => setActiveTab('viral')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'viral'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                바이럴 콘텐츠 분석
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Brain className="w-5 h-5" />
                AI 바이럴 분석
              </button>
              <button
                onClick={() => setActiveTab('gemini')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'gemini'
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Brain className="w-5 h-5" />
                Gemini AI 분석
              </button>
            </div>
            
            {/* 사용자 메뉴 */}
            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-4">
                  {/* 설정 버튼 */}
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeTab === 'settings'
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <SettingsIcon className="w-5 h-5" />
                    설정
                  </button>
                  
                  {/* 관리자 버튼 (jsky9292만 표시) */}
                  {currentUser.username === 'jsky9292' && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                        activeTab === 'admin'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      관리자
                    </button>
                  )}
                  <div className="text-sm">
                    <p className="font-semibold">{currentUser.username}</p>
                    <p className="text-gray-500">사용 횟수: {currentUser.usage_count || 0}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
                >
                  <User className="w-5 h-5" />
                  로그인 / 회원가입
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GeminiAnalyzer />
          </div>
        </div>
      ) : activeTab === 'settings' ? (
        /* 설정 섹션 */
        <div className="py-12">
          <Settings />
        </div>
      ) : activeTab === 'admin' && currentUser?.username === 'jsky9292' ? (
        /* 관리자 대시보드 */
        <AdminDashboard />
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