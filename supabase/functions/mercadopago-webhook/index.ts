import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", body.type, body.action);

    // Mercado Pago sends different notification types
    // We care about "payment" type
    if (body.type !== "payment" && body.action !== "payment.updated" && body.action !== "payment.created") {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.error("No payment ID in webhook body");
      return new Response(JSON.stringify({ error: "No payment ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch payment details from Mercado Pago API
    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN not configured");
      return new Response(JSON.stringify({ error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("Mercado Pago API error:", mpResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch payment" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payment = await mpResponse.json();
    console.log("Payment status:", payment.status);

    const externalReference = payment.external_reference;
    if (!externalReference) {
      console.error("No external_reference in payment");
      return new Response(
        JSON.stringify({ error: "No external_reference" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update the order using the service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Map MP status to order status
    let orderStatus = "pending";
    if (payment.status === "approved") orderStatus = "processing";
    else if (payment.status === "rejected") orderStatus = "cancelled";
    else if (payment.status === "in_process") orderStatus = "pending";
    else if (payment.status === "refunded") orderStatus = "cancelled";

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: payment.status,
        payment_id: String(payment.id),
        payment_status_detail: payment.status_detail,
        status: orderStatus,
      })
      .eq("external_reference", externalReference);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update order" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Decrement stock only when payment is approved
    if (payment.status === "approved") {
      const { data: orderData } = await supabase
        .from("orders")
        .select("items, shipping_address, id, total")
        .eq("external_reference", externalReference)
        .single();

      if (orderData?.items && Array.isArray(orderData.items)) {
        for (const item of orderData.items) {
          const { error: stockError } = await supabase.rpc("decrement_stock", {
            product_id: (item as any).product_id,
            quantity: (item as any).quantity,
          });
          if (stockError) {
            console.error("Error decrementing stock:", stockError);
          }
        }
        console.log("Stock decremented for approved payment");
      }

      const shippingAddr = orderData?.shipping_address as any;

      // Send WhatsApp notification to CUSTOMER for manual shipping orders
      if (shippingAddr?.delivery_method === "whatsapp" && shippingAddr?.phone && !shippingAddr?.whatsapp_notified) {
        try {
          const whatsappResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                orderId: orderData.id,
                customerPhone: shippingAddr.phone,
                customerName: shippingAddr.fullName || "Cliente",
                items: orderData.items,
              }),
            }
          );
          const whatsappResult = await whatsappResponse.json();
          console.log("WhatsApp customer notification result:", whatsappResult);

          if (whatsappResponse.ok && whatsappResult.success) {
            await supabase
              .from("orders")
              .update({
                shipping_address: { ...shippingAddr, whatsapp_notified: true },
              })
              .eq("id", orderData.id);
          }
        } catch (waError) {
          console.error("Error sending customer WhatsApp:", waError);
        }
      }

      // Send WhatsApp notification to ADMIN/OWNER about the new sale
      try {
        const { data: adminNumberData } = await supabase
          .from("site_content")
          .select("value")
          .eq("section", "shipping_config")
          .eq("key", "shipping_whatsapp_number")
          .single();

        const adminPhone = adminNumberData?.value;
        if (adminPhone) {
          const itemsList = (orderData?.items as any[])
            ?.map((i: any) => `• ${i.title} x${i.quantity} - $${i.price}`)
            .join("\n") || "Ver detalle en el panel";

          const customerName = shippingAddr?.fullName || "Cliente";
          const adminMessage = `🛒 *Nueva venta aprobada*\n\nOrden: *${orderData?.id?.slice(0, 8)}...*\nCliente: ${customerName}\nTotal: $${orderData?.total}\n\nProductos:\n${itemsList}\n\nRevisá el panel de administración para más detalles.`;

          const whatsappResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                orderId: orderData?.id,
                customerPhone: adminPhone,
                customerName: "Admin",
                items: orderData?.items,
                customMessage: adminMessage,
              }),
            }
          );
          const adminResult = await whatsappResponse.json();
          console.log("WhatsApp admin notification result:", adminResult);
        } else {
          console.log("No admin WhatsApp number configured, skipping admin notification");
        }
      } catch (adminWaError) {
        console.error("Error sending admin WhatsApp:", adminWaError);
      }
    }

    console.log("Order updated successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
