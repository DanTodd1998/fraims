exports.handler = async (event) => {
  const jsonHeaders = {
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
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
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "Invalid JSON body",
      }),
    };
  }

  if (!assessment || typeof assessment !== "object") {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "Missing assessment object",
      }),
    };
  }

  try {
    const prompt = `
You are assisting a competent fire risk assessor in the United Kingdom.

Review the completed fire risk assessment information below and produce a
professional action plan containing only genuine deficiencies that require
corrective action.

FIRE RISK ASSESSMENT:
${JSON.stringify(assessment, null, 2)}

Return a valid JSON array only.

Each action must use exactly this structure:

{
  "category": "Hazard category or assessment section",
  "finding": "Concise description of the deficiency",
  "action": "Clear and measurable corrective action",
  "priority": "Immediate, High, Medium or Low",
  "responsiblePerson": "Suggested responsible person or competent contractor",
  "targetTimescale": "Recommended completion timescale"
}

Rules:

- Base every action on information contained in the supplied assessment.
- Do not invent deficiencies, evidence, legislation, inspection results or building details.
- Do not create an action for a section that is satisfactory.
- Do not create actions merely to monitor satisfactory arrangements.
- Do not duplicate actions.
- Where several statements describe the same deficiency, combine them into one action.
- Use the relevant assessment section as the hazard category.
- Keep the finding concise and factual.
- Make the corrective action clear, specific and measurable.
- Do not use vague phrases such as "consider improving" or "review if necessary".
- Select an appropriate responsible person, such as:
  Responsible Person,
  Building Owner,
  Managing Agent,
  Facilities Manager,
  Fire Alarm Contractor,
  Electrical Contractor,
  Fire Door Contractor,
  Gas Contractor,
  or another suitable competent person.
- Use professional UK fire risk assessment terminology.
- Priority must be exactly one of:
  Immediate,
  High,
  Medium,
  Low.
- Target timescales must be proportionate to the risk.
- If no corrective actions are supported by the assessment, return an empty array.
- Return JSON only.
- Do not include markdown, code fences, headings or explanatory text.
`.trim();

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-5",
          max_tokens: 2500,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);

      return {
        statusCode: response.status,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: "Anthropic API error",
          detail: data,
        }),
      };
    }

    const rawText = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!rawText) {
      return {
        statusCode: 502,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: "AI returned an empty response",
        }),
      };
    }

    let actions;

    try {
      const cleanedText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      actions = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Could not parse action plan JSON:", rawText);

      return {
        statusCode: 502,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: "AI returned invalid action plan data",
          detail: parseError.message,
          rawText,
        }),
      };
    }

    if (!Array.isArray(actions)) {
      return {
        statusCode: 502,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: "AI response was not an action plan array",
        }),
      };
    }

    const validPriorities = [
      "Immediate",
      "High",
      "Medium",
      "Low",
    ];

    const cleanedActions = actions
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        category: String(item.category || "").trim(),
        finding: String(item.finding || "").trim(),
        action: String(item.action || "").trim(),
        priority: validPriorities.includes(item.priority)
          ? item.priority
          : "Medium",
        responsiblePerson: String(
          item.responsiblePerson || "Responsible Person"
        ).trim(),
        targetTimescale: String(
          item.targetTimescale || ""
        ).trim(),
      }))
      .filter(
        (item) =>
          item.category &&
          item.finding &&
          item.action
      );

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        actions: cleanedActions,
      }),
    };
  } catch (error) {
    console.error("Action plan request failed:", error);

    return {
      statusCode: 502,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "Failed to generate the action plan",
        detail: error.message || "Unknown error",
      }),
    };
  }
};