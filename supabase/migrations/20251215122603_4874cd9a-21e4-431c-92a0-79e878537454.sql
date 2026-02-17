-- Create product_questions table
CREATE TABLE public.product_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view questions (public for product pages)
CREATE POLICY "Anyone can view product questions"
ON public.product_questions
FOR SELECT
USING (true);

-- Authenticated users can create questions
CREATE POLICY "Authenticated users can create questions"
ON public.product_questions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own unanswered questions
CREATE POLICY "Users can update their own unanswered questions"
ON public.product_questions
FOR UPDATE
USING (auth.uid() = user_id AND answer IS NULL);

-- Users can delete their own unanswered questions
CREATE POLICY "Users can delete their own unanswered questions"
ON public.product_questions
FOR DELETE
USING (auth.uid() = user_id AND answer IS NULL);

-- Admins can manage all questions
CREATE POLICY "Admins can manage all questions"
ON public.product_questions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_product_questions_product_id ON public.product_questions(product_id);
CREATE INDEX idx_product_questions_user_id ON public.product_questions(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_questions_updated_at
BEFORE UPDATE ON public.product_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();