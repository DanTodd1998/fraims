exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Server misconfigured: missing API key",
      }),
    };
  }

  let assessment;
  let sectionName;
  let assessorNotes;
  let photos;
  let sectionGuidance;

  try {
    const parsedBody = JSON.parse(event.body || "{}");

    assessment = parsedBody.assessment;
    sectionName = parsedBody.sectionName;
    assessorNotes = parsedBody.assessorNotes || "";
    photos = parsedBody.photos || [];
    sectionGuidance = parsedBody.sectionGuidance || [];
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!assessment || typeof assessment !== "object") {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing assessment object",
      }),
    };
  }

  if (!sectionName || typeof sectionName !== "string") {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing section name",
      }),
    };
  }

  const photoSummary = photos.map((photo) => ({
    label: photo.label || "",
    reference: photo.ref || "",
  }));

  const prompt = `
You are assisting a competent fire risk assessor in the United Kingdom.

Draft one professional assessment paragraph for the following fire risk
assessment section:

SECTION:
${sectionName}

ASSESSOR NOTES:
${assessorNotes || "No assessor notes have been entered."}

SECTION GUIDANCE:
${JSON.stringify(sectionGuidance, null, 2)}

AVAILABLE PHOTOGRAPH REFERENCES:
${JSON.stringify(photoSummary, null, 2)}

ASSESSMENT INFORMATION:
${JSON.stringify(assessment, null, 2)}

Rules:

- Use only the information supplied.
- Do not invent facts, dimensions, materials, controls or defects.
- Do not claim to have visually inspected a photograph.
- Do not make a final statutory compliance judgement.
- Write in professional UK fire risk assessment language.
- Produce one coherent paragraph suitable for an FRA report.
- Clearly identify material limitations or missing information where relevant.
- Do not include headings, bullet points, markdown or explanatory commentary.
- Return plain text only.
`.trim();

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: prompt,
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

    const draft = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!draft) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "AI returned an empty response",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft }),
    };
  } catch (error) {
    console.error("Anthropic request failed:", error);

    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to reach Anthropic API",
      }),
    };
  }
};