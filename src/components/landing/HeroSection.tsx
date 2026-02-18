import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";
import { ArrowRight, Sparkles, Star } from "lucide-react";

const avatars = ["A", "B", "C", "D"] as const;
const stars = [1, 2, 3, 4, 5] as const;

export const HeroSection = () => {
  const { data: c } = useSiteContent("hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/50 to-background py-24 md:py-36">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-accent-foreground/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />

        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center md:text-left md:mx-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>{c?.badge_text ?? "Colección Premium 2025"}</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
            {c?.title_line1 ?? "Descubre productos que"}
            <span className="relative">
              <span className="text-primary"> {c?.title_highlight ?? "transforman"}</span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/30"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M0,8 Q50,0 100,8 T200,8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            {c?.title_line2 ?? "tu vida"}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            {c?.subtitle ??
              "Explora nuestra colección curada de productos premium en electrónica, moda, hogar y deportes. Calidad excepcional, diseño único."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button
              size="lg"
              className="group text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              asChild
            >
              <Link to="/products">
                {c?.cta_primary ?? "Explorar productos"}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 py-6 rounded-xl border-2 hover:bg-accent transition-all duration-300"
              asChild
            >
              <Link to="/categories">{c?.cta_secondary ?? "Ver categorías"}</Link>
            </Button>
          </div>

          <div className="flex items-center gap-6 mt-12 justify-center md:justify-start">
            <div className="flex -space-x-2" aria-label="Clientes">
              {avatars.map((label) => (
                <div
                  key={label}
                  className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                >
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            <div className="text-sm">
              <div className="flex items-center gap-1 text-primary" aria-label="Calificación 5 de 5">
                {stars.map((i) => (
                  <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </div>
              <span className="text-muted-foreground">
                {c?.trust_text ?? "+2,500 clientes satisfechos"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
