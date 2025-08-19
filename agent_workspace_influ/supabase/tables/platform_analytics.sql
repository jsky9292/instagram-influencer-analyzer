CREATE TABLE platform_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_users INTEGER DEFAULT 0,
    total_campaigns INTEGER DEFAULT 0,
    active_campaigns INTEGER DEFAULT 0,
    completed_campaigns INTEGER DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    platform_fees DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);