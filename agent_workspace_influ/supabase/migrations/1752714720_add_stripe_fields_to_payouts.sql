-- Migration: add_stripe_fields_to_payouts
-- Created at: 1752714720

ALTER TABLE payouts 
ADD COLUMN stripe_transfer_id VARCHAR(255),
ADD COLUMN stripe_account_id VARCHAR(255);;