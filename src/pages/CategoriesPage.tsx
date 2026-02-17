import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { useCategories, useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

const CategoriesPage = () => {
  const { categories, loading: loadingCategories } = useCategories();
  const { products, loading: loadingProducts } = useProducts();

  const categoriesWithCount = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      productCount: products.filter((p) => p.categoryId === category.id).length,
    }));
  }, [categories, products]);

  const loading = loadingCategories || loadingProducts;

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">Categorías</h1>
          <p className="text-muted-foreground">
            Explora nuestras categorías de productos
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {categoriesWithCount.map((category) => (
              <Link key={category.id} to={`/products?category=${category.id}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all h-64 md:h-80">
                  <div className="relative h-full overflow-hidden">
                    <img
                      src={category.image || ""}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 text-card">
                      <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">
                        {category.name}
                      </h2>
                      <p className="text-sm md:text-base opacity-90 mb-2">
                        {category.description}
                      </p>
                      <p className="text-sm opacity-75">
                        {category.productCount} productos
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoriesPage;
