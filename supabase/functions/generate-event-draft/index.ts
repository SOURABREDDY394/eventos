type GenerateEventDraftRequest = {
  prompt?: string;
  currentDate?: string;
  timezone?: string;
};

type RegistrationField = {
  label: string;
  field_type: "text" | "textarea" | "number" | "email" | "phone" | "select" | "checkbox";
  required: boolean;
  options: string[];
};

type VolunteerRole = {
  role: string;
  description: string;
};

type SponsorPackage = {
  title: string;
  description: string;
  benefits: string[];
};

type BudgetCategory = {
  type: "income" | "expense";
  title: string;
};

type GenerateEventDraftResponse = {
  title: string;
  category: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  city: string;
  max_participants: number;
  registration_fields: RegistrationField[];
  volunteer_roles: VolunteerRole[];
  sponsor_packages: SponsorPackage[];
  budget_categories: BudgetCategory[];
  certificate_enabled: boolean;
  warnings: string[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedFieldTypes = new Set([
  "text",
  "textarea",
  "number",
  "email",
  "phone",
  "select",
  "checkbox",
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTime(value: unknown, fallback: string) {
  const raw = normalizeString(value);
  return /^\d{2}:\d{2}$/.test(raw) ? raw : fallback;
}

function normalizeDate(value: unknown) {
  const raw = normalizeString(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
}

function normalizeRegistrationFields(value: unknown): RegistrationField[] {
  const rows = Array.isArray(value) ? value : [];
  const normalized = rows
    .map((field) => {
      const source = field as Record<string, unknown>;
      const fieldType = normalizeString(source.field_type);
      return {
        label: normalizeString(source.label),
        field_type: allowedFieldTypes.has(fieldType) ? fieldType as RegistrationField["field_type"] : "text",
        required: Boolean(source.required),
        options: Array.isArray(source.options) ? source.options.map(String) : [],
      };
    })
    .filter((field) => field.label);

  if (normalized.length > 0) return normalized;

  return [
    { label: "Full Name", field_type: "text", required: true, options: [] },
    { label: "Email", field_type: "email", required: true, options: [] },
    { label: "Phone Number", field_type: "phone", required: true, options: [] },
    { label: "College / Organization", field_type: "text", required: false, options: [] },
    { label: "Why do you want to attend?", field_type: "textarea", required: false, options: [] },
  ];
}

function normalizeDraft(value: Record<string, unknown>): GenerateEventDraftResponse {
  return {
    title: normalizeString(value.title),
    category: normalizeString(value.category),
    description: normalizeString(value.description),
    event_date: normalizeDate(value.event_date),
    start_time: normalizeTime(value.start_time, "10:00"),
    end_time: normalizeTime(value.end_time, "16:00"),
    venue: normalizeString(value.venue) || "To be announced",
    city: normalizeString(value.city),
    max_participants: Math.max(0, Number(value.max_participants) || 0),
    registration_fields: normalizeRegistrationFields(value.registration_fields),
    volunteer_roles: (Array.isArray(value.volunteer_roles) ? value.volunteer_roles : [])
      .map((role) => {
        const source = role as Record<string, unknown>;
        return {
          role: normalizeString(source.role),
          description: normalizeString(source.description),
        };
      })
      .filter((role) => role.role),
    sponsor_packages: (Array.isArray(value.sponsor_packages) ? value.sponsor_packages : [])
      .map((pkg) => {
        const source = pkg as Record<string, unknown>;
        return {
          title: normalizeString(source.title),
          description: normalizeString(source.description),
          benefits: Array.isArray(source.benefits) ? source.benefits.map(String) : [],
        };
      })
      .filter((pkg) => pkg.title),
    budget_categories: (Array.isArray(value.budget_categories) ? value.budget_categories : [])
      .map((category) => {
        const source = category as Record<string, unknown>;
        const type = normalizeString(source.type);
        return {
          type: type === "income" ? "income" : "expense",
          title: normalizeString(source.title),
        } as BudgetCategory;
      })
      .filter((category) => category.title),
    certificate_enabled: value.certificate_enabled !== false,
    warnings: Array.isArray(value.warnings) ? value.warnings.map(String).filter(Boolean) : [],
  };
}

function buildUserPrompt(input: Required<GenerateEventDraftRequest>) {
  return `The user prompt is:
${input.prompt}

Current date:
${input.currentDate}

Timezone:
${input.timezone}

Return only JSON with this schema:
{
  "title": "string",
  "category": "string",
  "description": "string",
  "event_date": "YYYY-MM-DD or empty string",
  "start_time": "HH:mm",
  "end_time": "HH:mm",
  "venue": "string",
  "city": "string",
  "max_participants": number,
  "registration_fields": [
    {
      "label": "string",
      "field_type": "text | textarea | number | email | phone | select | checkbox",
      "required": boolean,
      "options": []
    }
  ],
  "volunteer_roles": [
    {
      "role": "string",
      "description": "string"
    }
  ],
  "sponsor_packages": [
    {
      "title": "string",
      "description": "string",
      "benefits": []
    }
  ],
  "budget_categories": [
    {
      "type": "income | expense",
      "title": "string"
    }
  ],
  "certificate_enabled": boolean,
  "warnings": []
}`;
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

  let input: GenerateEventDraftRequest;
  try {
    input = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const prompt = normalizeString(input.prompt);
  const currentDate = normalizeDate(input.currentDate);
  const timezone = normalizeString(input.timezone) || "Asia/Kolkata";

  if (!prompt) {
    return jsonResponse({ error: "Prompt is required." }, 400);
  }

  if (!currentDate) {
    return jsonResponse({ error: "currentDate must be YYYY-MM-DD." }, 400);
  }

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
          content:
            "You are EventOS AI, an event setup assistant. Convert the organizer's natural-language event idea into a structured event draft. Return only valid JSON. Do not include markdown. Do not invent specific city/venue unless provided. Use reasonable defaults only when missing. Preserve the user's event intent. Interpret natural dates using currentDate and timezone. If venue is missing, use To be announced. If city is missing, use an empty string. If time is missing, use 10:00 and 16:00. If seats are missing, use 50 for gaming/esports, 100 for workshops/general events, and 200 for hackathons.",
        },
        { role: "user", content: buildUserPrompt({ prompt, currentDate, timezone }) },
      ],
      temperature: 0.2,
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
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return jsonResponse(normalizeDraft(parsed));
  } catch {
    return jsonResponse(
      { error: "Groq returned non-JSON content.", raw: content },
      502,
    );
  }
});
