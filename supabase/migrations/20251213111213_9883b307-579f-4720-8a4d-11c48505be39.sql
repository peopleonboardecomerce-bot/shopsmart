-- Create function to decrement product stock
CREATE OR REPLACE FUNCTION public.decrement_stock(product_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - quantity
  WHERE id = product_id AND stock >= quantity;
END;
$$;