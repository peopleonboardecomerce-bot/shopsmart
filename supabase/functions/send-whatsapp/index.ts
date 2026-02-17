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
    const { orderId, customerPhone, customerName, items, customMessage } = await req.json();

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (!accountSid || !authToken || !twilioNumber) {
      console.error("Twilio credentials not configured");
      return new Response(
        JSON.stringify({ error: "Twilio not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use custom message if provided, otherwise build the default customer message
    let message: string;
    if (customMessage) {
      message = customMessage;
    } else {
      const itemsList = items
        ?.map((i: any) => `• ${i.title} x${i.quantity} - $${i.price}`)
        .join("\n") || "Ver detalle en la tienda";
      message = `¡Hola ${customerName}! 🎉\n\nTu compra fue aprobada. Número de orden: *${orderId}*\n\nProductos:\n${itemsList}\n\nNos pondremos en contacto para coordinar el envío y el costo final. ¡Gracias por tu compra!`;
    }

    // Ensure phone has whatsapp: prefix
    const toNumber = customerPhone.startsWith("whatsapp:")
      ? customerPhone
      : `whatsapp:${customerPhone}`;

    const fromNumber = twilioNumber.startsWith("whatsapp:")
      ? twilioNumber
      : `whatsapp:${twilioNumber}`;

    // Send via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const body = new URLSearchParams({
      To: toNumber,
      From: fromNumber,
      Body: message,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const result = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", result);
      return new Response(
        JSON.stringify({ error: "Failed to send WhatsApp", details: result }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("WhatsApp sent successfully, SID:", result.sid);

    return new Response(
      JSON.stringify({ success: true, messageSid: result.sid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Send WhatsApp error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
