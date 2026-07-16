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

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "System prompt loaded successfully.",
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