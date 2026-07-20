/*
 * Background function: generates a full draft FRA with Claude, then writes the
 * result back into the assessment's generated_report field in Supabase.
 *
 * Because this is a *-background function, Netlify returns an immediate 202 to
 * the browser and keeps running (up to 15 minutes). The browser therefore does
 * NOT receive the draft directly — it polls Supabase for generated_report.status.
 *
 * Required environment variables (set in Netlify → Site settings → Environment):
 *   ANTHROPIC_API_KEY          - Anthropic API key
 *   SUPABASE_URL               - e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY  - service-role key (server-side only, never in the browser)
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Write a generated_report object onto an assessment row via the PostgREST API.
async function writeReport(assessmentId, report) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase env vars missing; cannot persist report.");
    return;
  }

  const endpoint =
    `${SUPABASE_URL}/rest/v1/assessments?id=eq.${encodeURIComponent(assessmentId)}`;

  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ generated_report: report }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Failed to write report to Supabase:", res.status, detail);
  } else {
    console.log("Report written to assessment:", assessmentId);
  }
}

exports.handler = async (event) => {
  // Parse the incoming assessment first so we know which row to update on error.
  let assessment;
  try {
    const parsed = JSON.parse(event.body || "{}");
    assessment = parsed.assessment;
  } catch {
    console.error("Invalid JSON body");
    return { statusCode: 400 };
  }

  if (!assessment || !assessment.id) {
    console.error("Missing assessment or assessment.id");
    return { statusCode: 400 };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    await writeReport(assessment.id, {
      status: "error",
      error: "Missing ANTHROPIC_API_KEY",
      updatedAt: new Date().toISOString(),
    });
    return { statusCode: 500 };
  }

  const systemPrompt = `
You are an expert United Kingdom Fire Risk Assessor.

Draft a complete Fire Risk Assessment using the supplied assessment information and all uploaded photographs.

The assessor remains responsible for reviewing, editing and approving the final report.

Do not invent facts. Clearly identify missing or uncertain information.

Use professional UK fire-risk-assessment terminology and PAS 79 methodology.

Analyse all photographs together with the property details and assessment information.

Return structured JSON only. Do not include markdown.
`.trim();

  try {
    // Gather every uploaded photograph.
    //
    // assessment.photos contains a mix of shapes:
    //   • category keys (e.g. "exterior") -> arrays of photo objects  [legacy model]
    //   • "sectionPhotos" -> an OBJECT keyed by section name -> arrays [new model]
    const photoContent = [];
    const photos = assessment.photos || {};

    // 1. Category-based photos (arrays), skipping the sectionPhotos object.
    Object.entries(photos).forEach(([category, list]) => {
      if (category === "sectionPhotos") return;
      if (!Array.isArray(list)) return;

      list.forEach((photo, index) => {
        if (!photo || !photo.url) return;

        photoContent.push({
          type: "text",
          text: `Photograph ${category.toUpperCase()}-${String(index + 1).padStart(3, "0")}
Category: ${category}
Original filename: ${photo.name || "Unknown"}`,
        });

        photoContent.push({
          type: "image",
          source: { type: "url", url: photo.url },
        });
      });
    });

    // 2. Section-based photos (object keyed by section name).
    const sectionPhotos =
      photos.sectionPhotos && typeof photos.sectionPhotos === "object"
        ? photos.sectionPhotos
        : {};

    Object.entries(sectionPhotos).forEach(([sectionName, list]) => {
      if (!Array.isArray(list)) return;

      list.forEach((photo, index) => {
        if (!photo || !photo.url) return;

        photoContent.push({
          type: "text",
          text: `Photograph SECTION-${String(index + 1).padStart(3, "0")}
Section: ${sectionName}
Original filename: ${photo.name || "Unknown"}`,
        });

        photoContent.push({
          type: "image",
          source: { type: "url", url: photo.url },
        });
      });
    });

    const reportRequest = `
${systemPrompt}

Using the complete assessment information and every photograph supplied,
produce a full draft Fire Risk Assessment for assessor review.

Return valid JSON only, using exactly this structure:

{
  "scopeResponsiblePersons": "",
  "premisesOccupancy": "",
  "fireHazards": "",
  "meansOfEscape": "",
  "fireDetectionWarning": "",
  "emergencyLightingSignage": "",
  "firefightingEquipment": "",
  "passiveFireProtection": "",
  "firefighterAccessFacilities": "",
  "managementTestingRecords": "",
  "conclusions": "",
  "recommendations": [
    {
      "action": "",
      "priority": "",
      "responsibleParty": "",
      "targetDate": "",
      "photoReferences": []
    }
  ],
  "limitations": "",
  "photoAppendix": [
    {
      "photoId": "",
      "category": "",
      "caption": "",
      "observation": ""
    }
  ],
  "riskEvaluation": {
    "likelihood": "",
    "severity": "",
    "rating": "",
    "rationale": "",
    "reviewPeriod": "",
    "reviewTriggers": ""
  }
}

Requirements:

- Draft the entire assessment, not one question or one section.
- Use all available property details, building details, findings and photographs.
- Do not invent facts that are not present or visibly supported.
- Clearly identify missing or uncertain information.
- Refer to photographs using the supplied photograph IDs.
- Include every uploaded photograph in photoAppendix.
- Keep the main report professional and readable.
- Be concise and avoid unnecessary repetition; each section should be substantive but not padded.
- Keep all output editable by the assessor.

Risk evaluation (this is a SUGGESTION for the assessor to review and confirm):
- "likelihood" must be exactly one of: "Low", "Medium", "High".
- "severity" must be exactly one of: "Slight harm", "Moderate harm", "Extreme harm".
- "rating" is the overall fire risk and must be exactly one of: "Trivial", "Tolerable", "Moderate", "Substantial", "Intolerable". Derive it from likelihood and severity using a standard PAS 79 / HSG65 risk matrix.
- "rationale" is 1-3 sentences explaining the suggested rating with reference to the significant findings and action plan. Do not overstate certainty.
- "reviewPeriod" is a suggested maximum period before the next review (e.g. "12 months").
- "reviewTriggers" briefly lists events that would prompt an earlier review.
- This rating is provisional and must be confirmed by the competent assessor; never present it as final.
- Return JSON only, with no markdown or explanatory text.

Complete assessment information:

${JSON.stringify(assessment, null, 2)}
`.trim();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 24000,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: reportRequest },
              ...photoContent,
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, JSON.stringify(data));
      // Surface the real reason so the assessor can see what happened.
      const apiMsg =
        (data && data.error && data.error.message) ||
        (data && data.message) ||
        `HTTP ${response.status}`;
      let friendly = `Anthropic API error: ${apiMsg}`;
      if (response.status === 429) {
        friendly = "The AI service is busy or rate-limited right now. Please wait a moment and try again.";
      } else if (response.status === 529) {
        friendly = "The AI service is temporarily overloaded. Please try again shortly.";
      } else if (response.status === 401) {
        friendly = "AI authentication failed — the API key may be invalid. Check the ANTHROPIC_API_KEY setting.";
      }
      await writeReport(assessment.id, {
        status: "error",
        error: friendly,
        detail: data,
        httpStatus: response.status,
        updatedAt: new Date().toISOString(),
      });
      return { statusCode: 502 };
    }

    const text = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    console.log("Claude stop reason:", data.stop_reason);
    console.log("Claude token usage:", data.usage);

    // Claude sometimes wraps JSON in markdown fences or adds stray text.
    // Strip fences, and if needed fall back to the outermost { ... } block.
    function extractJson(raw) {
      let cleaned = String(raw || "")
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      try {
        return JSON.parse(cleaned);
      } catch (e) {
        const first = cleaned.indexOf("{");
        const last = cleaned.lastIndexOf("}");
        if (first !== -1 && last !== -1 && last > first) {
          return JSON.parse(cleaned.slice(first, last + 1));
        }
        throw e;
      }
    }

    let draft;
    try {
      draft = extractJson(text);
    } catch (parseError) {
      console.error("Claude returned invalid JSON. stop_reason:", data.stop_reason);
      console.error("Raw text:", text);
      await writeReport(assessment.id, {
        status: "error",
        error:
          data.stop_reason === "max_tokens"
            ? "The report was too long and was cut off. Please try again."
            : "Claude returned an invalid report format.",
        raw: text,
        updatedAt: new Date().toISOString(),
      });
      return { statusCode: 502 };
    }

    await writeReport(assessment.id, {
      status: "ready",
      draft,
      photoCount: photoContent.filter((item) => item.type === "image").length,
      updatedAt: new Date().toISOString(),
    });

    return { statusCode: 200 };
  } catch (error) {
    console.error("Draft FRA generation failed:", error);
    await writeReport(assessment.id, {
      status: "error",
      error: error.message || "Unknown error",
      updatedAt: new Date().toISOString(),
    });
    return { statusCode: 500 };
  }
};