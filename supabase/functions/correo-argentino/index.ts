import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE = "https://api.correoargentino.com.ar/micorreo/v1";

// Cache token in memory (lives per cold start)
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const email = Deno.env.get("MICORREO_EMAIL");
  const password = Deno.env.get("MICORREO_PASSWORD");

  if (!email || !password) {
    throw new Error("MiCorreo credentials not configured");
  }

  const credentials = btoa(`${email}:${password}`);
  const res = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: { "Authorization": `Basic ${credentials}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MiCorreo auth failed [${res.status}]: ${text}`);
  }

  const data = await res.json();
  cachedToken = data.token;
  // Expire 5 min before actual expiry to be safe
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  return cachedToken!;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "rates") {
      return await handleRates(req);
    } else if (action === "import") {
      return await handleImport(req);
    } else if (action === "tracking") {
      return await handleTracking(req);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use: rates, import, tracking" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Correo Argentino error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleRates(req: Request) {
  const body = await req.json();
  const { postalCodeOrigin, postalCodeDestination, weight, dimensions } = body;

  if (!postalCodeDestination) {
    throw new Error("postalCodeDestination is required");
  }

  const customerId = Deno.env.get("MICORREO_CUSTOMER_ID");
  if (!customerId) throw new Error("MICORREO_CUSTOMER_ID not configured");

  const token = await getToken();

  const rateBody: Record<string, any> = {
    customerId,
    postalCodeOrigin: postalCodeOrigin || "1000",
    postalCodeDestination,
    dimensions: {
      weight: dimensions?.weight || weight || 1000,
      height: dimensions?.height || 10,
      width: dimensions?.width || 10,
      length: dimensions?.length || 10,
    },
  };

  const res = await fetch(`${API_BASE}/rates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(rateBody),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Rates error:", res.status, text);
    throw new Error(`Error al cotizar envío [${res.status}]`);
  }

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleImport(req: Request) {
  // Validate auth - only authenticated users or service role
  const authHeader = req.headers.get("authorization");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.json();
  const { orderId, shipmentData } = body;

  const customerId = Deno.env.get("MICORREO_CUSTOMER_ID");
  if (!customerId) throw new Error("MICORREO_CUSTOMER_ID not configured");

  const token = await getToken();

  const importBody = {
    customerId,
    ...shipmentData,
  };

  const res = await fetch(`${API_BASE}/shipping/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(importBody),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Import error:", res.status, text);
    throw new Error(`Error al importar envío [${res.status}]`);
  }

  const data = await res.json();

  // Save tracking info to the order
  if (orderId && data.trackingNumber) {
    await supabase
      .from("orders")
      .update({
        shipping_tracking: data.trackingNumber,
        shipping_provider: "correo_argentino",
      })
      .eq("id", orderId);
  }

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleTracking(req: Request) {
  const url = new URL(req.url);
  const trackingNumber = url.searchParams.get("tracking");

  if (!trackingNumber) {
    return new Response(
      JSON.stringify({ error: "tracking parameter required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const token = await getToken();

  const res = await fetch(
    `${API_BASE}/shipping/tracking?tracking=${trackingNumber}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Tracking error:", res.status, text);
    throw new Error(`Error al consultar seguimiento [${res.status}]`);
  }

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
