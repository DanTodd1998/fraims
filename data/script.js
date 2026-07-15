/* ============================================================
   FRAIMS — Supabase configuration
   Public URL + anon key are safe in front-end code.
   ============================================================ */
const SUPABASE_URL = "https://jfalmitemyxdkavobqbl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYWxtaXRlbXl4ZGthdm9icWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNTgxMTksImV4cCI6MjA5OTYzNDExOX0.pKWexGA8HVZRvED56YwR-PMqLC5oBoxVrM8ya-lHAeg";
const PHOTO_BUCKET = "assessment-photos";

// Appendix categories — MUST match the fra-generator appendix refs so the
// data shape lines up with the PDF engine later.
const PHOTO_CATEGORIES = [
  { ref: "A", key: "exterior",  title: "Exterior" },
  { ref: "B", key: "staircases", title: "Staircases" },
  { ref: "C", key: "management", title: "Fire Management" },
  { ref: "D", key: "detection",  title: "Detection & Alarm" },
  { ref: "F", key: "lighting",   title: "Emergency Lighting" },
  { ref: "G", key: "signage",    title: "Signage" }
];

// Single shared Supabase client.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


function startNewAssessment() {
  document.querySelector(".container").innerHTML = `
    <section class="welcome">
      <h2>New Fire Risk Assessment</h2>
      <p>Enter the basic property and assessment details.</p>
    </section>

    <section class="welcome">
      <form id="newAssessmentForm">

        <div class="form-group">
          <label for="propertyName">Property Name</label>
          <input id="propertyName" required>
        </div>

        <div class="form-group">
          <label for="propertyAddress">Property Address</label>
          <textarea id="propertyAddress" required></textarea>
        </div>

        <div class="form-group">
          <label for="clientName">Client Name</label>
          <input id="clientName">
        </div>

        <div class="form-group">
          <label for="buildingType">Building Type</label>
          <select id="buildingType">
            <option value="">Select building type</option>
            <option>Residential block</option>
            <option>Commercial premises</option>
            <option>Mixed-use building</option>
            <option>House in multiple occupation</option>
            <option>Office</option>
            <option>Retail premises</option>
            <option>Other</option>
          </select>
        </div>

        <div class="form-group">
          <label for="storeys">Number of Storeys</label>
          <input id="storeys" type="number" min="1">
        </div>

        <div class="form-group">
          <label for="assessor">Assessor</label>
          <input id="assessor" value="Daniel Todd">
        </div>

        <div class="form-group">
          <label for="assessmentDate">Assessment Date</label>
          <input id="assessmentDate" type="date" required>
        </div>

        <button type="submit" class="action-button action-button-primary">
          Save and Continue
        </button>

        <button
          type="button"
          class="action-button action-button-secondary"
          onclick="showDashboard()"
        >
          Back to Dashboard
        </button>

      </form>
    </section>
  `;

  document.getElementById("assessmentDate").value =
    new Date().toISOString().split("T")[0];

  document
    .getElementById("newAssessmentForm")
    .addEventListener("submit", saveNewAssessment);
}

