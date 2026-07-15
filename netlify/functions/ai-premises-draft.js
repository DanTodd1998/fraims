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

  try {
    const parsedBody = JSON.parse(event.body || "{}");
    assessment = parsedBody.assessment;
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
        error: "Missing 'assessment' object in request body",
      }),
    };
  }

  const prompt = `
You are assisting a competent fire risk assessor in the United Kingdom.

Using only the structured information below, draft one concise professional
"Premises Description" paragraph for a Fire Risk Assessment.

Do not invent facts.
Do not make compliance conclusions.
Clearly state where information is unknown.
Return only the paragraph.

Assessment information:
${JSON.stringify(assessment, null, 2)}
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
        max_tokens: 400,
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

    const text = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
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