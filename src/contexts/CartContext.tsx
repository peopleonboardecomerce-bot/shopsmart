import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { Product } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isSyncing = useRef(false);

  // Load cart from database for authenticated users, or localStorage for guests
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      
      if (user) {
        // Load from database
        const { data: cartItems, error } = await supabase
          .from("cart_items")
          .select("product_id, quantity");
        
        if (!error && cartItems && cartItems.length > 0) {
          const productIds = cartItems.map(item => item.product_id);
          const { data: products } = await supabase
            .from("products")
            .select("*")
            .in("id", productIds);
          
          if (products) {
            const loadedItems: CartItem[] = cartItems.map(cartItem => {
              const product = products.find(p => p.id === cartItem.product_id);
              if (!product) return null;
              return {
                product: {
                  id: product.id,
                  title: product.title,
                  description: product.description,
                  price: Number(product.price),
                  originalPrice: product.original_price ? Number(product.original_price) : null,
                  images: product.images || [],
                  categoryId: product.category_id,
                  stock: product.stock,
                  rating: Number(product.rating || 0),
                  reviewCount: product.reviews_count || 0,
                  featured: product.is_featured || false,
                  bestseller: product.is_bestseller || false,
                },
                quantity: cartItem.quantity,
              };
            }).filter(Boolean) as CartItem[];
            
            // Merge with localStorage cart if any
            const localCart = localStorage.getItem("cart");
            if (localCart) {
              const localItems: CartItem[] = JSON.parse(localCart);
              for (const localItem of localItems) {
                const existingIndex = loadedItems.findIndex(i => i.product.id === localItem.product.id);
                if (existingIndex === -1) {
                  loadedItems.push(localItem);
                  // Add to database
                  await supabase.from("cart_items").upsert({
                    user_id: user.id,
                    product_id: localItem.product.id,
                    quantity: localItem.quantity,
                  });
                }
              }
              localStorage.removeItem("cart");
            }
            
            setItems(loadedItems);
          }
        } else {
          // No items in DB, check localStorage for items to migrate
          const localCart = localStorage.getItem("cart");
          if (localCart) {
            const localItems: CartItem[] = JSON.parse(localCart);
            setItems(localItems);
            // Sync to database
            for (const item of localItems) {
              await supabase.from("cart_items").upsert({
                user_id: user.id,
                product_id: item.product.id,
                quantity: item.quantity,
              });
            }
            localStorage.removeItem("cart");
          } else {
            setItems([]);
          }
        }
      } else {
        // Guest: load from localStorage
        const stored = localStorage.getItem("cart");
        setItems(stored ? JSON.parse(stored) : []);
      }
      
      setIsLoading(false);
    };

    loadCart();
  }, [user]);

  // Sync cart to storage (localStorage for guests, database for authenticated)
  useEffect(() => {
    if (isLoading || isSyncing.current) return;
    
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, user, isLoading]);

  const syncToDatabase = useCallback(async (newItems: CartItem[]) => {
    if (!user) return;
    
    isSyncing.current = true;
    
    // Get current DB items
    const { data: dbItems } = await supabase
      .from("cart_items")
      .select("product_id")
      .eq("user_id", user.id);
    
    const dbProductIds = new Set(dbItems?.map(i => i.product_id) || []);
    const newProductIds = new Set(newItems.map(i => i.product.id));
    
    // Delete removed items
    for (const productId of dbProductIds) {
      if (!newProductIds.has(productId)) {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      }
    }
    
    // Upsert current items
    for (const item of newItems) {
      await supabase.from("cart_items").upsert({
        user_id: user.id,
        product_id: item.product.id,
        quantity: item.quantity,
      });
    }
    
    isSyncing.current = false;
  }, [user]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        newItems = [...prev, { product, quantity: Math.min(quantity, product.stock) }];
      }
      syncToDatabase(newItems);
      return newItems;
    });
  }, [syncToDatabase]);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.product.id !== productId);
      syncToDatabase(newItems);
      return newItems;
    });
  }, [syncToDatabase]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => {
      const newItems = prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      );
      syncToDatabase(newItems);
      return newItems;
    });
  }, [removeFromCart, syncToDatabase]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);
    } else {
      localStorage.removeItem("cart");
    }
  }, [user]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal; // Could add shipping, taxes, etc.

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
