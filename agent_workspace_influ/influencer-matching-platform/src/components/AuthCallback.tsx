import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // Get the hash fragment from the URL
        const hashFragment = window.location.hash

        if (hashFragment && hashFragment.length > 0) {
          // Exchange the auth code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment)

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            toast.error('로그인 오류: ' + error.message)
            navigate('/auth?error=' + encodeURIComponent(error.message))
            return
          }

          if (data.session) {
            // Successfully signed in, redirect to dashboard
            toast.success('로그인에 성공했습니다!')
            navigate('/dashboard')
            return
          }
        }

        // If we get here, something went wrong
        toast.error('로그인 세션을 찾을 수 없습니다.')
        navigate('/auth?error=No session found')
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('로그인 처리 중 오류가 발생했습니다.')
        navigate('/auth')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  )
}