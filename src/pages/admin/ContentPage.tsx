import { useState, useEffect } from "react";
import {
  useSiteContentAll,
  useUpdateSiteContent,
  SiteContentMap,
} from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero (Banner principal)",
  features: "Características",
  categories_section: "Sección Categorías",
  cta: "Llamada a la acción (CTA)",
  footer: "Pie de página (Footer)",
  shipping: "Métodos de envío",
  shipping_config: "Configuración de Envíos",
};

const FIELD_LABELS: Record<string, string> = {
  badge_text: "Texto del badge",
  title_line1: "Título línea 1",
  title_highlight: "Palabra destacada",
  title_line2: "Título línea 2",
  subtitle: "Subtítulo",
  cta_primary: "Botón principal",
  cta_secondary: "Botón secundario",
  trust_text: "Texto de confianza",
  feature_1_title: "Característica 1 - Título",
  feature_1_description: "Característica 1 - Descripción",
  feature_2_title: "Característica 2 - Título",
  feature_2_description: "Característica 2 - Descripción",
  feature_3_title: "Característica 3 - Título",
  feature_3_description: "Característica 3 - Descripción",
  feature_4_title: "Característica 4 - Título",
  feature_4_description: "Característica 4 - Descripción",
  badge: "Badge",
  title: "Título",
  brand_name: "Nombre de marca",
  brand_description: "Descripción de marca",
  contact_email: "Email de contacto",
  contact_phone: "Teléfono de contacto",
  contact_hours: "Horario de atención",
  method_1_name: "Método 1 - Nombre",
  method_1_price: "Método 1 - Precio",
  method_1_time: "Método 1 - Tiempo",
  method_2_name: "Método 2 - Nombre",
  method_2_price: "Método 2 - Precio",
  method_2_time: "Método 2 - Tiempo",
  method_3_name: "Método 3 - Nombre",
  method_3_price: "Método 3 - Precio",
  method_3_time: "Método 3 - Tiempo",
  shipping_mode: "Modo de envío (manual / api)",
  shipping_base_price: "Precio base de envío ($)",
  shipping_whatsapp_number: "Número de WhatsApp (con código de país)",
  shipping_manual_label: "Nombre del método manual",
  shipping_manual_description: "Descripción del método manual",
};

const LONG_FIELDS = ["subtitle", "brand_description"];

export const ContentPage = () => {
  const { data: allContent, isLoading } = useSiteContentAll();
  const updateMutation = useUpdateSiteContent();
  const [editData, setEditData] = useState<Record<string, SiteContentMap>>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (allContent) {
      setEditData(JSON.parse(JSON.stringify(allContent)));
      setDirty(false);
    }
  }, [allContent]);

  const handleChange = (section: string, key: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!allContent) return;

    const updates: { section: string; key: string; value: string }[] = [];
    for (const section of Object.keys(editData)) {
      for (const key of Object.keys(editData[section])) {
        if (allContent[section]?.[key] !== editData[section][key]) {
          updates.push({ section, key, value: editData[section][key] });
        }
      }
    }

    if (updates.length === 0) {
      toast.info("No hay cambios para guardar");
      return;
    }

    try {
      await updateMutation.mutateAsync(updates);
      toast.success(`${updates.length} campo(s) actualizado(s)`);
      setDirty(false);
    } catch {
      toast.error("Error al guardar los cambios");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sections = Object.keys(SECTION_LABELS);

  return (
    <div className="space-y-6">
      {/* Header responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            Contenido del sitio
          </h1>
          <p className="text-sm text-muted-foreground">
            Edita los textos de la landing page, footer y métodos de envío
          </p>
        </div>

        {/* Button full width on mobile */}
        <Button
          onClick={handleSave}
          disabled={!dirty || updateMutation.isPending}
          className="w-full sm:w-auto"
        >
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar cambios
        </Button>
      </div>

      {/* Tabs: horizontal scroll on mobile */}
      <Tabs defaultValue="hero">
        <div className="w-full overflow-x-auto">
          <TabsList className="inline-flex h-auto w-max gap-1 whitespace-nowrap">
            {sections.map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="text-xs sm:text-sm"
              >
                {SECTION_LABELS[s]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Helpful hint on very small screens */}
        <div className="text-xs text-muted-foreground sm:hidden">
          Deslizá horizontalmente para ver más secciones.
        </div>

        {sections.map((section) => (
          <TabsContent key={section} value={section}>
            <Card className="p-4 sm:p-6">
              {/* Form grid responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {editData[section] &&
                  Object.keys(editData[section])
                    .sort()
                    .map((key) => (
                      <div
                        key={key}
                        className={[
                          "space-y-2 min-w-0",
                          LONG_FIELDS.includes(key)
                            ? "lg:col-span-2"
                            : "",
                        ].join(" ")}
                      >
                        <Label className="block text-sm">
                          {FIELD_LABELS[key] || key}
                        </Label>

                        {LONG_FIELDS.includes(key) ? (
                          <Textarea
                            value={editData[section][key]}
                            onChange={(e) =>
                              handleChange(section, key, e.target.value)
                            }
                            rows={4}
                            className="min-h-[110px]"
                          />
                        ) : (
                          <Input
                            value={editData[section][key]}
                            onChange={(e) =>
                              handleChange(section, key, e.target.value)
                            }
                          />
                        )}
                      </div>
                    ))}
              </div>

              {/* Sticky action bar on mobile (optional UX improvement, no functionality change) */}
              <div className="mt-6 sm:hidden sticky bottom-3">
                <div className="rounded-lg border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 p-3">
                  <Button
                    onClick={handleSave}
                    disabled={!dirty || updateMutation.isPending}
                    className="w-full"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar cambios
                  </Button>
                  {!dirty && (
                    <p className="mt-2 text-xs text-muted-foreground text-center">
                      No hay cambios pendientes.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
