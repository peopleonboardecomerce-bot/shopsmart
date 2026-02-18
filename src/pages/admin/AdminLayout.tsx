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
  FileText,
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
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-card sticky top-0 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <span className="font-serif font-bold text-primary text-lg">
          Admin
        </span>

        <div className="w-8" /> {/* spacer */}
      </div>

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-border bg-card transition-all duration-300",
          // Desktop widths
          sidebarOpen ? "lg:w-64" : "lg:w-16",
          // Mobile behavior
          "w-[85vw] max-w-xs",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* HEADER */}
        <div className="flex h-14 lg:h-16 items-center justify-between border-b border-border px-4">
          {sidebarOpen && (
            <Link
              to="/"
              className="font-serif text-lg lg:text-xl font-bold text-primary truncate"
            >
              PeopleOnBoard
            </Link>
          )}

          <div className="flex items-center gap-2">
            {/* Toggle desktop collapse */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:inline-flex"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Close mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* NAV */}
        <nav className="p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/admin" &&
                location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors text-sm",
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

        {/* FOOTER */}
        <div className="absolute bottom-4 left-0 right-0 px-3 lg:px-4">
          <Link
            to="/"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
          >
            <ChevronLeft className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Volver a la tienda</span>}
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          // Desktop margins
          sidebarOpen ? "lg:ml-64" : "lg:ml-16",
          // Mobile no margin
          "ml-0"
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
