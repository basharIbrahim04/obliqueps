import { Resend } from "npm:resend@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OWNER_EMAIL = "figurifyps@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendKey);
    const body = await req.json();
    const {
      customerName, customerEmail, customerPhone,
      fileName, fileSize, material, color,
      infill, layerHeight, wallThickness, supports,
      estimatedWeight, estimatedTime, estimatedCost,
      priority, location, address, notes,
    } = body;

    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #e0e0e0; border-radius: 12px;">
        <h1 style="color: #00e5ff; border-bottom: 2px solid #00e5ff; padding-bottom: 10px;">🖨️ New 3D Print Order</h1>
        
        <h2 style="color: #00e5ff; margin-top: 20px;">Customer Info</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #888;">Name</td><td style="padding: 6px 0;">${customerName}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Email</td><td style="padding: 6px 0;">${customerEmail}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Phone</td><td style="padding: 6px 0;">${customerPhone || "N/A"}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Location</td><td style="padding: 6px 0;">${location}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Address</td><td style="padding: 6px 0;">${address || "N/A"}</td></tr>
        </table>

        <h2 style="color: #00e5ff; margin-top: 20px;">Print Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #888;">File</td><td style="padding: 6px 0;">${fileName} (${fileSizeMB} MB)</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Material</td><td style="padding: 6px 0;">${material} — ${color}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Infill</td><td style="padding: 6px 0;">${infill}%</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Layer Height</td><td style="padding: 6px 0;">${layerHeight}mm</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Wall Thickness</td><td style="padding: 6px 0;">${wallThickness}mm</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Supports</td><td style="padding: 6px 0;">${supports ? "Yes" : "No"}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Priority</td><td style="padding: 6px 0;">${priority}</td></tr>
        </table>

        <h2 style="color: #00e5ff; margin-top: 20px;">Estimate</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #888;">Weight</td><td style="padding: 6px 0;">${estimatedWeight}g</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Print Time</td><td style="padding: 6px 0;">${estimatedTime}</td></tr>
          <tr><td style="padding: 6px 0; color: #888; font-weight: bold;">Total Cost</td><td style="padding: 6px 0; font-size: 18px; color: #00e5ff; font-weight: bold;">₪${Number(estimatedCost).toFixed(2)}</td></tr>
        </table>

        ${notes ? `<h2 style="color: #00e5ff; margin-top: 20px;">Notes</h2><p>${notes}</p>` : ""}
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: "Oblique 3D <onboarding@resend.dev>",
      to: [OWNER_EMAIL],
      subject: `New Order: ${fileName} — ₪${Number(estimatedCost).toFixed(2)}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
