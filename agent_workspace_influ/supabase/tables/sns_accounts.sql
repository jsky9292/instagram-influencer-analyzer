CREATE TABLE sns_accounts (
    sns_account_id BIGSERIAL PRIMARY KEY,
    influencer_id UUID NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('INSTAGRAM',
    'YOUTUBE',
    'TIKTOK',
    'DOUYIN')),
    sns_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    access_token TEXT,
    followers_count INTEGER DEFAULT 0,
    avg_engagement_rate DECIMAL(5,4) DEFAULT 0,
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);