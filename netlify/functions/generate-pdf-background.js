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

// London & Kent brand colours (sampled from the banner).
const LK_NAVY = "#001225";
const LK_GREEN = "#0A3627";

// London & Kent banner embedded as a base64 JPEG (header strip on the cover).
const LK_BANNER = "data:image/jpeg;base64,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";

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
    // Avoid the address repeating the property name on its first line.
    const propName = esc(assessment.propertyName) || "Untitled Property";
    let addr = esc(assessment.propertyAddress);
    if (addr && propName && addr.indexOf(propName) === 0) {
      addr = addr.slice(propName.length).replace(/^[\s,]+/, "");
    }

    const ratingText = esc(
      (assessment.riskEvaluation && assessment.riskEvaluation.rating) || "Not yet rated"
    );

    const cover = [
      // (Banner temporarily removed for diagnostics.)
      { text: "Fire Risk Assessment", fontSize: 30, bold: true, color: LK_NAVY, alignment: "center", margin: [0, 150, 0, 6] },
      { text: propName, fontSize: 18, alignment: "center", margin: [0, 0, 0, 2] },
      addr
        ? { text: addr, fontSize: 12, color: "#555", alignment: "center", margin: [0, 0, 0, 40] }
        : { text: "", margin: [0, 0, 0, 40] },

      // Centered details block: a fixed-width table centered on the page.
      {
        table: {
          widths: [130, 200],
          body: [
            [{ text: "Client", bold: true, color: LK_NAVY }, esc(assessment.clientName)],
            [{ text: "Assessor", bold: true, color: LK_NAVY }, esc(assessment.assessor)],
            [{ text: "Assessment date", bold: true, color: LK_NAVY }, esc(assessment.assessmentDate)],
            [{ text: "Status", bold: true, color: LK_NAVY }, esc(assessment.status)],
            [{ text: "Reference", bold: true, color: LK_NAVY }, esc(assessment.propertyReference) || "—"],
            [{ text: "Overall risk rating", bold: true, color: LK_NAVY }, { text: ratingText, bold: true }],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingTop: () => 5,
          paddingBottom: () => 5,
          paddingLeft: () => 6,
          paddingRight: () => 6,
        },
        alignment: "center",
        margin: [0, 0, 0, 50],
      },

      {
        text: "AI-assisted draft for assessor review. The assessor remains responsible for reviewing, editing and approving the final report.",
        italics: true,
        color: "#888",
        fontSize: 9,
        alignment: "center",
        margin: [60, 0, 60, 0],
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
        narrative.push({ text: label, fontSize: 14, bold: true, color: LK_NAVY, margin: [0, 12, 0, 4] });
        narrative.push({ text: String(val), fontSize: 10, margin: [0, 0, 0, 6], lineHeight: 1.3 });
      }
    });

    // ---- Action plan table (from the assessment's editable action plan) ----
    const actions = Array.isArray(assessment.actionPlan) ? assessment.actionPlan : [];
    const actionPlanContent = [];
    if (actions.length) {
      actionPlanContent.push({ text: "Action Plan", fontSize: 14, bold: true, color: LK_NAVY, margin: [0, 16, 0, 6], pageBreak: "before" });
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
      appendixContent.push({ text: "Photograph Appendix", fontSize: 14, bold: true, color: LK_NAVY, margin: [0, 16, 0, 8], pageBreak: "before" });

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

    // ---- Risk evaluation ----
    const re = assessment.riskEvaluation || {};
    const riskContent = [];
    if (re.rating || re.likelihood || re.severity) {
      riskContent.push({ text: "Overall Risk Evaluation", fontSize: 14, bold: true, color: LK_NAVY, margin: [0, 16, 0, 6], pageBreak: "before" });
      riskContent.push({
        table: {
          widths: ["auto", "*"],
          body: [
            [{ text: "Likelihood of fire", bold: true }, esc(re.likelihood)],
            [{ text: "Severity of outcome", bold: true }, esc(re.severity)],
            [{ text: "Overall risk rating", bold: true }, { text: esc(re.rating), bold: true }],
            [{ text: "Review period", bold: true }, esc(re.reviewPeriod)],
            [{ text: "Review triggers", bold: true }, esc(re.reviewTriggers)],
            [{ text: "Status", bold: true }, re.confirmed ? "Confirmed by assessor" : "Provisional — not yet confirmed"],
          ],
        },
        layout: "lightHorizontalLines",
        fontSize: 10,
        margin: [0, 0, 0, 8],
      });
      if (re.rationale) {
        riskContent.push({ text: "Rationale", bold: true, fontSize: 11, margin: [0, 6, 0, 2] });
        riskContent.push({ text: esc(re.rationale), fontSize: 10, lineHeight: 1.3, margin: [0, 0, 0, 6] });
      }
      riskContent.push({
        text: "The overall risk rating is determined by the assessor using a PAS 79 / HSG65 risk matrix.",
        italics: true, color: "#666", fontSize: 9,
      });
    }

    // ---- Assessor declaration ----
    const declaration = [
      { text: "Assessor Declaration", fontSize: 14, bold: true, color: LK_NAVY, margin: [0, 16, 0, 6], pageBreak: "before" },
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
        ...riskContent,
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