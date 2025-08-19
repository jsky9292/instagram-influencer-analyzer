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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // 테스트 계정 데이터
    const testAccounts = [
      {
        email: 'admin@influencerplatform.com',
        name: '플랫폼 관리자',
        user_type: 'ADMIN',
        password: 'Admin123!'
      },
      {
        email: 'fashion.influencer@test.com',
        name: '패션인플루언서김',
        user_type: 'INFLUENCER',
        password: 'Test123!',
        profile: {
          channel_name: '@fashion_kim',
          description: '패션과 스타일을 사랑하는 인플루언서입니다. 일상 속 패션 아이템을 소개합니다.',
          categories: ['패션', '뷰티', '라이프스타일'],
          followers_count: 50000
        }
      },
      {
        email: 'beauty.guru@test.com',
        name: '뷰티구루이',
        user_type: 'INFLUENCER',
        password: 'Test123!',
        profile: {
          channel_name: '@beauty_guru',
          description: '뷰티 전문가로 다양한 화장품 리뷰와 메이크업 팁을 공유합니다.',
          categories: ['뷰티', '스킨케어', '메이크업'],
          followers_count: 100000
        }
      },
      {
        email: 'food.blogger@test.com',
        name: '푸드블로거박',
        user_type: 'INFLUENCER',
        password: 'Test123!',
        profile: {
          channel_name: '@food_blog',
          description: '맛집 탐방과 요리 레시피를 소개하는 푸드 인플루언서입니다.',
          categories: ['푸드', '요리', '맛집'],
          followers_count: 30000
        }
      },
      {
        email: 'travel.explorer@test.com',
        name: '여행탐험가최',
        user_type: 'INFLUENCER',
        password: 'Test123!',
        profile: {
          channel_name: '@travel_explorer',
          description: '전 세계 여행지를 탐험하며 여행 정보와 팁을 공유합니다.',
          categories: ['여행', '라이프스타일', '사진'],
          followers_count: 80000
        }
      },
      {
        email: 'fashion.brand@test.com',
        name: '패션브랜드컴퍼니',
        user_type: 'BRAND',
        password: 'Test123!',
        profile: {
          company_name: '패션브랜드컴퍼니',
          website_url: 'https://fashionbrand.com',
          industry: '패션/의류'
        }
      },
      {
        email: 'beauty.company@test.com',
        name: '뷰티컴퍼니',
        user_type: 'BRAND',
        password: 'Test123!',
        profile: {
          company_name: '뷰티컴퍼니',
          website_url: 'https://beautycompany.com',
          industry: '뷰티/화장품'
        }
      },
      {
        email: 'restaurant.group@test.com',
        name: '레스토랑그룹',
        user_type: 'BRAND',
        password: 'Test123!',
        profile: {
          company_name: '레스토랑그룹',
          website_url: 'https://restaurantgroup.com',
          industry: '식품/음료'
        }
      }
    ];

    const createdAccounts = [];

    // 각 테스트 계정 생성
    for (const account of testAccounts) {
      try {
        // Create user in auth
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            email: account.email,
            password: account.password,
            email_confirm: true
          })
        });

        if (!authResponse.ok) {
          const error = await authResponse.text();
          console.error(`Auth creation failed for ${account.email}:`, error);
          continue;
        }

        const authUser = await authResponse.json();
        
        // Insert user profile
        const userResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            user_id: authUser.id,
            email: account.email,
            name: account.name,
            user_type: account.user_type,
            status: 'ACTIVE'
          })
        });

        if (!userResponse.ok) {
          const error = await userResponse.text();
          console.error(`User profile creation failed for ${account.email}:`, error);
          continue;
        }

        // Create specific profile based on user type
        if (account.user_type === 'INFLUENCER' && account.profile) {
          const influencerResponse = await fetch(`${supabaseUrl}/rest/v1/influencer_profiles`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({
              influencer_id: authUser.id,
              channel_name: account.profile.channel_name,
              description: account.profile.description,
              categories: account.profile.categories
            })
          });

          if (!influencerResponse.ok) {
            console.error(`Influencer profile creation failed for ${account.email}`);
          }

          // Add mock SNS account
          await fetch(`${supabaseUrl}/rest/v1/sns_accounts`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({
              influencer_id: authUser.id,
              platform: 'INSTAGRAM',
              sns_user_id: account.profile.channel_name,
              followers_count: account.profile.followers_count,
              avg_engagement_rate: 0.045
            })
          });
        } else if (account.user_type === 'BRAND' && account.profile) {
          const brandResponse = await fetch(`${supabaseUrl}/rest/v1/brand_profiles`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({
              brand_id: authUser.id,
              company_name: account.profile.company_name,
              website_url: account.profile.website_url,
              industry: account.profile.industry
            })
          });

          if (!brandResponse.ok) {
            console.error(`Brand profile creation failed for ${account.email}`);
          }
        }

        createdAccounts.push({
          email: account.email,
          name: account.name,
          user_type: account.user_type,
          password: account.password
        });
      } catch (error) {
        console.error(`Error creating account ${account.email}:`, error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${createdAccounts.length} 개의 테스트 계정이 생성되었습니다.`,
      accounts: createdAccounts
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating test accounts:', error);
    return new Response(JSON.stringify({ 
      error: {
        code: 'TEST_ACCOUNT_CREATION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});