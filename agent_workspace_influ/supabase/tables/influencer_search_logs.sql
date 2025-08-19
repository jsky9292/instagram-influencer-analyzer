CREATE TABLE influencer_search_logs (
    id SERIAL PRIMARY KEY,
    brand_id TEXT NOT NULL,
    search_query TEXT NOT NULL,
    platform TEXT,
    language TEXT,
    country TEXT,
    search_type TEXT,
    results_count INTEGER DEFAULT 0,
    is_realtime BOOLEAN DEFAULT false,
    contacted_influencers TEXT[],
    search_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);