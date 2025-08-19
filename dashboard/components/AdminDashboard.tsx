'use client'

import React, { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Activity, Calendar, Mail, Shield, RefreshCw } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  created_at: string
  last_login: string
  usage_count: number
  is_active: boolean
}

interface UserStats {
  total_users: number
  active_users: number
  total_usage: number
  avg_usage: number
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    active_users: 0,
    total_usage: 0,
    avg_usage: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('로그인이 필요합니다')
        return
      }

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          setError('관리자 권한이 필요합니다')
        } else {
          setError('사용자 목록을 불러올 수 없습니다')
        }
        return
      }

      const data = await response.json()
      setUsers(data.users || [])
      setStats(data.stats || {
        total_users: 0,
        active_users: 0,
        total_usage: 0,
        avg_usage: 0
      })
    } catch (err) {
      setError('서버 연결 오류')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('ko-KR')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              관리자 대시보드
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            회원 관리 및 서비스 통계
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                전체 회원
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{stats.total_users}명</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6" />
                활성 회원
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{stats.active_users}명</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                총 사용 횟수
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{stats.total_usage}회</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6" />
                평균 사용 횟수
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{stats.avg_usage.toFixed(1)}회</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">회원 목록</CardTitle>
                <CardDescription>가입한 모든 회원 정보</CardDescription>
              </div>
              <button
                onClick={fetchUsers}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                새로고침
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">로딩 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">아직 가입한 회원이 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 font-bold">ID</th>
                      <th className="text-left py-3 px-2 font-bold">사용자명</th>
                      <th className="text-left py-3 px-2 font-bold">이메일</th>
                      <th className="text-left py-3 px-2 font-bold">이름</th>
                      <th className="text-left py-3 px-2 font-bold">가입일</th>
                      <th className="text-left py-3 px-2 font-bold">마지막 로그인</th>
                      <th className="text-left py-3 px-2 font-bold">사용 횟수</th>
                      <th className="text-left py-3 px-2 font-bold">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2">{user.id}</td>
                        <td className="py-3 px-2">
                          <span className="font-semibold">@{user.username}</span>
                          {user.username === 'jsky9292' && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                              관리자
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="py-3 px-2">{user.full_name || 'N/A'}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{formatDate(user.created_at)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm">{formatDate(user.last_login)}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-bold text-blue-600">{user.usage_count}회</span>
                        </td>
                        <td className="py-3 px-2">
                          {user.is_active ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                              활성
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                              비활성
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            © 2024 Instagram 인플루언서 분석 플랫폼 - 관리자 전용
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard