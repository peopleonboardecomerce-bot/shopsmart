
-- Add Mercado Pago payment columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS external_reference text,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS payment_status_detail text;

-- Unique index for external_reference (fast lookups + no duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_external_reference ON public.orders (external_reference) WHERE external_reference IS NOT NULL;

-- Index for payment_status queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
