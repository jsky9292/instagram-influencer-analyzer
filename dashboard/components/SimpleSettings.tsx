'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Key, Server, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ApiStatus {
  main_api: boolean
  gemini_api: boolean
  last_check: string
}

export default function SimpleSettings() {
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')

  useEffect(() => {
    // 로컬 스토리지에서 API 키 로드
    const savedApiKey = localStorage.getItem('gemini_api_key')
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey)
    }
    
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      // 메인 API 상태 확인
      const mainApiResponse = await fetch(`${API_URL}/health`, {
        method: 'GET',
      }).catch(() => null)

      // Gemini API 상태 확인
      const geminiApiResponse = await fetch(`${API_URL}/api/gemini/status`, {
        method: 'GET',
      }).catch(() => null)

      setApiStatus({
        main_api: mainApiResponse?.ok || false,
        gemini_api: geminiApiResponse?.ok || false,
        last_check: new Date().toLocaleTimeString('ko-KR')
      })
    } catch (error) {
      setApiStatus({
        main_api: false,
        gemini_api: false,
        last_check: new Date().toLocaleTimeString('ko-KR')
      })
    }
  }

  const saveApiKey = () => {
    if (!geminiApiKey.trim()) {
      setMessage('API 키를 입력해주세요.')
      setMessageType('error')
      return
    }

    try {
      localStorage.setItem('gemini_api_key', geminiApiKey.trim())
      setMessage('Gemini API 키가 저장되었습니다.')
      setMessageType('success')
      
      // API 상태 재확인
      setTimeout(checkApiStatus, 1000)
    } catch (error) {
      setMessage('API 키 저장에 실패했습니다.')
      setMessageType('error')
    }
  }

  const clearApiKey = () => {
    localStorage.removeItem('gemini_api_key')
    setGeminiApiKey('')
    setMessage('API 키가 삭제되었습니다.')
    setMessageType('info')
    
    setTimeout(checkApiStatus, 1000)
  }

  const testApiConnection = async () => {
    if (!geminiApiKey.trim()) {
      setMessage('먼저 API 키를 저장해주세요.')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
      
      // 간단한 테스트 요청
      const response = await fetch(`${API_URL}/api/gemini/market-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': geminiApiKey.trim()
        },
        body: JSON.stringify({
          category: '뷰티'
        })
      })

      if (response.ok) {
        setMessage('Gemini API 연결이 성공적으로 테스트되었습니다!')
        setMessageType('success')
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMessage(`API 테스트 실패: ${errorData.detail || '알 수 없는 오류'}`)
        setMessageType('error')
      }
    } catch (error: any) {
      setMessage(`연결 테스트 실패: ${error.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
      checkApiStatus()
    }
  }

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">⚙️ 설정</h1>
        <p className="text-gray-600">API 키 관리 및 시스템 상태를 확인하세요.</p>
      </div>

      {/* API 상태 카드 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="h-5 w-5" />
          <h2 className="text-xl font-bold">API 서버 상태</h2>
        </div>
        <p className="text-gray-600 mb-4">시스템 구성 요소의 현재 상태를 확인할 수 있습니다.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus?.main_api || false)}
              <span className="font-medium">메인 API</span>
            </div>
            <span className={`px-2 py-1 rounded text-sm ${apiStatus?.main_api ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {apiStatus?.main_api ? '연결됨' : '연결 끊김'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(apiStatus?.gemini_api || false)}
              <span className="font-medium">Gemini AI</span>
            </div>
            <span className={`px-2 py-1 rounded text-sm ${apiStatus?.gemini_api ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {apiStatus?.gemini_api ? '연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            마지막 확인: {apiStatus?.last_check || '-'}
          </span>
          <button 
            onClick={checkApiStatus}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>

      {/* Gemini API 키 설정 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5" />
          <h2 className="text-xl font-bold">Google Gemini API 키</h2>
        </div>
        <p className="text-gray-600 mb-4">현실적인 AI 분석을 위해 Google Gemini API 키를 설정하세요.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API 키</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-0 top-0 h-full px-3 hover:bg-gray-50"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button 
                onClick={saveApiKey}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
              {geminiApiKey && (
                <button 
                  onClick={clearApiKey}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={testApiConnection}
              disabled={loading || !geminiApiKey.trim()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '테스트 중...' : 'API 연결 테스트'}
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              messageType === 'success' ? 'bg-green-50 border border-green-200' :
              messageType === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className={
                  messageType === 'success' ? 'text-green-800' :
                  messageType === 'error' ? 'text-red-800' :
                  'text-blue-800'
                }>
                  {message}
                </span>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">API 키 획득 방법:</h4>
            <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600">
              <li><a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>에 접속</li>
              <li>Google 계정으로 로그인</li>
              <li>'Create API Key' 클릭하여 새 API 키 생성</li>
              <li>생성된 키를 복사하여 위 입력란에 붙여넣기</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 시스템 정보 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">시스템 정보</h2>
        <p className="text-gray-600 mb-4">현재 시스템 구성 및 기능 정보입니다.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">사용 가능한 기능</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li>Instagram 해시태그 크롤링</li>
              <li>인플루언서 분석</li>
              <li>바이럴 콘텐츠 분석</li>
              <li>AI 기반 성과 예측 (Gemini)</li>
              <li>시장 동향 분석 (Gemini)</li>
              <li>ROI 예측 (Gemini)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">데이터 보안</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li>API 키는 로컬 브라우저에만 저장</li>
              <li>서버에 API 키 전송하지 않음</li>
              <li>HTTPS 보안 연결 사용</li>
              <li>개인정보 수집하지 않음</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 문제 해결 가이드 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">문제 해결</h2>
        <p className="text-gray-600 mb-4">자주 발생하는 문제들과 해결 방법입니다.</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">🔴 "Failed to fetch" 에러</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 ml-4">
              <li>API 서버 상태를 확인하세요 (위 상태 카드 참조)</li>
              <li>인터넷 연결을 확인하세요</li>
              <li>브라우저 캐시를 삭제하고 새로고침하세요</li>
              <li>잠시 후 다시 시도해보세요</li>
            </ul>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">🟡 Gemini API 오류</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 ml-4">
              <li>API 키가 올바르게 입력되었는지 확인하세요</li>
              <li>API 키 연결 테스트를 실행해보세요</li>
              <li>Google AI Studio에서 API 키 상태를 확인하세요</li>
              <li>API 사용량 한도를 확인하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}