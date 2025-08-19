import { useState, useEffect } from 'react'

export function useMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // 초기 체크
    checkIfMobile()

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkIfMobile)
    
    // 오리엔테이션 변경 이벤트 리스너
    window.addEventListener('orientationchange', () => {
      setTimeout(checkIfMobile, 100) // 오리엔테이션 변경 후 약간의 지연
    })

    return () => {
      window.removeEventListener('resize', checkIfMobile)
      window.removeEventListener('orientationchange', checkIfMobile)
    }
  }, [breakpoint])

  // 디바이스 정보
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)
    const isMobileDevice = isIOS || isAndroid || isMobile
    const isTablet = /(iPad|tablet|Tablet)/.test(userAgent)
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    return {
      isIOS,
      isAndroid,
      isMobileDevice,
      isTablet,
      isTouch,
      userAgent
    }
  }

  // 뷰포트 높이 계산 (모바일 브라우저의 주소창 고려)
  const getViewportHeight = () => {
    return window.visualViewport?.height || window.innerHeight
  }

  // 안전 영역 정보 (노치 등)
  const getSafeAreaInsets = () => {
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    }
  }

  return {
    isMobile,
    ...getDeviceInfo(),
    getViewportHeight,
    getSafeAreaInsets
  }
}