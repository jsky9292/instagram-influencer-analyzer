import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../lib/utils'

interface SwipeCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  className?: string
  swipeThreshold?: number
}

export function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className,
  swipeThreshold = 100
}: SwipeCardProps) {
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setStartX(touch.clientX)
    setStartY(touch.clientY)
    setCurrentX(touch.clientX)
    setCurrentY(touch.clientY)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const touch = e.touches[0]
    setCurrentX(touch.clientX)
    setCurrentY(touch.clientY)
    
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.1}deg)`
      cardRef.current.style.opacity = String(1 - Math.abs(deltaX) / 300)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const deltaX = currentX - startX
    const deltaY = currentY - startY
    
    if (cardRef.current) {
      cardRef.current.style.transform = ''
      cardRef.current.style.opacity = '1'
    }
    
    // 스와이프 방향 감지
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 수평 스와이프
      if (deltaX > swipeThreshold && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < -swipeThreshold && onSwipeLeft) {
        onSwipeLeft()
      }
    } else {
      // 수직 스와이프
      if (deltaY > swipeThreshold && onSwipeDown) {
        onSwipeDown()
      } else if (deltaY < -swipeThreshold && onSwipeUp) {
        onSwipeUp()
      }
    }
    
    setIsDragging(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX)
    setStartY(e.clientY)
    setCurrentX(e.clientX)
    setCurrentY(e.clientY)
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    setCurrentX(e.clientX)
    setCurrentY(e.clientY)
    
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.1}deg)`
      cardRef.current.style.opacity = String(1 - Math.abs(deltaX) / 300)
    }
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    const deltaX = currentX - startX
    const deltaY = currentY - startY
    
    if (cardRef.current) {
      cardRef.current.style.transform = ''
      cardRef.current.style.opacity = '1'
    }
    
    // 스와이프 방향 감지
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > swipeThreshold && onSwipeRight) {
        onSwipeRight()
      } else if (deltaX < -swipeThreshold && onSwipeLeft) {
        onSwipeLeft()
      }
    } else {
      if (deltaY > swipeThreshold && onSwipeDown) {
        onSwipeDown()
      } else if (deltaY < -swipeThreshold && onSwipeUp) {
        onSwipeUp()
      }
    }
    
    setIsDragging(false)
  }

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (!isDragging) return
      handleMouseMove(e as any)
    }

    const handleMouseUpGlobal = () => {
      if (!isDragging) return
      handleMouseUp()
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal)
      document.addEventListener('mouseup', handleMouseUpGlobal)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal)
      document.removeEventListener('mouseup', handleMouseUpGlobal)
    }
  }, [isDragging, currentX, currentY, startX, startY])

  return (
    <div
      ref={cardRef}
      className={cn(
        'touch-none select-none transition-transform duration-200 ease-out',
        isDragging && 'transition-none',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  )
}