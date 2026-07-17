exports.handler = async (event) => {
  const jsonHeaders = {
    "Content-Type": "application/json",
  };

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
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
  let sectionName;
  let assessorNotes;
  let photos;
  let sectionGuidance;

  try {
    const parsedBody = JSON.parse(event.body || "{}");

    assessment = parsedBody.assessment;
    sectionName = parsedBody.sectionName;
    assessorNotes = parsedBody.assessorNotes || "";
    photos = Array.isArray(parsedBody.photos)
      ? parsedBody.photos
      : [];
    sectionGuidance = Array.isArray(parsedBody.sectionGuidance)
      ? parsedBody.sectionGuidance
      : [];
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

  if (!sectionName || typeof sectionName !== "string") {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "Missing section name",
      }),
    };
  }

  try {
    const imageBlocks = [];

    /*
     * Limit the number of images sent in one request.
     * This prevents oversized requests and excessive API cost.
     */
    const usablePhotos = photos
      .filter((photo) => photo && typeof photo.url === "string")
      .slice(0, 10);

    for (let index = 0; index < usablePhotos.length; index += 1) {
      const photo = usablePhotos[index];

      try {
        const imageResponse = await fetch(photo.url);

        if (!imageResponse.ok) {
          console.warn(
            `Could not download section photo ${index + 1}:`,
            imageResponse.status
          );
          continue;
        }

        const contentTypeHeader =
          imageResponse.headers.get("content-type") || "";

        const mediaType =
          contentTypeHeader.split(";")[0].trim().toLowerCase();

        const allowedMediaTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];

        if (!allowedMediaTypes.includes(mediaType)) {
          console.warn(
            `Skipping unsupported image type for photo ${index + 1}:`,
            mediaType
          );
          continue;
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64Data =
          Buffer.from(arrayBuffer).toString("base64");

        imageBlocks.push({
          type: "text",
          text:
            `Section photograph ${index + 1}` +
            `${photo.name ? `: ${photo.name}` : ""}`,
        });

        imageBlocks.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Data,
          },
        });
      } catch (photoError) {
        console.warn(
          `Could not process section photo ${index + 1}:`,
          photoError
        );
      }
    }

    const prompt = `
You are assisting a competent fire risk assessor in the United Kingdom.

Draft one professional assessment paragraph for the following fire risk
assessment section.

SECTION:
${sectionName}

ASSESSOR NOTES:
${assessorNotes || "No assessor notes have been entered."}

SECTION PHOTOGRAPH GUIDANCE:
${JSON.stringify(sectionGuidance, null, 2)}

ASSESSMENT INFORMATION:
${JSON.stringify(assessment, null, 2)}

Instructions:

- Use only the supplied assessment information, assessor notes and section photographs.
- Review the supplied photographs as visual evidence, but remain cautious about anything that cannot be confirmed from the image.
- Clearly distinguish visible observations from assumptions or missing evidence.
- Do not invent dimensions, materials, certification, test results, concealed construction or maintenance history.
- Do not treat a photograph as proof of full compliance.
- Do not make a final statutory compliance judgement.
- Where a visible concern appears relevant, describe it objectively and state where further confirmation or inspection may be required.
- If no usable photographs were supplied, rely only on the written information and identify relevant limitations.
- Write in professional UK fire risk assessment language.
- Produce one coherent paragraph suitable for an FRA report.
- Do not include headings, bullet points, markdown or explanatory commentary.
- Return plain text only.
`.trim();

    const messageContent = [
      {
        type: "text",
        text: prompt,
      },
      ...imageBlocks,
    ];

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
          max_tokens: 900,
          messages: [
            {
              role: "user",
              content: messageContent,
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

    const draft = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!draft) {
      return {
        statusCode: 502,
        headers: jsonHeaders,
        body: JSON.stringify({
          error: "AI returned an empty response",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        draft,
        imagesProcessed: imageBlocks.filter(
          (block) => block.type === "image"
        ).length,
      }),
    };
  } catch (error) {
    console.error("Anthropic request failed:", error);

    return {
      statusCode: 502,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: "Failed to generate the section assessment",
        detail: error.message || "Unknown error",
      }),
    };
  }
};