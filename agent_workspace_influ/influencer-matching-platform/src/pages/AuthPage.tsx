import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { SocialLoginButtons, SocialLoginDivider } from '../components/SocialLoginButtons'
import { ArrowLeft, Mail, Lock, User, Phone, Building, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

type AuthMode = 'signin' | 'signup'
type UserType = 'INFLUENCER' | 'BRAND' | 'AGENCY'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [userType, setUserType] = useState<UserType>('INFLUENCER')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone_number: '',
    business_registration_number: ''
  })
  
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const error = searchParams.get('error')

  // 사업자등록번호 검증 함수
  const validateBusinessNumber = (value: string) => {
    if (!value) return true // 선택적 필드
    const cleaned = value.replace(/[^0-9]/g, '')
    return cleaned.length === 10
  }

  // 사업자등록번호 포맷팅 함수
  const formatBusinessNumber = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password)
        navigate('/dashboard')
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.')
        }
        
        await signUp(formData.email, formData.password, {
          name: formData.name,
          user_type: userType,
          phone_number: formData.phone_number || undefined,
          business_registration_number: (userType === 'BRAND' || userType === 'AGENCY') ? 
            (formData.business_registration_number || undefined) : undefined
        })
        // 회원가입 성공 시 로그인 페이지로 이동
        setMode('signin')
      }
    } catch (error: any) {
      // 에러는 AuthContext에서 처리
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'business_registration_number') {
      // 사업자등록번호는 포맷팅 적용
      const formatted = formatBusinessNumber(value)
      setFormData({
        ...formData,
        [name]: formatted
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈페이지로 돌아가기
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">IM</span>
            </div>
            <CardTitle className="text-2xl">
              {mode === 'signin' ? '로그인' : '회원가입'}
            </CardTitle>
            <p className="text-gray-600">
              {mode === 'signin' 
                ? '인플루언서 매칭 플랫폼에 오신 것을 환영합니다!' 
                : '새로운 계정을 만들어 시작해보세요'
              }
            </p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Social Login Buttons */}
            {mode === 'signin' && (
              <div className="mb-6">
                <SocialLoginButtons />
                <SocialLoginDivider />
              </div>
            )}

            {/* User Type Selection (signup only) */}
            {mode === 'signup' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용자 유형
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserType('INFLUENCER')}
                    className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                      userType === 'INFLUENCER'
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    인플루언서
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('BRAND')}
                    className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                      userType === 'BRAND'
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    브랜드
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('AGENCY')}
                    className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                      userType === 'AGENCY'
                        ? 'bg-purple-50 border-purple-200 text-purple-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    에이전시
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {userType === 'INFLUENCER' ? '채널명 또는 닉네임' : '회사명 또는 브랜드명'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={
                        userType === 'INFLUENCER' 
                          ? '채널명을 입력해주세요' 
                          : '회사명을 입력해주세요'
                      }
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>

              {/* Phone field (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호 (선택사항)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="010-1234-5678"
                    />
                  </div>
                </div>
              )}

              {/* Business Registration Number field (signup only, for BRAND/AGENCY) */}
              {mode === 'signup' && (userType === 'BRAND' || userType === 'AGENCY') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사업자등록번호 (선택사항)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      name="business_registration_number"
                      value={formData.business_registration_number}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        formData.business_registration_number && !validateBusinessNumber(formData.business_registration_number)
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="123-45-67890"
                      maxLength={12}
                    />
                  </div>
                  {formData.business_registration_number && !validateBusinessNumber(formData.business_registration_number) && (
                    <p className="mt-1 text-xs text-red-600">
                      올바른 사업자등록번호 형식이 아닙니다. (10자리 숫자)
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    사업자등록번호는 나중에 프로필에서 등록할 수 있습니다.
                  </p>
                </div>
              )}

              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="비밀번호를 입력해주세요"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password field (signup only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="비밀번호를 다시 입력해주세요"
                      required
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {mode === 'signin' ? '로그인' : '회원가입'}
              </Button>
            </form>

            {/* Mode toggle */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {mode === 'signin' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  {mode === 'signin' ? '회원가입' : '로그인'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}