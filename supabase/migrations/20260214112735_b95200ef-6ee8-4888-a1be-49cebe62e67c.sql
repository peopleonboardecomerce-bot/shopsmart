
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view product questions" ON public.product_questions;

-- Authenticated users can view all questions (needed to display Q&A on product pages)
CREATE POLICY "Authenticated users can view product questions"
ON public.product_questions
FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can only see questions that have been answered (public Q&A display)
-- but we use a view to hide sensitive fields
CREATE OR REPLACE VIEW public.product_questions_public
WITH (security_invoker = on) AS
SELECT 
  id,
  product_id,
  question,
  answer,
  answered_at,
  created_at
FROM public.product_questions;

-- Allow anon to select from the view by adding a policy for anon on the base table
-- that only exposes answered questions
CREATE POLICY "Anon can view answered questions"
ON public.product_questions
FOR SELECT
TO anon
USING (answer IS NOT NULL);
