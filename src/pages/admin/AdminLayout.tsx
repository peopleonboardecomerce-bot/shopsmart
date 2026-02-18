import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FolderOpen,
  ChevronLeft,
  Menu,
  MessageSquare,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Loader2 } from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Productos" },
  { href: "/admin/categories", icon: FolderOpen, label: "Categorías" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Pedidos" },
  { href: "/admin/users", icon: Users, label: "Usuarios" },
  { href: "/admin/questions", icon: MessageSquare, label: "Preguntas" },
  { href: "/admin/content", icon: FileText, label: "Contenido" },
];

export const AdminLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isLoading, isAdmin, isAuthenticated } = useAdminCheck();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* mobile header with hamburger to open drawer */}
      <div className="md:hidden flex items-center p-4 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)}>
          <Menu />
        </Button>
        <Link to="/" className="ml-2 font-serif text-xl font-bold text-primary">
          PeopleOnBoard
        </Link>
      </div>

      {/* Sidebar for md+ screens, collapsible width */}
      <aside
        className={cn(
          "hidden md:fixed md:left-0 md:top-0 md:z-40 md:h-screen md:border-r md:border-border md:bg-card md:transition-all md:duration-300",
          sidebarOpen ? "md:w-64" : "md:w-16"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {sidebarOpen && (
            <Link to="/" className="font-serif text-xl font-bold text-primary">
              PeopleOnBoard
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/admin" && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            )}
          >
            <ChevronLeft className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Volver a la tienda</span>}
          </Link>
        </div>
      </aside>

      {/* mobile drawer overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-card border-r border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="font-serif text-xl font-bold text-primary">
                PeopleOnBoard
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(false)}>
                <X />
              </Button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== "/admin" && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          "md:ml-0",
          sidebarOpen ? "md:ml-64" : "md:ml-16"
        )}
      >
        <div className="p-8 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
