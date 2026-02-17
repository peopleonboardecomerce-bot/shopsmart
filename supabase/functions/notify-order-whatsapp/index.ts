import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to read the order and check/update notification status
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, items, shipping_address, user_id, status, payment_status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the order belongs to this user
    if (order.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shippingAddr = order.shipping_address as any;

    // Only send for whatsapp delivery method with a phone number
    if (shippingAddr?.delivery_method !== "whatsapp" || !shippingAddr?.phone) {
      return new Response(JSON.stringify({ skipped: true, reason: "Not a whatsapp delivery order" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if notification was already sent (stored in shipping_address)
    if (shippingAddr?.whatsapp_notified) {
      return new Response(JSON.stringify({ skipped: true, reason: "Already notified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send WhatsApp via the send-whatsapp function
    const whatsappResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          customerPhone: shippingAddr.phone,
          customerName: shippingAddr.fullName || "Cliente",
          items: order.items,
        }),
      }
    );

    const whatsappResult = await whatsappResponse.json();

    if (whatsappResponse.ok && whatsappResult.success) {
      // Mark as notified so we don't send again
      await supabaseAdmin
        .from("orders")
        .update({
          shipping_address: { ...shippingAddr, whatsapp_notified: true },
        })
        .eq("id", orderId);

      return new Response(JSON.stringify({ success: true, messageSid: whatsappResult.messageSid }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.error("WhatsApp send failed:", whatsappResult);
    return new Response(JSON.stringify({ error: "Failed to send WhatsApp", details: whatsappResult }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-order-whatsapp error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
