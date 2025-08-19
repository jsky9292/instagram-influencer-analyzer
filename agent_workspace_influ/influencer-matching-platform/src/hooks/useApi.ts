import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

// AI Matching Hook
export function useAIMatching() {
  const queryClient = useQueryClient()

  const matchingMutation = useMutation({
    mutationFn: async ({ campaignId }: { campaignId: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-matching', {
        body: { campaignId, action: 'match' }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('AI 매칭이 완료되었습니다!')
      queryClient.invalidateQueries({ queryKey: ['matching-scores'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'AI 매칭에 실패했습니다.')
    }
  })

  return {
    runMatching: matchingMutation.mutate,
    isMatching: matchingMutation.isPending
  }
}

// Chat Hook
export function useChat() {
  const queryClient = useQueryClient()

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message, messageType, fileUrl, fileName }: {
      conversationId: string
      message: string
      messageType?: string
      fileUrl?: string
      fileName?: string
    }) => {
      const { data, error } = await supabase.functions.invoke('chat-management', {
        body: {
          action: 'send_message',
          conversationId,
          message,
          messageType,
          fileUrl,
          fileName
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '메시지 전송에 실패했습니다.')
    }
  })

  const createConversationMutation = useMutation({
    mutationFn: async ({ campaignId, brandId, influencerId }: {
      campaignId: string
      brandId: string
      influencerId: string
    }) => {
      const { data, error } = await supabase.functions.invoke('chat-management', {
        body: {
          action: 'create_conversation',
          campaignId,
          brandId,
          influencerId
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '대화방 생성에 실패했습니다.')
    }
  })

  return {
    sendMessage: sendMessageMutation.mutate,
    createConversation: createConversationMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingConversation: createConversationMutation.isPending
  }
}

// Performance Analytics Hook
export function useAnalytics() {
  const queryClient = useQueryClient()

  const trackPerformanceMutation = useMutation({
    mutationFn: async ({ applicationId, postUrl }: {
      applicationId: number
      postUrl: string
    }) => {
      const { data, error } = await supabase.functions.invoke('performance-analytics', {
        body: {
          action: 'track_performance',
          applicationId,
          postUrl
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('성과 데이터가 기록되었습니다!')
      queryClient.invalidateQueries({ queryKey: ['performance'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '성과 추적에 실패했습니다.')
    }
  })

  return {
    trackPerformance: trackPerformanceMutation.mutate,
    isTracking: trackPerformanceMutation.isPending
  }
}

// Payment Hook
export function usePayment() {
  const queryClient = useQueryClient()

  const createEscrowMutation = useMutation({
    mutationFn: async ({ campaignId, applicationId, amount, paymentMethod }: {
      campaignId: string
      applicationId: number
      amount: number
      paymentMethod?: string
    }) => {
      const { data, error } = await supabase.functions.invoke('payment-processing', {
        body: {
          action: 'create_escrow_payment',
          campaignId,
          applicationId,
          amount,
          paymentMethod
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('결제가 에스크로에 예치되었습니다!')
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '결제에 실패했습니다.')
    }
  })

  const releasePaymentMutation = useMutation({
    mutationFn: async ({ applicationId }: { applicationId: number }) => {
      const { data, error } = await supabase.functions.invoke('payment-processing', {
        body: {
          action: 'release_payment',
          applicationId
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      toast.success('결제가 성공적으로 정산되었습니다!')
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['payouts'] })
    },
    onError: (error: any) => {
      toast.error(error.message || '정산에 실패했습니다.')
    }
  })

  return {
    createEscrow: createEscrowMutation.mutate,
    releasePayment: releasePaymentMutation.mutate,
    isCreatingEscrow: createEscrowMutation.isPending,
    isReleasingPayment: releasePaymentMutation.isPending
  }
}

// Notifications Hook
export function useNotifications() {
  const queryClient = useQueryClient()

  const markAsReadMutation = useMutation({
    mutationFn: async ({ notificationId }: { notificationId: string }) => {
      const { data, error } = await supabase.functions.invoke('notification-service', {
        body: {
          action: 'mark_as_read',
          notificationId
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return {
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending
  }
}

// Database Queries
export function useCampaigns(brandId?: string) {
  return useQuery({
    queryKey: ['campaigns', brandId],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (brandId) {
        query = query.eq('brand_id', brandId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useApplications(influencerId?: string, campaignId?: string) {
  return useQuery({
    queryKey: ['applications', influencerId, campaignId],
    queryFn: async () => {
      let query = supabase
        .from('campaign_applications')
        .select('*')
        .order('applied_at', { ascending: false })

      if (influencerId) {
        query = query.eq('influencer_id', influencerId)
      }
      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    }
  })
}

export function useMatchingScores(campaignId: string) {
  return useQuery({
    queryKey: ['matching-scores', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matching_scores')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('overall_score', { ascending: false })

      if (error) throw error
      return data
    }
  })
}