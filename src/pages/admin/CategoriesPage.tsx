import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  created_at: string;
}

const emptyCategory = {
  name: "",
  description: "",
  image: "",
};

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      toast.error("Error al cargar categorías");
      console.error(error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData(emptyCategory);
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setSaving(true);

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      image: formData.image.trim() || null,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", editingCategory.id);

      if (error) {
        toast.error("Error al actualizar categoría");
        console.error(error);
      } else {
        toast.success("Categoría actualizada");
        setDialogOpen(false);
        fetchCategories();
      }
    } else {
      const { error } = await supabase.from("categories").insert(categoryData);

      if (error) {
        toast.error("Error al crear categoría");
        console.error(error);
      } else {
        toast.success("Categoría creada");
        setDialogOpen(false);
        fetchCategories();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar categoría");
      console.error(error);
    } else {
      toast.success("Categoría eliminada");
      fetchCategories();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold truncate">
            Categorías
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra las categorías de tu tienda.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>

          {/* ✅ Responsive dialog: full width on mobile, max width on desktop */}
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nombre de la categoría"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Descripción de la categoría"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de imagen</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* ✅ Buttons stack on mobile */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
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
                  {saving && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingCategory ? "Guardar cambios" : "Crear categoría"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No hay categorías todavía.</p>
          <Button onClick={openCreateDialog} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Crear primera categoría
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          {/* ✅ Mobile: horizontal scroll only for table */}
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[96px]">Imagen</TableHead>
                  <TableHead className="min-w-[200px]">Nombre</TableHead>
                  <TableHead className="min-w-[280px]">Descripción</TableHead>
                  <TableHead className="w-[120px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <FolderOpen className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="font-medium">
                      <span className="block max-w-[260px] truncate">
                        {category.name}
                      </span>
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      <span className="block max-w-[380px] truncate">
                        {category.description || "-"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                          aria-label="Editar categoría"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
                          aria-label="Eliminar categoría"
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

          {/* ✅ Small helper text on mobile */}
          <div className="px-4 py-3 text-xs text-muted-foreground border-t sm:hidden">
            Deslizá horizontalmente para ver toda la tabla.
          </div>
        </div>
      )}
    </div>
  );
};
