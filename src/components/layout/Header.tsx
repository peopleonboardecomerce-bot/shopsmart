import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Shield,
  PackageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { favoriteIds } = useFavorites();

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync search input with URL (cuando vuelves atrás/adelante o compartís link)
  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  // Cerrar menú mobile al navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // UX: cerrar con ESC cuando está abierto
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const displayName = useMemo(() => {
    return (
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Cuenta"
    );
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    // Mantiene el input en la URL. No resetea: mejor UX si querés ajustar.
    navigate(`/products?search=${encodeURIComponent(q)}&page=1`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  const NavLink = ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={cn(
          "text-sm font-medium transition-colors",
          active ? "text-primary" : "hover:text-primary text-foreground",
          className
        )}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-bold text-primary">
            PeopleOB
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/products">Productos</NavLink>
          <NavLink to="/categories">Categorías</NavLink>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar productos"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Favorites */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/favorites" aria-label="Favoritos">
              <Heart className="h-5 w-5" />
              {favoriteIds.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center p-0 text-[10px] leading-none">
                  {favoriteIds.length > 99 ? "99+" : favoriteIds.length}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/cart" aria-label="Carrito">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center p-0 text-[10px] leading-none">
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Link>
          </Button>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Cuenta">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {isAdmin && (
                      <Badge variant="secondary" className="mt-2 w-fit text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <PackageIcon className="mr-2 h-4 w-4" />
                  Mis Pedidos
                </DropdownMenuItem>

                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" />
                      Panel de Administración
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={cn(
          "md:hidden border-t border-border overflow-hidden transition-[max-height] duration-300",
          mobileMenuOpen ? "max-h-80" : "max-h-0"
        )}
      >
        <div className="container py-4 space-y-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar productos"
              />
            </div>
          </form>

          <nav className="flex flex-col gap-2">
            <Link
              to="/products"
              className={cn(
                "text-sm font-medium transition-colors py-2",
                location.pathname === "/products" ? "text-primary" : "hover:text-primary"
              )}
            >
              Productos
            </Link>
            <Link
              to="/categories"
              className={cn(
                "text-sm font-medium transition-colors py-2",
                location.pathname === "/categories" ? "text-primary" : "hover:text-primary"
              )}
            >
              Categorías
            </Link>

            {!isAuthenticated && (
              <Button asChild className="mt-2 sm:hidden">
                <Link to="/auth">Iniciar sesión</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
