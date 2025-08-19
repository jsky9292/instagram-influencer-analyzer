-- Migration: add_escrow_fields_to_payments
-- Created at: 1752714715

ALTER TABLE payments 
ADD COLUMN escrow_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN escrow_release_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN platform_fee_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN influencer_amount DECIMAL(10,2) DEFAULT 0.00;;