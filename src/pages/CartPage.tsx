import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const CartPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, total, totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para continuar con el checkout");
      navigate("/auth", { state: { returnTo: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-serif text-3xl font-bold mb-8">Carrito de Compra</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Productos ({totalItems})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Resumen del pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className="text-muted-foreground">Se calcula en checkout</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Continuar al checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/products">Seguir comprando</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Parece que aún no has añadido productos a tu carrito. Explora nuestra tienda y encuentra algo que te guste.
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

export default CartPage;
