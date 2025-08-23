'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Key, Server, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ApiStatus {
  main_api: boolean
  gemini_api: boolean
  last_check: string
}

export default function Settings() {
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
      // 메인 API 상태 확인
      const mainApiResponse = await fetch(`${API_URL}/health`, {
        method: 'GET'
      }).catch(() => null)

      // Gemini API 상태 확인
      const geminiApiResponse = await fetch(`${API_URL}/api/gemini/status`, {
        method: 'GET'
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      
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

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return <Badge className="bg-green-100 text-green-800">연결됨</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">연결 끊김</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-gray-600">API 키 관리 및 시스템 상태를 확인하세요.</p>
      </div>

      {/* API 상태 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            API 서버 상태
          </CardTitle>
          <CardDescription>
            시스템 구성 요소의 현재 상태를 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(apiStatus?.main_api || false)}
                <span className="font-medium">메인 API</span>
              </div>
              {getStatusBadge(apiStatus?.main_api || false)}
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(apiStatus?.gemini_api || false)}
                <span className="font-medium">Gemini AI</span>
              </div>
              {getStatusBadge(apiStatus?.gemini_api || false)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              마지막 확인: {apiStatus?.last_check || '-'}
            </span>
            <Button variant="outline" size="sm" onClick={checkApiStatus}>
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gemini API 키 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Google Gemini API 키
          </CardTitle>
          <CardDescription>
            현실적인 AI 분석을 위해 Google Gemini API 키를 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-api-key">API 키</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="gemini-api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={saveApiKey}>저장</Button>
              {geminiApiKey && (
                <Button variant="outline" onClick={clearApiKey}>
                  삭제
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={testApiConnection}
              disabled={loading || !geminiApiKey.trim()}
            >
              {loading ? '테스트 중...' : 'API 연결 테스트'}
            </Button>
          </div>

          {message && (
            <Alert className={
              messageType === 'success' ? 'border-green-200 bg-green-50' :
              messageType === 'error' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className={
                messageType === 'success' ? 'text-green-800' :
                messageType === 'error' ? 'text-red-800' :
                'text-blue-800'
              }>
                {message}
              </AlertDescription>
            </Alert>
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
        </CardContent>
      </Card>

      {/* 시스템 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 정보</CardTitle>
          <CardDescription>
            현재 시스템 구성 및 기능 정보입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      {/* 문제 해결 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>문제 해결</CardTitle>
          <CardDescription>
            자주 발생하는 문제들과 해결 방법입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">🟡 Gemini API 오류</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 ml-4">
                <li>API 키가 올바르게 입력되었는지 확인하세요</li>
                <li>API 키 연결 테스트를 실행해보세요</li>
                <li>Google AI Studio에서 API 키 상태를 확인하세요</li>
                <li>API 사용량 한도를 확인하세요</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}