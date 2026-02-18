import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Footer = () => {
  const { data: c } = useSiteContent("footer");

  const brandName = c?.brand_name ?? "PeopleOnBoard";
  const brandDescription =
    c?.brand_description ??
    "Tu destino para productos de calidad premium. Estilo, elegancia y funcionalidad en cada compra.";

  const contactEmail = c?.contact_email ?? "info@lumiere.com";
  const contactPhone = c?.contact_phone ?? "+34 900 123 456";
  const contactHours = c?.contact_hours ?? "Lun - Vie: 9:00 - 18:00";

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <span className="font-serif text-2xl font-bold text-primary">
              {brandName}
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {brandDescription}
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Tienda</h4>
            <nav className="flex flex-col gap-2">
              <Link
                to="/products"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Todos los productos
              </Link>
              <Link
                to="/categories"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Categorías
              </Link>
              <Link
                to="/favorites"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Mis favoritos
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Soporte</h4>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">
                Atención al cliente
              </span>
              <span className="text-sm text-muted-foreground">
                Envíos y devoluciones
              </span>
              <span className="text-sm text-muted-foreground">
                Preguntas frecuentes
              </span>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contacto</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a
                href={`mailto:${contactEmail}`}
                className="hover:text-primary transition-colors"
              >
                {contactEmail}
              </a>
              <a
                href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                className="hover:text-primary transition-colors"
              >
                {contactPhone}
              </a>
              <span>{contactHours}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {brandName}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
