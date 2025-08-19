// API URL 설정
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// API 엔드포인트
export const API_ENDPOINTS = {
  crawl: `${API_URL}/crawl`,
  analyzeUser: `${API_URL}/analyze/user`,
  analyzeViral: `${API_URL}/analyze/viral-content`,
  authSignup: `${API_URL}/auth/signup`,
  authLogin: `${API_URL}/auth/login`,
  authMe: `${API_URL}/auth/me`,
  exportCsv: `${API_URL}/export/csv`,
  health: `${API_URL}/health`
}