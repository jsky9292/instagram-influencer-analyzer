CREATE TABLE influencer_contacts (
    id SERIAL PRIMARY KEY,
    brand_id TEXT NOT NULL,
    influencer_username TEXT NOT NULL,
    influencer_display_name TEXT,
    influencer_email TEXT,
    platform TEXT,
    contact_method TEXT NOT NULL,
    campaign_id INTEGER,
    contacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'SENT',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);