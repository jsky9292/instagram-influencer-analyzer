Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');
        
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!webhookSecret || !serviceRoleKey || !supabaseUrl) {
            throw new Error('환경 변수 설정이 누락되었습니다.');
        }

        // 실제 운영에서는 Stripe signature 검증 필요
        // 여기서는 데모를 위해 생략
        
        const event = JSON.parse(body);
        console.log('Webhook event received:', event.type, event.id);

        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object, serviceRoleKey, supabaseUrl);
                break;
                
            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object, serviceRoleKey, supabaseUrl);
                break;
                
            case 'payment_intent.canceled':
                await handlePaymentCanceled(event.data.object, serviceRoleKey, supabaseUrl);
                break;
                
            default:
                console.log('Unhandled event type:', event.type);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Webhook processing error:', error);
        
        return new Response(JSON.stringify({
            error: {
                code: 'WEBHOOK_PROCESSING_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function handlePaymentSuccess(paymentIntent, serviceRoleKey, supabaseUrl) {
    console.log('Processing payment success:', paymentIntent.id);
    
    try {
        // Update payment status to completed and set escrow to holding
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                status: 'completed',
                escrow_status: 'holding',
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            throw new Error('결제 상태 업데이트에 실패했습니다.');
        }

        const updatedPayments = await updateResponse.json();
        if (updatedPayments.length > 0) {
            const payment = updatedPayments[0];
            
            // If there's an application_id, update the campaign application status
            if (payment.application_id) {
                await fetch(`${supabaseUrl}/rest/v1/campaign_applications?application_id=eq.${payment.application_id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'paid',
                        updated_at: new Date().toISOString()
                    })
                });
            }
            
            console.log('결제 완료 및 에스크로 보관 처리 완료:', payment.payment_id);
        }
        
    } catch (error) {
        console.error('Payment success handling error:', error);
        throw error;
    }
}

async function handlePaymentFailure(paymentIntent, serviceRoleKey, supabaseUrl) {
    console.log('Processing payment failure:', paymentIntent.id);
    
    try {
        // Update payment status to failed
        await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'failed',
                escrow_status: 'failed',
                updated_at: new Date().toISOString()
            })
        });
        
        console.log('결제 실패 처리 완료:', paymentIntent.id);
        
    } catch (error) {
        console.error('Payment failure handling error:', error);
        throw error;
    }
}

async function handlePaymentCanceled(paymentIntent, serviceRoleKey, supabaseUrl) {
    console.log('Processing payment cancellation:', paymentIntent.id);
    
    try {
        // Update payment status to cancelled
        await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'cancelled',
                escrow_status: 'cancelled',
                updated_at: new Date().toISOString()
            })
        });
        
        console.log('결제 취소 처리 완료:', paymentIntent.id);
        
    } catch (error) {
        console.error('Payment cancellation handling error:', error);
        throw error;
    }
}