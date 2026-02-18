import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct, useCategory } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProductQuestions } from "@/components/products/ProductQuestions";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  const { product, loading } = useProduct(id);
  const { category } = useCategory(product?.categoryId);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
          <Button onClick={() => navigate("/products")}>Ver productos</Button>
        </div>
      </Layout>
    );
  }

  const favorite = isFavorite(product.id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para añadir productos al carrito");
      navigate("/auth", { state: { returnTo: `/product/${product.id}` } });
      return;
    }

    addToCart(product, quantity);
    toast.success(`${product.title} añadido al carrito`);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product);
    toast.success(
      favorite
        ? `${product.title} eliminado de favoritos`
        : `${product.title} añadido a favoritos`,
    );
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  return (
    <Layout>
      <div className="container py-6 sm:py-8">
        {/* Breadcrumb (wrap on mobile) */}
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/products")}
            className="hover:text-primary"
          >
            Productos
          </button>
          <span>/</span>
          {category && (
            <>
              <button
                onClick={() => navigate(`/products?category=${category.id}`)}
                className="hover:text-primary"
              >
                {category.name}
              </button>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate max-w-[70vw] sm:max-w-none">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="h-full w-full object-cover"
              />

              {product.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "shrink-0 rounded-md overflow-hidden border-2 transition-colors",
                      "w-16 h-16 sm:w-20 sm:h-20",
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground",
                    )}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} - ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5 sm:space-y-6 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {category && <Badge variant="outline">{category.name}</Badge>}
              {product.bestseller && (
                <Badge className="bg-primary text-primary-foreground">
                  Más vendido
                </Badge>
              )}
              {product.originalPrice && (
                <Badge variant="destructive">
                  -
                  {Math.round(
                    (1 - product.price / product.originalPrice) * 100,
                  )}
                  %
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight break-words">
              {product.title}
            </h1>

            {/* Rating (wrap safe) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground",
                    )}
                  />
                ))}
              </div>
              <span className="text-muted-foreground text-sm sm:text-base">
                {product.rating} ({product.reviewCount} reseñas)
              </span>
            </div>

            {/* Price (wrap on mobile) */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-2xl sm:text-3xl font-bold">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg sm:text-xl text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed break-words">
              {product.description}
            </p>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-block w-2 h-2 rounded-full",
                  product.stock > 10
                    ? "bg-green-500"
                    : product.stock > 0
                    ? "bg-amber-500"
                    : "bg-destructive",
                )}
              />
              <span className="text-sm">
                {product.stock > 10
                  ? "En stock"
                  : product.stock > 0
                  ? `Quedan ${product.stock} unidades`
                  : "Agotado"}
              </span>
            </div>

            {/* Quantity & Add to Cart (mobile: stacked & full width buttons) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-center justify-between border border-border rounded-md w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="h-11 w-11 sm:h-10 sm:w-10"
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <span className="w-12 text-center font-medium">{quantity}</span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={quantity >= product.stock}
                  className="h-11 w-11 sm:h-10 sm:w-10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="lg"
                className="w-full sm:flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? "Agotado" : "Añadir al carrito"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleFavorite}
                className="w-full sm:w-auto"
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    favorite && "fill-destructive text-destructive",
                  )}
                />
                <span className="ml-2 sm:hidden">
                  {favorite ? "Quitar favorito" : "Agregar a favoritos"}
                </span>
              </Button>
            </div>

            {/* Features (better stacking on small screens) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Envío gratis</p>
                  <p className="text-muted-foreground">En pedidos +$50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Garantía</p>
                  <p className="text-muted-foreground">2 años incluidos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Devoluciones</p>
                  <p className="text-muted-foreground">30 días</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions section */}
        <div className="mt-8 sm:mt-10">
          <ProductQuestions productId={product.id} />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
