-- Add shipping tracking columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_tracking TEXT,
ADD COLUMN IF NOT EXISTS shipping_provider TEXT;