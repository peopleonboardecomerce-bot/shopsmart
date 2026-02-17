import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFeaturedProducts, useBestsellers, useCategories } from "@/hooks/useProducts";
import { useSiteContent } from "@/hooks/useSiteContent";
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones, Loader2, Sparkles, Star } from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { CtaSection } from "@/components/landing/CtaSection";

const Index = () => {
  const { products: featuredProducts, loading: loadingFeatured } = useFeaturedProducts();
  const { products: bestsellers, loading: loadingBestsellers } = useBestsellers();
  const { categories, loading: loadingCategories } = useCategories();

  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />

      {/* Featured Products Carousel */}
      <section className="py-8">
        {loadingFeatured ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ProductCarousel
            products={featuredProducts}
            title="Productos Destacados"
            subtitle="Selección especial de nuestras mejores ofertas"
          />
        )}
      </section>

      <CategoriesSection categories={categories} loading={loadingCategories} />

      {/* Bestsellers Carousel */}
      <section className="py-8">
        {loadingBestsellers ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ProductCarousel
            products={bestsellers}
            title="Más Vendidos"
            subtitle="Los productos favoritos de nuestros clientes"
          />
        )}
      </section>

      <CtaSection />
    </Layout>
  );
};

export default Index;
