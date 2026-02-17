import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  productType: string;
}

export function useShippingRates() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async (postalCode: string) => {
    if (!postalCode || postalCode.length < 4) {
      setRates([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "correo-argentino?action=rates",
        {
          body: {
            postalCodeDestination: postalCode,
          },
        }
      );

      if (fnError) throw new Error("Error al cotizar envío");

      const parsed: ShippingRate[] = [];

      // API returns { rates: [...] }
      const ratesList = data?.rates || (Array.isArray(data) ? data : []);
      ratesList.forEach((rate: any) => {
        parsed.push({
          id: rate.productType || `rate-${parsed.length}`,
          name: rate.productName || "Envío Correo Argentino",
          price: typeof rate.price === "number" ? rate.price : parseFloat(rate.price || "0"),
          deliveryTime: rate.deliveryTimeMin && rate.deliveryTimeMax
            ? `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días hábiles`
            : rate.deliveryTime || "3-7 días hábiles",
          productType: rate.productType || "standard",
        });
      });

      setRates(parsed);

      if (parsed.length === 0) {
        setError("No se encontraron opciones de envío para ese código postal");
      }
    } catch (err: any) {
      console.error("Error fetching shipping rates:", err);
      setError(err.message || "Error al cotizar envío");
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  return { rates, loading, error, fetchRates };
}
