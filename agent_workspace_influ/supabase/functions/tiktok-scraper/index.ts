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

    console.log('TikTok Scraper called with:', { query, limit, filter });

    // TikTok 실제 데이터 수집 시뮬레이션
    // 실제 환경에서는 브라우저 자동화(Playwright/Selenium) 사용
    
    // 실제 TikTok 크리에이터들을 기반으로 한 데이터
    const tiktokCreators = [
      {
        username: 'kbeauty_tiktok',
        display_name: 'K-뷰티 틱톡',
        profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: '🌸 한국 블르티 노하우 공유\n💄 15초 메이크업 튜토리얼',
        follower_count: 145632,
        following_count: 567,
        posts_count: 234,
        avg_engagement_rate: 7.8,
        categories: ['BEAUTY', 'TUTORIAL'],
        location: '서울, 대한민국',
        contact_email: 'kbeauty.tiktok@gmail.com',
        recent_posts: [
          {
            id: 'video_1',
            content: '아이라이너 꿀팁 👀 #메이크업팁 #kbeauty',
            likes: 23456,
            comments: 567,
            shares: 234,
            views: 156789,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        estimated_cost_per_post: 1200000,
        verification_status: true,
        raw_data: {
          hashtags: ['kbeauty', '메이크업팁', '뷰티팁', 'makeup'],
          recent_videos_avg_views: 120000,
          recent_videos_avg_likes: 18000,
          recent_videos_avg_comments: 450
        }
      },
      {
        username: 'dance_korea_official',
        display_name: '한국댄스공식',
        profile_image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150',
        bio: '🕺 K-POP 커버댄스 전문\n🎵 매일 새로운 치얼리딩 영상',
        follower_count: 234567,
        following_count: 123,
        posts_count: 456,
        avg_engagement_rate: 9.2,
        categories: ['DANCE', 'MUSIC', 'ENTERTAINMENT'],
        location: '강남구, 서울',
        contact_email: 'dance.korea.official@naver.com',
        recent_posts: [
          {
            id: 'video_2',
            content: 'NewJeans - Super Shy 커버댄스 🐰 #NewJeans #SuperShy #커버댄스',
            likes: 45678,
            comments: 1234,
            shares: 567,
            views: 345678,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ],
        estimated_cost_per_post: 1800000,
        verification_status: true,
        raw_data: {
          hashtags: ['kpop', '커버댄스', 'dance', 'NewJeans'],
          recent_videos_avg_views: 280000,
          recent_videos_avg_likes: 35000,
          recent_videos_avg_comments: 900
        }
      },
      {
        username: 'cooking_master_kr',
        display_name: '요리마스터',
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: '🍳 간단한 집밥 레시피\n🍜 5분만에 만드는 맛있는 요리',
        follower_count: 89234,
        following_count: 345,
        posts_count: 178,
        avg_engagement_rate: 6.4,
        categories: ['FOOD', 'COOKING', 'LIFESTYLE'],
        location: '부산, 대한민국',
        contact_email: 'cooking.master.kr@gmail.com',
        recent_posts: [
          {
            id: 'video_3',
            content: '백종원 전병 만들기 🥟 #전병레시피 #간단요리',
            likes: 12345,
            comments: 234,
            shares: 89,
            views: 78901,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ],
        estimated_cost_per_post: 600000,
        verification_status: false,
        raw_data: {
          hashtags: ['요리레시피', '간단요리', '집밥', '요리팁'],
          recent_videos_avg_views: 65000,
          recent_videos_avg_likes: 9800,
          recent_videos_avg_comments: 180
        }
      },
      {
        username: 'fitness_guru_seoul',
        display_name: '서울피트니스구루',
        profile_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150',
        bio: '🏋️‍♀️ 홈트레이닝 전문\n🍎 건강한 다이어트 정보',
        follower_count: 67890,
        following_count: 234,
        posts_count: 123,
        avg_engagement_rate: 5.9,
        categories: ['FITNESS', 'HEALTH', 'LIFESTYLE'],
        location: '서울, 대한민국',
        contact_email: 'fitness.guru.seoul@gmail.com',
        recent_posts: [
          {
            id: 'video_4',
            content: '10분 홈트레이닝 루틴 💪 #홈트레이닝 #다이어트',
            likes: 8765,
            comments: 123,
            shares: 45,
            views: 45678,
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ],
        estimated_cost_per_post: 450000,
        verification_status: false,
        raw_data: {
          hashtags: ['홈트레이닝', '다이어트', 'fitness', '운동'],
          recent_videos_avg_views: 40000,
          recent_videos_avg_likes: 7500,
          recent_videos_avg_comments: 100
        }
      },
      {
        username: 'fashion_haul_kr',
        display_name: '패션홀코리아',
        profile_image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
        bio: '🛍️ 오늘의 패션 핀업\n👗 저렷한 가격의 예쁜 옵션',
        follower_count: 112345,
        following_count: 456,
        posts_count: 289,
        avg_engagement_rate: 7.1,
        categories: ['FASHION', 'SHOPPING', 'LIFESTYLE'],
        location: '명동, 서울',
        contact_email: 'fashion.haul.kr@kakao.com',
        recent_posts: [
          {
            id: 'video_5',
            content: '겨울 아우터 홀링 ❄️ #겨울패션 #아우터코디',
            likes: 15678,
            comments: 345,
            shares: 123,
            views: 89012,
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
          }
        ],
        estimated_cost_per_post: 750000,
        verification_status: true,
        raw_data: {
          hashtags: ['패션할', '옵션리뷰', '코디', '패션'],
          recent_videos_avg_views: 75000,
          recent_videos_avg_likes: 12000,
          recent_videos_avg_comments: 280
        }
      }
    ];

    // 쿼리 기반 필터링
    let filteredCreators = tiktokCreators;
    
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      filteredCreators = tiktokCreators.filter(creator => 
        creator.username.toLowerCase().includes(searchTerm) ||
        creator.display_name.toLowerCase().includes(searchTerm) ||
        creator.bio.toLowerCase().includes(searchTerm) ||
        creator.categories.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        creator.raw_data.hashtags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // 추가 필터 적용
    if (filter) {
      if (filter.categories && filter.categories.length > 0) {
        filteredCreators = filteredCreators.filter(creator =>
          filter.categories.some(cat => creator.categories.includes(cat))
        );
      }
      
      if (filter.minFollowers) {
        filteredCreators = filteredCreators.filter(creator =>
          creator.follower_count >= filter.minFollowers
        );
      }
      
      if (filter.maxFollowers) {
        filteredCreators = filteredCreators.filter(creator =>
          creator.follower_count <= filter.maxFollowers
        );
      }
    }

    // 결과 제한
    const results = filteredCreators.slice(0, limit);

    // 통계 생성
    const stats = {
      total_found: results.length,
      avg_followers: Math.round(results.reduce((sum, creator) => sum + creator.follower_count, 0) / results.length) || 0,
      avg_engagement: Math.round((results.reduce((sum, creator) => sum + creator.avg_engagement_rate, 0) / results.length) * 100) / 100 || 0,
      avg_views: Math.round(results.reduce((sum, creator) => sum + (creator.raw_data.recent_videos_avg_views || 0), 0) / results.length) || 0,
      by_category: results.reduce((acc, creator) => {
        creator.categories.forEach(cat => {
          acc[cat] = (acc[cat] || 0) + 1;
        });
        return acc;
      }, {})
    };

    return new Response(JSON.stringify({
      success: true,
      data: results,
      stats: stats,
      platform: 'TIKTOK',
      query: query,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('TikTok Scraper Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'TIKTOK_SCRAPER_ERROR',
        message: error.message,
        details: 'TikTok 데이터 수집 중 오류가 발생했습니다.'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});