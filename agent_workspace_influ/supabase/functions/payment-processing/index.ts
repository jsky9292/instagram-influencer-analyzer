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
        const { action, campaignId, applicationId, amount, paymentMethod } = await req.json();

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        switch (action) {
            case 'create_escrow_payment':
                return await createEscrowPayment({
                    campaignId, applicationId, amount, paymentMethod, userId,
                    supabaseUrl, serviceRoleKey, corsHeaders
                });
                
            case 'release_payment':
                return await releasePayment({
                    applicationId, userId, supabaseUrl, serviceRoleKey, corsHeaders
                });
                
            case 'request_payout':
                return await requestPayout({
                    applicationId, userId, supabaseUrl, serviceRoleKey, corsHeaders
                });
                
            case 'get_payment_status':
                return await getPaymentStatus({
                    campaignId, applicationId, userId, supabaseUrl, serviceRoleKey, corsHeaders
                });
                
            case 'process_payout':
                return await processPayout({
                    applicationId, userId, supabaseUrl, serviceRoleKey, corsHeaders
                });
                
            default:
                throw new Error('Invalid action');
        }

    } catch (error) {
        console.error('Payment processing error:', error);

        const errorResponse = {
            error: {
                code: 'PAYMENT_PROCESSING_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper functions

async function createEscrowPayment({ campaignId, applicationId, amount, paymentMethod, userId, supabaseUrl, serviceRoleKey, corsHeaders }) {
    // Verify the brand owns this campaign
    const campaignResponse = await fetch(
        `${supabaseUrl}/rest/v1/campaigns?campaign_id=eq.${campaignId}&brand_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!campaignResponse.ok) {
        throw new Error('Failed to verify campaign ownership');
    }

    const campaigns = await campaignResponse.json();
    if (campaigns.length === 0) {
        throw new Error('Campaign not found or access denied');
    }

    // Verify application exists and is accepted
    const applicationResponse = await fetch(
        `${supabaseUrl}/rest/v1/campaign_applications?application_id=eq.${applicationId}&campaign_id=eq.${campaignId}&status=eq.ACCEPTED`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!applicationResponse.ok) {
        throw new Error('Failed to verify application');
    }

    const applications = await applicationResponse.json();
    if (applications.length === 0) {
        throw new Error('Application not found or not accepted');
    }

    const application = applications[0];

    // Simulate payment processing (in production, integrate with Stripe)
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData = {
        brand_id: userId,
        campaign_id: campaignId,
        application_id: applicationId,
        amount: amount,
        method: paymentMethod || 'ESCROW',
        status: 'SUCCESS', // In production, this would be 'PENDING' initially
        transaction_id: transactionId,
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
        throw new Error('Failed to create payment record');
    }

    const payment = await paymentResponse.json();

    // Update application status to CONTRACTED
    await fetch(`${supabaseUrl}/rest/v1/campaign_applications?application_id=eq.${applicationId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'CONTRACTED',
            updated_at: new Date().toISOString()
        })
    });

    // Send notification to influencer
    await sendNotification({
        userId: application.influencer_id,
        type: 'PAYMENT_ESCROWED',
        title: '결제가 에스크로에 예치되었습니다',
        content: `캠페인 "${campaigns[0].title}"의 결제가 안전하게 예치되었습니다. 캠페인을 완료하면 자동으로 정산됩니다.`,
        data: { campaignId, applicationId, amount },
        supabaseUrl,
        serviceRoleKey
    });

    return new Response(JSON.stringify({
        data: {
            payment: payment[0],
            transaction_id: transactionId,
            status: 'SUCCESS'
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function releasePayment({ applicationId, userId, supabaseUrl, serviceRoleKey, corsHeaders }) {
    // Verify campaign completion and user authorization
    const applicationResponse = await fetch(
        `${supabaseUrl}/rest/v1/campaign_applications?application_id=eq.${applicationId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!applicationResponse.ok) {
        throw new Error('Failed to fetch application');
    }

    const applications = await applicationResponse.json();
    if (applications.length === 0) {
        throw new Error('Application not found');
    }

    const application = applications[0];

    // Verify user is the brand owner
    const campaignResponse = await fetch(
        `${supabaseUrl}/rest/v1/campaigns?campaign_id=eq.${application.campaign_id}&brand_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!campaignResponse.ok) {
        throw new Error('Access denied');
    }

    const campaigns = await campaignResponse.json();
    if (campaigns.length === 0) {
        throw new Error('Campaign not found or access denied');
    }

    // Get payment record
    const paymentResponse = await fetch(
        `${supabaseUrl}/rest/v1/payments?application_id=eq.${applicationId}&status=eq.SUCCESS`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!paymentResponse.ok) {
        throw new Error('Failed to fetch payment');
    }

    const payments = await paymentResponse.json();
    if (payments.length === 0) {
        throw new Error('No successful payment found');
    }

    const payment = payments[0];

    // Calculate platform fee (5%)
    const platformFee = payment.amount * 0.05;
    const netAmount = payment.amount - platformFee;

    // Create payout record
    const payoutData = {
        influencer_id: application.influencer_id,
        application_id: applicationId,
        amount: payment.amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: 'COMPLETED', // In production, this would be 'PROCESSING'
        processed_at: new Date().toISOString(),
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
        throw new Error('Failed to create payout record');
    }

    const payout = await payoutResponse.json();

    // Update application status to COMPLETED
    await fetch(`${supabaseUrl}/rest/v1/campaign_applications?application_id=eq.${applicationId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'COMPLETED',
            updated_at: new Date().toISOString()
        })
    });

    // Send notification to influencer
    await sendNotification({
        userId: application.influencer_id,
        type: 'PAYMENT_RELEASED',
        title: '정산이 완료되었습니다',
        content: `캠페인 완료에 따라 ${netAmount.toLocaleString()}원이 정산되었습니다.`,
        data: { applicationId, amount: netAmount },
        supabaseUrl,
        serviceRoleKey
    });

    return new Response(JSON.stringify({
        data: {
            payout: payout[0],
            net_amount: netAmount,
            platform_fee: platformFee,
            status: 'COMPLETED'
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function requestPayout({ applicationId, userId, supabaseUrl, serviceRoleKey, corsHeaders }) {
    // Verify influencer owns this application
    const applicationResponse = await fetch(
        `${supabaseUrl}/rest/v1/campaign_applications?application_id=eq.${applicationId}&influencer_id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!applicationResponse.ok) {
        throw new Error('Failed to verify application ownership');
    }

    const applications = await applicationResponse.json();
    if (applications.length === 0) {
        throw new Error('Application not found or access denied');
    }

    const application = applications[0];

    // Check if payment exists and campaign is completed
    if (application.status !== 'COMPLETED') {
        throw new Error('Campaign must be completed before requesting payout');
    }

    // Check if payout already exists
    const existingPayoutResponse = await fetch(
        `${supabaseUrl}/rest/v1/payouts?application_id=eq.${applicationId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (existingPayoutResponse.ok) {
        const existingPayouts = await existingPayoutResponse.json();
        if (existingPayouts.length > 0) {
            return new Response(JSON.stringify({
                data: {
                    payout: existingPayouts[0],
                    message: 'Payout already exists'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }

    // Calculate amounts
    const amount = application.proposed_cost;
    const platformFee = amount * 0.05;
    const netAmount = amount - platformFee;

    // Create payout request
    const payoutData = {
        influencer_id: userId,
        application_id: applicationId,
        amount: amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: 'REQUESTED',
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
        throw new Error('Failed to create payout request');
    }

    const payout = await payoutResponse.json();

    return new Response(JSON.stringify({
        data: {
            payout: payout[0],
            message: 'Payout request created successfully'
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function getPaymentStatus({ campaignId, applicationId, userId, supabaseUrl, serviceRoleKey, corsHeaders }) {
    // Get payment information
    let paymentQuery = `${supabaseUrl}/rest/v1/payments?`;
    
    if (applicationId) {
        paymentQuery += `application_id=eq.${applicationId}`;
    } else if (campaignId) {
        paymentQuery += `campaign_id=eq.${campaignId}`;
    } else {
        throw new Error('Either campaignId or applicationId is required');
    }

    const paymentResponse = await fetch(paymentQuery, {
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
        }
    });

    if (!paymentResponse.ok) {
        throw new Error('Failed to fetch payment status');
    }

    const payments = await paymentResponse.json();

    // Get payout information if exists
    let payouts = [];
    if (applicationId) {
        const payoutResponse = await fetch(
            `${supabaseUrl}/rest/v1/payouts?application_id=eq.${applicationId}`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        
        if (payoutResponse.ok) {
            payouts = await payoutResponse.json();
        }
    }

    return new Response(JSON.stringify({
        data: {
            payments,
            payouts,
            summary: {
                total_payments: payments.length,
                total_amount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                pending_payouts: payouts.filter(p => p.status === 'REQUESTED').length,
                completed_payouts: payouts.filter(p => p.status === 'COMPLETED').length
            }
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function processPayout({ applicationId, userId, supabaseUrl, serviceRoleKey, corsHeaders }) {
    // This would be called by admin or automated system
    // For now, simulate processing
    
    const payoutResponse = await fetch(
        `${supabaseUrl}/rest/v1/payouts?application_id=eq.${applicationId}&status=eq.REQUESTED`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'COMPLETED',
                processed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        }
    );

    if (!payoutResponse.ok) {
        throw new Error('Failed to process payout');
    }

    return new Response(JSON.stringify({
        data: {
            message: 'Payout processed successfully',
            processed_at: new Date().toISOString()
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Utility function to send notifications
async function sendNotification({ userId, type, title, content, data, supabaseUrl, serviceRoleKey }) {
    const notificationData = {
        user_id: userId,
        type,
        title,
        content,
        data: data || {},
        is_read: false,
        created_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/notifications`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
    });
}