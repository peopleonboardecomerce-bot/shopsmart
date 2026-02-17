export interface Product {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  bestseller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electrónica",
    description: "Gadgets y dispositivos de última generación",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop"
  },
  {
    id: "fashion",
    name: "Moda",
    description: "Ropa y accesorios de tendencia",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop"
  },
  {
    id: "home",
    name: "Hogar",
    description: "Decoración y artículos para el hogar",
    image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=300&fit=crop"
  },
  {
    id: "sports",
    name: "Deportes",
    description: "Equipamiento deportivo y fitness",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
  }
];

export const products: Product[] = [
  {
    id: "1",
    title: "Auriculares Inalámbricos Premium",
    description: "Sonido envolvente con cancelación de ruido activa",
    fullDescription: "Experimenta el sonido como nunca antes con nuestros auriculares inalámbricos premium. Cuentan con cancelación de ruido activa avanzada, 30 horas de batería y conectividad Bluetooth 5.2. El diseño ergonómico garantiza comodidad durante todo el día, mientras que los drivers de 40mm ofrecen un audio cristalino con graves profundos y agudos nítidos.",
    price: 199.99,
    originalPrice: 249.99,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&h=600&fit=crop"
    ],
    category: "electronics",
    stock: 45,
    rating: 4.8,
    reviewCount: 324,
    featured: true,
    bestseller: true
  },
  {
    id: "2",
    title: "Smartwatch Fitness Pro",
    description: "Monitor de salud avanzado con GPS integrado",
    fullDescription: "El Smartwatch Fitness Pro es tu compañero perfecto para un estilo de vida activo. Incluye monitor de frecuencia cardíaca, SpO2, seguimiento del sueño, GPS integrado y más de 100 modos de ejercicio. Resistente al agua hasta 50 metros y con una batería que dura hasta 14 días.",
    price: 299.99,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop"
    ],
    category: "electronics",
    stock: 28,
    rating: 4.6,
    reviewCount: 189,
    featured: true
  },
  {
    id: "3",
    title: "Chaqueta Urbana Impermeable",
    description: "Estilo moderno con protección contra la lluvia",
    fullDescription: "Chaqueta urbana diseñada para el día a día con tecnología impermeable y transpirable. Cuenta con capucha ajustable, múltiples bolsillos con cremallera y forro térmico removible. Perfecta para cualquier clima y ocasión.",
    price: 129.99,
    originalPrice: 159.99,
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop"
    ],
    category: "fashion",
    stock: 62,
    rating: 4.4,
    reviewCount: 87,
    bestseller: true
  },
  {
    id: "4",
    title: "Zapatillas Running Ultra",
    description: "Máxima amortiguación para largas distancias",
    fullDescription: "Las zapatillas Running Ultra están diseñadas para corredores exigentes. Con tecnología de amortiguación reactiva, upper de malla transpirable y suela de carbono para máxima propulsión. Ideales para maratones y entrenamientos intensivos.",
    price: 179.99,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop"
    ],
    category: "sports",
    stock: 35,
    rating: 4.9,
    reviewCount: 456,
    featured: true,
    bestseller: true
  },
  {
    id: "5",
    title: "Lámpara de Diseño Nórdico",
    description: "Iluminación elegante para espacios modernos",
    fullDescription: "Lámpara de pie con diseño escandinavo minimalista. Fabricada en madera de roble natural y pantalla de lino, ofrece luz cálida y acogedora. Altura ajustable y compatible con bombillas LED E27.",
    price: 89.99,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop"
    ],
    category: "home",
    stock: 19,
    rating: 4.7,
    reviewCount: 63
  },
  {
    id: "6",
    title: "Cámara Mirrorless 4K",
    description: "Captura momentos con calidad profesional",
    fullDescription: "Cámara mirrorless con sensor full-frame de 45MP, grabación de video 4K a 60fps, estabilización de imagen de 5 ejes y enfoque automático ultrarrápido. Incluye conectividad WiFi y Bluetooth para transferencia instantánea.",
    price: 1299.99,
    originalPrice: 1499.99,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=600&fit=crop"
    ],
    category: "electronics",
    stock: 12,
    rating: 4.9,
    reviewCount: 234,
    featured: true
  },
  {
    id: "7",
    title: "Set de Pesas Ajustables",
    description: "De 5kg a 25kg en un solo equipo",
    fullDescription: "Set de pesas con sistema de ajuste rápido que va de 5kg a 25kg. Diseño compacto que ahorra espacio, ideal para entrenamientos en casa. Agarre ergonómico antideslizante y construcción de acero duradero.",
    price: 249.99,
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=600&fit=crop"
    ],
    category: "sports",
    stock: 23,
    rating: 4.5,
    reviewCount: 112
  },
  {
    id: "8",
    title: "Sofá Modular 3 Plazas",
    description: "Comodidad y versatilidad para tu sala",
    fullDescription: "Sofá modular de 3 plazas con tapizado de tela antimanchas premium. Estructura de madera maciza, cojines de espuma de alta densidad y configuración flexible. Disponible en múltiples colores para adaptarse a tu decoración.",
    price: 899.99,
    originalPrice: 1099.99,
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&h=600&fit=crop"
    ],
    category: "home",
    stock: 8,
    rating: 4.6,
    reviewCount: 78
  },
  {
    id: "9",
    title: "Vestido Elegante Satinado",
    description: "Perfecto para ocasiones especiales",
    fullDescription: "Vestido largo de satén con corte fluido y escote en V. Confeccionado en satén de alta calidad con forro interior. Diseño atemporal que combina elegancia y comodidad para cualquier evento especial.",
    price: 159.99,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=600&fit=crop"
    ],
    category: "fashion",
    stock: 41,
    rating: 4.3,
    reviewCount: 95
  },
  {
    id: "10",
    title: "Tablet Pro 12.9\"",
    description: "Potencia y portabilidad en una pantalla grande",
    fullDescription: "Tablet con pantalla Liquid Retina de 12.9 pulgadas, chip M2, 256GB de almacenamiento y compatibilidad con Apple Pencil. Perfecta para creativos, profesionales y entretenimiento.",
    price: 1099.99,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&h=600&fit=crop"
    ],
    category: "electronics",
    stock: 17,
    rating: 4.8,
    reviewCount: 267,
    bestseller: true
  },
  {
    id: "11",
    title: "Esterilla de Yoga Premium",
    description: "Agarre superior y amortiguación óptima",
    fullDescription: "Esterilla de yoga de 6mm de grosor con superficie antideslizante y material TPE ecológico. Incluye correa de transporte y es resistente al sudor. Perfecta para yoga, pilates y estiramientos.",
    price: 49.99,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop"
    ],
    category: "sports",
    stock: 89,
    rating: 4.4,
    reviewCount: 156
  },
  {
    id: "12",
    title: "Set de Velas Aromáticas",
    description: "Crea ambientes relajantes en tu hogar",
    fullDescription: "Set de 6 velas aromáticas de cera de soja con fragancias naturales: lavanda, vainilla, jazmín, canela, menta y eucalipto. Cada vela tiene 40 horas de duración y viene en elegante envase de vidrio.",
    price: 39.99,
    images: [
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1603905156093-b93d3f0c8da4?w=600&h=600&fit=crop"
    ],
    category: "home",
    stock: 54,
    rating: 4.7,
    reviewCount: 203
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(product => product.category === categoryId);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getBestsellers = (): Product[] => {
  return products.filter(product => product.bestseller);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    product =>
      product.title.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
  );
};

export const filterProducts = (
  categoryId?: string,
  minPrice?: number,
  maxPrice?: number
): Product[] => {
  return products.filter(product => {
    const matchesCategory = !categoryId || product.category === categoryId;
    const matchesMinPrice = !minPrice || product.price >= minPrice;
    const matchesMaxPrice = !maxPrice || product.price <= maxPrice;
    return matchesCategory && matchesMinPrice && matchesMaxPrice;
  });
};
