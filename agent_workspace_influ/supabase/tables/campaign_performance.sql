CREATE TABLE campaign_performance (
    performance_id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    post_url VARCHAR(500),
    post_id VARCHAR(255),
    snapshot_date DATE NOT NULL,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);