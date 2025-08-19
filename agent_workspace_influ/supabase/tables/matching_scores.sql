CREATE TABLE matching_scores (
    score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL,
    influencer_id UUID NOT NULL,
    overall_score DECIMAL(5,2) NOT NULL,
    relevance_score DECIMAL(5,2) NOT NULL,
    influence_score DECIMAL(5,2) NOT NULL,
    authenticity_score DECIMAL(5,2) NOT NULL,
    brand_safety_score DECIMAL(5,2) NOT NULL,
    predicted_performance JSONB,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);