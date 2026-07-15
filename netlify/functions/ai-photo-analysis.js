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
      body: JSON.stringify({ error: "Missing Anthropic API key" }),
    };
  }

  let imageUrl;
  let category;

  try {
    const body = JSON.parse(event.body || "{}");
    imageUrl = body.imageUrl;
    category = body.category || "other";
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!imageUrl || typeof imageUrl !== "string") {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing imageUrl" }),
    };
  }

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
        max_tokens: 800,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "url",
                  url: imageUrl,
                },
              },
              {
                type: "text",
                text: `
You are assisting a competent UK fire risk assessor.

Analyse this photograph as fire-risk evidence.

Photo category: ${category}

Return valid JSON only:

{
  "description": "",
  "visibleFeatures": [],
  "potentialConcerns": [],
  "positiveControls": [],
  "limitations": "",
  "suggestedSections": []
}

Rules:
- Describe only what is visibly supported by the photograph.
- Do not assume hidden construction, certification, fire resistance or compliance.
- Do not make a final risk judgement.
- Clearly identify uncertainty and image limitations.
- Use concise professional UK fire-risk-assessment language.
- suggestedSections must contain relevant FRA section names only.
                `.trim(),
              },
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

    let analysis;

    try {
      analysis = JSON.parse(text);
    } catch {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "AI returned invalid JSON",
          raw: text,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis }),
    };
  } catch (error) {
    console.error("Photo analysis failed:", error);

    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to analyse photograph" }),
    };
  }
};