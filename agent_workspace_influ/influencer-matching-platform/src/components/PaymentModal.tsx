import { useState, useEffect } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { X, CreditCard, Shield, CheckCircle } from 'lucide-react'
import { usePayment } from '../hooks/usePayment'
import toast from 'react-hot-toast'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  applicationId?: string | null
  amount: number
  campaignTitle: string
  influencerName?: string
  onSuccess?: () => void
}

export function PaymentModal({
  isOpen,
  onClose,
  campaignId,
  applicationId,
  amount,
  campaignTitle,
  influencerName,
  onSuccess
}: PaymentModalProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { createCampaignPayment, loading: paymentLoading } = usePayment()
  
  const [clientSecret, setClientSecret] = useState<string>('')
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentSucceeded, setPaymentSucceeded] = useState(false)

  // Calculate fees
  const platformFeeRate = 0.10
  const platformFee = Math.round(amount * platformFeeRate)
  const influencerAmount = amount - platformFee

  useEffect(() => {
    if (isOpen && !clientSecret) {
      createPaymentIntent()
    }
  }, [isOpen])

  const createPaymentIntent = async () => {
    try {
      const result = await createCampaignPayment(campaignId, applicationId, amount)
      setClientSecret(result.clientSecret)
      setPaymentIntent(result)
    } catch (error) {
      console.error('Failed to create payment intent:', error)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setProcessing(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setProcessing(false)
      return
    }

    const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: '브랜드 결제자' // 실제로는 사용자 정보 사용
        }
      }
    })

    setProcessing(false)

    if (error) {
      console.error('Payment failed:', error)
      toast.error(error.message || '결제에 실패했습니다.')
    } else if (confirmedPaymentIntent && confirmedPaymentIntent.status === 'succeeded') {
      setPaymentSucceeded(true)
      toast.success('결제가 완료되었습니다!')
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 2000)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              캠페인 결제
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {paymentSucceeded ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                결제 완료!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                결제가 성공적으로 처리되었습니다.
              </p>
            </div>
          ) : (
            <>
              {/* 결제 정보 */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">결제 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">캠페인</span>
                    <span className="font-medium">{campaignTitle}</span>
                  </div>
                  {influencerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">인플루언서</span>
                      <span className="font-medium">{influencerName}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">총 금액</span>
                      <span className="font-medium">₩{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">플랫폼 수수료 (10%)</span>
                      <span>₩{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">인플루언서 수령액</span>
                      <span>₩{influencerAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 결제 폼 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    카드 정보
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="h-4 w-4" />
                  <span>결제 정보는 Stripe를 통해 안전하게 보호됩니다</span>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={processing}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!stripe || processing || paymentLoading}
                  >
                    {processing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>처리중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>₩{amount.toLocaleString()} 결제하기</span>
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
