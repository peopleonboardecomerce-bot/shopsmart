import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, MessageCircle } from "lucide-react";
import { useShippingConfig } from "@/hooks/useShippingConfig";
import { supabase } from "@/integrations/supabase/client";

const CheckoutResultPage = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("order");
  const shippingConfig = useShippingConfig();
  const notifiedRef = useRef(false);

  // Fallback: trigger WhatsApp notification from client when payment succeeds
  useEffect(() => {
    if (status === "success" && orderId && !notifiedRef.current) {
      notifiedRef.current = true;
      supabase.functions
        .invoke("notify-order-whatsapp", {
          body: { orderId },
        })
        .then(({ data, error }) => {
          if (error) console.error("Fallback WhatsApp notify error:", error);
          else console.log("Fallback WhatsApp notify result:", data);
        });
    }
  }, [status, orderId]);

  const config = {
    success: {
      icon: CheckCircle,
      iconClass: "text-green-600",
      bgClass: "bg-green-100",
      title: "¡Pago aprobado!",
      description:
        shippingConfig.mode === "manual"
          ? "Tu pedido ha sido procesado correctamente. Nos contactaremos por WhatsApp para coordinar el envío y el costo final."
          : "Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación con los detalles de tu compra.",
    },
    pending: {
      icon: Clock,
      iconClass: "text-yellow-600",
      bgClass: "bg-yellow-100",
      title: "Pago pendiente",
      description:
        "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
    },
    failure: {
      icon: XCircle,
      iconClass: "text-red-600",
      bgClass: "bg-red-100",
      title: "Pago rechazado",
      description:
        "No pudimos procesar tu pago. Por favor, intentá nuevamente con otro medio de pago.",
    },
  };

  const current = config[status as keyof typeof config] || config.failure;
  const Icon = current.icon;

  const whatsappMessage = encodeURIComponent(
    `Hola! Hice una compra con número de orden ${orderId || "N/A"} y quiero coordinar el envío.`,
  );
  const whatsappUrl = `https://wa.me/${shippingConfig.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <Layout>
      <div className="container py-10 sm:py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div
            className={`mx-auto mb-5 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full ${current.bgClass}`}
          >
            <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${current.iconClass}`} />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            {current.title}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground mb-2">
            {current.description}
          </p>

          {orderId && (
            <p className="text-sm text-muted-foreground mb-6 sm:mb-8 break-words">
              Nº de pedido:{" "}
              <span className="font-mono">
                {orderId.slice(0, 8)}...
              </span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {status === "success" && shippingConfig.mode === "manual" && (
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Coordinar envío
                </a>
              </Button>
            )}

            <Button
              asChild
              className="w-full sm:w-auto"
              variant={
                status === "success" && shippingConfig.mode === "manual"
                  ? "outline"
                  : "default"
              }
            >
              <Link to="/products">Seguir comprando</Link>
            </Button>

            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutResultPage;
