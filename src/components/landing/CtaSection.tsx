import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo } from "react";

export const CtaSection = () => {
  const { data: c } = useSiteContent("cta");

  // Small performance + cleanliness: compute fallbacks once (no behavior change)
  const content = useMemo(
    () => ({
      badgeText: c?.badge_text ?? "Únete hoy",
      title: c?.title ?? "¿Listo para comenzar?",
      subtitle:
        c?.subtitle ??
        "Únete a miles de clientes satisfechos y descubre por qué somos la tienda preferida para productos premium.",
      ctaPrimary: c?.cta_primary ?? "Comenzar a comprar",
      ctaSecondary: c?.cta_secondary ?? "Explorar categorías",
    }),
    [c]
  );

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary-foreground/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl" />

      <div className="container relative text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          <span>{content.badgeText}</span>
        </div>

        <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-primary-foreground">
          {content.title}
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
          {content.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="secondary"
            className="group text-base px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <Link to="/products">
              {content.ctaPrimary}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button
            size="lg"
            className="text-base px-8 py-6 rounded-xl border-2 border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-all duration-300"
            asChild
          >
            <Link to="/categories">{content.ctaSecondary}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
