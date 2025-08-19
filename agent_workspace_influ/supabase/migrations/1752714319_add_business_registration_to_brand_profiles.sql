-- Migration: add_business_registration_to_brand_profiles
-- Created at: 1752714319

ALTER TABLE brand_profiles 
ADD COLUMN business_registration_number VARCHAR(12),
ADD COLUMN business_registration_verified BOOLEAN DEFAULT FALSE;;