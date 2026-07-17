/*
 * Background function: builds a professional FRA PDF from the AI-generated draft,
 * embeds the uploaded photographs, uploads the PDF to Supabase Storage, and writes
 * the download URL back into the assessment's generated_report.pdfUrl.
 *
 * Because this is a *-background function, Netlify returns 202 immediately and the
 * browser polls generated_report.pdfStatus / pdfUrl.
 *
 * Required environment variables:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uses the existing "assessment-photos" storage bucket (folder: reports/).
 */

const PdfPrinter = require("pdfmake/src/printer");
const vfsModule = require("pdfmake/build/vfs_fonts.js");
const vfs = vfsModule.pdfMake ? vfsModule.pdfMake.vfs : vfsModule.vfs;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PHOTO_BUCKET = "assessment-photos";

const fonts = {
  Roboto: {
    normal: Buffer.from(vfs["Roboto-Regular.ttf"], "base64"),
    bold: Buffer.from(vfs["Roboto-Medium.ttf"], "base64"),
    italics: Buffer.from(vfs["Roboto-Italic.ttf"], "base64"),
    bolditalics: Buffer.from(vfs["Roboto-MediumItalic.ttf"], "base64"),
  },
};

// Merge a status/URL patch into generated_report without losing the draft.
async function patchReport(assessmentId, patch) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase env vars missing; cannot update report.");
    return;
  }
  const base = `${SUPABASE_URL}/rest/v1/assessments`;

  // Read current generated_report so we merge rather than overwrite.
  let current = {};
  try {
    const getRes = await fetch(
      `${base}?id=eq.${encodeURIComponent(assessmentId)}&select=generated_report`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    const rows = await getRes.json();
    if (Array.isArray(rows) && rows[0] && rows[0].generated_report) {
      current = rows[0].generated_report;
    }
  } catch (e) {
    console.warn("Could not read current report, will merge onto empty:", e.message);
  }

  const merged = { ...current, ...patch, updatedAt: new Date().toISOString() };

  const res = await fetch(`${base}?id=eq.${encodeURIComponent(assessmentId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ generated_report: merged }),
  });
  if (!res.ok) {
    console.error("Failed to patch report:", res.status, await res.text());
  }
}

// Fetch an image URL and return a pdfmake-ready data URL, or null on failure.
async function fetchImageDataUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("Image fetch failed:", res.status, url);
      return null;
    }
    const ct = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const supported = ["image/jpeg", "image/png"];
    // pdfmake supports JPEG and PNG only.
    let mediaType = supported.includes(ct) ? ct : "";
    if (!mediaType) {
      if (/\.jpe?g($|\?)/i.test(url)) mediaType = "image/jpeg";
      else if (/\.png($|\?)/i.test(url)) mediaType = "image/png";
    }
    if (!mediaType) {
      console.warn("Unsupported image type for PDF (need jpeg/png):", ct, url);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${mediaType};base64,${buf.toString("base64")}`;
  } catch (e) {
    console.warn("Image fetch error:", e.message, url);
    return null;
  }
}

