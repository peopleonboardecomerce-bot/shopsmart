
-- Table to store editable site content as key-value pairs per section
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(section, key)
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read site content (needed for landing page)
CREATE POLICY "Anyone can view site content"
ON public.site_content FOR SELECT
USING (true);

-- Only admins can manage site content
CREATE POLICY "Admins can manage site content"
ON public.site_content FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default content
INSERT INTO public.site_content (section, key, value) VALUES
-- Hero
('hero', 'badge_text', 'Colección Premium 2025'),
('hero', 'title_line1', 'Descubre productos que'),
('hero', 'title_highlight', 'transforman'),
('hero', 'title_line2', 'tu vida'),
('hero', 'subtitle', 'Explora nuestra colección curada de productos premium en electrónica, moda, hogar y deportes. Calidad excepcional, diseño único.'),
('hero', 'cta_primary', 'Explorar productos'),
('hero', 'cta_secondary', 'Ver categorías'),
('hero', 'trust_text', '+2,500 clientes satisfechos'),
-- Features
('features', 'feature_1_title', 'Envío Gratis'),
('features', 'feature_1_description', 'En pedidos mayores a $50'),
('features', 'feature_2_title', 'Pago Seguro'),
('features', 'feature_2_description', 'Transacciones 100% seguras'),
('features', 'feature_3_title', 'Soporte 24/7'),
('features', 'feature_3_description', 'Atención personalizada'),
('features', 'feature_4_title', 'Devoluciones'),
('features', 'feature_4_description', '30 días de garantía'),
-- Categories section
('categories_section', 'badge', 'Explora'),
('categories_section', 'title', 'Nuestras Categorías'),
('categories_section', 'subtitle', 'Encuentra exactamente lo que buscas en nuestra amplia selección de categorías'),
-- CTA section
('cta', 'badge_text', 'Únete hoy'),
('cta', 'title', '¿Listo para comenzar?'),
('cta', 'subtitle', 'Únete a miles de clientes satisfechos y descubre por qué somos la tienda preferida para productos premium.'),
('cta', 'cta_primary', 'Comenzar a comprar'),
('cta', 'cta_secondary', 'Explorar categorías'),
-- Footer
('footer', 'brand_name', 'PeopleOnBoard'),
('footer', 'brand_description', 'Tu destino para productos de calidad premium. Estilo, elegancia y funcionalidad en cada compra.'),
('footer', 'contact_email', 'info@lumiere.com'),
('footer', 'contact_phone', '+34 900 123 456'),
('footer', 'contact_hours', 'Lun - Vie: 9:00 - 18:00'),
-- Shipping methods
('shipping', 'method_1_name', 'Envío Estándar'),
('shipping', 'method_1_price', '4.99'),
('shipping', 'method_1_time', '5-7 días'),
('shipping', 'method_2_name', 'Envío Express'),
('shipping', 'method_2_price', '9.99'),
('shipping', 'method_2_time', '2-3 días'),
('shipping', 'method_3_name', 'Envío 24h'),
('shipping', 'method_3_price', '14.99'),
('shipping', 'method_3_time', 'Siguiente día hábil');
