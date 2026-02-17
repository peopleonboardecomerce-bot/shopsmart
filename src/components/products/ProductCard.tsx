import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, useCategory } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { category } = useCategory(product.categoryId);
  const favorite = isFavorite(product.id);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info("Inicia sesión para añadir productos al carrito");
      navigate("/auth", { state: { returnTo: `/product/${product.id}` } });
      return;
    }
    
    addToCart(product);
    toast.success(`${product.title} añadido al carrito`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
    toast.success(
      favorite
        ? `${product.title} eliminado de favoritos`
        : `${product.title} añadido a favoritos`
    );
  };

  const hasValidImage = product.images?.[0] && !imageError;

  return (
    <Link 
      to={`/product/${product.id}`}
      className={cn(
        "group relative block rounded-xl bg-card overflow-hidden",
        "border border-border/50",
        "shadow-sm hover:shadow-xl",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1",
        className
      )}
    >
      {/* Subtle decorative pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        {hasValidImage ? (
          <img
            src={product.images[0]}
            alt={product.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted/50">
            <ImageOff className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Gradient overlay for better badge visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.bestseller && (
            <Badge className="bg-primary text-primary-foreground text-xs font-medium px-2.5 py-0.5 shadow-sm">
              Más vendido
            </Badge>
          )}
          {product.originalPrice && (
            <Badge className="bg-destructive text-destructive-foreground text-xs font-medium px-2.5 py-0.5 shadow-sm">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-3 right-3 z-10",
            "h-9 w-9 rounded-full",
            "bg-card/80 backdrop-blur-sm",
            "border border-border/50",
            "opacity-0 group-hover:opacity-100",
            "transition-all duration-300",
            "hover:bg-card hover:scale-110",
            "shadow-sm",
            favorite && "opacity-100 bg-destructive/10 border-destructive/30"
          )}
          onClick={handleToggleFavorite}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors",
              favorite ? "fill-destructive text-destructive" : "text-foreground/70"
            )} 
          />
        </Button>

        {/* Quick Add to Cart - Slide up animation */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <Button
            className={cn(
              "w-full rounded-lg font-medium",
              "bg-primary text-primary-foreground",
              "shadow-lg shadow-primary/25",
              "hover:bg-primary/90",
              "transition-all duration-200"
            )}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock === 0 ? "Agotado" : "Añadir al carrito"}
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative p-4 space-y-3">
        {/* Category Tag */}
        {category && (
          <span className="inline-block text-xs font-medium text-primary/80 uppercase tracking-wide">
            {category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
          {product.title}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3.5 w-3.5",
                  i < Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </div>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-xl font-bold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-amber-600 font-medium">
            ¡Solo quedan {product.stock} unidades!
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-destructive font-medium">
            Agotado
          </p>
        )}
      </div>
    </Link>
  );
};
