import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useShippingRates, ShippingRate } from "@/hooks/useShippingRates";
import { z } from "zod";

export const shippingSchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  address: z.string().min(5, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  postalCode: z.string().min(4, "Código postal requerido"),
  phone: z.string().min(9, "Teléfono requerido"),
  shippingMethod: z.string().min(1, "Selecciona un método de envío"),
});

export type ShippingData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  data: ShippingData;
  errors: Record<string, string>;
  onChange: (data: ShippingData) => void;
  onShippingCostChange?: (cost: number) => void;
}

export const ShippingForm = ({ data, errors, onChange, onShippingCostChange }: ShippingFormProps) => {
  const { rates, loading: ratesLoading, error: ratesError, fetchRates } = useShippingRates();

  const handlePostalCodeBlur = () => {
    if (data.postalCode.length >= 4) {
      fetchRates(data.postalCode);
    }
  };

  const handleQuote = () => {
    if (data.postalCode.length >= 4) {
      fetchRates(data.postalCode);
    }
  };

  const handleMethodChange = (value: string) => {
    onChange({ ...data, shippingMethod: value });
    const selected = rates.find((r) => r.id === value);
    if (selected && onShippingCostChange) {
      onShippingCostChange(selected.price);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            placeholder="Juan García"
          />
          {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+54 11 1234-5678"
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          placeholder="Av. Corrientes 1234, Piso 2B"
        />
        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ciudad</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            placeholder="Buenos Aires"
          />
          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Código postal</Label>
          <div className="flex gap-2">
            <Input
              id="postalCode"
              value={data.postalCode}
              onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
              onBlur={handlePostalCodeBlur}
              placeholder="1000"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleQuote}
              disabled={data.postalCode.length < 4 || ratesLoading}
            >
              {ratesLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
        </div>
      </div>

      {/* Shipping Methods from Correo Argentino */}
      <div className="space-y-3">
        <Label>Método de envío</Label>

        {ratesLoading && (
          <div className="flex items-center gap-2 p-4 border border-border rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cotizando con Correo Argentino...</span>
          </div>
        )}

        {ratesError && (
          <p className="text-sm text-destructive">{ratesError}</p>
        )}

        {rates.length === 0 && !ratesLoading && !ratesError && (
          <p className="text-sm text-muted-foreground">
            Ingresá tu código postal para ver las opciones de envío disponibles.
          </p>
        )}

        {rates.length > 0 && (
          <RadioGroup
            value={data.shippingMethod}
            onValueChange={handleMethodChange}
          >
            {rates.map((rate) => (
              <div
                key={rate.id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
                  data.shippingMethod === rate.id ? "border-primary bg-accent/50" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={rate.id} id={rate.id} />
                  <Label htmlFor={rate.id} className="cursor-pointer">
                    <p className="font-medium">{rate.name}</p>
                    <p className="text-sm text-muted-foreground">{rate.deliveryTime}</p>
                  </Label>
                </div>
                <span className="font-medium">${rate.price.toFixed(2)}</span>
              </div>
            ))}
          </RadioGroup>
        )}

        {errors.shippingMethod && (
          <p className="text-sm text-destructive">{errors.shippingMethod}</p>
        )}
      </div>
    </div>
  );
};
