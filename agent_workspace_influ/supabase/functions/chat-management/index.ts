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

        if (action === 'create_conversation') {
            const { campaignId, brandId, influencerId } = requestData;

            if (!campaignId || !brandId || !influencerId) {
                throw new Error('채팅방 생성에 필요한 정보가 누락되었습니다.');
            }

            // 기존 대화방 확인
            const existingConversationResponse = await fetch(
                `${supabaseUrl}/rest/v1/chat_conversations?campaign_id=eq.${campaignId}&brand_id=eq.${brandId}&influencer_id=eq.${influencerId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const existingConversations = await existingConversationResponse.json();
            
            if (existingConversations && existingConversations.length > 0) {
                return new Response(JSON.stringify({
                    data: {
                        conversation: existingConversations[0],
                        message: '기존 대화방을 사용합니다.'
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 새 대화방 생성
            const conversationData = {
                campaign_id: campaignId,
                brand_id: brandId,
                influencer_id: influencerId,
                status: 'ACTIVE',
                last_message_at: new Date().toISOString()
            };

            const createResponse = await fetch(`${supabaseUrl}/rest/v1/chat_conversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(conversationData)
            });

            if (!createResponse.ok) {
                const errorText = await createResponse.text();
                throw new Error(`대화방 생성 실패: ${errorText}`);
            }

            const newConversation = await createResponse.json();

            // 초기 메시지 생성
            const initialMessage = {
                conversation_id: newConversation[0].conversation_id,
                sender_id: currentUserId,
                message: '안녕하세요! 캠페인 협업에 대해 논의하고 싶습니다.',
                message_type: 'TEXT'
            };

            await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(initialMessage)
            });

            return new Response(JSON.stringify({
                data: {
                    conversation: newConversation[0],
                    message: '새 대화방이 생성되었습니다.'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'send_message') {
            const { conversationId, message, messageType = 'TEXT', fileUrl, fileName } = requestData;

            if (!conversationId || !message) {
                throw new Error('메시지 전송에 필요한 정보가 누락되었습니다.');
            }

            // 대화방 게열 여부 확인
            const conversationResponse = await fetch(
                `${supabaseUrl}/rest/v1/chat_conversations?conversation_id=eq.${conversationId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const conversations = await conversationResponse.json();
            if (!conversations || conversations.length === 0) {
                throw new Error('대화방을 찾을 수 없습니다.');
            }

            const conversation = conversations[0];
            
            // 사용자가 해당 대화방의 참여자인지 확인
            if (conversation.brand_id !== currentUserId && conversation.influencer_id !== currentUserId) {
                throw new Error('이 대화방에 메시지를 보낼 권한이 없습니다.');
            }

            // 메시지 생성
            const messageData = {
                conversation_id: conversationId,
                sender_id: currentUserId,
                message: message,
                message_type: messageType,
                file_url: fileUrl || null,
                file_name: fileName || null
            };

            const messageResponse = await fetch(`${supabaseUrl}/rest/v1/chat_messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(messageData)
            });

            if (!messageResponse.ok) {
                const errorText = await messageResponse.text();
                throw new Error(`메시지 전송 실패: ${errorText}`);
            }

            const newMessage = await messageResponse.json();

            // 대화방 마지막 메시지 시간 업데이트
            await fetch(`${supabaseUrl}/rest/v1/chat_conversations?conversation_id=eq.${conversationId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    last_message_at: new Date().toISOString()
                })
            });

            return new Response(JSON.stringify({
                data: {
                    message: newMessage[0]
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('지원하지 않는 작업입니다.');

    } catch (error) {
        console.error('채팅 관리 오류:', error);

        const errorResponse = {
            error: {
                code: 'CHAT_MANAGEMENT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});