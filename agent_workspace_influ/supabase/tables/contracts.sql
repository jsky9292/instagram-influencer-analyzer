CREATE TABLE contracts (
    contract_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    terms JSONB,
    brand_signature TEXT,
    influencer_signature TEXT,
    brand_signed_at TIMESTAMPTZ,
    influencer_signed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT',
    'PENDING',
    'SIGNED',
    'COMPLETED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);