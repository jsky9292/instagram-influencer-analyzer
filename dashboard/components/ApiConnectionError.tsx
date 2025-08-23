'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, Settings, Key, Server } from 'lucide-react'

export default function ApiConnectionError() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [errorDetails, setErrorDetails] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [showError, setShowError] = useState(false)
  
  useEffect(() => {
    checkApiConnection()
  }, [retryCount])
  
  const checkApiConnection = async () => {
    setApiStatus('checking')
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
    
    console.log('Checking API connection to:', API_URL) // 디버깅용
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3초 타임아웃
      
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        setApiStatus('connected')
        setShowError(false)
        console.log('API connected successfully')
      } else {
        setApiStatus('error')
        setShowError(true)
        setErrorDetails(`API 서버 응답 오류: ${response.status}`)
      }
    } catch (error: any) {
      console.error('API connection error:', error)
      setApiStatus('error')
      setShowError(true)
      if (error.name === 'AbortError') {
        setErrorDetails('API 서버 응답 시간 초과')
      } else if (error.message.includes('Failed to fetch')) {
        setErrorDetails('API 서버에 연결할 수 없습니다 (포트 8001)')
      } else {
        setErrorDetails(error.message)
      }
    }
  }
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setShowError(false)
    checkApiConnection()
  }
  
  if (apiStatus === 'checking') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
            <p className="text-lg">API 서버 연결 확인 중...</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (apiStatus === 'error' && showError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-8 w-8" />
              <h2 className="text-2xl font-bold">API 서버 연결 실패</h2>
            </div>
            
            {/* 에러 상세 */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errorDetails}</p>
            </div>
            
            {/* 해결 방법 */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">🔧 해결 방법:</h3>
              
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-5 w-5 text-gray-600" />
                    <h4 className="font-semibold">1. API 서버 실행 확인</h4>
                  </div>
                  <ul className="ml-7 space-y-1 text-sm text-gray-600">
                    <li>• 터미널/명령 프롬프트 열기</li>
                    <li>• <code className="bg-gray-200 px-1 rounded">cd dashboard</code> 실행</li>
                    <li>• <code className="bg-gray-200 px-1 rounded">python -m uvicorn api.crawl_realtime:app --host 0.0.0.0 --port 8001</code> 실행</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-5 w-5 text-gray-600" />
                    <h4 className="font-semibold">2. Gemini API 키 설정 (선택)</h4>
                  </div>
                  <ul className="ml-7 space-y-1 text-sm text-gray-600">
                    <li>• 로그인 후 설정 탭 클릭</li>
                    <li>• Google Gemini API 키 입력</li>
                    <li>• <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">API 키 받기</a></li>
                  </ul>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <h4 className="font-semibold">3. 포터블 버전 사용시</h4>
                  </div>
                  <ul className="ml-7 space-y-1 text-sm text-gray-600">
                    <li>• <code className="bg-gray-200 px-1 rounded">확인_및_실행.bat</code> 실행</li>
                    <li>• 또는 <code className="bg-gray-200 px-1 rounded">테스트_및_진단.bat</code>로 문제 확인</li>
                    <li>• Python과 Node.js가 설치되어 있는지 확인</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-1">⚠️ 방화벽 확인</h4>
                  <p className="text-sm text-yellow-700">
                    Windows 방화벽이 포트 8001을 차단할 수 있습니다.
                    방화벽 설정에서 Python.exe를 허용해주세요.
                  </p>
                </div>
              </div>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </button>
              
              <button
                onClick={() => {
                  setApiStatus('connected')
                  setShowError(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                무시하고 계속
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}