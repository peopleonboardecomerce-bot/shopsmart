import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/useProducts";
import { Filter, X, Loader2, DollarSign } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface ProductFiltersProps {
  selectedCategory: string;
  priceRange: [number, number];
  maxPrice: number;
  onCategoryChange: (category: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

export const ProductFilters = ({
  selectedCategory,
  priceRange,
  maxPrice,
  onCategoryChange,
  onPriceChange,
  onClearFilters,
}: ProductFiltersProps) => {
  const { categories, loading } = useCategories();
  const hasActiveFilters = selectedCategory !== "" || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Categoría</Label>
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <Select value={selectedCategory || "all"} onValueChange={(value) => onCategoryChange(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Rango de precio</Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              min={0}
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) => {
                const value = Math.min(Number(e.target.value) || 0, priceRange[1]);
                onPriceChange([value, priceRange[1]]);
              }}
              className="pl-7 h-9"
              placeholder="Mín"
            />
          </div>
          <span className="text-muted-foreground">-</span>
          <div className="relative flex-1">
            <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              min={priceRange[0]}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => {
                const value = Math.max(Number(e.target.value) || 0, priceRange[0]);
                onPriceChange([priceRange[0], Math.min(value, maxPrice)]);
              }}
              className="pl-7 h-9"
              placeholder="Máx"
            />
          </div>
        </div>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={priceRange}
          onValueChange={(value) => onPriceChange(value as [number, number])}
          className="mt-2"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={onClearFilters} className="w-full">
          <X className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 p-6 bg-card rounded-lg border border-border">
          <h3 className="font-semibold mb-4">Filtros</h3>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 rounded-full bg-primary w-2 h-2" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};
