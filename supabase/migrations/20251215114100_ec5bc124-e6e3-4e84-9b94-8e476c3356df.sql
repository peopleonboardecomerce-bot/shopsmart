-- Add category_id column to products
ALTER TABLE public.products ADD COLUMN category_id uuid;

-- Map existing text categories to category IDs
UPDATE public.products SET category_id = (
  CASE 
    WHEN category = 'electronics' THEN 'a1b2c3d4-0001-4000-8000-000000000001'::uuid
    WHEN category = 'fashion' THEN 'a1b2c3d4-0002-4000-8000-000000000002'::uuid
    WHEN category = 'home' THEN 'a1b2c3d4-0003-4000-8000-000000000003'::uuid
    WHEN category = 'sports' THEN 'a1b2c3d4-0004-4000-8000-000000000004'::uuid
  END
);

-- Make category_id NOT NULL after mapping
ALTER TABLE public.products ALTER COLUMN category_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE public.products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

-- Drop the old text category column
ALTER TABLE public.products DROP COLUMN category;

-- Create index for better performance
CREATE INDEX idx_products_category_id ON public.products(category_id);