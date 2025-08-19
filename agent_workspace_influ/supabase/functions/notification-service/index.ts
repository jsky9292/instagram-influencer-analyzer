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

        if (action === 'create_notification') {
            const { userId, type, title, content, data } = requestData;

            if (!userId || !type || !title) {
                throw new Error('알림 생성에 필수 정보가 누락되었습니다.');
            }

            const notificationData = {
                user_id: userId,
                type: type,
                title: title,
                content: content || '',
                data: data || {},
                is_read: false
            };

            const createResponse = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(notificationData)
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                throw new Error(`알림 생성 실패: ${errorText}`);
            }

            const newNotification = await createResponse.json();

            return new Response(JSON.stringify({
                data: {
                    notification: newNotification[0],
                    message: '알림이 성공적으로 생성되었습니다.'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'mark_as_read') {
            const { notificationId } = requestData;

            if (!notificationId) {
                throw new Error('알림 ID가 누락되었습니다.');
            }

            // 사용자 인증 확인
            const authHeader = req.headers.get('authorization');
            if (!authHeader) {
                throw new Error('인증이 필요합니다.');
            }

            const token = authHeader.replace('Bearer ', '');
            const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': serviceRoleKey
                }
            });

            if (!userResponse.ok) {
                throw new Error('잘못된 인증 토큰입니다.');
            }

            const userData = await userResponse.json();
            const currentUserId = userData.id;

            const updateResponse = await fetch(
                `${supabaseUrl}/rest/v1/notifications?notification_id=eq.${notificationId}&user_id=eq.${currentUserId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ is_read: true })
                }
            );

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`알림 읽음 처리 실패: ${errorText}`);
            }

            return new Response(JSON.stringify({
                data: {
                    message: '알림이 읽음으로 표시되었습니다.'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'send_campaign_notifications') {
            const { campaignId, notificationType } = requestData;

            if (!campaignId || !notificationType) {
                throw new Error('캐페인 알림 전송에 필요한 정보가 누락되었습니다.');
            }

            // 캠페인 정보 조회
            const campaignResponse = await fetch(`${supabaseUrl}/rest/v1/campaigns?campaign_id=eq.${campaignId}&select=*`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            const campaigns = await campaignResponse.json();
            if (!campaigns || campaigns.length === 0) {
                throw new Error('캠페인을 찾을 수 없습니다.');
            }

            const campaign = campaigns[0];
            let notifications = [];

            if (notificationType === 'new_campaign') {
                // 새 캠페인 알림 - 매칭된 인플루언서들에게 전송
                const matchingResponse = await fetch(
                    `${supabaseUrl}/rest/v1/matching_scores?campaign_id=eq.${campaignId}&overall_score=gte.70&order=overall_score.desc&limit=50`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const matchingScores = await matchingResponse.json();
                
                for (const match of matchingScores) {
                    notifications.push({
                        user_id: match.influencer_id,
                        type: 'NEW_CAMPAIGN_MATCH',
                        title: '새로운 캠페인 매칭!',
                        content: `"${campaign.title}" 캠페인이 당신과 매칭되었습니다. (매칭 점수: ${match.overall_score}점)`,
                        data: {
                            campaign_id: campaignId,
                            matching_score: match.overall_score,
                            action_url: `/campaigns/${campaignId}`
                        },
                        is_read: false
                    });
                }
            } else if (notificationType === 'campaign_status_change') {
                // 캠페인 상태 변경 알림
                const applicationsResponse = await fetch(
                    `${supabaseUrl}/rest/v1/campaign_applications?campaign_id=eq.${campaignId}&select=influencer_id`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const applications = await applicationsResponse.json();
                
                for (const application of applications) {
                    notifications.push({
                        user_id: application.influencer_id,
                        type: 'CAMPAIGN_STATUS_CHANGE',
                        title: '캠페인 상태 변경',
                        content: `"${campaign.title}" 캠페인의 상태가 변경되었습니다.`,
                        data: {
                            campaign_id: campaignId,
                            new_status: campaign.status,
                            action_url: `/campaigns/${campaignId}`
                        },
                        is_read: false
                    });
                }
            }

            // 알림 일괄 생성
            if (notifications.length > 0) {
                const createResponse = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(notifications)
                });

                if (!createResponse.ok) {
                    const errorText = await createResponse.text();
                    throw new Error(`알림 생성 실패: ${errorText}`);
                }
            }

            return new Response(JSON.stringify({
                data: {
                    notifications_sent: notifications.length,
                    message: `${notifications.length}개의 알림이 전송되었습니다.`
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('지원하지 않는 작업입니다.');

    } catch (error) {
        console.error('알림 서비스 오류:', error);

        const errorResponse = {
            error: {
                code: 'NOTIFICATION_SERVICE_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});