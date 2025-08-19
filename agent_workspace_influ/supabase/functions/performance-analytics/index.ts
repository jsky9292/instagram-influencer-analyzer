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
        const requestData = await req.json();
        const { action } = requestData;

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase 설정이 누락되었습니다.');
        }

        if (action === 'track_performance') {
            const { applicationId, postUrl, metrics } = requestData;

            if (!applicationId) {
                throw new Error('지원 ID가 필요합니다.');
            }

            // 지원 정보 조회
            const applicationResponse = await fetch(
                `${supabaseUrl}/rest/v1/campaign_applications?application_id=eq.${applicationId}&select=*,campaigns(*)`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const applications = await applicationResponse.json();
            if (!applications || applications.length === 0) {
                throw new Error('지원 정보를 찾을 수 없습니다.');
            }

            const application = applications[0];
            const campaign = application.campaigns;

            // 성과 데이터 생성 (실제로는 SNS API에서 가져와야 함)
            const performanceData = {
                application_id: applicationId,
                campaign_id: application.campaign_id,
                influencer_id: application.influencer_id,
                post_url: postUrl || '',
                metrics: metrics || {
                    reach: Math.floor(Math.random() * 50000) + 10000,
                    impressions: Math.floor(Math.random() * 100000) + 20000,
                    likes: Math.floor(Math.random() * 5000) + 500,
                    comments: Math.floor(Math.random() * 500) + 50,
                    shares: Math.floor(Math.random() * 200) + 20,
                    saves: Math.floor(Math.random() * 1000) + 100,
                    story_views: Math.floor(Math.random() * 20000) + 5000,
                    profile_visits: Math.floor(Math.random() * 1000) + 100,
                    website_clicks: Math.floor(Math.random() * 500) + 50
                },
                performance_score: 0,
                roi_calculation: {},
                analyzed_at: new Date().toISOString()
            };

            // 성과 점수 계산
            const metrics_data = performanceData.metrics;
            const engagementRate = ((metrics_data.likes + metrics_data.comments + metrics_data.shares) / metrics_data.reach) * 100;
            const reachRate = (metrics_data.reach / metrics_data.impressions) * 100;
            const conversionRate = (metrics_data.website_clicks / metrics_data.reach) * 100;
            
            performanceData.performance_score = Math.min(100, 
                (engagementRate * 0.4) + (reachRate * 0.3) + (conversionRate * 0.3)
            );

            // ROI 계산
            const campaignBudget = campaign.budget || 1000000;
            const estimatedRevenue = metrics_data.website_clicks * 50000; // 클릭당 예상 매출
            const roi = ((estimatedRevenue - campaignBudget) / campaignBudget) * 100;
            
            performanceData.roi_calculation = {
                campaign_budget: campaignBudget,
                estimated_revenue: estimatedRevenue,
                roi_percentage: Math.round(roi * 100) / 100,
                cost_per_click: campaignBudget / metrics_data.website_clicks,
                cost_per_engagement: campaignBudget / (metrics_data.likes + metrics_data.comments + metrics_data.shares)
            };

            // 성과 데이터 저장
            const createResponse = await fetch(`${supabaseUrl}/rest/v1/campaign_performance`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(performanceData)
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                throw new Error(`성과 데이터 저장 실패: ${errorText}`);
            }

            const newPerformance = await createResponse.json();

            return new Response(JSON.stringify({
                data: {
                    performance: newPerformance[0],
                    message: '성과 데이터가 성공적으로 기록되었습니다.'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'generate_report') {
            const { campaignId, influencerId, dateRange } = requestData;

            if (!campaignId && !influencerId) {
                throw new Error('캠페인 ID 또는 인플루언서 ID가 필요합니다.');
            }

            let query = `${supabaseUrl}/rest/v1/campaign_performance?select=*,campaigns(*),campaign_applications(*)`;
            
            if (campaignId) {
                query += `&campaign_id=eq.${campaignId}`;
            }
            if (influencerId) {
                query += `&influencer_id=eq.${influencerId}`;
            }
            if (dateRange) {
                query += `&analyzed_at=gte.${dateRange.start}&analyzed_at=lte.${dateRange.end}`;
            }

            const performanceResponse = await fetch(query, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!performanceResponse.ok) {
                throw new Error('성과 데이터를 불러올 수 없습니다.');
            }

            const performances = await performanceResponse.json();

            // 리포트 데이터 집계
            const report = {
                total_campaigns: new Set(performances.map(p => p.campaign_id)).size,
                total_posts: performances.length,
                total_reach: performances.reduce((sum, p) => sum + (p.metrics?.reach || 0), 0),
                total_impressions: performances.reduce((sum, p) => sum + (p.metrics?.impressions || 0), 0),
                total_engagement: performances.reduce((sum, p) => {
                    const metrics = p.metrics || {};
                    return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
                }, 0),
                average_performance_score: performances.length > 0 
                    ? performances.reduce((sum, p) => sum + (p.performance_score || 0), 0) / performances.length
                    : 0,
                total_budget: performances.reduce((sum, p) => sum + (p.roi_calculation?.campaign_budget || 0), 0),
                total_estimated_revenue: performances.reduce((sum, p) => sum + (p.roi_calculation?.estimated_revenue || 0), 0),
                average_roi: performances.length > 0
                    ? performances.reduce((sum, p) => sum + (p.roi_calculation?.roi_percentage || 0), 0) / performances.length
                    : 0,
                top_performing_posts: performances
                    .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
                    .slice(0, 5),
                engagement_by_platform: {},
                performance_trends: [],
                recommendations: []
            };

            // 추천 사항 생성
            if (report.average_performance_score < 30) {
                report.recommendations.push('성과가 저조합니다. 콘텐츠 품질과 타겟팅을 개선해 보세요.');
            } else if (report.average_performance_score > 70) {
                report.recommendations.push('우수한 성과를 보이고 있습니다. 이 전략을 다른 캠페인에도 적용해 보세요.');
            }

            if (report.average_roi < 50) {
                report.recommendations.push('투자 수익률이 낮습니다. 더 효과적인 인플루언서를 선택하거나 가격을 조정해 보세요.');
            }

            return new Response(JSON.stringify({
                data: {
                    report: report,
                    generated_at: new Date().toISOString(),
                    data_points: performances.length
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('지원하지 않는 작업입니다.');

    } catch (error) {
        console.error('성과 분석 오류:', error);

        const errorResponse = {
            error: {
                code: 'PERFORMANCE_ANALYTICS_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});