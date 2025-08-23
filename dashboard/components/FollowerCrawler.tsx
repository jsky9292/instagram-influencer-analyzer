'use client'

import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Plus, Trash2, RefreshCw, Shield, Users, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Account {
  username: string
  password?: string
  proxy?: string
  status: string
  request_count: number
  last_used?: string
  added_at: string
}

interface FollowerData {
  user_id: string
  username: string
  full_name: string
  profile_pic_url: string
  is_verified: boolean
  is_private: boolean
  follower_count: number
  collected_by: string
  collected_at: string
}

export default function FollowerCrawler() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newAccount, setNewAccount] = useState({ username: '', password: '', proxy: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [crawling, setCrawling] = useState(false)
  const [ipInfo, setIpInfo] = useState<any>(null)
  const [targetUsername, setTargetUsername] = useState('')
  const [maxCount, setMaxCount] = useState<number>(1000)
  const [useRotation, setUseRotation] = useState(true)
  const [followers, setFollowers] = useState<FollowerData[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

  useEffect(() => {
    loadAccounts()
    checkIP()
  }, [])

  const loadAccounts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/accounts/list`)
      const data = await response.json()
      setAccounts(data.accounts || [])
    } catch (err) {
      console.error('계정 목록 로드 실패:', err)
    }
  }

  const checkIP = async () => {
    try {
      const response = await fetch(`${API_URL}/api/check-ip`)
      const data = await response.json()
      setIpInfo(data)
    } catch (err) {
      console.error('IP 확인 실패:', err)
    }
  }

  const addAccount = async () => {
    if (!newAccount.username || !newAccount.password) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/api/accounts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('계정이 추가되었습니다.')
        setNewAccount({ username: '', password: '', proxy: '' })
        loadAccounts()
      } else {
        setError(data.message || '계정 추가 실패')
      }
    } catch (err: any) {
      setError('계정 추가 중 오류 발생')
    } finally {
      setLoading(false)
    }
  }

  const removeAccount = async (username: string) => {
    if (!confirm(`${username} 계정을 삭제하시겠습니까?`)) return

    try {
      const response = await fetch(`${API_URL}/api/accounts/${username}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('계정이 삭제되었습니다.')
        loadAccounts()
      }
    } catch (err) {
      setError('계정 삭제 실패')
    }
  }

  const startCrawling = async () => {
    if (!targetUsername) {
      setError('크롤링할 인스타그램 아이디를 입력해주세요.')
      return
    }

    if (accounts.length === 0) {
      setError('먼저 계정을 등록해주세요.')
      return
    }

    setCrawling(true)
    setError('')
    setSuccess('')
    setFollowers([])

    try {
      const response = await fetch(`${API_URL}/api/followers/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_username: targetUsername,
          max_count: maxCount,
          use_rotation: useRotation
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setFollowers(data.followers)
        setSuccess(`${data.total_collected}명의 팔로워를 수집했습니다.`)
      } else {
        setError(data.error || '크롤링 실패')
      }
    } catch (err: any) {
      setError('크롤링 중 오류 발생')
    } finally {
      setCrawling(false)
    }
  }

  const downloadCSV = () => {
    if (followers.length === 0) return

    const csv = [
      ['Username', 'Full Name', 'Followers', 'Verified', 'Private', 'Collected By'],
      ...followers.map(f => [
        f.username,
        f.full_name,
        f.follower_count,
        f.is_verified ? 'Yes' : 'No',
        f.is_private ? 'Yes' : 'No',
        f.collected_by
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `followers_${targetUsername}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* 헤더 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">👥 팔로워 크롤러</h1>
        <p className="text-gray-600">인스타그램 팔로워 목록을 안전하게 수집합니다.</p>
      </div>

      {/* IP/VPN 상태 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h2 className="text-xl font-bold">연결 상태</h2>
          </div>
          <button onClick={checkIP} className="p-2 hover:bg-gray-100 rounded">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        
        {ipInfo && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">IP 주소</p>
              <p className="font-mono">{ipInfo.ip}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">위치</p>
              <p>{ipInfo.country} / {ipInfo.city}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ISP</p>
              <p className="text-sm">{ipInfo.org}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">VPN 상태</p>
              <div className="flex items-center gap-1">
                {ipInfo.is_vpn ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">사용 중</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-600">미사용</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!ipInfo?.is_vpn && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                VPN을 사용하지 않고 있습니다. 대량 크롤링 시 VPN 사용을 권장합니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 계정 관리 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">계정 관리</h2>
        
        {/* 계정 추가 폼 */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">인스타그램 아이디</label>
              <input
                type="text"
                placeholder="username"
                value={newAccount.username}
                onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2.5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                프록시 <span className="text-gray-400 text-xs">(선택사항 - 비워두셔도 됩니다)</span>
              </label>
              <input
                type="text"
                placeholder="예: http://proxy:port (선택사항)"
                value={newAccount.proxy}
                onChange={(e) => setNewAccount({...newAccount, proxy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">프록시 서버가 있는 경우만 입력하세요</p>
            </div>
          </div>
          
          <button
            onClick={addAccount}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            계정 추가
          </button>
        </div>

        {/* 등록된 계정 목록 */}
        <div className="space-y-2">
          <h3 className="font-semibold">등록된 계정 ({accounts.length}개)</h3>
          {accounts.length === 0 ? (
            <p className="text-gray-500">등록된 계정이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {accounts.map((account) => (
                <div key={account.username} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{account.username}</span>
                    <span className="text-sm text-gray-500">요청: {account.request_count}회</span>
                    {account.proxy && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">프록시</span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${
                      account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {account.status}
                    </span>
                  </div>
                  <button
                    onClick={() => removeAccount(account.username)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 크롤링 설정 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">크롤링 설정</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대상 인스타그램 아이디</label>
              <input
                type="text"
                placeholder="@username (@ 제외)"
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value.replace('@', ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최대 수집 개수</label>
              <input
                type="text"
                value={maxCount === 0 ? '' : maxCount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value === '') {
                    setMaxCount(0);
                  } else {
                    const num = parseInt(value);
                    if (num <= 10000) {
                      setMaxCount(num);
                    }
                  }
                }}
                onBlur={(e) => {
                  if (maxCount === 0 || maxCount < 10) setMaxCount(10);
                  if (maxCount > 10000) setMaxCount(10000);
                }}
                placeholder="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">10 ~ 10,000 사이의 숫자를 입력하세요</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rotation"
              checked={useRotation}
              onChange={(e) => setUseRotation(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="rotation" className="text-sm">
              계정 로테이션 사용 (여러 계정을 번갈아가며 사용)
            </label>
          </div>
          
          {useRotation && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ 인터리빙 방식: 각 계정이 30개씩 수집 후 다음 계정으로 전환합니다.
              </p>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800">{success}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={startCrawling}
            disabled={crawling || accounts.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {crawling ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                크롤링 중... (시간이 걸릴 수 있습니다)
              </>
            ) : (
              <>
                <Users className="h-5 w-5" />
                팔로워 크롤링 시작
              </>
            )}
          </button>
        </div>
      </div>

      {/* 결과 */}
      {followers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">수집된 팔로워 ({followers.length}명)</h2>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              CSV 다운로드
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">프로필</th>
                  <th className="text-left py-2">사용자명</th>
                  <th className="text-left py-2">이름</th>
                  <th className="text-left py-2">팔로워</th>
                  <th className="text-left py-2">상태</th>
                  <th className="text-left py-2">수집 계정</th>
                </tr>
              </thead>
              <tbody>
                {followers.slice(0, 100).map((follower) => (
                  <tr key={follower.user_id} className="border-b">
                    <td className="py-2">
                      <img 
                        src={follower.profile_pic_url} 
                        alt={follower.username}
                        className="w-10 h-10 rounded-full"
                      />
                    </td>
                    <td className="py-2">
                      <a 
                        href={`https://instagram.com/${follower.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        @{follower.username}
                      </a>
                    </td>
                    <td className="py-2">{follower.full_name}</td>
                    <td className="py-2">{follower.follower_count.toLocaleString()}</td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        {follower.is_verified && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">인증</span>
                        )}
                        {follower.is_private && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">비공개</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 text-sm text-gray-500">{follower.collected_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {followers.length > 100 && (
              <p className="mt-4 text-center text-gray-500">
                ... 외 {followers.length - 100}명 (CSV 다운로드로 전체 확인)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}