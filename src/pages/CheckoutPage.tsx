import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ShippingForm, ShippingData, shippingSchema } from "@/components/checkout/ShippingForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useShippingConfig } from "@/hooks/useShippingConfig";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Store, Truck, MessageCircle } from "lucide-react";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const shippingConfig = useShippingConfig();
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup" | "whatsapp">(
    shippingConfig.mode === "manual" ? "whatsapp" : "shipping"
  );
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingData, setShippingData] = useState<ShippingData>({
    fullName: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    shippingMethod: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isAuthenticated) {
    navigate("/auth", { state: { returnTo: "/checkout" } });
    return null;
  }

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const getShippingCost = () => {
    if (deliveryMethod === "pickup") return 0;
    if (deliveryMethod === "whatsapp") return shippingConfig.basePrice;
    return shippingCost;
  };

  const total = subtotal + getShippingCost();

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (deliveryMethod === "shipping") {
      const result = shippingSchema.safeParse(shippingData);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error("Por favor, completa todos los campos requeridos");
        return;
      }
      if (shippingCost === 0) {
        toast.error("Por favor, cotizá el envío ingresando tu código postal");
        return;
      }
    }

    if (deliveryMethod === "whatsapp") {
      // Validate address fields for WhatsApp shipping
      if (!shippingData.fullName || shippingData.fullName.trim().length < 2) {
        setErrors({ fullName: "Nombre requerido" });
        toast.error("Por favor, completá tu nombre");
        return;
      }
      if (!shippingData.address || shippingData.address.trim().length < 5) {
        setErrors({ address: "Dirección requerida" });
        toast.error("Por favor, completá tu dirección");
        return;
      }
      if (!shippingData.city || shippingData.city.trim().length < 2) {
        setErrors({ city: "Ciudad requerida" });
        toast.error("Por favor, completá la ciudad");
        return;
      }
      if (!shippingData.postalCode || shippingData.postalCode.trim().length < 4) {
        setErrors({ postalCode: "Código postal requerido" });
        toast.error("Por favor, completá el código postal");
        return;
      }
      if (!shippingData.phone || shippingData.phone.trim().length < 9) {
        setErrors({ phone: "Teléfono requerido" });
        toast.error("Por favor, completá el teléfono");
        return;
      }
    }

    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
      }));

      // 1) Obtener el JWT real del usuario logueado
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
      }

      const { data, error } = await supabase.functions.invoke("create-mp-preference",
        {
          body: {
            items: orderItems,
            shippingAddress: {
              ...shippingData,
              shippingMethod:
                deliveryMethod === "whatsapp"
                  ? "whatsapp_manual"
                  : shippingData.shippingMethod,
            },
            total,
            shippingCost: getShippingCost(),
            deliveryMethod,
            shippingNote:
              deliveryMethod === "whatsapp" ? "Envío a coordinar" : undefined,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      


      if (error || !data?.init_point) {
        throw new Error(data?.error || "Error al crear el pago");
      }

      clearCart();
      window.location.href = data.sandbox_init_point || data.init_point;
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error.message || "Error al procesar el pedido. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-serif text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Método de entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={(v) => {
                    setDeliveryMethod(v as "shipping" | "pickup" | "whatsapp");
                    if (v === "pickup") setShippingCost(0);
                  }}
                  className="space-y-3"
                >
                  {/* WhatsApp manual shipping */}
                  {shippingConfig.mode === "manual" && (
                    <div
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        deliveryMethod === "whatsapp" ? "border-primary bg-accent/50" : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="whatsapp" id="whatsapp" />
                      <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">{shippingConfig.manualLabel}</p>
                            <p className="text-sm text-muted-foreground">
                              {shippingConfig.manualDescription}
                            </p>
                            {shippingConfig.basePrice > 0 && (
                              <p className="text-sm font-medium mt-1">
                                Costo base: ${shippingConfig.basePrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  )}

                  {/* Correo Argentino API shipping */}
                  {shippingConfig.mode === "api" && (
                    <div
                      className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        deliveryMethod === "shipping" ? "border-primary bg-accent/50" : "border-border"
                      }`}
                    >
                      <RadioGroupItem value="shipping" id="shipping" />
                      <Label htmlFor="shipping" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Envío a domicilio (Correo Argentino)</p>
                            <p className="text-sm text-muted-foreground">
                              Cotización en tiempo real según tu código postal
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  )}

                  <div
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      deliveryMethod === "pickup" ? "border-primary bg-accent/50" : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Store className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Retiro en tienda</p>
                          <p className="text-sm text-muted-foreground">
                            Gratis - Retira en nuestra tienda principal
                          </p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Address form for WhatsApp shipping */}
            {deliveryMethod === "whatsapp" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datos de envío</CardTitle>
                </CardHeader>
                <CardContent>
                  <WhatsAppShippingForm
                    data={shippingData}
                    errors={errors}
                    onChange={setShippingData}
                  />
                </CardContent>
              </Card>
            )}

            {/* Correo Argentino Shipping Form */}
            {deliveryMethod === "shipping" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datos de envío</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShippingForm
                    data={shippingData}
                    errors={errors}
                    onChange={setShippingData}
                    onShippingCostChange={setShippingCost}
                  />
                </CardContent>
              </Card>
            )}

            {deliveryMethod === "pickup" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ubicación de retiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Tienda Principal</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dirección de retiro configurada
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Horario: Lun - Vie: 10:00 - 20:00, Sáb: 10:00 - 14:00
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.product.title}</p>
                        <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span>
                      {deliveryMethod === "pickup"
                        ? "Gratis"
                        : deliveryMethod === "whatsapp"
                        ? shippingConfig.basePrice > 0
                          ? `$${shippingConfig.basePrice.toFixed(2)}`
                          : "A coordinar"
                        : shippingCost > 0
                        ? `$${shippingCost.toFixed(2)}`
                        : "Cotizar"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {deliveryMethod === "whatsapp" && shippingConfig.basePrice === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    * El costo final de envío se coordinará por WhatsApp
                  </p>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {loading ? "Procesando..." : "Pagar con Mercado Pago"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Al finalizar, aceptas nuestros términos y condiciones
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Simple address form for WhatsApp manual shipping (no shipping method selection needed)
import { Input } from "@/components/ui/input";

const WhatsAppShippingForm = ({
  data,
  errors,
  onChange,
}: {
  data: ShippingData;
  errors: Record<string, string>;
  onChange: (data: ShippingData) => void;
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          value={data.fullName}
          onChange={(e) => onChange({ ...data, fullName: e.target.value })}
          placeholder="Juan García"
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="+54 11 1234-5678"
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="address">Dirección</Label>
      <Input
        id="address"
        value={data.address}
        onChange={(e) => onChange({ ...data, address: e.target.value })}
        placeholder="Av. Corrientes 1234, Piso 2B"
      />
      {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="city">Ciudad</Label>
        <Input
          id="city"
          value={data.city}
          onChange={(e) => onChange({ ...data, city: e.target.value })}
          placeholder="Buenos Aires"
        />
        {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="postalCode">Código postal</Label>
        <Input
          id="postalCode"
          value={data.postalCode}
          onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
          placeholder="1000"
        />
        {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
      </div>
    </div>
  </div>
);

export default CheckoutPage;
