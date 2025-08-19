CREATE TABLE influencer_profiles (
    influencer_id UUID PRIMARY KEY,
    channel_name VARCHAR(255),
    description TEXT,
    categories JSONB,
    contact_email VARCHAR(255),
    portfolio_url VARCHAR(500),
    location VARCHAR(255),
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    collaboration_types JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);