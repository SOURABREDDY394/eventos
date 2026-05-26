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

function isWeakDescription(description: string, prompt: string) {
  const normalizedDescription = description.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const normalizedPrompt = prompt.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return (
    description.length < 110 ||
    normalizedDescription === normalizedPrompt ||
    /^.+\s+event\s+(on|at)\s+.+$/i.test(description) ||
    !/[.!?].+[.!?]/s.test(description)
  );
}

function generatedDescriptionFor(draft: {
  title: string;
  category: string;
  event_date: string;
  city: string;
  venue: string;
  max_participants: number;
}) {
  const title = draft.title || "This event";
  const category = draft.category.toLowerCase();
  const participantText = draft.max_participants > 0 ? ` for up to ${draft.max_participants} participants` : "";
  const cityText = draft.city ? ` in ${draft.city}` : "";
  const venueText = draft.venue && draft.venue !== "To be announced" ? ` at ${draft.venue}` : "";

  if (category.includes("gaming") || category.includes("esports") || /\b(pubg|bgmi|free fire|esports)\b/i.test(title)) {
    return `${title} is a competitive gaming event${participantText}${cityText}${venueText}, built around structured matches, fair play, and an organized player experience. Participants submit registrations for organizer approval, and approved players receive event access details for check-in. Winners, attendance, and participation can later be verified through EventOS certificates and Proof Passport records.`;
  }

  if (category.includes("ai") || category.includes("technology") || /\b(ai|workshop|machine learning|tech)\b/i.test(title)) {
    return `${title} is a hands-on learning event${participantText}${cityText}${venueText}, designed for participants who want a focused and practical experience. Registrations require organizer approval, approved attendees receive QR-based access, and verified attendance can be used for certificates and Proof Passport records.`;
  }

  if (category.includes("hackathon") || /\bhackathon\b/i.test(title)) {
    return `${title} is a build-focused event${participantText}${cityText}${venueText}, where participants work on ideas, prototypes, and problem-solving under a structured event flow. Applications are reviewed by the organizer, approved participants receive check-in access, and verified participation can become certificates and Proof Passport records.`;
  }

  return `${title} is an organized event${participantText}${cityText}${venueText}, with registration approval, check-in management, and participant verification handled through EventOS. Approved attendees receive event access details, and verified participation can later support certificates and Proof Passport records.`;
}

function normalizeDraft(value: Record<string, unknown>, prompt: string): GenerateEventDraftResponse {
  const title = normalizeString(value.title);
  const category = normalizeString(value.category);
  const event_date = normalizeDate(value.event_date);
  const venue = normalizeString(value.venue) || "To be announced";
  const city = normalizeString(value.city);
  const max_participants = Math.max(0, Number(value.max_participants) || 0);
  const rawDescription = normalizeString(value.description);
  const description = isWeakDescription(rawDescription, prompt)
    ? generatedDescriptionFor({ title, category, event_date, city, venue, max_participants })
    : rawDescription;

  return {
    title,
    category,
    description,
    event_date,
    start_time: normalizeTime(value.start_time, "10:00"),
    end_time: normalizeTime(value.end_time, "16:00"),
    venue,
    city,
    max_participants,
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
            "You are EventOS AI, an event setup assistant. Convert the organizer's natural-language event idea into a structured event draft. Return only valid JSON. Do not include markdown. Do not invent specific city/venue unless provided. Use reasonable defaults only when missing. Preserve the user's event intent. The description must be original, polished, and useful: write 2-3 complete sentences explaining the event experience, registration approval, check-in/proof/certificates where relevant. Never echo the user's short prompt as the description. Interpret natural dates using currentDate and timezone. If venue is missing, use To be announced. If city is missing, use an empty string. If time is missing, use 10:00 and 16:00. If seats are missing, use 50 for gaming/esports, 100 for workshops/general events, and 200 for hackathons.",
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
    return jsonResponse(normalizeDraft(parsed, prompt));
  } catch {
    return jsonResponse(
      { error: "Groq returned non-JSON content.", raw: content },
      502,
    );
  }
});
