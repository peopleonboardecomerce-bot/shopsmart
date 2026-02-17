import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  originalPrice?: number | null;
  images: string[];
  categoryId: string;
  stock: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestseller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(
          data.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : null,
            images: p.images || [],
            categoryId: p.category_id,
            stock: p.stock,
            rating: Number(p.rating || 0),
            reviewCount: p.reviews_count || 0,
            featured: p.is_featured || false,
            bestseller: p.is_bestseller || false,
          }))
        );
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return { products, loading };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (!error && data) {
        setCategories(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            image: c.image,
          }))
        );
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};

export const useProduct = (id: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        setProduct({
          id: data.id,
          title: data.title,
          description: data.description,
          price: Number(data.price),
          originalPrice: data.original_price ? Number(data.original_price) : null,
          images: data.images || [],
          categoryId: data.category_id,
          stock: data.stock,
          rating: Number(data.rating || 0),
          reviewCount: data.reviews_count || 0,
          featured: data.is_featured || false,
          bestseller: data.is_bestseller || false,
        });
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  return { product, loading };
};

export const useFeaturedProducts = () => {
  const { products, loading } = useProducts();
  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured),
    [products]
  );
  return { products: featuredProducts, loading };
};

export const useBestsellers = () => {
  const { products, loading } = useProducts();
  const bestsellers = useMemo(
    () => products.filter((p) => p.bestseller),
    [products]
  );
  return { products: bestsellers, loading };
};

export const useFilteredProducts = (
  categoryId?: string,
  minPrice?: number,
  maxPrice?: number,
  searchQuery?: string,
  page: number = 1,
  pageSize: number = 12
) => {
  const { products, loading: productsLoading } = useProducts();

  const filteredProducts = useMemo(() => {
    let result = products;

    if (categoryId) {
      result = result.filter((p) => p.categoryId === categoryId);
    }

    if (minPrice !== undefined) {
      result = result.filter((p) => p.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      result = result.filter((p) => p.price <= maxPrice);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [products, categoryId, minPrice, maxPrice, searchQuery]);

  const maxProductPrice = useMemo(
    () => Math.max(...products.map((p) => p.price), 0),
    [products]
  );

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, page, pageSize]);

  return { 
    products: paginatedProducts, 
    loading: productsLoading, 
    maxPrice: maxProductPrice,
    totalProducts,
    totalPages,
    currentPage: page
  };
};

export const useCategory = (categoryId: string | undefined) => {
  const { categories, loading } = useCategories();
  const category = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  );
  return { category, loading };
};

export const useProductsByCategory = (categoryId: string) => {
  const { products, loading } = useProducts();
  const categoryProducts = useMemo(
    () => products.filter((p) => p.categoryId === categoryId),
    [products, categoryId]
  );
  return { products: categoryProducts, loading };
};
