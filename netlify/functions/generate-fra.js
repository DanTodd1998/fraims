const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing ANTHROPIC_API_KEY" }),
    };
  }

  try {
    const { assessment } = JSON.parse(event.body || "{}");

    if (!assessment) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing assessment" }),
      };
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

    // NEXT:
    // - Build one prompt from:
    //   • systemPrompt
    //   • assessment
    //   • all uploaded photographs
    // - Send to Claude
    // - Return complete draft FRA

    // Gather every uploaded photograph from every category.
const photoContent = [];

Object.entries(assessment.photos || {}).forEach(([category, photos]) => {
  (photos || []).forEach((photo, index) => {
    if (!photo.url) return;

    photoContent.push({
      type: "text",
      text: `Photograph ${category.toUpperCase()}-${String(index + 1).padStart(3, "0")}
Category: ${category}
Original filename: ${photo.name || "Unknown"}`,
    });

    photoContent.push({
      type: "image",
      source: {
        type: "url",
        url: photo.url,
      },
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
  ]
}

Requirements:

- Draft the entire assessment, not one question or one section.
- Use all available property details, building details, findings and photographs.
- Do not invent facts that are not present or visibly supported.
- Clearly identify missing or uncertain information.
- Refer to photographs using the supplied photograph IDs.
- Include every uploaded photograph in photoAppendix.
- Keep the main report professional and readable.
- Keep all output editable by the assessor.
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
    max_tokens: 3500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: reportRequest,
          },
          ...photoContent,
        ],
      },
    ],
  }),
});

const data = await response.json();

if (!response.ok) {
  return {
    statusCode: response.status,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: "Anthropic API error",
      detail: data,
    }),
  };
}

const text = (data.content || [])
  .filter((block) => block.type === "text")
  .map((block) => block.text)
  .join("\n")
  .trim();

let draft;

try {
  draft = JSON.parse(text);
} catch (parseError) {
  console.error("Claude returned invalid JSON:", text);

  return {
    statusCode: 502,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: "Claude returned an invalid report format.",
      raw: text,
    }),
  };
}

return {
  statusCode: 200,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    draft,
    photoCount: photoContent.filter((item) => item.type === "image").length,
  }),
};

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
      }),
    };
  }
};