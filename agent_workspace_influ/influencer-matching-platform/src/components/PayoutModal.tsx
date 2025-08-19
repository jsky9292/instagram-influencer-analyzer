import { useState } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { X, DollarSign, Banknote, CheckCircle } from 'lucide-react'
import { usePayment } from '../hooks/usePayment'
import toast from 'react-hot-toast'

interface PayoutModalProps {
  isOpen: boolean
  onClose: () => void
  paymentId: string
  applicationId?: string | null
  amount: number
  platformFee: number
  influencerName?: string
  onSuccess?: () => void
}

export function PayoutModal({
  isOpen,
  onClose,
  paymentId,
  applicationId,
  amount,
  platformFee,
  influencerName,
  onSuccess
}: PayoutModalProps) {
  const { processInfluencerPayout, loading } = usePayment()
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  })
  const [processing, setProcessing] = useState(false)
  const [payoutSucceeded, setPayoutSucceeded] = useState(false)

  const netAmount = amount - platformFee

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    try {
      setProcessing(true)
      
      const result = await processInfluencerPayout(paymentId, applicationId, bankInfo)
      
      setPayoutSucceeded(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error('Payout failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankInfo({
      ...bankInfo,
      [e.target.name]: e.target.value
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              인플루언서 정산
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {payoutSucceeded ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                정산 처리 완료!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                정산이 성공적으로 처리되었습니다.<br />
                2-3 영업일 내에 입금됩니다.
              </p>
            </div>
          ) : (
            <>
              {/* 정산 정보 */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">정산 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {influencerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">인플루언서</span>
                      <span className="font-medium">{influencerName}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">총 결제 금액</span>
                      <span className="font-medium">₩{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>플랫폼 수수료 (10%)</span>
                      <span>-₩{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                      <span>실 정산 금액</span>
                      <span>₩{netAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 계좌 정보 폼 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    은행명
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={bankInfo.bankName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="예: 국민은행"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    계좌번호
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={bankInfo.accountNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="계좌번호를 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    예금주명
                  </label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={bankInfo.accountHolder}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="예금주명을 입력하세요"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Banknote className="h-4 w-4" />
                  <span>계좌 정보는 안전하게 암호화되어 저장됩니다</span>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={processing || loading}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={processing || loading}
                  >
                    {processing || loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>처리중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>₩{netAmount.toLocaleString()} 정산 요청</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
