const { colors, pageMargins, banner } = require("./theme");
const { fmtDate, addMonths, loadImage, photoGrid, riskMatrix } = require("./helpers");
const bp = require("./boilerplate");

// ---- reusable style pieces ----
function sectionBar(num, title) {
  return {
    table: {
      widths: [26, "*"],
      body: [[
        { text: String(num), color: colors.white, bold: true, fontSize: 13, alignment: "center", fillColor: colors.navy, margin: [0, 6, 0, 6] },
        { text: title, color: colors.navy, bold: true, fontSize: 13, margin: [8, 6, 0, 6], border: [false, false, false, true], borderColor: [colors.navy, colors.navy, colors.navy, colors.navy] }
      ]]
    },
    layout: {
      hLineWidth: (i, node) => (i === node.table.body.length ? 0 : 0),
      vLineWidth: () => 0,
      hLineColor: () => colors.navy
    },
    margin: [0, 14, 0, 2]
  };
}
function underline() {
  return { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: colors.navy }], margin: [0, 0, 0, 8] };
}
function subHeading(text) {
  return { text, color: colors.steel, bold: true, fontSize: 11, margin: [0, 10, 0, 3] };
}
function para(text) {
  return { text, alignment: "justify", fontSize: 10, lineHeight: 1.15, margin: [0, 0, 0, 6], color: colors.text };
}
function appendixTag(ref, title) {
  return {
    table: { widths: ["auto", "*"], body: [[
      { text: `Appendix ${ref}`, color: colors.white, bold: true, fontSize: 10, fillColor: colors.steel, margin: [8, 4, 8, 4] },
      { text: title, color: colors.navy, bold: true, fontSize: 11, margin: [10, 4, 0, 4] }
    ]] },
    layout: "noBorders",
    margin: [0, 12, 0, 2]
  };
}

// ---- detail block used on the cover ----
function coverBlock(title, rows) {
  const body = rows.map((r) => [
    { text: r[0], fontSize: 10, color: colors.text, margin: [0, 1, 0, 1] },
    { text: r[1], fontSize: 10, color: colors.text, alignment: "right", margin: [0, 1, 0, 1] }
  ]);
  return [
    { text: title, color: colors.navy, bold: true, fontSize: 11, margin: [0, 14, 0, 4] },
    { table: { widths: ["*", "*"], body }, layout: "noBorders" }
  ];
}

