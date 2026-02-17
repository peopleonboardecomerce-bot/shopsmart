-- Add length constraints to product_questions table
ALTER TABLE public.product_questions
  ADD CONSTRAINT question_max_length CHECK (length(question) <= 1000);

ALTER TABLE public.product_questions
  ADD CONSTRAINT answer_max_length CHECK (length(answer) <= 2000);

-- Remove unused user INSERT policy on orders (orders are created via edge function with service role)
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;