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
    const { email, password, name, user_type } = await req.json()

    if (!email || !password || !name || !user_type) {
      return new Response(JSON.stringify({
        error: { message: 'Missing required fields' }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create auth user with service role
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    
    if (!supabaseServiceRoleKey || !supabaseUrl) {
      throw new Error('Missing Supabase configuration')
    }

    // Create user in auth.users
    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          user_type
        }
      })
    })

    if (!createUserResponse.ok) {
      const errorText = await createUserResponse.text()
      throw new Error(`Failed to create auth user: ${errorText}`)
    }

    const authUser = await createUserResponse.json()
    console.log('Created auth user:', authUser.id)

    // Create user profile in public.users table
    const createProfileResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: authUser.id,
        email,
        name,
        user_type,
        status: 'ACTIVE'
      })
    })

    if (!createProfileResponse.ok) {
      const errorText = await createProfileResponse.text()
      console.error('Failed to create user profile:', errorText)
      // Continue anyway, user is created in auth
    }

    // Create type-specific profile
    if (user_type === 'BRAND') {
      await fetch(`${supabaseUrl}/rest/v1/brand_profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceRoleKey
        },
        body: JSON.stringify({
          brand_id: authUser.id,
          company_name: name
        })
      })
    } else if (user_type === 'INFLUENCER') {
      await fetch(`${supabaseUrl}/rest/v1/influencer_profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseServiceRoleKey
        },
        body: JSON.stringify({
          influencer_id: authUser.id,
          channel_name: name
        })
      })
    }

    return new Response(JSON.stringify({
      data: {
        user: authUser,
        email,
        message: 'Demo user created successfully'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error creating demo user:', error)
    return new Response(JSON.stringify({
      error: {
        code: 'CREATION_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})