import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('ko-KR').format(number)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function getStatusColor(status: string): string {
  const statusColors = {
    'ACTIVE': 'text-green-600 bg-green-100',
    'INACTIVE': 'text-gray-600 bg-gray-100',
    'SUSPENDED': 'text-red-600 bg-red-100',
    'DRAFT': 'text-gray-600 bg-gray-100',
    'RECRUITING': 'text-blue-600 bg-blue-100',
    'ONGOING': 'text-yellow-600 bg-yellow-100',
    'COMPLETED': 'text-green-600 bg-green-100',
    'CANCELLED': 'text-red-600 bg-red-100',
    'APPLIED': 'text-blue-600 bg-blue-100',
    'NEGOTIATING': 'text-yellow-600 bg-yellow-100',
    'ACCEPTED': 'text-green-600 bg-green-100',
    'REJECTED': 'text-red-600 bg-red-100',
    'CONTRACTED': 'text-purple-600 bg-purple-100'
  }
  
  return statusColors[status as keyof typeof statusColors] || 'text-gray-600 bg-gray-100'
}

export function getStatusText(status: string): string {
  const statusTexts = {
    'ACTIVE': '활성',
    'INACTIVE': '비활성',
    'SUSPENDED': '정지',
    'DRAFT': '임시저장',
    'RECRUITING': '모집중',
    'ONGOING': '진행중',
    'COMPLETED': '완료',
    'CANCELLED': '취소',
    'APPLIED': '지원',
    'NEGOTIATING': '협상중',
    'ACCEPTED': '수락',
    'REJECTED': '거절',
    'CONTRACTED': '계약완료'
  }
  
  return statusTexts[status as keyof typeof statusTexts] || status
}