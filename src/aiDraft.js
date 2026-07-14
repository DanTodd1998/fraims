#!/usr/bin/env node
/*
 * AI-assisted findings drafter (OPTIONAL, human-in-the-loop).
 *
 * Reads the photos referenced in assessment.json, sends them to Claude with
 * a structured prompt, and writes DRAFT findings into a *separate* file
 * (assessment.drafts.json). It NEVER overwrites assessment.json directly.
 *
 * The assessor then reviews/edits the drafts and copies approved text into
 * assessment.json by hand (standalone) or via the FDIMS review screen (later).
 * This is the human-approval gate: AI drafts, the qualified assessor approves.
 *
 * Usage:
 *   export ANTHROPIC_API_KEY=sk-...
 *   node src/aiDraft.js [assessment.json]
 *
 * Requires network access to api.anthropic.com.
 */
const fs = require("fs");
const path = require("path");
const { loadImage } = require("./helpers");

const MODEL = "claude-sonnet-4-6";
const API_URL = "https://api.anthropic.com/v1/messages";

// System prompt keeps Claude in "draft for a qualified assessor" mode --
// tentative, evidence-based, no invented certification facts.
const SYSTEM = `You are assisting a qualified fire risk assessor by drafting observations for a Type 1 Fire Risk Assessment of the communal areas of a UK residential building. You are drafting ONLY -- a qualified human assessor will review, correct, and approve every word before it is issued.

Rules:
- Describe only what is visibly evident in the photographs. Do not assert test dates, certification status, or compliance conclusions that cannot be seen.
- Use measured, professional UK fire-safety language consistent with PAS 79-1 and the Regulatory Reform (Fire Safety) Order 2005.
- Where something cannot be determined from a photo, say so plainly (e.g. "servicing status could not be confirmed from visual inspection").
- Never state a definitive pass/fail. This is narrative assessment prose, not a checklist.
- Keep each section to 2-4 sentences.
Return ONLY valid JSON, no markdown fences, in the shape: {"sections":[{"key":"...","findings":"..."}]}`;

async function draftFindings(dataPath) {
  const projectRoot = path.resolve(__dirname, "..");
  const photosDir = path.resolve(projectRoot, "data", "photos");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set. Export it before running aiDraft.");
  }

  // Build a content array: for each appendix category with photos, attach the
  // images and name the section they inform.
  const content = [];
  const sectionsWanted = [];
  for (const ap of data.appendices || []) {
    const withImgs = (ap.photos || [])
      .map((p) => ({ p, uri: loadImage(photosDir, p.file) }))
      .filter((x) => x.uri);
    if (withImgs.length === 0) continue;
    content.push({ type: "text", text: `--- Photographs for section: ${ap.title} (appendix ${ap.ref}) ---` });
    for (const { uri } of withImgs) {
      const [meta, b64] = uri.split(",");
      const media = meta.includes("png") ? "image/png" : "image/jpeg";
      content.push({ type: "image", source: { type: "base64", media_type: media, data: b64 } });
    }
    sectionsWanted.push({ ref: ap.ref, title: ap.title });
  }

  content.push({
    type: "text",
    text:
      `Building overview for context:\n${(data.report.buildingOverview || []).join("\n")}\n\n` +
      `Draft findings for these sections based on the photographs above: ` +
      sectionsWanted.map((s) => `"${s.title}"`).join(", ") +
      `. Use a lowercase key derived from the section (e.g. "Fire Detection & Alarm" -> "detection"). Return JSON only.`
  });

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content }]
    })
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  const text = (body.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .replace(/```json|```/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error("Could not parse model JSON. Raw response:\n" + text);
  }

  const outPath = path.resolve(projectRoot, "data", "assessment.drafts.json");
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), status: "pending_review", ...parsed }, null, 2));
  return outPath;
}

if (require.main === module) {
  const dataPath = process.argv[2] || path.resolve(__dirname, "..", "data", "assessment.json");
  draftFindings(dataPath)
    .then((p) => {
      console.log("\u2713 Draft findings written to:", p);
      console.log("  These are DRAFTS. Review and edit, then copy approved text into assessment.json.");
    })
    .catch((e) => { console.error("Draft failed:", e.message); process.exit(1); });
}

module.exports = { draftFindings };
