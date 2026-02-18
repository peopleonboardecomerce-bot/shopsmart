import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useProducts";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  images: string[];
  category_id: string;
  stock: number;
  rating: number | null;
  reviews_count: number | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  created_at: string;
}

const emptyProduct = {
  title: "",
  description: "",
  price: 0,
  original_price: null as number | null,
  images: [] as string[],
  category_id: "",
  stock: 0,
  rating: null as number | null,
  reviews_count: null as number | null,
  is_featured: false,
  is_bestseller: false,
};

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const { categories } = useCategories();

  const categoriesById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.id, c.name);
    return map;
  }, [categories]);

  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar productos");
      console.error(error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData(emptyProduct);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || "",
      price: product.price,
      original_price: product.original_price,
      images: product.images || [],
      category_id: product.category_id,
      stock: product.stock,
      rating: product.rating,
      reviews_count: product.reviews_count,
      is_featured: product.is_featured || false,
      is_bestseller: product.is_bestseller || false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category_id || formData.price <= 0) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setSaving(true);

    const productData = {
      title: formData.title,
      description: formData.description || null,
      price: formData.price,
      original_price: formData.original_price || null,
      images: formData.images,
      category_id: formData.category_id,
      stock: formData.stock,
      rating: formData.rating,
      reviews_count: formData.reviews_count,
      is_featured: formData.is_featured,
      is_bestseller: formData.is_bestseller,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);

      if (error) {
        toast.error("Error al actualizar producto");
        console.error(error);
      } else {
        toast.success("Producto actualizado");
        setDialogOpen(false);
        fetchProducts();
      }
    } else {
      const { error } = await supabase.from("products").insert(productData);

      if (error) {
        toast.error("Error al crear producto");
        console.error(error);
      } else {
        toast.success("Producto creado");
        setDialogOpen(false);
        fetchProducts();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar producto");
      console.error(error);
    } else {
      toast.success("Producto eliminado");
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold truncate">
            Productos
          </h1>
          <p className="text-sm text-muted-foreground">
            Crea, edita y administra tus productos.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Productooooo
            </Button>
          </DialogTrigger>

          {/* ✅ Responsive dialog: full width on mobile + internal scroll */}
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90svh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Top: title + category */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Nombre del producto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Describe el producto (opcional)"
                />
              </div>

              {/* Price / Original / Stock */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Precio Original</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={formData.original_price ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        original_price: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      })
                    }
                    placeholder="(opcional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    inputMode="numeric"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Rating / reviews */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rating">Puntuación (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    inputMode="decimal"
                    value={formData.rating ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="Ej: 4.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviews_count">Número de reseñas</Label>
                  <Input
                    id="reviews_count"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={formData.reviews_count ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reviews_count: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    placeholder="Ej: 150"
                  />
                </div>
              </div>

              {/* Images uploader */}
              <div className="space-y-2">
                <Label>Imágenes del producto</Label>
                <ProductImageUploader
                  images={formData.images}
                  onChange={(images) => setFormData({ ...formData, images })}
                />
              </div>

              {/* Switches: stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                <div className="flex items-center justify-between sm:justify-start gap-3 rounded-lg border p-3 sm:p-0 sm:border-0">
                  <div className="min-w-0">
                    <Label htmlFor="featured" className="cursor-pointer">
                      Destacado
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Se mostrará como producto destacado.
                    </p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_featured: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-3 rounded-lg border p-3 sm:p-0 sm:border-0">
                  <div className="min-w-0">
                    <Label htmlFor="bestseller" className="cursor-pointer">
                      Más vendido
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Se mostrará como “más vendido”.
                    </p>
                  </div>
                  <Switch
                    id="bestseller"
                    checked={formData.is_bestseller}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_bestseller: checked })
                    }
                  />
                </div>
              </div>

              {/* Actions: stack on mobile */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingProduct ? "Guardar cambios" : "Crear producto"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No hay productos todavía.</p>
          <Button onClick={openCreateDialog} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Crear primer producto
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          {/* ✅ Mobile-friendly: horizontal scroll for table */}
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Imagen</TableHead>
                  <TableHead className="min-w-[260px]">Título</TableHead>
                  <TableHead className="min-w-[220px]">Categoría</TableHead>
                  <TableHead className="w-[140px]">Precio</TableHead>
                  <TableHead className="w-[120px]">Stock</TableHead>
                  <TableHead className="w-[120px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="font-medium">
                      <span className="block max-w-[360px] truncate">
                        {product.title}
                      </span>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {categoriesById.get(product.category_id) || "-"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      €{product.price.toFixed(2)}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {product.stock}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                          aria-label="Editar producto"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ✅ Hint for small screens */}
          <div className="px-4 py-3 text-xs text-muted-foreground border-t sm:hidden">
            Deslizá horizontalmente para ver toda la tabla.
          </div>
        </div>
      )}
    </div>
  );
};
