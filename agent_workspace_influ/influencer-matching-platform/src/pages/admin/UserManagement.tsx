import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatDate, formatNumber, getStatusColor } from '../../lib/utils'
import { 
  Search, 
  Filter, 
  Users, 
  UserCheck, 
  UserX, 
  Shield,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Ban,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

// Mock user data
const mockUsers = [
  {
    user_id: '1',
    name: '김인플루',
    email: 'kim.influencer@email.com',
    user_type: 'INFLUENCER',
    status: 'ACTIVE',
    phone_number: '010-1234-5678',
    created_at: '2024-01-15T09:00:00Z',
    last_login: '2025-01-17T14:30:00Z',
    total_campaigns: 15,
    total_earnings: 5500000,
    followers_count: 45000
  },
  {
    user_id: '2',
    name: '뷰티브랜드',
    email: 'contact@beautycompany.com',
    user_type: 'BRAND',
    status: 'ACTIVE',
    phone_number: '02-1234-5678',
    created_at: '2024-02-10T10:00:00Z',
    last_login: '2025-01-17T16:00:00Z',
    total_campaigns: 8,
    total_spent: 12000000,
    company_name: '뷰티컴퍼니'
  },
  {
    user_id: '3',
    name: '마케팅에이전시',
    email: 'info@marketingagency.com',
    user_type: 'AGENCY',
    status: 'INACTIVE',
    phone_number: '02-9876-5432',
    created_at: '2024-03-05T11:00:00Z',
    last_login: '2025-01-10T09:15:00Z',
    total_campaigns: 25,
    total_spent: 35000000,
    company_name: '마케팅에이전시'
  },
  {
    user_id: '4',
    name: '푸드인플루언서',
    email: 'food.lover@email.com',
    user_type: 'INFLUENCER',
    status: 'SUSPENDED',
    phone_number: '010-5678-1234',
    created_at: '2024-01-20T08:30:00Z',
    last_login: '2025-01-16T12:00:00Z',
    total_campaigns: 3,
    total_earnings: 800000,
    followers_count: 28000
  }
]

export function UserManagement() {
  const { userProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserType, setSelectedUserType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  // Check if user is admin
  if (userProfile?.user_type !== 'ADMIN') {
    return (
      <Layout>
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </Layout>
    )
  }
  
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedUserType || user.user_type === selectedUserType
    const matchesStatus = !selectedStatus || user.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })
  
  const handleStatusChange = (userId: string, newStatus: string) => {
    console.log(`Change user ${userId} status to ${newStatus}`)
    // In real implementation, call API to update user status
  }
  
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
            <p className="text-gray-600">플랫폼에 등록된 모든 사용자를 관리합니다</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="이름 또는 이메일 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">모든 사용자 유형</option>
                <option value="INFLUENCER">인플루언서</option>
                <option value="BRAND">브랜드</option>
                <option value="AGENCY">에이전시</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">모든 상태</option>
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
                <option value="SUSPENDED">정지</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                고급 필터
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">전체 사용자</p>
                  <p className="text-xl font-bold text-gray-900">{formatNumber(mockUsers.length)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">활성 사용자</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(mockUsers.filter(u => u.status === 'ACTIVE').length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserX className="h-8 w-8 text-gray-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">비활성 사용자</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(mockUsers.filter(u => u.status === 'INACTIVE').length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Ban className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">정지된 사용자</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(mockUsers.filter(u => u.status === 'SUSPENDED').length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">사용자</th>
                    <th className="text-left py-3 px-4">유형</th>
                    <th className="text-left py-3 px-4">상태</th>
                    <th className="text-left py-3 px-4">가입일</th>
                    <th className="text-left py-3 px-4">최근 로그인</th>
                    <th className="text-left py-3 px-4">활동</th>
                    <th className="text-left py-3 px-4">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.user_type === 'INFLUENCER' ? 'bg-purple-100 text-purple-700' :
                          user.user_type === 'BRAND' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {user.user_type === 'INFLUENCER' ? '인플루언서' :
                           user.user_type === 'BRAND' ? '브랜드' : '에이전시'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          user.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {user.status === 'ACTIVE' ? '활성' :
                           user.status === 'INACTIVE' ? '비활성' : '정지'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(user.last_login)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600">
                          <div>캠페인: {user.total_campaigns}회</div>
                          {user.user_type === 'INFLUENCER' ? (
                            <div>수익: {formatNumber(user.total_earnings)}원</div>
                          ) : (
                            <div>지출: {formatNumber(user.total_spent)}원</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            상세보기
                          </Button>
                          <div className="relative">
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* User Detail Modal */}
        {selectedUser && (
          <UserDetailModal 
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </Layout>
  )
}

function UserDetailModal({ user, onClose, onStatusChange }: {
  user: any
  onClose: () => void
  onStatusChange: (userId: string, status: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">사용자 상세 정보</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.user_type === 'INFLUENCER' ? 'bg-purple-100 text-purple-700' :
                    user.user_type === 'BRAND' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.user_type === 'INFLUENCER' ? '인플루언서' :
                     user.user_type === 'BRAND' ? '브랜드' : '에이전시'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    user.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {user.status === 'ACTIVE' ? '활성' :
                     user.status === 'INACTIVE' ? '비활성' : '정지'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">이메일:</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">전화번호:</span>
                <span className="text-sm font-medium">{user.phone_number}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">가입일:</span>
                <span className="text-sm font-medium">{formatDate(user.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">최근 로그인:</span>
                <span className="text-sm font-medium">{formatDate(user.last_login)}</span>
              </div>
            </div>
            
            {/* Activity Stats */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">활동 통계</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{user.total_campaigns}</p>
                  <p className="text-xs text-gray-600">총 캠페인 수</p>
                </div>
                {user.user_type === 'INFLUENCER' ? (
                  <>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{formatNumber(user.total_earnings)}</p>
                      <p className="text-xs text-gray-600">총 수익 (원)</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{formatNumber(user.followers_count)}</p>
                      <p className="text-xs text-gray-600">총 팔로워</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{formatNumber(user.total_spent)}</p>
                      <p className="text-xs text-gray-600">총 지출 (원)</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{user.company_name}</p>
                      <p className="text-xs text-gray-600">회사명</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">계정 관리</h4>
              <div className="flex space-x-3">
                {user.status !== 'ACTIVE' && (
                  <Button 
                    onClick={() => onStatusChange(user.user_id, 'ACTIVE')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    계정 활성화
                  </Button>
                )}
                {user.status !== 'SUSPENDED' && (
                  <Button 
                    variant="outline"
                    onClick={() => onStatusChange(user.user_id, 'SUSPENDED')}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    계정 정지
                  </Button>
                )}
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-1" />
                  이메일 전송
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}