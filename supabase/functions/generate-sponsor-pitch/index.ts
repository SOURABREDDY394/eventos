type SponsorPitchRequest = {
  eventTitle?: string;
  eventDescription?: string;
  eventDate?: string;
  venue?: string;
  city?: string;
  eventCategory?: string;
  audienceSize?: number;
  sponsorType?: string;
  sponsorGoal?: string;
};

type SponsorPitchResponse = {
  emailPitch: string;
  whatsappPitch: string;
  sponsorPackageSuggestion: string;
  valuePoints: string[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function buildPrompt(input: SponsorPitchRequest) {
  return `You are EventOS, a premium event-tech platform for verified event operations.

Generate sponsor pitch content for this event.

Event details:
- Title: ${input.eventTitle || "Untitled event"}
- Description: ${input.eventDescription || "No description provided"}
- Date: ${input.eventDate || "Not provided"}
- Venue: ${input.venue || "Not provided"}
- City: ${input.city || "Not provided"}
- Category: ${input.eventCategory || "General"}
- Audience size: ${input.audienceSize || "Not provided"}
- Sponsor type/industry: ${input.sponsorType || "Not provided"}
- Sponsor goal: ${input.sponsorGoal || "Not provided"}

Return only valid JSON with this exact shape:
{
  "emailPitch": "professional email pitch",
  "whatsappPitch": "short WhatsApp pitch",
  "sponsorPackageSuggestion": "recommended sponsor package with price/benefits if possible",
  "valuePoints": ["value point 1", "value point 2", "value point 3", "value point 4"]
}

Do not include markdown fences. Do not invent unverifiable metrics. If a detail is missing, phrase it generally instead of fabricating facts.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed. Use POST." }, 405);
  }

  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  if (!groqApiKey) {
    return jsonResponse(
      { error: "GROQ_API_KEY is missing. Add it as a Supabase Edge Function secret." },
      500,
    );
  }

  let input: SponsorPitchRequest;
  try {
    input = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const prompt = buildPrompt(input);

  const model = Deno.env.get("GROQ_MODEL") || "llama-3.3-70b-versatile";

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You generate concise, premium, business-ready event sponsorship pitch copy and return strict JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!groqResponse.ok) {
    const details = await groqResponse.text();
    return jsonResponse(
      { error: "Groq request failed.", details },
      groqResponse.status,
    );
  }

  const groqJson = await groqResponse.json();
  const content = groqJson?.choices?.[0]?.message?.content;

  if (!content) {
    return jsonResponse({ error: "Groq returned an empty response." }, 502);
  }

  try {
    const parsed = JSON.parse(content) as SponsorPitchResponse;
    return jsonResponse(parsed);
  } catch {
    return jsonResponse(
      { error: "Groq returned non-JSON content.", raw: content },
      502,
    );
  }
});