function saveNewAssessment(event) {
  event.preventDefault();

  const assessment = {
    // Stable per-assessment id — used to give each property its own photo
    // folder in the bucket. Added for the Photographs module.
    id: "FRA-" + Date.now(),
    propertyName: document.getElementById("propertyName").value.trim(),
    propertyAddress: document.getElementById("propertyAddress").value.trim(),
    clientName: document.getElementById("clientName").value.trim(),
    buildingType: document.getElementById("buildingType").value,
    storeys: document.getElementById("storeys").value,
    assessor: document.getElementById("assessor").value.trim(),
    assessmentDate: document.getElementById("assessmentDate").value,
    status: "Draft",
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(
    "fraimsCurrentAssessment",
    JSON.stringify(assessment)
  );

  showAssessmentWorkspace();
}

function showAssessmentWorkspace() {
  const assessment = JSON.parse(
    localStorage.getItem("fraimsCurrentAssessment") || "{}"
  );

  document.querySelector(".container").innerHTML = `
    <section class="welcome">
      <h2>${escapeHtml(assessment.propertyName || "New Assessment")}</h2>
      <p>${escapeHtml(assessment.propertyAddress || "")}</p>
      <p>
        <span class="status-badge">
          ${escapeHtml(assessment.status || "Draft")}
        </span>
      </p>
    </section>

    <section class="dashboard-grid">

      <button class="dashboard-card" onclick="showBuildingDetails()">
        <div class="icon">🏢</div>
        <h3>Building Details</h3>
        <p>Record the construction, use, occupancy and fire strategy.</p>
      </button>

      <button class="dashboard-card" onclick="showPhotographs()">
        <div class="icon">📷</div>
        <h3>Photographs</h3>
        <p>Upload and categorise site photographs.</p>
      </button>

      <button class="dashboard-card" onclick="showFireRiskFindings()">
        <div class="icon">🔥</div>
        <h3>Fire Risk Findings</h3>
        <p>Record hazards, controls and significant findings.</p>
      </button>

    </section>

    <button
      class="action-button action-button-secondary"
      onclick="showDashboard()"
    >
      Back to Dashboard
    </button>
  `;
}

function showDashboard() {
  location.reload();
}

function showDraftAssessments() {
  const assessment = JSON.parse(
    localStorage.getItem("fraimsCurrentAssessment") || "null"
  );

  if (!assessment) {
    alert("No draft assessments found.");
    return;
  }

  showAssessmentWorkspace();
}

function showCompletedAssessments() {
  alert("Completed Assessments will be added later.");
}

function showBuildingDetails() {
  const assessment = JSON.parse(
    localStorage.getItem("fraimsCurrentAssessment") || "{}"
  );

  const details = assessment.buildingDetails || {};

  document.querySelector(".container").innerHTML = `
    <section class="welcome">
      <h2>Building Details</h2>
      <p>Record the main details of the premises.</p>
    </section>

    <section class="welcome">
      <div class="form-group">
        <label for="buildingUse">Primary Use</label>
        <input id="buildingUse" value="${escapeHtml(details.buildingUse || "")}" placeholder="Example: Residential block">
      </div>

      <div class="form-group">
        <label for="yearBuilt">Approximate Year Built</label>
        <input id="yearBuilt" value="${escapeHtml(details.yearBuilt || "")}" placeholder="Example: 1985">
      </div>

      <div class="form-group">
        <label for="occupancy">Occupancy</label>
        <input id="occupancy" value="${escapeHtml(details.occupancy || "")}" placeholder="Example: General needs housing">
      </div>

      <div class="form-group">
        <label for="numberOfFlats">Number of Flats</label>
        <input id="numberOfFlats" type="number" value="${details.numberOfFlats || ""}">
      </div>

      <div class="form-group">
        <label for="fireStrategy">Fire Strategy</label>
        <select id="fireStrategy">
          <option value="">Select...</option>
          <option ${details.fireStrategy === "Stay Put" ? "selected" : ""}>Stay Put</option>
          <option ${details.fireStrategy === "Simultaneous Evacuation" ? "selected" : ""}>Simultaneous Evacuation</option>
          <option ${details.fireStrategy === "Phased Evacuation" ? "selected" : ""}>Phased Evacuation</option>
          <option ${details.fireStrategy === "Unknown" ? "selected" : ""}>Unknown</option>
        </select>
      </div>

      <button
        class="action-button action-button-primary"
        onclick="saveBuildingDetails()"
      >
        Save Building Details
      </button>

      <button
        class="action-button action-button-secondary"
        onclick="showAssessmentWorkspace()"
      >
        Back to Workspace
      </button>
    </section>
  `;
}

function saveBuildingDetails() {
  const assessment = JSON.parse(
    localStorage.getItem("fraimsCurrentAssessment") || "{}"
  );

  assessment.buildingDetails = {
    buildingUse: document.getElementById("buildingUse").value.trim(),
    yearBuilt: document.getElementById("yearBuilt").value.trim(),
    occupancy: document.getElementById("occupancy").value.trim(),
    numberOfFlats: document.getElementById("numberOfFlats").value.trim(),
    fireStrategy: document.getElementById("fireStrategy").value
  };

  assessment.updatedAt = new Date().toISOString();

  localStorage.setItem(
    "fraimsCurrentAssessment",
    JSON.stringify(assessment)
  );

  console.log(assessment);
  alert("Building details saved.");

  showAssessmentWorkspace();
}

/* ============================================================
   Photographs module — Supabase cloud storage, per category.
   ============================================================ */
function showPhotographs() {
  const assessment = JSON.parse(
    localStorage.getItem("fraimsCurrentAssessment") || "{}"
  );

  if (!assessment.id) {
    alert("Please create and save an assessment first.");
    showDashboard();
    return;
  }

  const photos = assessment.photos || {};

  const categoriesHtml = PHOTO_CATEGORIES.map((cat) => {
    const list = photos[cat.key] || [];
    const thumbs = list.length
      ? list.map((p, i) => `
          <div class="photo-thumb">
            <img src="${escapeHtml(p.url)}" alt="${escapeHtml(cat.title)} photo">
            <button class="remove-photo" title="Remove"
              onclick="removePhoto('${cat.key}', ${i})">×</button>
          </div>
        `).join("")
      : `<p class="photo-empty">No photographs uploaded yet.</p>`;

    return `
      <div class="photo-category">
        <h3>${cat.title}</h3>
        <div class="photo-upload-row">
          <input type="file" accept="image/*" id="file-${cat.key}">
          <button class="action-button action-button-primary"
            onclick="uploadPhoto('${cat.key}')">Upload</button>
        </div>
        <p class="upload-status" id="status-${cat.key}"></p>
        <div class="photo-thumbs">${thumbs}</div>
      </div>
    `;
  }).join("");

  document.querySelector(".container").innerHTML = `
    <section class="welcome">
      <h2>Photographs</h2>
      <p>Upload site photographs grouped by report category.</p>
    </section>

    <section class="welcome">
      ${categoriesHtml}

      <button
        class="action-button action-button-secondary"
        onclick="showAssessmentWorkspace()">
        Back to Workspace
      </button>
    </section>
  `;
}

async function uploadPhoto(categoryKey) {
  const assessment = JSON.parse(
    localStorage.getItem("fraimsCurrentAssessment") || "{}"
  );
  const statusEl = document.getElementById("status-" + categoryKey);
  const fileInput = document.getElementById("file-" + categoryKey);
  const file = fileInput.files[0];

  if (!file) {
    setStatus(statusEl, "Choose a photo first.", "error");
    return;
  }

  setStatus(statusEl, "Uploading…", "");

  // Unique path: <bucket>/<assessmentId>/<category>/<timestamp>-<name>
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${assessment.id}/${categoryKey}/${Date.now()}-${safeName}`;

  try {
    const { error: uploadError } = await supabaseClient
      .storage
      .from(PHOTO_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    // Public URL (bucket is public for now).
    const { data: urlData } = supabaseClient
      .storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(path);

    // Save reference into the assessment record.
    if (!assessment.photos) assessment.photos = {};
    if (!assessment.photos[categoryKey]) assessment.photos[categoryKey] = [];
    assessment.photos[categoryKey].push({
      path: path,
      url: urlData.publicUrl,
      name: file.name,
      uploadedAt: new Date().toISOString()
    });
    assessment.updatedAt = new Date().toISOString();

    localStorage.setItem("fraimsCurrentAssessment", JSON.stringify(assessment));

    setStatus(statusEl, "Uploaded.", "success");
    showPhotographs(); // re-render to show the new thumbnail
  } catch (err) {
    console.error("Upload failed:", err);
    setStatus(statusEl, "Upload failed: " + (err.message || "unknown error"), "error");
  }
}

async function removePhoto(categoryKey, index) {
  const assessment = JSON.parse(
    localStorage.getItem("fraimsCurrentAssessment") || "{}"
  );
  const list = (assessment.photos && assessment.photos[categoryKey]) || [];
  const photo = list[index];
  if (!photo) return;

  if (!confirm("Remove this photo?")) return;

  try {
    // Delete from the bucket, then from the record.
    const { error } = await supabaseClient
      .storage
      .from(PHOTO_BUCKET)
      .remove([photo.path]);
    if (error) throw error;

    list.splice(index, 1);
    assessment.photos[categoryKey] = list;
    assessment.updatedAt = new Date().toISOString();
    localStorage.setItem("fraimsCurrentAssessment", JSON.stringify(assessment));

    showPhotographs();
  } catch (err) {
    console.error("Remove failed:", err);
    alert("Could not remove photo: " + (err.message || "unknown error"));
  }
}

function setStatus(el, message, kind) {
  if (!el) return;
  el.textContent = message;
  el.className = "upload-status" + (kind ? " " + kind : "");
}

function showFireRiskFindings() {
  alert("Fire Risk Findings will be added next.");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}