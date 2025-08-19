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
        const { channelId, channelUrl } = await req.json();

        // YouTube API 키 확인
        const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
        if (!youtubeApiKey) {
            throw new Error('YouTube API key is not configured');
        }

        let finalChannelId = channelId;

        // 채널 URL에서 채널 ID 추출
        if (channelUrl && !channelId) {
            const urlParts = channelUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            
            // @handle 형태인 경우 검색으로 찾기
            if (lastPart.startsWith('@')) {
                const searchResponse = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(lastPart)}&key=${youtubeApiKey}`
                );
                
                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    if (searchData.items && searchData.items.length > 0) {
                        finalChannelId = searchData.items[0].snippet.channelId;
                    }
                }
            } else if (lastPart.startsWith('UC')) {
                finalChannelId = lastPart;
            }
        }

        if (!finalChannelId) {
            throw new Error('Channel ID could not be determined');
        }

        // 채널 정보 가져오기
        const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${finalChannelId}&key=${youtubeApiKey}`
        );

        if (!channelResponse.ok) {
            throw new Error('Failed to fetch channel data from YouTube API');
        }

        const channelData = await channelResponse.json();

        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('Channel not found');
        }

        const channel = channelData.items[0];
        const snippet = channel.snippet;
        const statistics = channel.statistics;
        const branding = channel.brandingSettings;

        // 최근 동영상 정보 가져오기 (인게이지먼트 계산용)
        const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${finalChannelId}&type=video&order=date&maxResults=10&key=${youtubeApiKey}`
        );

        let recentVideos = [];
        let avgEngagementRate = 0;

        if (videosResponse.ok) {
            const videosData = await videosResponse.json();
            const videoIds = videosData.items.map(item => item.id.videoId).join(',');

            // 동영상 통계 가져오기
            const videoStatsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${youtubeApiKey}`
            );

            if (videoStatsResponse.ok) {
                const videoStatsData = await videoStatsResponse.json();
                recentVideos = videoStatsData.items;

                // 평균 인게이지먼트율 계산
                if (recentVideos.length > 0) {
                    const totalEngagement = recentVideos.reduce((sum, video) => {
                        const views = parseInt(video.statistics.viewCount || '0');
                        const likes = parseInt(video.statistics.likeCount || '0');
                        const comments = parseInt(video.statistics.commentCount || '0');
                        return sum + ((likes + comments) / Math.max(views, 1));
                    }, 0);
                    avgEngagementRate = (totalEngagement / recentVideos.length) * 100;
                }
            }
        }

        // 카테고리 분석 (키워드 기반)
        const description = snippet.description.toLowerCase();
        const title = snippet.title.toLowerCase();
        const keywords = branding?.channel?.keywords || '';
        const allText = `${description} ${title} ${keywords}`.toLowerCase();

        const categories = [];
        if (allText.includes('게임') || allText.includes('game') || allText.includes('gaming')) categories.push('GAMING');
        if (allText.includes('뷰티') || allText.includes('beauty') || allText.includes('메이크업')) categories.push('BEAUTY');
        if (allText.includes('음식') || allText.includes('요리') || allText.includes('food') || allText.includes('cooking')) categories.push('FOOD');
        if (allText.includes('여행') || allText.includes('travel')) categories.push('TRAVEL');
        if (allText.includes('패션') || allText.includes('fashion') || allText.includes('스타일')) categories.push('FASHION');
        if (allText.includes('기술') || allText.includes('tech') || allText.includes('IT')) categories.push('TECH');
        if (allText.includes('라이프') || allText.includes('life') || allText.includes('일상')) categories.push('LIFESTYLE');
        if (allText.includes('교육') || allText.includes('education') || allText.includes('학습')) categories.push('EDUCATION');
        if (allText.includes('피트니스') || allText.includes('fitness') || allText.includes('운동')) categories.push('FITNESS');
        if (allText.includes('음악') || allText.includes('music')) categories.push('MUSIC');

        if (categories.length === 0) categories.push('GENERAL');

        // 협업 비용 추정 (구독자 수 기반)
        const subscriberCount = parseInt(statistics.subscriberCount || '0');
        let estimatedCost = 0;
        if (subscriberCount < 10000) {
            estimatedCost = Math.max(50000, subscriberCount * 10);
        } else if (subscriberCount < 100000) {
            estimatedCost = subscriberCount * 15;
        } else if (subscriberCount < 1000000) {
            estimatedCost = subscriberCount * 20;
        } else {
            estimatedCost = subscriberCount * 25;
        }

        // 수집된 데이터 정리
        const influencerData = {
            platform: 'YOUTUBE',
            external_id: finalChannelId,
            username: snippet.customUrl || finalChannelId,
            display_name: snippet.title,
            bio: snippet.description.substring(0, 500),
            profile_image: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            follower_count: subscriberCount,
            total_posts: parseInt(statistics.videoCount || '0'),
            avg_engagement_rate: Math.round(avgEngagementRate * 100) / 100,
            categories: categories,
            location: snippet.country || null,
            verified: statistics.hiddenSubscriberCount === false,
            estimated_cost_per_post: estimatedCost,
            last_updated: new Date().toISOString(),
            raw_data: {
                channel_stats: statistics,
                recent_videos: recentVideos.slice(0, 5),
                total_views: parseInt(statistics.viewCount || '0')
            }
        };

        return new Response(JSON.stringify({
            data: influencerData,
            success: true
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('YouTube data collection error:', error);

        const errorResponse = {
            error: {
                code: 'YOUTUBE_DATA_COLLECTION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});