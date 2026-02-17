import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { useFilteredProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Search, PackageX, Loader2 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PRODUCTS_PER_PAGE = 12;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [priceInitialized, setPriceInitialized] = useState(false);

  const { products: filteredProducts, loading, maxPrice, totalProducts, totalPages } = useFilteredProducts(
    selectedCategory || undefined,
    priceRange[0] > 0 ? priceRange[0] : undefined,
    priceInitialized && priceRange[1] > 0 ? priceRange[1] : undefined,
    searchQuery || undefined,
    currentPage,
    PRODUCTS_PER_PAGE
  );

  const ceiledMaxPrice = Math.ceil(maxPrice || 0);

  // Sync with URL params
  useEffect(() => {
    setSelectedCategory(urlCategory);
    setSearchQuery(urlSearch);
    setCurrentPage(urlPage);
  }, [urlCategory, urlSearch, urlPage]);

  // Update price range when max price is loaded (only on initial load)
  useEffect(() => {
    if (ceiledMaxPrice > 0 && !priceInitialized) {
      setPriceRange([0, ceiledMaxPrice]);
      setPriceInitialized(true);
    }
  }, [ceiledMaxPrice, priceInitialized]);

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateSearchParams({ category: category || null, page: null });
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, ceiledMaxPrice || 1500]);
    setSearchQuery("");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateSearchParams({ search: query || null, page: null });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateSearchParams({ page: page > 1 ? String(page) : null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generatePaginationItems = () => {
    const items: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      
      if (currentPage > 3) items.push('ellipsis');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) items.push(i);
      
      if (currentPage < totalPages - 2) items.push('ellipsis');
      
      items.push(totalPages);
    }
    
    return items;
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold mb-2">
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : selectedCategory
              ? "Productos"
              : "Todos los Productos"}
          </h1>
          <p className="text-muted-foreground">
            {loading ? "Cargando..." : `${totalProducts} productos encontrados`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <ProductFilters
            selectedCategory={selectedCategory}
            priceRange={priceRange}
            maxPrice={ceiledMaxPrice || 1500}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
            onClearFilters={handleClearFilters}
          />

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {generatePaginationItems().map((item, index) => (
                          <PaginationItem key={index}>
                            {item === 'ellipsis' ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() => handlePageChange(item)}
                                isActive={currentPage === item}
                                className="cursor-pointer"
                              >
                                {item}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <PackageX className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No se encontraron productos</h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros o buscar algo diferente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
