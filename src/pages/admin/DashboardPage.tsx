import { useEffect, useState } from "react";
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

        const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

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

  const statCards = [
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
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido al Panel de Administración</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Desde aquí puedes gestionar productos, pedidos y usuarios de tu tienda.
              Utiliza el menú lateral para navegar entre las diferentes secciones.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
