import { useState } from 'react'
import { FaGoogle } from 'react-icons/fa'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { supabase } from '../lib/supabase'
import { Button } from './ui/Button'
import toast from 'react-hot-toast'

export function SocialLoginButtons() {
  const [loading, setLoading] = useState<'google' | 'kakao' | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading('google')
      
      // Google OAuth 시도
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) {
        console.error('Google login error:', error)
        
        // 에러 유형별 친화적 메시지 제공
        if (error.message.includes('not enabled') || error.message.includes('provider')) {
          toast.error('🔧 Google 로그인 설정이 필요합니다.\n\n관리자가 다음 단계를 완료해야 합니다:\n1. Google Cloud Console에서 OAuth 2.0 설정\n2. Supabase에서 Google Provider 활성화\n3. 리다이렉션 URI 설정', {
            duration: 8000
          })
        } else if (error.message.includes('redirect_uri')) {
          toast.error('OAuth 리다이렉션 설정이 필요합니다. 관리자에게 문의해주세요.')
        } else {
          toast.error(`Google 로그인 오류: ${error.message}`)
        }
      } else if (data?.url) {
        toast.success('Google 로그인 페이지로 이동합니다...')
        // OAuth URL이 반환된 경우 자동으로 리다이렉션됨
      } else {
        toast.success('Google 로그인을 진행합니다...')
      }
    } catch (error: any) {
      console.error('Google login error:', error)
      toast.error('Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(null)
    }
  }

  const handleKakaoLogin = async () => {
    try {
      setLoading('kakao')
      
      // 카카오 OAuth 시도
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Kakao login error:', error)
        
        if (error.message.includes('not enabled') || error.message.includes('provider')) {
          toast.error('🔧 카카오 로그인 설정이 필요합니다.\n\n관리자가 다음 단계를 완료해야 합니다:\n1. Kakao Developers에서 앱 생성\n2. REST API 키 및 리다이렉션 URI 설정\n3. Supabase에서 Kakao Provider 활성화', {
            duration: 8000
          })
        } else {
          toast.error(`카카오 로그인 오류: ${error.message}`)
        }
      } else if (data?.url) {
        toast.success('카카오 로그인 페이지로 이동합니다...')
      } else {
        toast.success('카카오 로그인을 진행합니다...')
      }
    } catch (error: any) {
      console.error('Kakao login error:', error)
      toast.error('카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full flex items-center justify-center space-x-3 py-3 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
        onClick={handleGoogleLogin}
        disabled={loading === 'google'}
      >
        {loading === 'google' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        ) : (
          <FaGoogle className="w-5 h-5 text-red-500" />
        )}
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {loading === 'google' ? '로그인 중...' : 'Google로 계속하기'}
        </span>
      </Button>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center space-x-3 py-3 border-yellow-400 hover:border-yellow-500 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-600"
        onClick={handleKakaoLogin}
        disabled={loading === 'kakao'}
      >
        {loading === 'kakao' ? (
          <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <RiKakaoTalkFill className="w-5 h-5 text-yellow-600" />
        )}
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {loading === 'kakao' ? '로그인 중...' : 'KakaoTalk으로 계속하기'}
        </span>
      </Button>
    </div>
  )
}

export function SocialLoginDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
          또는 이메일로 계속하기
        </span>
      </div>
    </div>
  )
}
