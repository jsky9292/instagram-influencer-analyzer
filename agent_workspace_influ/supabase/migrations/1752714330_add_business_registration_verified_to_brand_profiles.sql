-- Migration: add_business_registration_verified_to_brand_profiles
-- Created at: 1752714330

ALTER TABLE brand_profiles 
ADD COLUMN business_registration_verified BOOLEAN DEFAULT FALSE;;