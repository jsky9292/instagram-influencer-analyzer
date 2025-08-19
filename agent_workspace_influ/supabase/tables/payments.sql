CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL,
    campaign_id UUID NOT NULL,
    application_id BIGINT,
    amount DECIMAL(12,2) NOT NULL,
    method VARCHAR(50) CHECK (method IN ('CREDIT_CARD',
    'BANK_TRANSFER',
    'ESCROW')),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING',
    'PROCESSING',
    'SUCCESS',
    'FAILED',
    'REFUNDED')),
    transaction_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);