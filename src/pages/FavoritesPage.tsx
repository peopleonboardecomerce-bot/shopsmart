import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Heart, ShoppingBag } from "lucide-react";

const FavoritesPage = () => {
  const { favorites } = useFavorites();

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">Mis Favoritos</h1>
          <p className="text-muted-foreground">
            {favorites.length === 0
              ? "Aún no tienes productos favoritos"
              : `${favorites.length} productos guardados`}
          </p>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">No tienes favoritos aún</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Explora nuestros productos y guarda tus favoritos para encontrarlos fácilmente más tarde.
            </p>
            <Button asChild>
              <Link to="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Explorar productos
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
