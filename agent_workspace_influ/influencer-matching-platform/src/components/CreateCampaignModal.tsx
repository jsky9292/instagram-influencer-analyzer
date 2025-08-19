import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { X, Calendar, DollarSign, Users, Tag } from 'lucide-react'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget_min: '',
    budget_max: '',
    start_date: '',
    end_date: '',
    target_audience: '',
    content_type: '',
    hashtags: '',
    platforms: [] as string[]
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePlatformChange = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userProfile?.user_id) {
      toast.error('사용자 정보를 찾을 수 없습니다.')
      return
    }

    try {
      setLoading(true)
      
      console.log('캠페인 생성 시작')
      console.log('사용자 프로필:', userProfile)
      console.log('폼 데이터:', formData)
      
      const campaignData = {
        brand_id: userProfile.user_id,
        title: formData.title,
        description: formData.description,
        budget: parseInt(formData.budget_max) || parseInt(formData.budget_min) || 1000000,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        status: 'ACTIVE',
        campaign_type: formData.content_type || 'GENERAL',
        requirements: {
          details: formData.requirements || '',
          target_audience: formData.target_audience || '',
          hashtags: formData.hashtags ? formData.hashtags.split(',').map(tag => tag.trim()) : [],
          platforms: formData.platforms || ['INSTAGRAM'],
          budget_range: {
            min: parseInt(formData.budget_min) || 500000,
            max: parseInt(formData.budget_max) || 1000000
          }
        },
        target_categories: formData.platforms.length > 0 
          ? formData.platforms.map(platform => ({ platform, active: true }))
          : [{ platform: 'INSTAGRAM', active: true }]
      }
      
      console.log('전송할 캠페인 데이터:', campaignData)
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select()

      console.log('Supabase 응답:', { data, error })

      if (error) {
        console.error('Supabase 에러 상세:', error)
        throw error
      }

      toast.success('캠페인이 성공적으로 생성되었습니다!')
      onSuccess?.();
      onClose()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: '',
        budget_min: '',
        budget_max: '',
        start_date: '',
        end_date: '',
        target_audience: '',
        content_type: '',
        hashtags: '',
        platforms: []
      })
    } catch (error: any) {
      console.error('Campaign creation error:', error)
      console.error('Error details:', error.details, error.hint, error.message)
      toast.error(`캠페인 생성에 실패했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">새 캠페인 만들기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              캠페인 제목 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="캠페인 제목을 입력해주세요"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              캠페인 설명 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="캠페인에 대한 상세한 설명을 입력해주세요"
              required
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              요구사항
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="인플루언서에게 요구하는 조건을 입력해주세요"
            />
          </div>

          {/* Budget Range */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                총 캠페인 예산 *
              </label>
              <select
                name="budget_max"
                value={formData.budget_max}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">예산 범위를 선택해주세요</option>
                <option value="500000">50만원 이하 (마이크로 인플루언서)</option>
                <option value="1000000">50만원 - 100만원 (중소 인플루언서)</option>
                <option value="3000000">100만원 - 300만원 (중견 인플루언서)</option>
                <option value="5000000">300만원 - 500만원 (인기 인플루언서)</option>
                <option value="10000000">500만원 - 1,000만원 (메가 인플루언서)</option>
                <option value="20000000">1,000만원 이상 (톱티어 인플루언서)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 예산 (원)
                </label>
                <input
                  type="number"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예: 500000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 예산 (원)
                </label>
                <input
                  type="number"
                  name="budget_max"
                  value={formData.budget_max}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예: 1000000"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                시작일 *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                종료일 *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              타겟 오디언스
            </label>
            <input
              type="text"
              name="target_audience"
              value={formData.target_audience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="예: 20-30대 여성, 패션에 관심 있는 사람들"
            />
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              콘텐츠 유형
            </label>
            <select
              name="content_type"
              value={formData.content_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">선택해주세요</option>
              <option value="POST">일반 포스트</option>
              <option value="STORY">스토리</option>
              <option value="REEL">릴스</option>
              <option value="VIDEO">동영상</option>
              <option value="LIVE">라이브</option>
            </select>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              타겟 플랫폼 * (중복 선택 가능)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'INSTAGRAM', name: '인스타그램', icon: '📸', color: 'border-pink-300 bg-pink-50' },
                { id: 'TIKTOK', name: '틱톡', icon: '🎵', color: 'border-black bg-gray-50' },
                { id: 'YOUTUBE', name: '유튜브', icon: '📺', color: 'border-red-300 bg-red-50' },
                { id: 'TWITTER', name: '트위터/X', icon: '🐦', color: 'border-blue-300 bg-blue-50' }
              ].map((platform) => (
                <label 
                  key={platform.id} 
                  className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.platforms.includes(platform.id) 
                      ? `${platform.color} border-opacity-100` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes(platform.id)}
                    onChange={() => handlePlatformChange(platform.id)}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{platform.icon}</span>
                  <span className="text-sm font-medium text-center">{platform.name}</span>
                </label>
              ))}
            </div>
            {formData.platforms.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">최소 하나의 플랫폼을 선택해주세요.</p>
            )}
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              해시태그 및 키워드
            </label>
            <input
              type="text"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="쉼표로 구분하여 입력 (예: 패션, 뷰티, 데일리룩, K뷰티)"
            />
            <p className="text-xs text-gray-500 mt-1">
              인플루언서 검색 시 사용될 키워드들을 입력해주세요 (# 없이 입력)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? '생성 중...' : '캠페인 생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}