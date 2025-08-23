'use client'

import { useState } from 'react'

export default function SimpleGeminiAnalyzer() {
  const [analysisData, setAnalysisData] = useState({
    username: '',
    followers: '',
    engagement_rate: '',
    category: '뷰티',
    brand_collaborations: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setAnalysisData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const performAnalysis = async () => {
    if (!analysisData.username || !analysisData.followers || !analysisData.engagement_rate) {
      setError('모든 필수 정보를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      const requestData = {
        username: analysisData.username,
        followers: parseInt(analysisData.followers),
        engagement_rate: parseFloat(analysisData.engagement_rate),
        category: analysisData.category,
        recent_posts: [],
        brand_collaborations: analysisData.brand_collaborations.split(',').map(s => s.trim()).filter(s => s),
        demographics: {}
      }

      // 로컬 스토리지에서 API 키 가져오기
      const geminiKey = localStorage.getItem('gemini_api_key')
      if (!geminiKey) {
        throw new Error('Gemini API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.')
      }

      const response = await fetch(`${API_URL}/api/gemini/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': geminiKey,
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResult(data.analysis)
      } else {
        throw new Error('분석 결과를 받지 못했습니다.')
      }
    } catch (err: any) {
      console.error('Gemini 분석 실패:', err)
      setError(err.message || '분석 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">🧠 Gemini AI 현실적 분석</h1>
        <p className="text-gray-600">Google Gemini AI를 활용한 시장 데이터 기반 현실적인 인플루언서 분석</p>
      </div>

      {/* 입력 폼 */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">인플루언서 사용자명</label>
            <input
              type="text"
              placeholder="@username"
              value={analysisData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">팔로워 수</label>
            <input
              type="number"
              placeholder="50000"
              value={analysisData.followers}
              onChange={(e) => handleInputChange('followers', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">참여율 (%)</label>
            <input
              type="number"
              step="0.1"
              placeholder="3.5"
              value={analysisData.engagement_rate}
              onChange={(e) => handleInputChange('engagement_rate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select 
              value={analysisData.category} 
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="뷰티">뷰티</option>
              <option value="패션">패션</option>
              <option value="푸드">푸드</option>
              <option value="여행">여행</option>
              <option value="피트니스">피트니스</option>
              <option value="라이프스타일">라이프스타일</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">브랜드 협업 이력 (쉼표로 구분)</label>
          <input
            type="text"
            placeholder="브랜드A, 브랜드B, 브랜드C"
            value={analysisData.brand_collaborations}
            onChange={(e) => handleInputChange('brand_collaborations', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ⚠️ {error}
          </div>
        )}

        <button 
          onClick={performAnalysis} 
          disabled={loading}
          className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '🧠 Gemini AI 분석 중...' : '🧠 Gemini AI 분석 시작'}
        </button>
      </div>

      {/* 결과 표시 */}
      {result && (
        <div className="space-y-6">
          {/* 종합 점수 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              ⭐ 종합 분석 점수
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.influencer_score?.overall_score?.toFixed(1) || 'N/A'}</div>
                <div className="text-sm text-gray-500">종합 점수</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.influencer_score?.engagement_score?.toFixed(1) || 'N/A'}</div>
                <div className="text-sm text-gray-500">참여도</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{result.influencer_score?.reach_score?.toFixed(1) || 'N/A'}</div>
                <div className="text-sm text-gray-500">도달률</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{result.influencer_score?.market_score?.toFixed(1) || 'N/A'}</div>
                <div className="text-sm text-gray-500">시장 적합도</div>
              </div>
            </div>
          </div>

          {/* 성과 예측 */}
          {result.performance_prediction && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                📈 캠페인 성과 예측
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">예상 도달률</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.performance_prediction.estimated_reach?.realistic?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2">전환율</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {result.performance_prediction.conversion_rate?.realistic || 'N/A'}%
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2">예상 ROI</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {result.performance_prediction.roi_prediction?.expected?.toFixed(1) || 'N/A'}x
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 추천사항 */}
          {result.recommendations && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">🎯 AI 추천사항</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span>추천 결과:</span>
                    <span className={`px-2 py-1 rounded text-sm font-semibold ${
                      result.recommendations.recommendation === 'proceed' ? 'bg-green-100 text-green-800' :
                      result.recommendations.recommendation === 'caution' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {result.recommendations.recommendation?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-700">{result.recommendations.reasoning}</p>
                </div>
                
                {result.recommendations.suggested_budget_range && (
                  <div>
                    <h4 className="font-semibold mb-2">제안 예산 범위</h4>
                    <div className="text-lg">
                      {result.recommendations.suggested_budget_range.min?.toLocaleString()}원 - {result.recommendations.suggested_budget_range.max?.toLocaleString()}원
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}