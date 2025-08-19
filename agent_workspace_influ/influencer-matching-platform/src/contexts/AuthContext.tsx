import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, User } from '../lib/supabase'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: SupabaseUser | null
  userProfile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: {
    name: string
    user_type: 'INFLUENCER' | 'BRAND' | 'AGENCY'
    phone_number?: string
    business_registration_number?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          await loadUserProfile(user.id)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // KEEP SIMPLE - avoid any async operations in callback
        setUser(session?.user || null)
        if (!session?.user) {
          setUserProfile(null)
        } else if (session.user.id !== user?.id) {
          // User changed, load new profile
          setTimeout(() => loadUserProfile(session.user.id), 0)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error loading user profile:', error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        throw error
      }
      
      toast.success('로그인에 성공했습니다!')
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message || '로그인에 실패했습니다.')
      throw error
    }
  }

  async function signUp(email: string, password: string, userData: {
    name: string
    user_type: 'INFLUENCER' | 'BRAND' | 'AGENCY'
    phone_number?: string
    business_registration_number?: string
  }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            user_id: data.user.id,
            email: email,
            name: userData.name,
            user_type: userData.user_type,
            phone_number: userData.phone_number,
            status: 'ACTIVE'
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          throw profileError
        }

        // Create type-specific profile
        if (userData.user_type === 'INFLUENCER') {
          await supabase
            .from('influencer_profiles')
            .insert({
              influencer_id: data.user.id,
              channel_name: userData.name
            })
        } else if (userData.user_type === 'BRAND' || userData.user_type === 'AGENCY') {
          await supabase
            .from('brand_profiles')
            .insert({
              brand_id: data.user.id,
              company_name: userData.name,
              business_registration_number: userData.business_registration_number
            })
        }

        toast.success('회원가입이 완료되었습니다! 이메일을 확인해 주세요.')
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      toast.error(error.message || '회원가입에 실패했습니다.')
      throw error
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
      
      toast.success('로그아웃되었습니다.')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error(error.message || '로그아웃에 실패했습니다.')
      throw error
    }
  }

  async function updateProfile(updates: Partial<User>) {
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser) {
        throw new Error('사용자 인증에 실패했습니다.')
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', currentUser.id)
        .select()
        .maybeSingle()

      if (error) {
        throw error
      }

      setUserProfile(data)
      toast.success('프로필이 업데이트되었습니다.')
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast.error(error.message || '프로필 업데이트에 실패했습니다.')
      throw error
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}