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

Using only the structured assessment information below, draft the PREM-01
"Premises description" finding.

Return valid JSON only, with exactly these fields:

{
  "finding": "",
  "existingControls": "",
  "recommendation": "",
  "priority": "",
  "responsibleParty": "",
  "limitations": ""
}

Rules:

- Do not invent facts.
- Do not make a final compliance judgement.
- Use concise, professional FRA wording.
- "finding" should describe the premises using the known information.
- "existingControls" should include only controls clearly recorded in the assessment.
- "recommendation" should identify missing information or sensible follow-up action.
- "priority" must be one of:
  "", "immediate", "high", "medium", "low", "advisory"
- "responsibleParty" should be blank unless the assessment clearly supports one.
- "limitations" should clearly record unknown, unclear, or missing information.
- Return JSON only. No markdown and no explanation.

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
  .join("\n")
  .trim();

let draft;

try {
  draft = JSON.parse(text);
} catch (error) {
  console.error("Claude returned invalid JSON:", text);

  return {
    statusCode: 502,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: "AI returned an invalid structured response",
      raw: text
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