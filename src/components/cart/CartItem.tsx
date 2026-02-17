import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/contexts/CartContext";
import { useCart } from "@/contexts/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="shrink-0">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          ${product.price.toFixed(2)} c/u
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(product.id, quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(product.id, quantity + 1)}
            disabled={quantity >= product.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-2 text-destructive hover:text-destructive"
            onClick={() => removeFromCart(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right shrink-0">
        <p className="font-bold">${(product.price * quantity).toFixed(2)}</p>
      </div>
    </div>
  );
};