// Upload PDF bytes to Supabase Storage and return a public URL.
async function uploadPdf(assessmentId, bytes) {
  const objectPath = `reports/${assessmentId}-${Date.now()}.pdf`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${PHOTO_BUCKET}/${objectPath}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/pdf",
      "x-upsert": "true",
    },
    body: bytes,
  });

  if (!res.ok) {
    throw new Error(`Storage upload failed: ${res.status} ${await res.text()}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${objectPath}`;
}

// Render the pdfmake document definition to a PDF buffer.
function renderPdf(docDefinition) {
  return new Promise((resolve, reject) => {
    try {
      const printer = new PdfPrinter(fonts);
      const doc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

exports.handler = async (event) => {
  let assessment;
  try {
    assessment = JSON.parse(event.body || "{}").assessment;
  } catch {
    return { statusCode: 400 };
  }
  if (!assessment || !assessment.id) {
    return { statusCode: 400 };
  }

  const draft =
    assessment.generatedReport && assessment.generatedReport.draft
      ? assessment.generatedReport.draft
      : null;

  if (!draft) {
    await patchReport(assessment.id, {
      pdfStatus: "error",
      pdfError: "No draft report available. Generate the draft FRA first.",
    });
    return { statusCode: 400 };
  }

  await patchReport(assessment.id, { pdfStatus: "generating" });

  try {
    const esc = (v) => (v === undefined || v === null ? "" : String(v));

    // ---- Cover page ----
    const cover = [
      { text: "Fire Risk Assessment", fontSize: 26, bold: true, margin: [0, 120, 0, 8] },
      { text: esc(assessment.propertyName) || "Untitled Property", fontSize: 16, margin: [0, 0, 0, 4] },
      { text: esc(assessment.propertyAddress), fontSize: 12, color: "#444", margin: [0, 0, 0, 30] },
      {
        table: {
          widths: ["auto", "*"],
          body: [
            [{ text: "Client", bold: true }, esc(assessment.clientName)],
            [{ text: "Assessor", bold: true }, esc(assessment.assessor)],
            [{ text: "Assessment date", bold: true }, esc(assessment.assessmentDate)],
            [{ text: "Status", bold: true }, esc(assessment.status)],
            [{ text: "Reference", bold: true }, esc(assessment.propertyReference)],
          ],
        },
        layout: "noBorders",
      },
      {
        text: "AI-assisted draft for assessor review. The assessor remains responsible for reviewing, editing and approving the final report.",
        italics: true,
        color: "#666",
        fontSize: 9,
        margin: [0, 40, 0, 0],
      },
      { text: "", pageBreak: "after" },
    ];

    // ---- Narrative sections ----
    const sectionOrder = [
      ["scopeResponsiblePersons", "Scope & Responsible Persons"],
      ["premisesOccupancy", "Premises & Occupancy"],
      ["fireHazards", "Fire Hazards"],
      ["meansOfEscape", "Means of Escape"],
      ["fireDetectionWarning", "Fire Detection & Warning"],
      ["emergencyLightingSignage", "Emergency Lighting & Signage"],
      ["firefightingEquipment", "Firefighting Equipment"],
      ["passiveFireProtection", "Passive Fire Protection"],
      ["firefighterAccessFacilities", "Firefighter Access & Facilities"],
      ["managementTestingRecords", "Management, Testing & Records"],
      ["conclusions", "Conclusions"],
      ["limitations", "Limitations"],
    ];

    const narrative = [];
    sectionOrder.forEach(([key, label]) => {
      const val = draft[key];
      if (val && String(val).trim()) {
        narrative.push({ text: label, fontSize: 14, bold: true, margin: [0, 12, 0, 4] });
        narrative.push({ text: String(val), fontSize: 10, margin: [0, 0, 0, 6], lineHeight: 1.3 });
      }
    });

    // ---- Action plan table (from the assessment's editable action plan) ----
    const actions = Array.isArray(assessment.actionPlan) ? assessment.actionPlan : [];
    const actionPlanContent = [];
    if (actions.length) {
      actionPlanContent.push({ text: "Action Plan", fontSize: 14, bold: true, margin: [0, 16, 0, 6], pageBreak: "before" });
      const body = [
        [
          { text: "Hazard Category", bold: true },
          { text: "Finding", bold: true },
          { text: "Action Required", bold: true },
          { text: "Priority", bold: true },
          { text: "Responsible", bold: true },
          { text: "Timescale", bold: true },
        ],
      ];
      actions.forEach((a) => {
        body.push([
          esc(a.category),
          esc(a.finding),
          esc(a.action),
          esc(a.priority),
          esc(a.responsiblePerson),
          esc(a.targetTimescale),
        ]);
      });
      actionPlanContent.push({
        table: { headerRows: 1, widths: ["12%", "23%", "27%", "10%", "14%", "14%"], body },
        layout: "lightHorizontalLines",
        fontSize: 8,
      });
    }

    // ---- Photograph appendix (embed real photos) ----
    const realPhotos = [];
    const photos = assessment.photos || {};
    Object.entries(photos).forEach(([category, list]) => {
      if (category === "sectionPhotos") return;
      if (!Array.isArray(list)) return;
      list.forEach((photo, index) => {
        if (!photo || !photo.url) return;
        realPhotos.push({
          id: `${category.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
          label: category,
          url: photo.url,
        });
      });
    });
    const sp = photos.sectionPhotos && typeof photos.sectionPhotos === "object" ? photos.sectionPhotos : {};
    Object.entries(sp).forEach(([sectionName, list]) => {
      if (!Array.isArray(list)) return;
      list.forEach((photo, index) => {
        if (!photo || !photo.url) return;
        realPhotos.push({
          id: `SECTION-${String(index + 1).padStart(3, "0")}`,
          label: sectionName,
          url: photo.url,
        });
      });
    });

    // Map AI observations by photoId.
    const aiById = {};
    (Array.isArray(draft.photoAppendix) ? draft.photoAppendix : []).forEach((p) => {
      if (p && p.photoId) aiById[String(p.photoId).toUpperCase().trim()] = p;
    });

    const appendixContent = [];
    if (realPhotos.length) {
      appendixContent.push({ text: "Photograph Appendix", fontSize: 14, bold: true, margin: [0, 16, 0, 8], pageBreak: "before" });

      for (const rp of realPhotos) {
        const dataUrl = await fetchImageDataUrl(rp.url);
        const ai = aiById[rp.id.toUpperCase()] || null;
        const obs = ai
          ? `${ai.caption ? String(ai.caption) : ""}${ai.observation ? " " + String(ai.observation) : ""}`.trim()
          : "";

        appendixContent.push({ text: `${rp.id} — ${rp.label}`, bold: true, fontSize: 10, margin: [0, 8, 0, 4] });
        if (dataUrl) {
          appendixContent.push({ image: dataUrl, fit: [380, 300], margin: [0, 0, 0, 4] });
        } else {
          appendixContent.push({ text: "[Photograph could not be embedded]", italics: true, color: "#999", fontSize: 9 });
        }
        if (obs) {
          appendixContent.push({ text: obs, fontSize: 9, margin: [0, 0, 0, 6], lineHeight: 1.3 });
        }
      }
    }

    // ---- Assessor declaration ----
    const declaration = [
      { text: "Assessor Declaration", fontSize: 14, bold: true, margin: [0, 16, 0, 6], pageBreak: "before" },
      {
        text:
          "This fire risk assessment has been carried out to identify the significant fire hazards and persons at risk, and to recommend action where appropriate. The findings are based on the information available and the areas inspected at the time of assessment, subject to the limitations recorded above. This is an AI-assisted draft and must be reviewed, verified and approved by the responsible competent assessor before issue.",
        fontSize: 10,
        lineHeight: 1.3,
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          widths: ["*", "*"],
          body: [
            [{ text: "Assessor", bold: true }, { text: "Signature / Date", bold: true }],
            [esc(assessment.assessor) || " ", " "],
          ],
        },
        layout: "lightHorizontalLines",
      },
    ];

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 50],
      header: (currentPage) =>
        currentPage === 1
          ? null
          : {
              text: esc(assessment.propertyName) || "Fire Risk Assessment",
              alignment: "left",
              fontSize: 8,
              color: "#888",
              margin: [40, 20, 40, 0],
            },
      footer: (currentPage, pageCount) => ({
        columns: [
          { text: "Fire Risk Assessment — AI-assisted draft", fontSize: 8, color: "#888", margin: [40, 0, 0, 0] },
          { text: `Page ${currentPage} of ${pageCount}`, alignment: "right", fontSize: 8, color: "#888", margin: [0, 0, 40, 0] },
        ],
      }),
      content: [
        ...cover,
        ...narrative,
        ...actionPlanContent,
        ...appendixContent,
        ...declaration,
      ],
      defaultStyle: { font: "Roboto", fontSize: 10 },
    };

    const pdfBuffer = await renderPdf(docDefinition);
    const pdfUrl = await uploadPdf(assessment.id, pdfBuffer);

    await patchReport(assessment.id, {
      pdfStatus: "ready",
      pdfUrl,
    });

    return { statusCode: 200 };
  } catch (error) {
    console.error("PDF generation failed:", error);
    await patchReport(assessment.id, {
      pdfStatus: "error",
      pdfError: error.message || "Unknown error",
    });
    return { statusCode: 500 };
  }
};