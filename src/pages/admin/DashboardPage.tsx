import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id, total"),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);

        const totalRevenue =
          ordersRes.data?.reduce((sum, order) => sum + Number(order.total), 0) ||
          0;

        setStats({
          totalProducts: productsRes.count || 0,
          totalOrders: ordersRes.data?.length || 0,
          totalUsers: usersRes.count || 0,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = useMemo(
    () => [
      {
        title: "Productos",
        value: stats.totalProducts,
        icon: Package,
        color: "text-primary",
      },
      {
        title: "Pedidos",
        value: stats.totalOrders,
        icon: ShoppingCart,
        color: "text-accent-foreground",
      },
      {
        title: "Usuarios",
        value: stats.totalUsers,
        icon: Users,
        color: "text-secondary",
      },
      {
        title: "Ingresos",
        value: `€${stats.totalRevenue.toFixed(2)}`,
        icon: TrendingUp,
        color: "text-primary",
      },
    ],
    [stats],
  );

  return (
    <div className="space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold truncate">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen rápido de la actividad de tu tienda.
          </p>
        </div>
      </div>

      {/* Stats grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground truncate">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-5 w-5 shrink-0", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold tabular-nums">
                {loading ? "—" : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Welcome card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Bienvenido al Panel de Administración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base text-muted-foreground">
            Desde aquí puedes gestionar productos, pedidos y usuarios de tu
            tienda. Utiliza el menú lateral para navegar entre las diferentes
            secciones.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
