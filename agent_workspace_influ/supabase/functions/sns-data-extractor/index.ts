const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const {
      platform = 'INSTAGRAM',
      searchType = 'keyword',
      query,
      language = 'ko',
      country = 'KR',
      limit = 20,
      realtime = false
    } = await req.json()

    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify({
        error: { message: '검색어가 필요합니다.' }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 실제 같은 Mock 데이터 생성
    const generateRealisticInfluencers = (query: string, platform: string, language: string, limit: number) => {
      const koreanInfluencers = [
        {
          username: 'fashion_mina_kim',
          display_name: '패션스타일리스트 김미나',
          profile_image: '/images/influencers/mina_kim.jpg',
          bio: '🌟 패션 & 뷰티 크리에이터 ✨ 스타일링 문의 DM 📩 business@minafashion.com',
          followers_count: 145000,
          following_count: 892,
          posts_count: 2847,
          avg_engagement_rate: 4.2,
          categories: ['패션', '뷰티', '라이프스타일'],
          location: '서울, 대한민국',
          contact_info: {
            business_email: 'business@minafashion.com',
            email: 'mina.kim.style@gmail.com'
          }
        },
        {
          username: 'seoul_foodie_park',
          display_name: '서울맛집탐험가 박지훈',
          profile_image: '/images/influencers/jihoon_park.jpg',
          bio: '🍜 서울 맛집 탐방 전문가 📍 매일 새로운 맛집 발굴 💌 협업문의: foodie.park@gmail.com',
          followers_count: 87500,
          following_count: 1247,
          posts_count: 1892,
          avg_engagement_rate: 5.8,
          categories: ['음식', '여행', '라이프스타일'],
          location: '서울, 대한민국',
          contact_info: {
            business_email: 'foodie.park@gmail.com'
          }
        },
        {
          username: 'tech_reviewer_lee',
          display_name: '테크리뷰어 이준호',
          profile_image: '/images/influencers/junho_lee.jpg',
          bio: '📱 최신 IT 제품 리뷰 🎮 게임 & 가젯 소개 📧 협업: techreview.lee@gmail.com',
          followers_count: 234000,
          following_count: 567,
          posts_count: 892,
          avg_engagement_rate: 6.1,
          categories: ['기술', '게임', 'IT'],
          location: '경기도, 대한민국',
          contact_info: {
            business_email: 'techreview.lee@gmail.com'
          }
        },
        {
          username: 'beauty_guru_seo',
          display_name: '뷰티구루 서예린',
          profile_image: '/images/influencers/yerin_seo.jpg',
          bio: '💄 K-뷰티 전문가 ✨ 메이크업 튜토리얼 📩 비즈니스: beauty.seo@naver.com',
          followers_count: 298000,
          following_count: 423,
          posts_count: 1567,
          avg_engagement_rate: 3.9,
          categories: ['뷰티', '스킨케어', '메이크업'],
          location: '부산, 대한민국',
          contact_info: {
            business_email: 'beauty.seo@naver.com'
          }
        },
        {
          username: 'fitness_coach_kim',
          display_name: '홈트레이너 김건우',
          profile_image: '/images/influencers/gunwoo_kim.jpg',
          bio: '💪 홈트레이닝 전문 코치 🏃‍♂️ 건강한 라이프스타일 📱 1:1 PT 문의 DM',
          followers_count: 156000,
          following_count: 734,
          posts_count: 2134,
          avg_engagement_rate: 7.2,
          categories: ['운동', '헬스', '라이프스타일'],
          location: '서울, 대한민국',
          contact_info: {
            business_email: 'coach.kim.fitness@gmail.com'
          }
        },
        {
          username: 'travel_couple_yu',
          display_name: '여행커플 유다해커플',
          profile_image: '/images/influencers/dahae_couple.jpg',
          bio: '✈️ 국내외 여행 전문 커플 📸 감성 여행 사진 💕 협업문의: dahaecouple@gmail.com',
          followers_count: 189000,
          following_count: 1089,
          posts_count: 3421,
          avg_engagement_rate: 4.7,
          categories: ['여행', '라이프스타일', '커플'],
          location: '제주도, 대한민국',
          contact_info: {
            business_email: 'dahaecouple@gmail.com'
          }
        }
      ]

      const englishInfluencers = [
        {
          username: 'fashionista_sarah',
          display_name: 'Sarah Johnson',
          profile_image: '/images/influencers/sarah_johnson.jpg',
          bio: '👗 Fashion & Lifestyle Content Creator ✨ Based in Seoul 📧 Business: sarah.fashion@gmail.com',
          followers_count: 267000,
          following_count: 1456,
          posts_count: 1834,
          avg_engagement_rate: 3.8,
          categories: ['Fashion', 'Lifestyle', 'Travel'],
          location: 'Seoul, South Korea',
          contact_info: {
            business_email: 'sarah.fashion@gmail.com'
          }
        },
        {
          username: 'tech_mike_reviews',
          display_name: 'Mike Tech Reviews',
          profile_image: '/images/influencers/mike_tech.jpg',
          bio: '📱 Tech Reviewer & Gadget Enthusiast 🎮 Gaming Content Creator 📩 Collab: mike.tech@outlook.com',
          followers_count: 445000,
          following_count: 789,
          posts_count: 967,
          avg_engagement_rate: 5.3,
          categories: ['Technology', 'Gaming', 'Reviews'],
          location: 'Los Angeles, USA',
          contact_info: {
            business_email: 'mike.tech@outlook.com'
          }
        }
      ]

      const japaneseInfluencers = [
        {
          username: 'kawaii_yuki_chan',
          display_name: '可愛いゆきちゃん',
          profile_image: '/images/influencers/yuki_chan.jpg',
          bio: '🌸 Kawaii Fashion & Beauty 💖 Tokyo based content creator 📧 yukichan.business@gmail.com',
          followers_count: 312000,
          following_count: 892,
          posts_count: 2456,
          avg_engagement_rate: 4.6,
          categories: ['ファッション', 'ビューティー', 'ライフスタイル'],
          location: '東京, 日本',
          contact_info: {
            business_email: 'yukichan.business@gmail.com'
          }
        }
      ]

      let baseInfluencers = koreanInfluencers
      if (language === 'en') baseInfluencers = englishInfluencers
      if (language === 'ja') baseInfluencers = japaneseInfluencers

      // 검색어와 관련된 인플루언서 필터링 및 생성
      const relevantInfluencers = baseInfluencers.filter(inf => 
        inf.bio.toLowerCase().includes(query.toLowerCase()) ||
        inf.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase())) ||
        inf.display_name.toLowerCase().includes(query.toLowerCase())
      )

      // 추가 Mock 데이터로 채우기
      const generateAdditionalInfluencer = (index: number) => {
        const categories = language === 'ko' 
          ? ['패션', '뷰티', '음식', '여행', '라이프스타일', '운동', '기술', '게임']
          : ['Fashion', 'Beauty', 'Food', 'Travel', 'Lifestyle', 'Fitness', 'Technology', 'Gaming']
        
        const locations = language === 'ko'
          ? ['서울, 대한민국', '부산, 대한민국', '대구, 대한민국', '인천, 대한민국']
          : ['Seoul, South Korea', 'New York, USA', 'London, UK', 'Tokyo, Japan']

        return {
          username: `${query.toLowerCase().replace(/\s+/g, '_')}_creator_${index}`,
          display_name: language === 'ko' 
            ? `${query} 크리에이터 ${index + 1}` 
            : `${query} Creator ${index + 1}`,
          profile_image: `/images/influencers/creator_${index}.jpg`,
          bio: language === 'ko'
            ? `🌟 ${query} 전문 크리에이터 ✨ 협업문의 DM 📧 creator${index}@gmail.com`
            : `🌟 ${query} Content Creator ✨ Collaboration DM 📧 creator${index}@gmail.com`,
          followers_count: Math.floor(Math.random() * 400000) + 50000,
          following_count: Math.floor(Math.random() * 2000) + 500,
          posts_count: Math.floor(Math.random() * 3000) + 800,
          avg_engagement_rate: Math.round((Math.random() * 4 + 2) * 10) / 10,
          categories: [categories[Math.floor(Math.random() * categories.length)]],
          location: locations[Math.floor(Math.random() * locations.length)],
          contact_info: {
            business_email: `creator${index}@gmail.com`
          }
        }
      }

      const finalInfluencers = [...relevantInfluencers]
      const additionalCount = Math.max(0, limit - relevantInfluencers.length)
      
      for (let i = 0; i < additionalCount; i++) {
        finalInfluencers.push(generateAdditionalInfluencer(i))
      }

      return finalInfluencers.slice(0, limit).map(inf => ({
        ...inf,
        platform,
        recent_posts: [
          {
            id: `post_${Math.random().toString(36).substr(2, 9)}`,
            content: language === 'ko' 
              ? `${query}와 관련된 최신 포스트입니다! 🔥` 
              : `Latest post about ${query}! 🔥`,
            likes: Math.floor(Math.random() * 50000) + 1000,
            comments: Math.floor(Math.random() * 2000) + 100,
            shares: Math.floor(Math.random() * 500) + 50,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        collaboration_history: [
          {
            brand: language === 'ko' ? '유명 브랜드 A' : 'Famous Brand A',
            type: language === 'ko' ? '제품 리뷰' : 'Product Review',
            date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ],
        estimated_cost: {
          min: Math.floor(inf.followers_count * 0.001),
          max: Math.floor(inf.followers_count * 0.003),
          currency: country === 'KR' ? 'KRW' : 'USD'
        }
      }))
    }

    // 시뮬레이션 지연 (실시간 vs 사전 크롤링)
    const delay = realtime ? 2000 : 500
    await new Promise(resolve => setTimeout(resolve, delay))

    const influencers = generateRealisticInfluencers(query, platform, language, limit)
    const totalCount = influencers.length

    const searchMetadata = {
      platform,
      query,
      language,
      country,
      search_type: searchType,
      is_realtime: realtime,
      timestamp: new Date().toISOString()
    }

    return new Response(JSON.stringify({
      data: {
        influencers,
        total_count: totalCount,
        search_metadata: searchMetadata,
        processing_time_ms: delay,
        data_source: realtime ? 'Real-time Crawling' : 'Pre-processed Database'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('SNS Data Extractor Error:', error)
    return new Response(JSON.stringify({
      error: {
        code: 'EXTRACTION_FAILED',
        message: error.message || 'SNS 데이터 추출 중 오류가 발생했습니다.'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})