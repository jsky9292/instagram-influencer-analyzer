import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function usePayment() {
  const [loading, setLoading] = useState(false)

  const createCampaignPayment = async (campaignId: string, applicationId: string | null, amount: number) => {
    try {
      setLoading(true)
      
      const { data: result, error } = await supabase.functions.invoke('create-campaign-payment', {
        body: {
          campaign_id: campaignId,
          application_id: applicationId,
          amount: amount,
          currency: 'krw'
        }
      })
      
      if (error) {
        throw new Error(error.message)
      }

      return result
    } catch (error: any) {
      console.error('Payment creation error:', error)
      toast.error(error.message || '결제 생성에 실패했습니다.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const processInfluencerPayout = async (paymentId: string, applicationId: string | null, bankInfo?: any) => {
    try {
      setLoading(true)
      
      const { data: result, error } = await supabase.functions.invoke('process-influencer-payout', {
        body: {
          payment_id: paymentId,
          application_id: applicationId,
          bank_info: bankInfo
        }
      })
      
      if (error) {
        throw new Error(error.message)
      }

      toast.success('정산 처리가 시작되었습니다.')
      return result
    } catch (error: any) {
      console.error('Payout processing error:', error)
      toast.error(error.message || '정산 처리에 실패했습니다.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    createCampaignPayment,
    processInfluencerPayout
  }
}
