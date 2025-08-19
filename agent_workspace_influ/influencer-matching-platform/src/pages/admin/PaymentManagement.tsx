import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Layout } from '../../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { PayoutModal } from '../../components/PayoutModal'
import { usePayment } from '../../hooks/usePayment'
import { formatDate, formatCurrency, formatNumber } from '../../lib/utils'
import { 
  Search, 
  Filter, 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Target
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

// Mock payment data
const mockPayments = [
  {
    payment_id: '1',
    brand_name: '뷰티컴퍼니',
    campaign_title: '신제품 런칭 캠페인',
    amount: 5000000,
    method: 'CREDIT_CARD',
    status: 'SUCCESS',
    transaction_id: 'TXN_20250117_001',
    created_at: '2025-01-17T09:00:00Z',
    platform_fee: 300000
  },
  {
    payment_id: '2',
    brand_name: '패션브랜드',
    campaign_title: '여름 컨션 소개',
    amount: 8000000,
    method: 'BANK_TRANSFER',
    status: 'PENDING',
    transaction_id: 'TXN_20250117_002',
    created_at: '2025-01-17T10:30:00Z',
    platform_fee: 480000
  },
  {
    payment_id: '3',
    brand_name: '맛집레스토랑',
    campaign_title: '레스토랑 홍보',
    amount: 3000000,
    method: 'CREDIT_CARD',
    status: 'SUCCESS',
    transaction_id: 'TXN_20250116_003',
    created_at: '2025-01-16T14:15:00Z',
    platform_fee: 180000
  },
  {
    payment_id: '4',
    brand_name: '테크컴퍼니',
    campaign_title: '신제품 리뷰',
    amount: 4500000,
    method: 'CREDIT_CARD',
    status: 'FAILED',
    transaction_id: 'TXN_20250116_004',
    created_at: '2025-01-16T16:45:00Z',
    platform_fee: 0
  }
]

const mockPayouts = [
  {
    payout_id: '1',
    influencer_name: '김인플루',
    campaign_title: '레스토랑 홍보',
    amount: 1400000,
    platform_fee: 84000,
    net_amount: 1316000,
    status: 'COMPLETED',
    requested_at: '2025-01-15T10:00:00Z',
    completed_at: '2025-01-16T09:00:00Z'
  },
  {
    payout_id: '2',
    influencer_name: '뷰티인플루언서',
    campaign_title: '신제품 런칭 캠페인',
    amount: 2000000,
    platform_fee: 120000,
    net_amount: 1880000,
    status: 'PROCESSING',
    requested_at: '2025-01-17T08:30:00Z',
    completed_at: null
  },
  {
    payout_id: '3',
    influencer_name: '푸드인플루언서',
    campaign_title: '레스토랑 홍보',
    amount: 1200000,
    platform_fee: 72000,
    net_amount: 1128000,
    status: 'REQUESTED',
    requested_at: '2025-01-17T11:00:00Z',
    completed_at: null
  }
]

const revenueData = [
  { date: '1/10', payments: 15000000, payouts: 12000000, fees: 900000 },
  { date: '1/11', payments: 18000000, payouts: 14000000, fees: 1080000 },
  { date: '1/12', payments: 12000000, payouts: 9000000, fees: 720000 },
  { date: '1/13', payments: 22000000, payouts: 17000000, fees: 1320000 },
  { date: '1/14', payments: 16000000, payouts: 13000000, fees: 960000 },
  { date: '1/15', payments: 25000000, payouts: 19000000, fees: 1500000 },
  { date: '1/16', payments: 20000000, payouts: 16000000, fees: 1200000 },
  { date: '1/17', payments: 13000000, payouts: 10000000, fees: 780000 }
]

export function PaymentManagement() {
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('payments')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPayout, setSelectedPayout] = useState<any>(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const { processInfluencerPayout } = usePayment()
  
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
  
  const totalPayments = mockPayments.reduce((sum, p) => sum + (p.status === 'SUCCESS' ? p.amount : 0), 0)
  const totalPayouts = mockPayouts.reduce((sum, p) => sum + (p.status === 'COMPLETED' ? p.net_amount : 0), 0)
  const totalFees = mockPayments.reduce((sum, p) => sum + (p.status === 'SUCCESS' ? p.platform_fee : 0), 0)
  
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">결제 및 정산 관리</h1>
            <p className="text-gray-600">플랫폼의 모든 결제와 정산을 관리합니다</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            재무 리포트
          </Button>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 결제액</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPayments)}</p>
                  <p className="text-xs text-green-600">↑ 8.2% 전주 대비</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 정산액</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPayouts)}</p>
                  <p className="text-xs text-blue-600">↑ 12.1% 전주 대비</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">플랫폼 수수료</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFees)}</p>
                  <p className="text-xs text-green-600">6% 수수료율</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">순 수익</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPayments - totalPayouts)}</p>
                  <p className="text-xs text-green-600">↑ 15.3% 전주 대비</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>수익 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line 
                  type="monotone" 
                  dataKey="payments" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="결제액"
                />
                <Line 
                  type="monotone" 
                  dataKey="payouts" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="정산액"
                />
                <Line 
                  type="monotone" 
                  dataKey="fees" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="수수료"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              결제 내역 ({mockPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payouts'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              정산 내역 ({mockPayouts.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'payments' ? (
          <PaymentsTable 
            payments={mockPayments} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
        ) : (
          <PayoutsTable 
            payouts={mockPayouts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            setSelectedPayout={setSelectedPayout}
            setShowPayoutModal={setShowPayoutModal}
          />
        )}
      </div>
      
      {/* Payout Modal */}
      {selectedPayout && (
        <PayoutModal
          isOpen={showPayoutModal}
          onClose={() => {
            setShowPayoutModal(false)
            setSelectedPayout(null)
          }}
          paymentId={selectedPayout.payout_id}
          applicationId={selectedPayout.application_id}
          amount={selectedPayout.amount}
          platformFee={selectedPayout.platform_fee}
          influencerName={selectedPayout.influencer_name}
          onSuccess={() => {
            // 정산 성공 후 데이터 새로고침
            window.location.reload()
          }}
        />
      )}
    </Layout>
  )
}

