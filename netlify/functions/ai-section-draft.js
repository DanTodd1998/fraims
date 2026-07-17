exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const {
      assessment,
      sectionName,
      sectionGuidance = [],
      assessorNotes = "",
      photos = []
    } = JSON.parse(event.body || "{}");

    if (!assessment) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Assessment data is required." })
      };
    }

    if (!sectionName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Section name is required." })
      };
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Anthropic API key is not configured." })
      };
    }

    const buildingOverview = {
      propertyName: assessment.propertyName || "",
      propertyReference: assessment.propertyReference || "",
      propertyAddress: assessment.propertyAddress || "",
      clientName: assessment.clientName || "",
      assessorName: assessment.assessorName || "",
      assessmentDate: assessment.assessmentDate || "",
      construction: assessment.construction || "",
      age: assessment.age || "",
      height: assessment.height || "",
      storeys: assessment.storeys || "",
      occupancy: assessment.occupancy || "",
      use: assessment.use || "",
      layout: assessment.layout || "",
      vulnerablePersons: assessment.vulnerablePersons || "",
      fireStrategy: assessment.fireStrategy || "",
      accessLimitations: assessment.accessLimitations || "",
      previousAssessment: assessment.previousAssessment || "",
      generalNotes: assessment.generalNotes || ""
    };

    const prompt = `
You are assisting a competent UK fire risk assessor.

Write one professional, concise and evidence-led narrative paragraph for the following fire risk assessment section.

Section:
${sectionName}

Building overview:
${JSON.stringify(buildingOverview, null, 2)}

Section guidance:
${sectionGuidance.length ? sectionGuidance.join("\n- ") : "No specific guidance supplied."}

Assessor notes:
${assessorNotes || "No assessor notes supplied."}

Number of photographs supplied:
${photos.length}

Important rules:
- Use UK fire risk assessment terminology.
- Do not invent facts.
- Do not claim compliance unless the supplied evidence supports it.
- Where evidence is insufficient, say so clearly and identify what further inspection, testing or documentation may be required.
- Keep the output as one coherent paragraph.
- Do not include headings, bullet points, JSON or markdown.
- The paragraph must remain suitable for manual editing and approval by the assessor.
`;

    const content = [
      {
        type: "text",
        text: prompt
      }
    ];

    for (const photo of photos) {
      if (!photo?.url) continue;

      content.push({
        type: "image",
        source: {
          type: "url",
          url: photo.url
        }
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content
          }
        ]
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Anthropic error:", result);

      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: result?.error?.message || "Anthropic request failed."
        })
      };
    }

    const draft = (result.content || [])
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("\n")
      .trim();

    if (!draft) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Claude returned no draft text." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ draft })
    };
  } catch (error) {
    console.error("ai-section-draft failed:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Could not generate section draft."
      })
    };
  }
};