function buildDocDefinition(data, opts) {
  const baseDir = opts.baseDir;                 // for banner
  const photosDir = opts.photosDir;             // for appendix photos
  const m = data.meta;
  const validFrom = m.assessmentDate;
  const validTo = addMonths(m.assessmentDate, m.validityMonths || 12);
  const bannerImg = loadImage(baseDir, banner);

  // Normalize consequence: accept "Moderate" or "Moderate harm".
  const normConsequence = bp.riskMatrix.consequences.find(
    (c) => c.toLowerCase().startsWith(data.riskEvaluation.consequence.toLowerCase().replace(/ harm$/, ""))
  ) || data.riskEvaluation.consequence;
  data.riskEvaluation.consequence = normConsequence;
  const rating = bp.riskMatrix.grid[data.riskEvaluation.likelihood][normConsequence];

  const content = [];

  // ===== COVER =====
  content.push({ text: `FIRE RISK ASSESSMENT:\n${m.assessmentType.toUpperCase()}`, alignment: "center", bold: true, fontSize: 17, color: colors.text, margin: [0, 10, 0, 18] });
  content.push(...coverBlock("PROPERTY DETAILS", [
    ["Property Name:", m.propertyName],
    ["Property Reference:", m.propertyReference],
    ["Property Address:", m.propertyAddress],
    ["Produced For:", m.producedFor],
    ["Scope:", m.scope]
  ]));
  content.push(...coverBlock("VALIDITY", [
    ["Valid from:", fmtDate(validFrom)],
    ["Valid to:", fmtDate(validTo)],
    ["Assessment Ref:", m.versionRef]
  ]));
  content.push({ text: "ASSESSED BY", color: colors.navy, bold: true, fontSize: 11, margin: [0, 14, 0, 4] });
  content.push({ text: `${m.assessor.name} (${m.assessor.title})`, fontSize: 10, margin: [0, 0, 0, 1] });
  m.assessor.qualifications.forEach((q) => content.push({ text: q, fontSize: 10, margin: [0, 0, 0, 1] }));
  content.push({ table: { widths: ["*", "*"], body: [
    [{ text: "Assessment Date:", fontSize: 10, margin: [0, 6, 0, 1] }, { text: fmtDate(m.assessmentDate), fontSize: 10, alignment: "right", margin: [0, 6, 0, 1] }],
    [{ text: "Approved Date:", fontSize: 10 }, { text: fmtDate(m.approvedDate), fontSize: 10, alignment: "right" }],
    [{ text: "Assessed By Organisation:", fontSize: 10 }, { text: m.assessor.organisation, fontSize: 10, alignment: "right" }]
  ] }, layout: "noBorders" });
  content.push(...coverBlock("SPECIFICATION & STANDARDS", [
    ["Conformance:", m.specification.conformance],
    ["Methodology:", m.specification.methodology],
    ["Inspection Type:", m.specification.inspectionType]
  ]));

  // ===== 1 DISCLAIMER =====
  content.push({ text: "", pageBreak: "after" });
  addBoilerplateSection(content, 1, bp.disclaimer);

  // ===== 2 REGULATIONS =====
  content.push({ text: "", pageBreak: "before" });
  addBoilerplateSection(content, 2, bp.regulations);
  content.push({ text: bp.regulations.notesTitle, color: colors.steel, bold: true, fontSize: 11, margin: [0, 8, 0, 3] });
  bp.regulations.notes.forEach((n) => content.push({ text: `\u2022  ${n}`, fontSize: 10, margin: [0, 0, 0, 4], alignment: "justify" }));

  // ===== 3 LEGAL =====
  content.push({ text: "", pageBreak: "before" });
  addBoilerplateSection(content, 3, bp.legal);
  content.push({ text: bp.legal.summaryTitle, color: colors.steel, bold: true, fontSize: 11, margin: [0, 8, 0, 4] });
  content.push({
    table: { widths: ["auto", "*"], body: bp.legal.summary.map((r) => [
      { text: r[0], bold: true, fontSize: 10, fillColor: colors.light, margin: [5, 4, 5, 4] },
      { text: r[1], fontSize: 10, margin: [5, 4, 5, 4] }
    ]) },
    layout: { hLineColor: () => colors.line, vLineColor: () => colors.line, hLineWidth: () => 0.5, vLineWidth: () => 0.5 },
    margin: [0, 0, 0, 8]
  });
  content.push(para(bp.legal.outro));

  // ===== 4 FRA REPORT =====
  content.push({ text: "", pageBreak: "before" });
  content.push(sectionBar(4, "Fire Risk Assessment Report"));
  content.push(underline());
  content.push(subHeading("Building Overview"));
  data.report.buildingOverview.forEach((p) => content.push(para(p)));
  data.report.sections.forEach((s) => {
    content.push(subHeading(s.title));
    content.push(para(s.findings + (s.appendixRef ? `  (Appendix ${s.appendixRef}).` : "")));
  });

  // ===== 5 RISK EVALUATION =====
  content.push({ text: "", pageBreak: "before" });
  content.push(sectionBar(5, "Fire Risk Evaluation & Risk Matrix"));
  content.push(underline());
  content.push(para(`The overall fire risk at the premises has been evaluated using the risk-level estimator methodology set out in PAS 79-1:2020, which considers the likelihood of fire occurring against the potential consequences for life safety.`));
  content.push(subHeading("Likelihood of Fire"));
  content.push(para(`${data.riskEvaluation.likelihood} \u2013 ${data.riskEvaluation.likelihoodNarrative}`));
  content.push(subHeading("Potential Consequences of Fire"));
  content.push(para(`${data.riskEvaluation.consequenceNarrative}`));
  content.push(riskMatrix(bp.riskMatrix, data.riskEvaluation.likelihood, data.riskEvaluation.consequence));
  content.push({ text: `Assessed position: ${data.riskEvaluation.likelihood} likelihood \u00d7 ${data.riskEvaluation.consequence} \u2192 highlighted cell.`, fontSize: 9, italics: true, color: colors.muted, margin: [0, 0, 0, 8] });
  // rating banner
  content.push({
    table: { widths: ["*"], body: [[
      { text: `OVERALL RISK RATING:  ${rating.toUpperCase()}`, bold: true, fontSize: 13, color: colors.white, alignment: "center", fillColor: require("./theme").ratingColor[rating], margin: [0, 10, 0, 10] }
    ]] },
    layout: "noBorders", margin: [0, 4, 0, 10], unbreakable: true
  });
  content.push(para(data.riskEvaluation.ratingNarrative));
  content.push(subHeading("Risk Rating Definitions"));
  content.push({
    table: { widths: ["auto", "*"], body: bp.riskMatrix.definitions.map((d) => [
      { text: d[0], bold: true, fontSize: 9, fillColor: colors.light, margin: [5, 3, 5, 3] },
      { text: d[1], fontSize: 9, margin: [5, 3, 5, 3] }
    ]) },
    layout: { hLineColor: () => colors.line, vLineColor: () => colors.line, hLineWidth: () => 0.5, vLineWidth: () => 0.5 }
  });

  // ===== 6 MONITORING =====
  content.push({ text: "", pageBreak: "before" });
  const mon = JSON.parse(JSON.stringify(bp.monitoring));
  mon.blocks[0].body = mon.blocks[0].body.replace("{{validTo}}", fmtDate(validTo));
  addBoilerplateSection(content, 6, mon);

  // ===== 7 APPENDIX =====
  content.push({ text: "", pageBreak: "before" });
  content.push(sectionBar(7, "Appendix \u2014 Photographic Record"));
  content.push(underline());
  (data.appendices || []).forEach((ap) => {
    content.push(appendixTag(ap.ref, ap.title));
    content.push(photoGrid(ap, photosDir, 3));
  });

  // ===== APPENDIX I CERTIFICATION + SIGN-OFF =====
  if (data.certification) {
    content.push({ text: "", pageBreak: "before" });
    content.push(appendixTag("I", "Certification"));
    content.push(para(data.certification.intro));
    (data.certification.items || []).forEach((c) => content.push({ text: `\u2022  ${c}`, fontSize: 10, margin: [0, 0, 0, 5], alignment: "justify" }));
    content.push({ text: "Assessed by", fontSize: 10, margin: [0, 20, 0, 2] });
    content.push({ text: m.approval.approvedBy || m.assessor.name, bold: true, fontSize: 11 });
    content.push({ text: m.assessor.title, fontSize: 10, color: colors.muted });
    content.push({ text: m.assessor.organisation, fontSize: 10, color: colors.muted });
    if (m.approval.approvedBy && m.approval.approvedAt) {
      content.push({ text: `Approved by ${m.approval.approvedBy} on ${fmtDate(m.approval.approvedAt)}`, fontSize: 8, italics: true, color: colors.muted, margin: [0, 8, 0, 0] });
    }
  }

  // ===== DOC =====
  return {
    pageSize: "A4",
    pageMargins,
    defaultStyle: { font: "Helvetica", fontSize: 10, color: colors.text },
    header: (currentPage) => {
      if (currentPage === 1 && bannerImg) {
        return { image: bannerImg, width: 495, margin: [50, 20, 50, 0] };
      }
      return {
        columns: [
          { text: "LONDON & KENT CONSTRUCTION LTD", fontSize: 8, bold: true, color: colors.navy, margin: [50, 30, 0, 0] },
          { text: `Type 1 Fire Risk Assessment`, fontSize: 8, color: colors.muted, alignment: "right", margin: [0, 30, 50, 0] }
        ]
      };
    },
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: `Fire Risk Assessment  |  ${m.propertyName}  |  Ref: ${m.versionRef}`, fontSize: 7, color: colors.muted, margin: [50, 10, 0, 0] },
        { text: `Page ${currentPage} of ${pageCount}`, fontSize: 7, color: colors.muted, alignment: "right", margin: [0, 10, 50, 0] }
      ]
    }),
    content
  };
}

function addBoilerplateSection(content, num, sec) {
  content.push(sectionBar(num, sec.title));
  content.push(underline());
  if (sec.intro) content.push(para(sec.intro));
  (sec.blocks || []).forEach((b) => {
    content.push(subHeading(b.heading));
    content.push(para(b.body));
  });
}

module.exports = { buildDocDefinition };
