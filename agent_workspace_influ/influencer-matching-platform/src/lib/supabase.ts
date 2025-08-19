import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rdxsrpvngdnhvlfbjszv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHNycHZuZ2RuaHZsZmJqc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MDg2OTUsImV4cCI6MjA2ODI4NDY5NX0.ICVD3OdYMs34QICl9sS4-fdvSctxTLHtrAm1ENUYz9A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type UserType = 'INFLUENCER' | 'BRAND' | 'AGENCY' | 'ADMIN'
export type CampaignStatus = 'DRAFT' | 'RECRUITING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
export type ApplicationStatus = 'APPLIED' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED' | 'CONTRACTED' | 'COMPLETED'

export interface User {
  user_id: string
  email: string
  user_type: UserType
  name: string
  profile_image_url?: string
  phone_number?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  created_at: string
  updated_at: string
}

export interface InfluencerProfile {
  influencer_id: string
  channel_name?: string
  description?: string
  categories?: string[]
  contact_email?: string
  portfolio_url?: string
  location?: string
  min_price?: number
  max_price?: number
  collaboration_types?: string[]
  created_at: string
  updated_at: string
}

export interface BrandProfile {
  brand_id: string
  company_name: string
  business_registration_number?: string
  website_url?: string
  industry?: string
  company_size?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Campaign {
  campaign_id: string
  brand_id: string
  title: string
  description?: string
  budget: number
  start_date?: string
  end_date?: string
  application_deadline?: string
  status: CampaignStatus
  target_kpis?: any
  requirements?: any
  guidelines?: string
  campaign_type?: string
  target_categories?: string[]
  created_at: string
  updated_at: string
}

export interface CampaignApplication {
  application_id: number
  campaign_id: string
  influencer_id: string
  proposed_cost?: number
  proposal_message?: string
  status: ApplicationStatus
  contract_id?: string
  deliverables?: any
  applied_at: string
  updated_at: string
}

export interface MatchingScore {
  score_id: string
  campaign_id: string
  influencer_id: string
  overall_score: number
  relevance_score: number
  influence_score: number
  authenticity_score: number
  brand_safety_score: number
  predicted_performance?: any
  calculated_at: string
}

export interface Notification {
  notification_id: string
  user_id: string
  type: string
  title: string
  content?: string
  data?: any
  is_read: boolean
  created_at: string
}