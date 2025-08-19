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
        const { payment_id, application_id, bank_info } = await req.json();

        console.log('Payout request received:', { payment_id, application_id });

        if (!payment_id && !application_id) {
            throw new Error('결제 ID 또는 지원 ID가 필요합니다.');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

        if (!serviceRoleKey || !supabaseUrl || !stripeSecretKey) {
            throw new Error('환경 변수 설정이 누락되었습니다.');
        }

        // Get user from auth header
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
            throw new Error('사용자 인증에 실패했습니다.');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Get payment information
        let whereClause = '';
        if (payment_id) {
            whereClause = `payment_id=eq.${payment_id}`;
        } else {
            whereClause = `application_id=eq.${application_id}`;
        }

        const paymentResponse = await fetch(`${supabaseUrl}/rest/v1/payments?${whereClause}&escrow_status=eq.holding`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!paymentResponse.ok) {
            throw new Error('결제 정보를 찾을 수 없습니다.');
        }

        const payments = await paymentResponse.json();
        if (payments.length === 0) {
            throw new Error('에스크로 상태의 결제를 찾을 수 없습니다.');
        }

        const payment = payments[0];

        // Verify user has permission (admin or application owner)
        const userProfileResponse = await fetch(`${supabaseUrl}/rest/v1/users?user_id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!userProfileResponse.ok) {
            throw new Error('사용자 정보를 찾을 수 없습니다.');
        }

        const userProfiles = await userProfileResponse.json();
        if (userProfiles.length === 0) {
            throw new Error('사용자 프로필을 찾을 수 없습니다.');
        }

        const userProfile = userProfiles[0];
        const isAdmin = userProfile.user_type === 'ADMIN';

        // If not admin, verify user is the influencer for this application
        if (!isAdmin && payment.application_id) {
            const applicationResponse = await fetch(`${supabaseUrl}/rest/v1/campaign_applications?application_id=eq.${payment.application_id}&influencer_id=eq.${userId}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!applicationResponse.ok) {
                throw new Error('지원 정보를 확인할 수 없습니다.');
            }

            const applications = await applicationResponse.json();
            if (applications.length === 0) {
                throw new Error('해당 지원에 대한 권한이 없습니다.');
            }
        }

        // Get influencer ID for payout
        let influencerId = userId;
        if (payment.application_id && isAdmin) {
            const applicationResponse = await fetch(`${supabaseUrl}/rest/v1/campaign_applications?application_id=eq.${payment.application_id}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (applicationResponse.ok) {
                const applications = await applicationResponse.json();
                if (applications.length > 0) {
                    influencerId = applications[0].influencer_id;
                }
            }
        }

        // Create payout record
        const payoutData = {
            influencer_id: influencerId,
            application_id: payment.application_id,
            amount: payment.influencer_amount,
            platform_fee: payment.platform_fee_amount,
            net_amount: payment.influencer_amount,
            status: 'processing',
            bank_info: bank_info || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const payoutResponse = await fetch(`${supabaseUrl}/rest/v1/payouts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(payoutData)
        });

        if (!payoutResponse.ok) {
            const errorText = await payoutResponse.text();
            throw new Error('정산 기록 생성에 실패했습니다: ' + errorText);
        }

        const payout = await payoutResponse.json();
        console.log('Payout record created:', payout[0].payout_id);

        // Update escrow status to released
        const escrowUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/payments?payment_id=eq.${payment.payment_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                escrow_status: 'released',
                escrow_release_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        if (!escrowUpdateResponse.ok) {
            console.error('Failed to update escrow status');
        }

        // In a real implementation, here you would:
        // 1. Create Stripe transfer to influencer's connected account
        // 2. Or initiate bank transfer using banking API
        // For demo, we'll just mark as completed after a delay
        
        setTimeout(async () => {
            try {
                await fetch(`${supabaseUrl}/rest/v1/payouts?payout_id=eq.${payout[0].payout_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'completed',
                        processed_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                });
                console.log('Payout marked as completed:', payout[0].payout_id);
            } catch (error) {
                console.error('Failed to update payout status:', error);
            }
        }, 5000); // 5초 후 완료 처리

        return new Response(JSON.stringify({
            data: {
                payoutId: payout[0].payout_id,
                amount: payment.influencer_amount,
                platformFee: payment.platform_fee_amount,
                netAmount: payment.influencer_amount,
                status: 'processing',
                estimatedCompletionTime: '2-3 business days'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Payout processing error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'PAYOUT_PROCESSING_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});