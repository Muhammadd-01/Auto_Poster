-- database.sql
-- Run this in your Supabase SQL Editor to prepare the database for the SaaS app

-- 1. Create Social Accounts Table
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- Compatible with auth.users(id) or test accounts
  provider VARCHAR(50) NOT NULL, -- e.g. 'linkedin', 'twitter'
  provider_account_id VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  profile_url TEXT,
  email VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT,
  status VARCHAR(20) DEFAULT 'CONNECTED',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- 2. Setup RLS (Row Level Security)
-- Note: Disabling RLS allows the backend server (which uses the anon key) to manage social_accounts.
ALTER TABLE public.social_accounts DISABLE ROW LEVEL SECURITY;

-- 3. Creator Suite Post Columns Migration (Safe to run multiple times)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS first_comment TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
