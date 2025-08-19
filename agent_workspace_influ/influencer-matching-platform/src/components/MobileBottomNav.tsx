import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  MessageCircle, 
  BarChart3, 
  Zap,
  User
} from 'lucide-react'
import { cn } from '../lib/utils'

export function MobileBottomNav() {
  const { userProfile } = useAuth()
  const location = useLocation()
  
  const isAdmin = userProfile?.user_type === 'ADMIN'
  
  const navigation = isAdmin ? [
    { name: '대시보드', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: '사용자', href: '/admin/users', icon: Users },
    { name: '캠페인', href: '/admin/campaigns', icon: Zap },
    { name: '결제', href: '/admin/payments', icon: BarChart3 },
  ] : [
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '캠페인', href: '/campaigns', icon: Zap },
    { name: '인플루언서', href: '/influencers', icon: Users },
    { name: '채팅', href: '/chat', icon: MessageCircle },
    { name: '분석', href: '/analytics', icon: BarChart3 },
  ]
  
  // 모바일에서만 표시
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center text-xs font-medium transition-colors',
                isActive
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 mb-1',
                isActive ? 'text-purple-600' : 'text-gray-400'
              )} />
              <span>{item.name}</span>
            </Link>
          )
        })}
        <Link
          to="/profile"
          className={cn(
            'flex flex-col items-center justify-center text-xs font-medium transition-colors',
            location.pathname === '/profile'
              ? 'text-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-purple-600'
          )}
        >
          <User className={cn(
            'h-5 w-5 mb-1',
            location.pathname === '/profile' ? 'text-purple-600' : 'text-gray-400'
          )} />
          <span>프로필</span>
        </Link>
      </div>
    </div>
  )
}