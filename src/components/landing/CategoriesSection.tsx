import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useSiteContent } from "@/hooks/useSiteContent";
import { ArrowRight, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
}

interface CategoriesSectionProps {
  categories: Category[];
  loading: boolean;
}

export const CategoriesSection = ({ categories, loading }: CategoriesSectionProps) => {
  const { data: c } = useSiteContent("categories_section");

  return (
    <section className="py-16 bg-gradient-to-b from-background via-accent/30 to-background">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {c?.badge ?? "Explora"}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">{c?.title ?? "Nuestras Categorías"}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {c?.subtitle ?? "Encuentra exactamente lo que buscas en nuestra amplia selección de categorías"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} to={`/products?category=${category.id}`}>
                <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={category.image || ""}
                      alt={category.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="transform transition-transform duration-300 group-hover:translate-y-0 translate-y-2">
                        <h3 className="font-serif font-bold text-xl text-card mb-1">{category.name}</h3>
                        <p className="text-sm text-card/80 line-clamp-2">{category.description}</p>
                      </div>
                      <div className="mt-4 flex items-center text-card text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Explorar</span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
