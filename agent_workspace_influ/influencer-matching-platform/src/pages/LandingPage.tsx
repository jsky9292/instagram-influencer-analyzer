import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Users, Zap, TrendingUp, Shield, MessageCircle, BarChart3 } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IM</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">인플루언서 매칭</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline">로그인</Button>
              </Link>
              <Link to="/auth">
                <Button>회원가입</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI로 당신의 브랜드를 빛내 줄<br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                최적의 인플루언서를
              </span><br />
              지금 바로 찾아보세요
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              주제별 인플루언서 발굴 및 수요업체와의 AI 기반 스마트 매칭 플랫폼으로
              효율적이고 투명한 인플루언서 마케팅 생태계를 조성합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  캠페인 등록하기 (브랜드)
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  인플루언서 지원하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              플랫폼 핵심 기능
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI 기반 매칭부터 성과 분석까지, 인플루언서 마케팅의 모든 것을 한 곳에서
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>AI 매칭 시스템</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  관련성, 영향력, 신뢰도, 브랜드 안전성을 종합 분석하여 최적의 인플루언서를 추천합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>예측 성과 모델링</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  머신러닝 기반으로 캠페인 KPI(도달률, 참여율, 전환율)를 사전에 예측합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>실시간 채팅</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  브랜드-인플루언서 간 1:1 채팅, 파일 공유, 계약서 첨부 기능을 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle>성과 분석 대시보드</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  실시간 KPI 모니터링, ROI 계산, 인플루언서별 성과 비교 분석을 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>안전 결제 시스템</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  에스크로 기반의 안전 결제 시스템과 자동 수수료 정산 기능을 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>전자 계약 시스템</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  플랫폼 내에서 전자 계약서 생성, 검토, 서명을 진행할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              성공 사례
            </h2>
            <p className="text-xl text-gray-600">
              이미 많은 브랜드와 인플루언서가 우리 플랫폼을 통해 성공적인 협업을 진행하고 있습니다.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">250%</div>
                  <div className="text-gray-600">평균 ROI 증가</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">15,000+</div>
                  <div className="text-gray-600">성공적인 캠페인</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                  <div className="text-gray-600">고객 만족도</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            AI 기반 매칭 시스템으로 당신의 인플루언서 마케팅을 다음 단계로 끌어올려보세요.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary">
              무료로 시작하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IM</span>
                </div>
                <span className="ml-2 text-lg font-bold">인플루언서 매칭</span>
              </div>
              <p className="text-gray-400">
                AI 기반 인플루언서 매칭 플랫폼
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI 매칭</li>
                <li>성과 분석</li>
                <li>결제 시스템</li>
                <li>채팅 시스템</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-gray-400">
                <li>고객센터</li>
                <li>사용 가이드</li>
                <li>FAQ</li>
                <li>문의하기</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">회사</h3>
              <ul className="space-y-2 text-gray-400">
                <li>회사 소개</li>
                <li>이용약관</li>
                <li>개인정보처리방침</li>
                <li>뉴스</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 인플루언서 매칭 플랫폼. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}