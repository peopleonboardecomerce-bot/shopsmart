import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  phone?: string;
}

interface Order {
  id: string;
  user_id: string | null;
  status: string;
  total: number;
  shipping_address: ShippingAddress | null;
  items: OrderItem[];
  created_at: string;
  profile_email?: string;
  profile_name?: string;
}

const statusOptions = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-500" },
  { value: "processing", label: "Procesando", color: "bg-blue-500" },
  { value: "shipped", label: "Enviado", color: "bg-purple-500" },
  { value: "delivered", label: "Entregado", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelado", color: "bg-destructive" },
];

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    // First fetch orders
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      toast.error("Error al cargar pedidos");
      console.error(ordersError);
      setLoading(false);
      return;
    }

    // Then fetch profiles for each order with user_id
    const userIds = ordersData
      ?.map((o) => o.user_id)
      .filter((id): id is string => id !== null);

    let profiles: Record<string, { full_name: string | null }> = {};
    let emails: Record<string, string> = {};

    if (userIds && userIds.length > 0) {
      // Fetch profile names
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profilesData) {
        profiles = profilesData.reduce((acc, p) => {
          acc[p.id] = { full_name: p.full_name };
          return acc;
        }, {} as Record<string, { full_name: string | null }>);
      }

      // Fetch emails via edge function (admin only)
      try {
        const { data: emailData } = await supabase.functions.invoke("get-user-emails", {
          body: { userIds },
        });
        if (emailData?.emails) {
          emails = emailData.emails;
        }
      } catch (error) {
        console.error("Error fetching emails:", error);
      }
    }

    const ordersWithProfiles: Order[] = (ordersData || []).map((order) => ({
      id: order.id,
      user_id: order.user_id,
      status: order.status,
      total: Number(order.total),
      shipping_address: order.shipping_address as unknown as ShippingAddress | null,
      items: (order.items as unknown as OrderItem[]) || [],
      created_at: order.created_at,
      profile_email: order.user_id ? emails[order.user_id] || undefined : undefined,
      profile_name: order.user_id ? profiles[order.user_id]?.full_name || undefined : undefined,
    }));

    setOrders(ordersWithProfiles);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Error al actualizar estado");
      console.error(error);
    } else {
      toast.success("Estado actualizado");
      fetchOrders();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = statusOptions.find((s) => s.value === status);
    return (
      <Badge className={statusInfo?.color || "bg-muted"}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Pedidos</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay pedidos todavía.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-24">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {order.profile_name || order.profile_email || "Usuario eliminado"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "dd MMM yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>€{order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">ID del Pedido</p>
                  <p className="font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p>
                    {format(new Date(selectedOrder.created_at), "dd MMMM yyyy, HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p>
                    {selectedOrder.profile_name || "N/A"}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {selectedOrder.profile_email}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Dirección de Envío</p>
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p>{selectedOrder.shipping_address.fullName}</p>
                    <p>{selectedOrder.shipping_address.address}</p>
                    <p>
                      {selectedOrder.shipping_address.postalCode}{" "}
                      {selectedOrder.shipping_address.city}
                    </p>
                    <p>{selectedOrder.shipping_address.phone}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Productos</p>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between p-3">
                      <span>
                        {item.title} x{item.quantity}
                      </span>
                      <span>€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 font-bold">
                    <span>Total</span>
                    <span>€{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
