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

    const { items, shippingAddress, total, shippingCost, deliveryMethod, shippingNote } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Payment not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the order first using service role to get the order ID
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const externalReference = crypto.randomUUID();

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        items,
        total,
        status: "pending",
        payment_status: "pending",
        external_reference: externalReference,
        shipping_address: deliveryMethod !== "pickup" ? {
          ...shippingAddress,
          delivery_method: deliveryMethod,
          shipping_note: shippingNote || null,
        } : null,
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("Error creating order");
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build Mercado Pago preference
    const preferenceItems = items.map((item: any) => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: Number(item.price),
      currency_id: "ARS",
    }));

    // Add shipping as an item if applicable
    if ((deliveryMethod === "shipping" || deliveryMethod === "whatsapp") && shippingCost > 0) {
      preferenceItems.push({
        title: "Envío",
        quantity: 1,
        unit_price: Number(shippingCost),
        currency_id: "ARS",
      });
    }

    const siteUrl = req.headers.get("origin") || "https://id-preview--0760985d-a981-444f-a6a2-deac77def744.lovable.app";

    const preference = {
      items: preferenceItems,
      external_reference: externalReference,
      back_urls: {
        success: `${siteUrl}/checkout/result?status=success&order=${order.id}`,
        failure: `${siteUrl}/checkout/result?status=failure&order=${order.id}`,
        pending: `${siteUrl}/checkout/result?status=pending&order=${order.id}`,
      },
      auto_return: "approved",
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      await mpResponse.text();
      console.error("MP preference error:", mpResponse.status);

      // Rollback: delete the order
      await supabaseAdmin.from("orders").delete().eq("id", order.id);

      return new Response(JSON.stringify({ error: "Failed to create payment" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mpData = await mpResponse.json();

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        sandbox_init_point: mpData.sandbox_init_point,
        order_id: order.id,
        external_reference: externalReference,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Create preference error");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
