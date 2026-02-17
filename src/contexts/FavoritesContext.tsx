import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { Product } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FavoritesContextType {
  favorites: Product[];
  favoriteIds: string[];
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isSyncing = useRef(false);

  // Load favorites from database for authenticated users, or localStorage for guests
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);

      if (user) {
        // Load from database
        const { data: dbFavorites, error } = await supabase
          .from("user_favorites")
          .select("product_id");

        if (!error && dbFavorites) {
          let loadedIds = dbFavorites.map(f => f.product_id);

          // Merge with localStorage favorites if any
          const localFavorites = localStorage.getItem("favorites");
          if (localFavorites) {
            const localIds: string[] = JSON.parse(localFavorites);
            for (const localId of localIds) {
              if (!loadedIds.includes(localId)) {
                loadedIds.push(localId);
                // Add to database
                await supabase.from("user_favorites").insert({
                  user_id: user.id,
                  product_id: localId,
                });
              }
            }
            localStorage.removeItem("favorites");
          }

          setFavoriteIds(loadedIds);

          // Fetch product details
          if (loadedIds.length > 0) {
            const { data: products } = await supabase
              .from("products")
              .select("*")
              .in("id", loadedIds);

            if (products) {
              setFavorites(products.map(p => ({
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
              })));
            }
          } else {
            setFavorites([]);
          }
        }
      } else {
        // Guest: load from localStorage
        const stored = localStorage.getItem("favorites");
        const ids = stored ? JSON.parse(stored) : [];
        setFavoriteIds(ids);

        if (ids.length > 0) {
          const { data: products } = await supabase
            .from("products")
            .select("*")
            .in("id", ids);

          if (products) {
            setFavorites(products.map(p => ({
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
            })));
          }
        } else {
          setFavorites([]);
        }
      }

      setIsLoading(false);
    };

    loadFavorites();
  }, [user]);

  // Sync to localStorage for guests
  useEffect(() => {
    if (isLoading || isSyncing.current || user) return;
    localStorage.setItem("favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds, user, isLoading]);

  const syncToDatabase = useCallback(async (productId: string, action: 'add' | 'remove') => {
    if (!user) return;

    isSyncing.current = true;

    if (action === 'add') {
      await supabase.from("user_favorites").insert({
        user_id: user.id,
        product_id: productId,
      });
    } else {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    }

    isSyncing.current = false;
  }, [user]);

  const addToFavorites = useCallback((product: Product) => {
    setFavoriteIds(prev => {
      if (prev.includes(product.id)) return prev;
      return [...prev, product.id];
    });
    setFavorites(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
    syncToDatabase(product.id, 'add');
  }, [syncToDatabase]);

  const removeFromFavorites = useCallback((productId: string) => {
    setFavoriteIds(prev => prev.filter(id => id !== productId));
    setFavorites(prev => prev.filter(p => p.id !== productId));
    syncToDatabase(productId, 'remove');
  }, [syncToDatabase]);

  const toggleFavorite = useCallback((product: Product) => {
    const isCurrentlyFavorite = favoriteIds.includes(product.id);
    
    if (isCurrentlyFavorite) {
      setFavoriteIds(prev => prev.filter(id => id !== product.id));
      setFavorites(prev => prev.filter(p => p.id !== product.id));
      syncToDatabase(product.id, 'remove');
    } else {
      setFavoriteIds(prev => [...prev, product.id]);
      setFavorites(prev => [...prev, product]);
      syncToDatabase(product.id, 'add');
    }
  }, [favoriteIds, syncToDatabase]);

  const isFavorite = useCallback((productId: string) => {
    return favoriteIds.includes(productId);
  }, [favoriteIds]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};