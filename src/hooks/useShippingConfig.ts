import { useSiteContent } from "@/hooks/useSiteContent";

export interface ShippingConfig {
  mode: "manual" | "api";
  basePrice: number;
  whatsappNumber: string;
  manualLabel: string;
  manualDescription: string;
  isLoading: boolean;
}

export const useShippingConfig = (): ShippingConfig => {
  const { data, isLoading } = useSiteContent("shipping_config");

  return {
    mode: (data?.shipping_mode as "manual" | "api") || "manual",
    basePrice: parseFloat(data?.shipping_base_price || "0"),
    whatsappNumber: data?.shipping_whatsapp_number || "",
    manualLabel: data?.shipping_manual_label || "Envío a coordinar por WhatsApp",
    manualDescription: data?.shipping_manual_description || "El costo de envío se coordina luego de la compra según destino y peso.",
    isLoading,
  };
};
