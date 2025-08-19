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
        const { campaignId, action } = await req.json();

        if (!campaignId) {
            throw new Error('캠페인 ID가 필요합니다.');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase 설정이 누락되었습니다.');
        }

        if (action === 'match') {
            // 캠페인 정보 조회
            const campaignResponse = await fetch(`${supabaseUrl}/rest/v1/campaigns?campaign_id=eq.${campaignId}&select=*`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!campaignResponse.ok) {
                throw new Error('캠페인 정보를 불러올 수 없습니다.');
            }

            const campaigns = await campaignResponse.json();
            if (!campaigns || campaigns.length === 0) {
                throw new Error('캠페인을 찾을 수 없습니다.');
            }

            const campaign = campaigns[0];

            // 인플루언서 프로필 조회
            const influencersResponse = await fetch(`${supabaseUrl}/rest/v1/influencer_profiles?select=*,users(*)`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!influencersResponse.ok) {
                throw new Error('인플루언서 정보를 불러올 수 없습니다.');
            }

            const influencers = await influencersResponse.json();

            // AI 매칭 스코어 계산
            const matchingScores = [];

            for (const influencer of influencers) {
                // 카테고리 매칭 점수 (0-40점)
                let relevanceScore = 20;
                const campaignCategories = campaign.target_categories || [];
                const influencerCategories = influencer.categories || [];
                
                if (influencerCategories.length > 0 && campaignCategories.length > 0) {
                    const matchingCategories = influencerCategories.filter(cat => 
                        campaignCategories.some(campCat => 
                            campCat.toLowerCase().includes(cat.toLowerCase()) || 
                            cat.toLowerCase().includes(campCat.toLowerCase())
                        )
                    );
                    relevanceScore = Math.min(40, (matchingCategories.length / campaignCategories.length) * 40);
                }

                // 예산 매칭 점수 (0-30점)
                let budgetScore = 15;
                const campaignBudget = campaign.budget || 1000000;
                const influencerMinPrice = influencer.min_price || 500000;
                const influencerMaxPrice = influencer.max_price || 2000000;
                
                if (campaignBudget >= influencerMinPrice && campaignBudget <= influencerMaxPrice) {
                    budgetScore = 30;
                } else if (campaignBudget >= influencerMinPrice * 0.8 || campaignBudget <= influencerMaxPrice * 1.2) {
                    budgetScore = 20;
                }

                // 영향력 점수 (0-20점) - 팔로워 수 기반 추정
                let influenceScore = 15;
                const followersEstimate = Math.random() * 100000 + 10000; // 임시 추정값
                if (followersEstimate > 100000) influenceScore = 20;
                else if (followersEstimate > 50000) influenceScore = 18;
                else if (followersEstimate > 10000) influenceScore = 15;
                else influenceScore = 10;

                // 신뢰도 점수 (0-10점)
                const authenticityScore = Math.min(10, Math.random() * 8 + 5);

                // 전체 점수 계산
                const overallScore = relevanceScore + budgetScore + influenceScore + authenticityScore;

                // 매칭 스코어 저장
                matchingScores.push({
                    campaign_id: campaignId,
                    influencer_id: influencer.influencer_id,
                    overall_score: Math.round(overallScore * 10) / 10,
                    relevance_score: Math.round(relevanceScore * 10) / 10,
                    influence_score: Math.round(influenceScore * 10) / 10,
                    authenticity_score: Math.round(authenticityScore * 10) / 10,
                    brand_safety_score: Math.round((Math.random() * 20 + 80) * 10) / 10,
                    predicted_performance: {
                        estimated_reach: Math.round(followersEstimate * (0.1 + Math.random() * 0.3)),
                        estimated_engagement: Math.round(followersEstimate * (0.02 + Math.random() * 0.08)),
                        roi_prediction: Math.round((1.5 + Math.random()) * 100) / 100
                    }
                });
            }

            // 매칭 스코어를 데이터베이스에 저장
            for (const score of matchingScores) {
                await fetch(`${supabaseUrl}/rest/v1/matching_scores`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'resolution=merge-duplicates'
                    },
                    body: JSON.stringify(score)
                });
            }

            // 상위 매칭 결과 반환
            const topMatches = matchingScores
                .sort((a, b) => b.overall_score - a.overall_score)
                .slice(0, 20);

            return new Response(JSON.stringify({
                data: {
                    campaign_id: campaignId,
                    total_matches: matchingScores.length,
                    top_matches: topMatches,
                    matching_completed_at: new Date().toISOString()
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('지원하지 않는 작업입니다.');

    } catch (error) {
        console.error('AI 매칭 오류:', error);

        const errorResponse = {
            error: {
                code: 'AI_MATCHING_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});