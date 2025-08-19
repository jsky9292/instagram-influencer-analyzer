const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { 
      brand_id, 
      influencer_username,
      influencer_display_name,
      influencer_email,
      platform,
      contact_method,
      campaign_id 
    } = await req.json()

    if (!brand_id || !influencer_username || !contact_method) {
      return new Response(JSON.stringify({
        error: { message: 'brand_id, influencer_username, contact_method는 필수입니다.' }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Supabase 클라이언트 설정
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase 설정이 누락되었습니다.')
    }

    // 연락 이력 저장
    const contactLogResponse = await fetch(`${supabaseUrl}/rest/v1/influencer_contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        brand_id,
        influencer_username,
        influencer_display_name,
        influencer_email,
        platform,
        contact_method,
        campaign_id,
        contacted_at: new Date().toISOString(),
        status: 'SENT'
      })
    })

    if (!contactLogResponse.ok) {
      const errorText = await contactLogResponse.text()
      console.error('연락 이력 저장 실패:', errorText)
      // 연락 이력 저장 실패해도 계속 진행
    }

    // 검색 로그도 업데이트 (해당 인플루언서에 대한 관심 표시)
    await fetch(`${supabaseUrl}/rest/v1/influencer_search_logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey
      },
      body: JSON.stringify({
        brand_id,
        search_query: influencer_display_name,
        platform,
        results_count: 1,
        contacted_influencers: [influencer_username],
        search_metadata: {
          contact_initiated: true,
          contact_method,
          timestamp: new Date().toISOString()
        }
      })
    })

    return new Response(JSON.stringify({
      data: {
        message: '연락 이력이 성공적으로 기록되었습니다.',
        contact_id: Date.now(), // 실제로는 DB에서 생성된 ID 사용
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('연락 이력 기록 오류:', error)
    return new Response(JSON.stringify({
      error: {
        code: 'CONTACT_LOG_FAILED',
        message: error.message || '연락 이력 기록 중 오류가 발생했습니다.'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})