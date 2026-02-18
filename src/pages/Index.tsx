import { Layout } from "@/components/layout/Layout";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { useFeaturedProducts, useBestsellers, useCategories } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
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
      <section className="py-6 sm:py-8">
        <div className="container">
          {loadingFeatured ? (
            <div className="py-10 sm:py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ProductCarousel
              products={featuredProducts}
              title="Productos Destacados"
              subtitle="Selección especial de nuestras mejores ofertas"
            />
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 sm:py-8">
        <div className="container">
          <CategoriesSection categories={categories} loading={loadingCategories} />
        </div>
      </section>

      {/* Bestsellers Carousel */}
      <section className="py-6 sm:py-8">
        <div className="container">
          {loadingBestsellers ? (
            <div className="py-10 sm:py-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ProductCarousel
              products={bestsellers}
              title="Más Vendidos"
              subtitle="Los productos favoritos de nuestros clientes"
            />
          )}
        </div>
      </section>

      <CtaSection />
    </Layout>
  );
};

export default Index;
