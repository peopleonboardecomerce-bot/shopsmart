-- Remove email column from profiles table since it's already stored in auth.users
-- This prevents potential email enumeration attacks
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;