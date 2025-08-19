CREATE TABLE brand_profiles (
    brand_id UUID PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(100),
    website_url VARCHAR(500),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);