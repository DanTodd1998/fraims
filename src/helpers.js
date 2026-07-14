const fs = require("fs");
const path = require("path");
const { colors, ratingColor } = require("./theme");

// ---- dates ----
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function addMonths(iso, months) {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// ---- images ----
// Returns a data URI, or null if the file is missing (so generation never crashes
// on an absent photo -- it renders a placeholder instead).
function loadImage(baseDir, relPath) {
  try {
    const full = path.resolve(baseDir, relPath);
    const buf = fs.readFileSync(full);
    const ext = path.extname(full).slice(1).toLowerCase();
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (e) {
    return null;
  }
}

// ---- photo grid ----
// layout "single": one large centred image.
// layout "grid": rows of `cols` images with captions beneath.
function photoGrid(appendix, photosDir, cols = 3) {
  const photos = appendix.photos || [];
  if (photos.length === 0) {
    return { text: "No photographs supplied for this section.", italics: true, color: colors.muted, margin: [0, 4, 0, 8] };
  }

  if (appendix.layout === "single") {
    const p = photos[0];
    const img = loadImage(photosDir, p.file);
    return {
      stack: [
        img
          ? { image: img, fit: [360, 460], alignment: "center", margin: [0, 6, 0, 4] }
          : missingBox(340, 300),
        p.caption ? { text: p.caption, italics: true, alignment: "center", fontSize: 9, color: colors.muted } : {}
      ],
      unbreakable: true
    };
  }

  // grid
  const rows = [];
  for (let i = 0; i < photos.length; i += cols) {
    const slice = photos.slice(i, i + cols);
    const cells = slice.map((p) => {
      const img = loadImage(photosDir, p.file);
      return {
        stack: [
          img ? { image: img, fit: [150, 150], alignment: "center" } : missingBox(150, 130),
          p.caption ? { text: p.caption, italics: true, alignment: "center", fontSize: 8, color: colors.muted, margin: [0, 3, 0, 0] } : {}
        ]
      };
    });
    while (cells.length < cols) cells.push({ text: "" }); // pad row
    rows.push(cells);
  }
  return {
    table: { widths: Array(cols).fill("*"), body: rows },
    layout: "noBorders",
    margin: [0, 6, 0, 8]
  };
}

function missingBox(w, h) {
  return {
    table: { widths: [w], heights: [h], body: [[{ text: "Photo not found", italics: true, color: colors.muted, alignment: "center", margin: [0, h / 2 - 6, 0, 0] }]] },
    layout: {
      hLineColor: () => colors.line, vLineColor: () => colors.line,
      hLineWidth: () => 0.5, vLineWidth: () => 0.5
    },
    alignment: "center"
  };
}

// ---- risk matrix ----
function riskMatrix(matrix, selLikelihood, selConsequence) {
  const header = [{ text: "Likelihood \u2193 / Harm \u2192", bold: true, fontSize: 8, fillColor: colors.navy, color: colors.white, margin: [3, 5, 3, 5] }]
    .concat(matrix.consequences.map((c) => ({ text: c, bold: true, fontSize: 8, alignment: "center", fillColor: colors.navy, color: colors.white, margin: [3, 5, 3, 5] })));

  const body = [header];
  for (const L of matrix.likelihoods) {
    const row = [{ text: `${L} likelihood`, bold: true, fontSize: 8, fillColor: colors.light, margin: [3, 6, 3, 6] }];
    for (const C of matrix.consequences) {
      const rating = matrix.grid[L][C];
      const isSel = L === selLikelihood && C === selConsequence;
      row.push({
        text: rating + (isSel ? "  \u25c0" : ""),
        fontSize: 8,
        bold: isSel,
        alignment: "center",
        fillColor: isSel ? ratingColor[rating] : colors.cellIdle,
        color: isSel ? "#ffffff" : colors.text,
        margin: [3, 6, 3, 6]
      });
    }
    body.push(row);
  }
  return {
    table: { widths: ["auto", "*", "*", "*"], body },
    layout: {
      hLineColor: () => colors.white, vLineColor: () => colors.white,
      hLineWidth: () => 2, vLineWidth: () => 2
    },
    margin: [0, 8, 0, 10],
    unbreakable: true
  };
}

module.exports = { fmtDate, addMonths, loadImage, photoGrid, riskMatrix };
