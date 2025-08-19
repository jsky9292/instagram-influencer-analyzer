CREATE TABLE campaign_applications (
    application_id BIGSERIAL PRIMARY KEY,
    campaign_id UUID NOT NULL,
    influencer_id UUID NOT NULL,
    proposed_cost DECIMAL(10,2),
    proposal_message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'APPLIED' CHECK (status IN ('APPLIED',
    'NEGOTIATING',
    'ACCEPTED',
    'REJECTED',
    'CONTRACTED',
    'COMPLETED')),
    contract_id UUID,
    deliverables JSONB,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);