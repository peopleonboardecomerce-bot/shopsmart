import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { useCategories, useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

const CategoriesPage = () => {
  const { categories, loading: loadingCategories } = useCategories();
  const { products, loading: loadingProducts } = useProducts();

  // Build a map once for O(1) lookups (avoid filtering products N times)
  const productCountByCategoryId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      const id = p.categoryId;
      if (!id) continue;
      map[id] = (map[id] || 0) + 1;
    }
    return map;
  }, [products]);

  const categoriesWithCount = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      productCount: productCountByCategoryId[category.id] || 0,
    }));
  }, [categories, productCountByCategoryId]);

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
        ) : categoriesWithCount.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No hay categorías disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {categoriesWithCount.map((category) => {
              const hasImage = Boolean(category.image);

              return (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="block focus:outline-none"
                  aria-label={`Ver productos de la categoría ${category.name}`}
                >
                  <Card className="group overflow-hidden hover:shadow-xl transition-all h-64 md:h-80">
                    <div className="relative h-full overflow-hidden">
                      {hasImage ? (
                        <img
                          src={category.image as string}
                          alt={category.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted" aria-hidden="true" />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />

                      <div className="absolute bottom-6 left-6 right-6 text-card">
                        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">
                          {category.name}
                        </h2>

                        {category.description ? (
                          <p className="text-sm md:text-base opacity-90 mb-2 line-clamp-2">
                            {category.description}
                          </p>
                        ) : (
                          <p className="text-sm md:text-base opacity-80 mb-2">
                            Explora productos de esta categoría
                          </p>
                        )}

                        <p className="text-sm opacity-75">
                          {category.productCount}{" "}
                          {category.productCount === 1 ? "producto" : "productos"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoriesPage;
