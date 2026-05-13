import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image, mode, cyclePhase, cycleDay } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const skinPrompt = `You are HerSense Vision AI, a dermatological analysis assistant specialized in hormonal skin health.

The user is in their ${cyclePhase} phase, Day ${cycleDay} of their cycle.

Analyze this selfie and provide:
1. **Skin Assessment**: Identify any visible concerns (acne type, dark circles, puffiness, texture)
2. **Hormonal Connection**: Link findings to the current ${cyclePhase} phase
3. **Phase-Specific Advice**: Provide skincare recommendations based on current cycle day sensitivity
4. **What to Avoid**: Ingredients or habits to skip right now

Be specific and reference the cycle phase. Example: "Since you're on Day ${cycleDay}, your skin barrier is thinner than usual."
Format with clear sections using markdown.`;

    const productPrompt = `You are HerSense Vision AI, a skincare ingredient analyzer.

The user is in their ${cyclePhase} phase, Day ${cycleDay} of their cycle.

Analyze this product ingredient list and provide:
1. **Safety Check**: Rate each visible ingredient as Safe ✅, Caution ⚡, or Avoid ❌ for the current phase
2. **Key Warnings**: Highlight any ingredients that are problematic during ${cyclePhase} phase
3. **Phase Context**: Explain WHY certain ingredients are risky right now (e.g., "Retinol + thin menstrual-phase barrier = irritation risk")
4. **Alternative**: Suggest what to use instead

Be specific. Example: "Warning: This contains Retinol. You are in your ${cyclePhase} phase; your skin is more sensitive today. Skip until Day 8."
Format with clear sections using markdown.`;

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: mode === 'skin' ? skinPrompt : productPrompt },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Vision API error:", response.status, t);
      return new Response(JSON.stringify({ error: "Vision analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Analysis complete.";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vision error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
