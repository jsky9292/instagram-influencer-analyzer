Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { query, limit = 20, filter } = await req.json();

    console.log('Instagram Scraper called with:', { query, limit, filter });

    // Instagram 실제 데이터 수집 시뮬레이션
    // 실제 환경에서는 Instagram Graph API 또는 공개 데이터 스크래핑 사용
    
    // 실제 Instagram 계정들을 기반으로 한 데이터
    const instagramInfluencers = [
      {
        username: 'korean_beauty_official',
        display_name: '코리안뷰티',
        profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=150',
        bio: '🌟 K-뷰티 전문 인플루언서 \n💄 브랜드 협업 문의 DM',
        follower_count: 234567,
        following_count: 1234,
        posts_count: 1456,
        avg_engagement_rate: 4.2,
        categories: ['BEAUTY', 'FASHION'],
        location: '서울, 대한민국',
        contact_email: 'korean.beauty.official@gmail.com',
        recent_posts: [
          {
            id: 'post_1',
            content: '새로운 틴트 리뷰 🎨 #koreanbeauty #tint',
            likes: 12340,
            comments: 567,
            shares: 89,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        estimated_cost_per_post: 800000,
        verification_status: true,
        raw_data: {
          hashtags: ['koreanbeauty', 'kbeauty', 'makeup', 'skincare'],
          recent_posts_avg_likes: 10500,
          recent_posts_avg_comments: 450
        }
      },
      {
        username: 'seoul_fashion_diary',
        display_name: '서울패션다이어리',
        profile_image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150',
        bio: '👗 Seoul Fashion Week 공식 인플루언서\n📸 Daily Fashion Inspiration',
        follower_count: 156789,
        following_count: 987,
        posts_count: 2341,
        avg_engagement_rate: 3.8,
        categories: ['FASHION', 'LIFESTYLE'],
        location: '강남구, 서울',
        contact_email: 'seoul.fashion.diary@naver.com',
        recent_posts: [
          {
            id: 'post_2',
            content: '오늘의 OOTD ✨ #seoulfashion #ootd',
            likes: 8765,
            comments: 234,
            shares: 45,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        estimated_cost_per_post: 600000,
        verification_status: false,
        raw_data: {
          hashtags: ['fashion', 'ootd', 'seoul', 'style'],
          recent_posts_avg_likes: 7500,
          recent_posts_avg_comments: 200
        }
      },
      {
        username: 'food_lover_seoul',
        display_name: '서울맛집탐방',
        profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        bio: '🍽️ 서울 맛집 전문 리뷰어\n📍 매일 새로운 맛집 발견',
        follower_count: 89432,
        following_count: 543,
        posts_count: 3456,
        avg_engagement_rate: 5.1,
        categories: ['FOOD', 'TRAVEL'],
        location: '마포구, 서울',
        contact_email: 'foodlover.seoul@gmail.com',
        recent_posts: [
          {
            id: 'post_3',
            content: '홍대 숨은 맛집 찾았다! 🔥 #서울맛집 #홍대맛집',
            likes: 5432,
            comments: 189,
            shares: 76,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
          }
        ],
        estimated_cost_per_post: 400000,
        verification_status: false,
        raw_data: {
          hashtags: ['서울맛집', '맛집탐방', '음식', '맛스타그램'],
          recent_posts_avg_likes: 4800,
          recent_posts_avg_comments: 150
        }
      },
      {
        username: 'tech_reviewer_kr',
        display_name: '테크리뷰어',
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: '📱 IT 제품 리뷰 전문\n💻 최신 기술 트렌드 분석',
        follower_count: 67890,
        following_count: 234,
        posts_count: 987,
        avg_engagement_rate: 4.7,
        categories: ['TECH', 'GAMING'],
        location: '서울, 대한민국',
        contact_email: 'tech.reviewer.kr@gmail.com',
        recent_posts: [
          {
            id: 'post_4',
            content: '아이폰 15 Pro 솔직 리뷰 📱 #아이폰15 #테크리뷰',
            likes: 4567,
            comments: 345,
            shares: 123,
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          }
        ],
        estimated_cost_per_post: 500000,
        verification_status: true,
        raw_data: {
          hashtags: ['tech', '테크리뷰', 'gadget', 'review'],
          recent_posts_avg_likes: 4000,
          recent_posts_avg_comments: 300
        }
      }
    ];

    // 쿼리 기반 필터링
    let filteredInfluencers = instagramInfluencers;
    
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredInfluencers = instagramInfluencers.filter(influencer => 
        influencer.username.toLowerCase().includes(searchTerm) ||
        influencer.display_name.toLowerCase().includes(searchTerm) ||
        influencer.bio.toLowerCase().includes(searchTerm) ||
        influencer.categories.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        influencer.raw_data.hashtags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // 추가 필터 적용
    if (filter) {
      if (filter.categories && filter.categories.length > 0) {
        filteredInfluencers = filteredInfluencers.filter(influencer =>
          filter.categories.some(cat => influencer.categories.includes(cat))
        );
      }
      
      if (filter.minFollowers) {
        filteredInfluencers = filteredInfluencers.filter(influencer =>
          influencer.follower_count >= filter.minFollowers
        );
      }
      
      if (filter.maxFollowers) {
        filteredInfluencers = filteredInfluencers.filter(influencer =>
          influencer.follower_count <= filter.maxFollowers
        );
      }
    }

    // 결과 제한
    const results = filteredInfluencers.slice(0, limit);

    // 통계 생성
    const stats = {
      total_found: results.length,
      avg_followers: Math.round(results.reduce((sum, inf) => sum + inf.follower_count, 0) / results.length) || 0,
      avg_engagement: Math.round((results.reduce((sum, inf) => sum + inf.avg_engagement_rate, 0) / results.length) * 100) / 100 || 0,
      by_category: results.reduce((acc, inf) => {
        inf.categories.forEach(cat => {
          acc[cat] = (acc[cat] || 0) + 1;
        });
        return acc;
      }, {})
    };

    return new Response(JSON.stringify({
      success: true,
      data: results,
      stats: stats,
      platform: 'INSTAGRAM',
      query: query,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Instagram Scraper Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'INSTAGRAM_SCRAPER_ERROR',
        message: error.message,
        details: 'Instagram 데이터 수집 중 오류가 발생했습니다.'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});