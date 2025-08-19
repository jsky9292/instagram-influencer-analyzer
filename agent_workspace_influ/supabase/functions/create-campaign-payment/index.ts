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
        const { campaign_id, application_id, amount, currency = 'krw' } = await req.json();

        console.log('Campaign payment request received:', { campaign_id, application_id, amount });

        // Validate required parameters
        if (!campaign_id || !amount || amount <= 0) {
            throw new Error('캠페인 ID와 유효한 금액이 필요합니다.');
        }

        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey) {
            throw new Error('Stripe 설정이 누락되었습니다.');
        }

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase 설정이 누락되었습니다.');
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

        // Verify user is brand owner of the campaign
        const campaignResponse = await fetch(`${supabaseUrl}/rest/v1/campaigns?campaign_id=eq.${campaign_id}&brand_id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!campaignResponse.ok) {
            throw new Error('캠페인 정보를 확인할 수 없습니다.');
        }

        const campaigns = await campaignResponse.json();
        if (campaigns.length === 0) {
            throw new Error('해당 캠페인에 대한 권한이 없습니다.');
        }

        const campaign = campaigns[0];

        // Calculate platform fee (10%)
        const platformFeeRate = 0.10;
        const platformFeeAmount = Math.round(amount * platformFeeRate);
        const influencerAmount = amount - platformFeeAmount;

        // Create Stripe Payment Intent
        const stripeParams = new URLSearchParams();
        stripeParams.append('amount', Math.round(amount).toString()); // KRW는 cents 단위 없음
        stripeParams.append('currency', currency);
        stripeParams.append('payment_method_types[]', 'card');
        stripeParams.append('metadata[campaign_id]', campaign_id);
        stripeParams.append('metadata[application_id]', application_id || '');
        stripeParams.append('metadata[brand_id]', userId);
        stripeParams.append('metadata[platform_fee]', platformFeeAmount.toString());
        stripeParams.append('metadata[influencer_amount]', influencerAmount.toString());

        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.text();
            console.error('Stripe API error:', errorData);
            throw new Error('결제 처리 중 오류가 발생했습니다.');
        }

        const paymentIntent = await stripeResponse.json();
        console.log('Payment intent created:', paymentIntent.id);

        // Create payment record in database
        const paymentData = {
            brand_id: userId,
            campaign_id: campaign_id,
            application_id: application_id,
            amount: amount,
            method: 'stripe',
            status: 'pending',
            stripe_payment_intent_id: paymentIntent.id,
            escrow_status: 'pending',
            platform_fee_amount: platformFeeAmount,
            influencer_amount: influencerAmount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const paymentResponse = await fetch(`${supabaseUrl}/rest/v1/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(paymentData)
        });

        if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            console.error('Failed to create payment record:', errorText);
            
            // Cancel payment intent if database insert fails
            try {
                await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntent.id}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${stripeSecretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            } catch (cancelError) {
                console.error('Failed to cancel payment intent:', cancelError);
            }
            
            throw new Error('결제 기록 생성에 실패했습니다.');
        }

        const payment = await paymentResponse.json();
        console.log('Payment record created:', payment[0].payment_id);

        return new Response(JSON.stringify({
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                paymentId: payment[0].payment_id,
                amount: amount,
                currency: currency,
                platformFee: platformFeeAmount,
                influencerAmount: influencerAmount,
                status: 'pending'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Campaign payment creation error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'PAYMENT_CREATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});