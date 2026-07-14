#!/usr/bin/env node
/*
 * FRA Generator - standalone entry point.
 *
 * Usage:  node src/generate.js [path/to/assessment.json] [output.pdf]
 *
 * This is the STANDALONE input source. When integrated into FDIMS,
 * only this file is replaced (data comes from Supabase instead of a
 * local JSON file); template.js and the rest are reused unchanged.
 */
const fs = require("fs");
const path = require("path");
const PdfPrinter = require("pdfmake");
const { buildDocDefinition } = require("./template");

const fontDir = path.resolve(__dirname, "..", "assets", "fonts");

// Bundled DejaVu Sans -- full Unicode coverage (arrows, en-dashes, smart quotes)
// and portable to Netlify where system fonts aren't guaranteed.
const fonts = {
  Helvetica: {
    normal: path.join(fontDir, "DejaVuSans.ttf"),
    bold: path.join(fontDir, "DejaVuSans-Bold.ttf"),
    italics: path.join(fontDir, "DejaVuSans-Oblique.ttf"),
    bolditalics: path.join(fontDir, "DejaVuSans-BoldOblique.ttf")
  }
};

function generate(dataPath, outPath) {
  const projectRoot = path.resolve(__dirname, "..");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  // Guard: block generation unless approved (audit gate).
  // Comment out for local preview; enforced in FDIMS.
  const approved = data.meta.approval && data.meta.approval.approvedBy;
  if (!approved && !process.env.FRA_ALLOW_UNAPPROVED) {
    console.warn("\u26a0  WARNING: report has no approver set (meta.approval.approvedBy).");
    console.warn("   Set FRA_ALLOW_UNAPPROVED=1 to generate a draft/preview anyway.");
  }

  const printer = new PdfPrinter(fonts);
  const docDef = buildDocDefinition(data, {
    baseDir: projectRoot,
    photosDir: path.resolve(projectRoot, "data", "photos")
  });

  const pdfDoc = printer.createPdfKitDocument(docDef);
  const stream = fs.createWriteStream(outPath);
  pdfDoc.pipe(stream);
  pdfDoc.end();
  return new Promise((res, rej) => {
    stream.on("finish", () => res(outPath));
    stream.on("error", rej);
  });
}

if (require.main === module) {
  const dataPath = process.argv[2] || path.resolve(__dirname, "..", "data", "assessment.json");
  const outPath = process.argv[3] || path.resolve(__dirname, "..", "output.pdf");
  generate(dataPath, outPath)
    .then((p) => console.log("\u2713 Generated:", p))
    .catch((e) => { console.error("Generation failed:", e); process.exit(1); });
}

module.exports = { generate };