function PaymentsTable({ payments, searchTerm, setSearchTerm, selectedStatus, setSelectedStatus }: any) {
  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch = payment.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.campaign_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !selectedStatus || payment.status === selectedStatus
    return matchesSearch && matchesStatus
  })
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>결제 내역</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="브랜드 또는 캠페인 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">모든 상태</option>
              <option value="SUCCESS">성공</option>
              <option value="PENDING">대기중</option>
              <option value="FAILED">실패</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">결제 정보</th>
                <th className="text-left py-3 px-4">금액</th>
                <th className="text-left py-3 px-4">결제 수단</th>
                <th className="text-left py-3 px-4">상태</th>
                <th className="text-left py-3 px-4">수수료</th>
                <th className="text-left py-3 px-4">거래 ID</th>
                <th className="text-left py-3 px-4">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment: any) => (
                <tr key={payment.payment_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{payment.brand_name}</p>
                      <p className="text-xs text-gray-500">{payment.campaign_title}</p>
                      <p className="text-xs text-gray-400">{formatDate(payment.created_at)}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      payment.method === 'CREDIT_CARD' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {payment.method === 'CREDIT_CARD' ? '신용카드' : '계좌이체'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                      payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {payment.status === 'SUCCESS' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {payment.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                      {payment.status === 'FAILED' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {payment.status === 'SUCCESS' ? '성공' :
                       payment.status === 'PENDING' ? '대기중' : '실패'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatCurrency(payment.platform_fee)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-500 font-mono">{payment.transaction_id}</span>
                  </td>
                  <td className="py-3 px-4">
                    {payment.status === 'FAILED' && (
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        재시도
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function PayoutsTable({ payouts, searchTerm, setSearchTerm, selectedStatus, setSelectedStatus, setSelectedPayout, setShowPayoutModal }: any) {
  const filteredPayouts = payouts.filter((payout: any) => {
    const matchesSearch = payout.influencer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payout.campaign_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !selectedStatus || payout.status === selectedStatus
    return matchesSearch && matchesStatus
  })
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>정산 내역</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="인플루언서 또는 캠페인 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">모든 상태</option>
              <option value="COMPLETED">완료</option>
              <option value="PROCESSING">처리중</option>
              <option value="REQUESTED">요청</option>
            </select>
            <Button>
              대량 정산 처리
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">정산 정보</th>
                <th className="text-left py-3 px-4">총 금액</th>
                <th className="text-left py-3 px-4">수수료</th>
                <th className="text-left py-3 px-4">실수령액</th>
                <th className="text-left py-3 px-4">상태</th>
                <th className="text-left py-3 px-4">요청일</th>
                <th className="text-left py-3 px-4">작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map((payout: any) => (
                <tr key={payout.payout_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{payout.influencer_name}</p>
                      <p className="text-xs text-gray-500">{payout.campaign_title}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{formatCurrency(payout.amount)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600">{formatCurrency(payout.platform_fee)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-green-600">{formatCurrency(payout.net_amount)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      payout.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      payout.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payout.status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {payout.status === 'PROCESSING' && <Clock className="h-3 w-3 mr-1" />}
                      {payout.status === 'REQUESTED' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {payout.status === 'COMPLETED' ? '완료' :
                       payout.status === 'PROCESSING' ? '처리중' : '요청'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-600">
                      <div>요청: {formatDate(payout.requested_at)}</div>
                      {payout.completed_at && (
                        <div>완료: {formatDate(payout.completed_at)}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {payout.status === 'REQUESTED' && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          setSelectedPayout(payout)
                          setShowPayoutModal(true)
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                    )}
                    {payout.status === 'PROCESSING' && (
                      <Button variant="outline" size="sm">
                        <Clock className="h-4 w-4 mr-1" />
                        대기중
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

  )
}
