import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { PackageIcon, AlertCircle, ShoppingBag, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_status: string | null;
  payment_status_detail: string | null;
  items: any;
  shipping_address: any;
}

const OrderHistoryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc">("date-desc");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>("all");

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setError(null);
        setLoading(true);

        let query = supabase
          .from("orders")
          .select(
            "id, created_at, total, status, payment_status, payment_status_detail, items",
          )
          .eq("user_id", user.id);

        // Apply filters
        if (filterPaymentStatus !== "all") {
          query = query.eq("payment_status", filterPaymentStatus);
        }
        if (filterOrderStatus !== "all") {
          query = query.eq("status", filterOrderStatus);
        }

        // Apply sorting
        const ascending = sortBy === "date-asc";
        query = query.order("created_at", { ascending });

        const { data, error } = await query;
        if (error) throw error;

        setOrders((data as Order[]) || []);
      } catch (err: any) {
        setError(err.message || "Error al cargar los pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, isAuthenticated, sortBy, filterPaymentStatus, filterOrderStatus]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "processing":
        return "default";
      case "shipped":
        return "secondary";
      case "delivered":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "processing":
        return "Procesando";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      case "pending":
        return "Pendiente";
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status: string | null) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      default:
        return status || "No disponible";
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">Acceso requerido</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Debes iniciar sesión para ver tus pedidos.
            </p>
            <Button asChild>
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 sm:py-8">
        {/* Header responsive */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <PackageIcon className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Mis Pedidos
            </h1>
          </div>
        </div>

        {/* Error (no altera lógica, sólo UI) */}
        {error && (
          <Card className="mb-6 border-destructive/30">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // trigger refetch by toggling sort twice without changing final value
                    setSortBy((prev) => (prev === "date-desc" ? "date-asc" : "date-desc"));
                    setTimeout(() => setSortBy((prev) => (prev === "date-desc" ? "date-asc" : "date-desc")), 0);
                  }}
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters Section (responsive grid + full width controls on mobile) */}
        <Card className="mb-6 border-border">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort-by" className="text-sm font-medium">
                  Ordenar por
                </Label>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger id="sort-by" className="w-full">
                    <SelectValue placeholder="Selecciona ordenamiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Más recientes primero</SelectItem>
                    <SelectItem value="date-asc">Más antiguos primero</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-status" className="text-sm font-medium">
                  Estado de pago
                </Label>
                <Select
                  value={filterPaymentStatus}
                  onValueChange={setFilterPaymentStatus}
                >
                  <SelectTrigger id="payment-status" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-status" className="text-sm font-medium">
                  Estado del pedido
                </Label>
                <Select
                  value={filterOrderStatus}
                  onValueChange={setFilterOrderStatus}
                >
                  <SelectTrigger id="order-status" className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button (full width on mobile) */}
            {(filterPaymentStatus !== "all" ||
              filterOrderStatus !== "all" ||
              sortBy !== "date-desc") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortBy("date-desc");
                  setFilterPaymentStatus("all");
                  setFilterOrderStatus("all");
                }}
                className="mt-4 w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  {/* Summary: switches to stacked layout on mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground mb-1">
                        Número de pedido
                      </p>
                      <p className="font-mono text-sm font-semibold truncate">
                        {order.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground mb-1">Fecha</p>
                      <p className="font-medium break-words">
                        {new Date(order.created_at).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="font-bold text-lg">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Estado</p>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-border pt-4 mb-4">
                    <p className="text-sm font-semibold text-muted-foreground mb-3">
                      Productos
                    </p>
                    <div className="space-y-2">
                      {Array.isArray(order.items) &&
                        order.items.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="text-sm flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="text-foreground break-words">
                                {item.title}{" "}
                                <span className="text-muted-foreground">
                                  x{item.quantity}
                                </span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${item.price.toFixed(2)} c/u
                              </p>
                            </div>
                            <p className="text-sm font-medium whitespace-nowrap">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Payment Status (stack on mobile) */}
                  <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Estado del pago
                      </p>
                      <Badge
                        variant={getPaymentStatusBadgeVariant(order.payment_status)}
                      >
                        {getPaymentStatusLabel(order.payment_status)}
                      </Badge>
                    </div>
                    {order.payment_status_detail && (
                      <p className="text-xs text-muted-foreground break-words sm:text-right">
                        {order.payment_status_detail}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">
              Aún no has realizado compras
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Explora nuestra tienda y realiza tu primer pedido.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ver productos
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrderHistoryPage;
