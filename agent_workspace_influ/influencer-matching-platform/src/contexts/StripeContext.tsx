import React, { createContext, useContext, ReactNode } from 'react'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// Stripe 공개 키 (환경변수에서 가져오거나 하드코딩)
const stripePublishableKey = 'pk_test_51234567890' // 실제 키로 교체 필요

const stripePromise = loadStripe(stripePublishableKey)

interface StripeProviderProps {
  children: ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  )
}

// Stripe 훅 (필요시 사용)
export function useStripe() {
  // Elements Provider 내에서만 사용 가능
  return { stripePromise }
}
