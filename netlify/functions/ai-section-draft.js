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

  console.log("Section AI request:", sectionName);
  console.log("Received photos:", JSON.stringify(photos));

  // Derive a supported Anthropic media type from the response header,
  // falling back to the filename extension when the server sends a
  // generic type such as application/octet-stream.
  function inferMediaType(photo, responseType) {
    const cleanType = String(responseType || "")
      .split(";")[0]
      .trim()
      .toLowerCase();

    const supported = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (supported.includes(cleanType)) {
      return cleanType;
    }

    const name = String(photo && photo.name ? photo.name : "").toLowerCase();

    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
      return "image/jpeg";
    }

    if (name.endsWith(".png")) {
      return "image/png";
    }

    if (name.endsWith(".gif")) {
      return "image/gif";
    }

    if (name.endsWith(".webp")) {
      return "image/webp";
    }

    return "";
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

      console.log(`Fetching section photo ${index + 1}:`, photo.url);

      try {
        const imageResponse = await fetch(photo.url);

        console.log(
          `Image response ${index + 1}:`,
          imageResponse.status,
          imageResponse.headers.get("content-type")
        );

        if (!imageResponse.ok) {
          console.warn(
            `Could not download section photo ${index + 1}:`,
            imageResponse.status
          );
          continue;
        }

        const mediaType = inferMediaType(
          photo,
          imageResponse.headers.get("content-type")
        );

        if (!mediaType) {
          console.warn(
            `Skipping unsupported image type for photo ${index + 1}:`,
            imageResponse.headers.get("content-type"),
            photo.name
          );
          continue;
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const base64Data =
          Buffer.from(arrayBuffer).toString("base64");

        if (!base64Data) {
          console.warn(
            `Skipping photo ${index + 1}: base64 conversion produced no data`
          );
          continue;
        }

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

    const imagesProcessed = imageBlocks.filter(
      (block) => block.type === "image"
    ).length;

    console.log("Images sent to Anthropic:", imagesProcessed);

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

NUMBER OF USABLE SECTION PHOTOGRAPHS SUPPLIED: ${imagesProcessed}

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
          imagesProcessed,
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
          imagesProcessed,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        draft,
        imagesProcessed,
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