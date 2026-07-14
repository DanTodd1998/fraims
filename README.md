# FRA Generator

Generates London & Kent Construction Type 1 Fire Risk Assessment PDFs in the
**38–40 Gloucester Terrace narrative format** (professional prose per system,
PAS 79-1 risk matrix, photographic appendix, certification + sign-off).

Built standalone now, designed to drop into **FDIMS** later with no rewrite of
the PDF layer.

## Quick start

```bash
npm install
node src/generate.js                       # uses data/assessment.json -> output.pdf
node src/generate.js my.json report.pdf    # custom input/output
```

The approval gate warns if `meta.approval.approvedBy` is empty. To produce a
preview before sign-off:

```bash
FRA_ALLOW_UNAPPROVED=1 node src/generate.js
```

## How it's structured

The design is a **pure function**: `assessment data (JSON) -> PDF`. "Standalone"
vs "integrated" only changes *where the JSON comes from*.

```
fra-generator/
  data/
    assessment.json          <- the input (metadata + findings + risk + appendices)
    photos/<category>/*.jpg   <- photos, foldered by appendix category
  src/
    generate.js              <- ENTRY POINT / input source (swap this for FDIMS)
    template.js              <- maps JSON -> pdfmake document definition
    boilerplate.js           <- fixed legal text (sections 1,2,3,6) + risk matrix
    theme.js                 <- L&K colours, margins, banner path
    helpers.js               <- dates, photo grid, risk matrix rendering
    aiDraft.js               <- OPTIONAL: photos -> draft findings (human-approved)
  assets/
    banner.png               <- L&K letterhead banner (2200x212)
    fonts/DejaVuSans*.ttf     <- bundled Unicode font (arrows, en-dashes, quotes)
```

### Input data (`data/assessment.json`)

- `meta` — property details, assessor, dates. `validityMonths` auto-computes
  "valid to" (assessment date + N months).
- `report.buildingOverview` — array of paragraphs.
- `report.sections` — the per-system narrative findings. Each has a `title`,
  `findings`, and optional `appendixRef` (adds "(Appendix X)." to the text).
- `riskEvaluation` — `likelihood` (Low/Medium/High) × `consequence`
  (Slight/Moderate/Extreme). The overall rating and highlighted matrix cell are
  **auto-derived** from these via the PAS 79-1 grid in `boilerplate.js`.
- `appendices` — photo groups. `layout: "single"` = one large image (exterior);
  `layout: "grid"` = 3-column captioned grid. Only categories with photos render.
- `certification` / `meta.approval` — Appendix I text and the sign-off block.

### The risk matrix

`boilerplate.js` holds the 3×3 PAS 79-1 grid. Change one cell there and every
future report uses it. Rating -> colour mapping lives in `theme.js`.

## AI-assisted drafting (optional, human-in-the-loop)

`aiDraft.js` sends the appendix photos to Claude and writes **draft** findings to
`data/assessment.drafts.json` with `status: "pending_review"`. It never touches
`assessment.json`. The qualified assessor reviews/edits and copies approved text
across. FRA findings carry legal weight — the human approves, the AI only drafts.

```bash
export ANTHROPIC_API_KEY=sk-...
node src/aiDraft.js
```

## Moving into FDIMS

Because the PDF layer is a pure function, integration is mostly plumbing:

1. **Input source** — replace `generate.js`'s `fs.readFileSync` with a Supabase
   query that assembles the same JSON shape from your assessment + photos tables.
2. **Photos** — swap `loadImage`'s filesystem read for a Supabase Storage fetch
   (it already returns a data URI, so `template.js` is unchanged).
3. **Approval gate** — enforce `status = 'approved'` on the record before the
   Netlify function will generate. Stamp `approved_by` / `approved_at`.
4. **Delivery** — pipe the PDF buffer to Resend (email) or return a download.
5. **AI drafting** — call `aiDraft` server-side from the Netlify function so the
   API key stays off the client; write drafts to a `draft_findings` column.

`template.js`, `boilerplate.js`, `theme.js`, and `helpers.js` move across as-is.
