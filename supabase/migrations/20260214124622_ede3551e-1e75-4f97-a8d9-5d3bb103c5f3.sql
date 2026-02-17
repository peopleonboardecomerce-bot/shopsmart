-- Revoke public/authenticated access to decrement_stock so it can only be called via service role
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) FROM public;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) FROM anon;