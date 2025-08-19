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
    const {
      query,
      platforms = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE'],
      categories = [],
      followerRange = null,
      sortBy = 'followers',
      limit = 20,
      language = 'ko',
      country = 'KR',
      searchType = 'keyword'
    } = await req.json();

    console.log('Unified Search called with:', {
      query, platforms, categories, followerRange, sortBy, limit
    });

    // 각 플랫폼별 검색 결과를 저장할 배열
    let allResults = [];
    const platformStats = {};
    const errors = [];

    // Instagram 검색
    if (platforms.includes('INSTAGRAM')) {
      try {
        const instagramResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/instagram-scraper`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              query,
              limit: Math.ceil(limit / platforms.length),
              filter: {
                categories: categories,
                minFollowers: followerRange ? parseInt(followerRange.split('-')[0]) : null,
                maxFollowers: followerRange ? parseInt(followerRange.split('-')[1]) : null
              }
            })
          }
        );

        if (instagramResponse.ok) {
          const instagramData = await instagramResponse.json();
          if (instagramData.success) {
            const formattedResults = instagramData.data.map(item => ({
              ...item,
              platform: 'INSTAGRAM',
              id: `instagram_${item.username}`,
              total_posts: item.posts_count
            }));
            allResults = allResults.concat(formattedResults);
            platformStats['INSTAGRAM'] = instagramData.stats;
          }
        }
      } catch (error) {
        console.error('Instagram search error:', error);
        errors.push({ platform: 'INSTAGRAM', error: error.message });
      }
    }

    // TikTok 검색
    if (platforms.includes('TIKTOK')) {
      try {
        const tiktokResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/tiktok-scraper`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              query,
              limit: Math.ceil(limit / platforms.length),
              filter: {
                categories: categories,
                minFollowers: followerRange ? parseInt(followerRange.split('-')[0]) : null,
                maxFollowers: followerRange ? parseInt(followerRange.split('-')[1]) : null
              }
            })
          }
        );

        if (tiktokResponse.ok) {
          const tiktokData = await tiktokResponse.json();
          if (tiktokData.success) {
            const formattedResults = tiktokData.data.map(item => ({
              ...item,
              platform: 'TIKTOK',
              id: `tiktok_${item.username}`,
              total_posts: item.posts_count
            }));
            allResults = allResults.concat(formattedResults);
            platformStats['TIKTOK'] = tiktokData.stats;
          }
        }
      } catch (error) {
        console.error('TikTok search error:', error);
        errors.push({ platform: 'TIKTOK', error: error.message });
      }
    }

    // YouTube 검색
    if (platforms.includes('YOUTUBE')) {
      try {
        const youtubeResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/youtube-data-collector`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              query: query,
              maxResults: Math.ceil(limit / platforms.length)
            })
          }
        );

        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          if (youtubeData.channels && youtubeData.channels.length > 0) {
            const formattedResults = youtubeData.channels.map(channel => ({
              username: channel.customUrl || channel.id,
              display_name: channel.title,
              profile_image: channel.thumbnails?.default?.url || 'https://via.placeholder.com/150',
              bio: channel.description?.substring(0, 200) + '...' || '',
              follower_count: channel.subscriberCount || 0,
              following_count: 0,
              posts_count: channel.videoCount || 0,
              total_posts: channel.videoCount || 0,
              avg_engagement_rate: (channel.viewCount && channel.videoCount) ? 
                Math.round((channel.viewCount / channel.videoCount / channel.subscriberCount) * 100 * 100) / 100 : 0,
              categories: [channel.topicDetails?.topicCategories?.[0]?.split('/')?.pop() || 'ENTERTAINMENT'],
              location: channel.country || '미공개',
              contact_email: '',
              recent_posts: channel.recentVideos?.map(video => ({
                id: video.id,
                content: video.title,
                likes: video.likeCount || 0,
                comments: video.commentCount || 0,
                shares: 0,
                views: video.viewCount || 0,
                timestamp: video.publishedAt
              })) || [],
              estimated_cost_per_post: channel.estimatedEarnings?.min || 500000,
              verification_status: channel.subscriberCount > 100000,
              platform: 'YOUTUBE',
              id: `youtube_${channel.id}`,
              raw_data: {
                channel_id: channel.id,
                view_count: channel.viewCount,
                video_count: channel.videoCount,
                subscriber_count: channel.subscriberCount
              }
            }));
            
            allResults = allResults.concat(formattedResults);
            platformStats['YOUTUBE'] = {
              total_found: formattedResults.length,
              avg_subscribers: Math.round(
                formattedResults.reduce((sum, ch) => sum + ch.follower_count, 0) / formattedResults.length
              ) || 0
            };
          }
        }
      } catch (error) {
        console.error('YouTube search error:', error);
        errors.push({ platform: 'YOUTUBE', error: error.message });
      }
    }

    // 정렬 적용
    if (sortBy === 'followers') {
      allResults.sort((a, b) => b.follower_count - a.follower_count);
    } else if (sortBy === 'engagement') {
      allResults.sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate);
    } else if (sortBy === 'recent') {
      allResults.sort((a, b) => {
        const aTime = a.recent_posts?.[0]?.timestamp || '2020-01-01';
        const bTime = b.recent_posts?.[0]?.timestamp || '2020-01-01';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    }

    // 최종 결과 제한
    const finalResults = allResults.slice(0, limit);

    // 통합 통계 생성
    const totalStats = {
      total_found: finalResults.length,
      by_platform: platformStats,
      avg_followers: Math.round(
        finalResults.reduce((sum, inf) => sum + inf.follower_count, 0) / finalResults.length
      ) || 0,
      avg_engagement: Math.round(
        (finalResults.reduce((sum, inf) => sum + inf.avg_engagement_rate, 0) / finalResults.length) * 100
      ) / 100 || 0,
      by_category: finalResults.reduce((acc, inf) => {
        inf.categories?.forEach(cat => {
          acc[cat] = (acc[cat] || 0) + 1;
        });
        return acc;
      }, {}),
      search_platforms: platforms
    };

    // 번역 기능 (간단한 키워드 매핑)
    const translatedQuery = translateKeyword(query, language);

    return new Response(JSON.stringify({
      success: true,
      data: finalResults,
      stats: totalStats,
      query: query,
      translated_query: translatedQuery,
      platforms_searched: platforms,
      errors: errors.length > 0 ? errors : null,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unified Search Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'UNIFIED_SEARCH_ERROR',
        message: error.message,
        details: '통합 인플루언서 검색 중 오류가 발생했습니다.'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// 키워드 번역 함수
function translateKeyword(keyword, language) {
  const translations = {
    'beauty': { ko: '뷰티', en: 'beauty', ja: 'ビューティー', zh: '美容' },
    '뷰티': { ko: '뷰티', en: 'beauty', ja: 'ビューティー', zh: '美容' },
    'fashion': { ko: '패션', en: 'fashion', ja: 'ファッション', zh: '时尚' },
    '패션': { ko: '패션', en: 'fashion', ja: 'ファッション', zh: '时尚' },
    'food': { ko: '음식', en: 'food', ja: '食べ物', zh: '食物' },
    '음식': { ko: '음식', en: 'food', ja: '食べ物', zh: '食物' },
    'travel': { ko: '여행', en: 'travel', ja: '旅行', zh: '旅行' },
    '여행': { ko: '여행', en: 'travel', ja: '旅行', zh: '旅行' },
    'fitness': { ko: '피트니스', en: 'fitness', ja: 'フィットネス', zh: '健身' },
    '피트니스': { ko: '피트니스', en: 'fitness', ja: 'フィットネス', zh: '健身' }
  };

  const lowerKeyword = keyword.toLowerCase();
  if (translations[lowerKeyword]) {
    return translations[lowerKeyword][language] || keyword;
  }
  return keyword;
}