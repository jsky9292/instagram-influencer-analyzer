import { useState, useEffect } from 'react'
import { usePWA } from '../hooks/usePWA'
import { Button } from './ui/Button'
import { Download, X, Bell } from 'lucide-react'

export function PWAInstallPrompt() {
  const { isInstallable, installPWA, requestNotificationPermission } = usePWA()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 모달이 열려있는지 감지
  useEffect(() => {
    const detectModal = () => {
      const modals = document.querySelectorAll('[role="dialog"], .modal, .fixed.inset-0')
      setIsModalOpen(modals.length > 0)
    }
    
    const observer = new MutationObserver(detectModal)
    observer.observe(document.body, { childList: true, subtree: true })
    
    return () => observer.disconnect()
  }, [])

  // 모달이 열려있으면 PWA 프롬프트 숨김
  if (!isInstallable || isDismissed || isModalOpen) {
    return null
  }

  const handleInstall = async () => {
    await installPWA()
    setShowNotificationPrompt(true)
  }

  const handleEnableNotifications = async () => {
    await requestNotificationPermission()
    setShowNotificationPrompt(false)
    setIsDismissed(true)
  }

  if (showNotificationPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">알림 받기</h3>
            <p className="text-sm text-gray-600 mb-3">
              새로운 캠페인과 메시지 알림을 받아보세요.
            </p>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleEnableNotifications}>
                알림 허용
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowNotificationPrompt(false)
                  setIsDismissed(true)
                }}
              >
                나중에
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Download className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">앱으로 설치하기</h3>
          <p className="text-sm text-gray-600 mb-3">
            홈 화면에 추가하여 앱처럼 사용하세요.
          </p>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleInstall}>
              설치하기
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsDismissed(true)}
            >
              나중에
            </Button>
          </div>
        </div>
        <button 
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}