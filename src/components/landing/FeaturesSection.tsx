import { Card } from "@/components/ui/card";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Truck, Shield, Headphones, ShoppingBag } from "lucide-react";

const ICONS = [Truck, Shield, Headphones, ShoppingBag];

export const FeaturesSection = () => {
  const { data: c } = useSiteContent("features");

  const features = [1, 2, 3, 4].map((i) => ({
    icon: ICONS[i - 1],
    title: c?.[`feature_${i}_title`] ?? "",
    description: c?.[`feature_${i}_description`] ?? "",
  }));

  return (
    <section className="py-16 relative -mt-8">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden p-6 bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
