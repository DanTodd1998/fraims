/* ============================================================
   FRAIMS — Supabase configuration
   ============================================================ */
const SUPABASE_URL = "https://jfalmitemyxdkavobqbl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYWxtaXRlbXl4ZGthdm9icWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNTgxMTksImV4cCI6MjA5OTYzNDExOX0.pKWexGA8HVZRvED56YwR-PMqLC5oBoxVrM8ya-lHAeg";
const PHOTO_BUCKET = "assessment-photos";

const PHOTO_CATEGORIES = [
  { ref: "A", key: "exterior",  title: "Exterior" },
  { ref: "B", key: "staircases", title: "Staircases" },
  { ref: "C", key: "management", title: "Fire Management" },
  { ref: "D", key: "detection",  title: "Detection & Alarm" },
  { ref: "F", key: "lighting",   title: "Emergency Lighting" },
  { ref: "G", key: "signage",    title: "Signage" }
];

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================
   UNIVERSAL CORE — question definitions (Stage A, locked)
   Finding data attaches per question id at answer time.
   ============================================================ */
const UNIVERSAL_CORE = [
  { id:"SCOPE-01", section:"Scope & Responsible Persons", title:"Scope & limitations", prompt:"Record the assessment type (e.g. Type 1), what was and was not inspected, and any access limitations.", polarity:"neutral", applicability:"always", applicabilityRationale:"Every assessment must record its own scope and limitations.", evidence:"Areas marked 'not accessed', locked risers/voids, whether the assessment covers common parts only or includes flat entrance doors.", suggestedPriority:null, reference:"RRO 2005 Art. 9; GOV.UK guidance" },
  { id:"SCOPE-02", section:"Scope & Responsible Persons", title:"Responsible Person identified", prompt:"Has the Responsible Person / dutyholder been identified and recorded?", polarity:"positive", applicability:"always", applicabilityRationale:"The FSO requires a Responsible Person for all in-scope premises.", evidence:"Named RP, managing agent, freeholder; written evidence of who holds the duty.", suggestedPriority:null, reference:"RRO 2005 Art. 3 & 5" },
  { id:"SCOPE-03", section:"Scope & Responsible Persons", title:"Cooperation between dutyholders", prompt:"Where multiple dutyholders exist, are cooperation and coordination arrangements in place?", polarity:"positive", applicability:"context", applicabilityRationale:"Applies to multi-occupied or mixed-use premises. May be N/A for single-occupier.", evidence:"Shared fire strategy, written agreements between occupiers.", suggestedPriority:null, reference:"RRO 2005 Art. 22" },
  { id:"SCOPE-04", section:"Scope & Responsible Persons", title:"Previous assessment & outstanding actions", prompt:"Is a previous fire risk assessment available, and have its actions been completed?", polarity:"positive", applicability:"context", applicabilityRationale:"Applies where the premises has been assessed before. N/A for a first assessment.", evidence:"Prior report, action tracker, overdue items, completion dates.", suggestedPriority:null, reference:"RRO 2005 Art. 9" },

  { id:"PREM-01", section:"Premises & Occupancy", title:"Premises description", prompt:"Record the construction, age, height, number of storeys, use and layout of the premises.", polarity:"neutral", applicability:"always", applicabilityRationale:"Fundamental descriptive record for every assessment.", evidence:"Floors including basements, construction type, roof form, conversion history.", suggestedPriority:null, reference:"GOV.UK guidance" },
  { id:"PREM-02", section:"Premises & Occupancy", title:"Relevant persons", prompt:"Record who uses the building (residents, staff, visitors, contractors) and the occupancy pattern.", polarity:"neutral", applicability:"always", applicabilityRationale:"Identifying relevant persons is a core FSO requirement.", evidence:"Approximate occupancy, sleeping risk, lone or night-time occupancy.", suggestedPriority:null, reference:"RRO 2005 Art. 3" },
  { id:"PREM-03", section:"Premises & Occupancy", title:"Vulnerable persons", prompt:"Have occupants who may need assistance to evacuate been identified and considered?", polarity:"positive", applicability:"always", applicabilityRationale:"The FSO requires consideration of persons especially at risk. Never infer none exist from absence of information.", evidence:"Mobility or cognitive impairments; whether arrangements (or RPEEP where in scope) exist.", suggestedPriority:null, reference:"RRO 2005 Art. 9; Fire Safety (Residential Evacuation Plans) (England) Regs 2025 where in scope" },
  { id:"PREM-04", section:"Premises & Occupancy", title:"Fire loss / incident history", prompt:"Have any previous fires, near misses, or repeated unwanted alarm signals been recorded?", polarity:"neutral", applicability:"context", applicabilityRationale:"Applies where an incident/alarm history exists. Record 'none reported' where applicable.", evidence:"Incident logs, false-alarm patterns indicating a systemic issue.", suggestedPriority:null, reference:"GOV.UK guidance" },

  { id:"HAZ-01", section:"Fire Hazards — Ignition, Fuel, Oxygen", title:"Electrical safety", prompt:"Is there evidence of fixed installation testing (EICR) and are portable appliances in safe condition?", polarity:"positive", applicability:"always", applicabilityRationale:"All premises have electrical installations.", evidence:"In-date EICR, remedial action on C1/C2, damaged sockets or leads, overloaded extensions.", suggestedPriority:"medium", reference:"RRO 2005 Art. 8–13; BS 7671" },
  { id:"HAZ-02", section:"Fire Hazards — Ignition, Fuel, Oxygen", title:"Heating & cooking", prompt:"Are there unsafe heating or cooking arrangements?", polarity:"hazard", applicability:"always", applicabilityRationale:"All premises have some heating or cooking source; nature varies by type.", evidence:"Portable heaters near combustibles, unguarded appliances, gas safety records, cooking in escape routes.", suggestedPriority:"high", reference:"RRO 2005 Art. 8–13" },
  { id:"HAZ-03", section:"Fire Hazards — Ignition, Fuel, Oxygen", title:"Smoking", prompt:"Is there evidence of smoking in prohibited areas or inadequate smoking controls?", polarity:"hazard", applicability:"always", applicabilityRationale:"Smoking risk is universally considered, even where prohibited.", evidence:"Evidence of smoking on escape routes, provision/condition of designated areas.", suggestedPriority:"medium", reference:"RRO 2005 Art. 8–13" },
  { id:"HAZ-04", section:"Fire Hazards — Ignition, Fuel, Oxygen", title:"Combustible materials & housekeeping", prompt:"Is combustible material, waste, or storage present in escape routes or plant areas?", polarity:"hazard", applicability:"always", applicabilityRationale:"Housekeeping is a universal control measure.", evidence:"Items stored in corridors or stairs, refuse accumulation, storage under stairs.", suggestedPriority:"high", reference:"RRO 2005 Art. 8–13" },
  { id:"HAZ-05", section:"Fire Hazards — Ignition, Fuel, Oxygen", title:"Arson / deliberate ignition", prompt:"Are there vulnerabilities to deliberate fire-setting?", polarity:"hazard", applicability:"always", applicabilityRationale:"Arson risk is considered for all premises, though exposure varies.", evidence:"Accessible external refuse, unsecured storage, poor perimeter security, previous incidents.", suggestedPriority:null, reference:"GOV.UK arson reduction guidance" },
  { id:"HAZ-06", section:"Fire Hazards — Ignition, Fuel, Oxygen", title:"Dangerous substances", prompt:"Are dangerous or highly flammable substances present and inadequately controlled?", polarity:"hazard", applicability:"context", applicabilityRationale:"Applies where flammable/dangerous substances are stored or used. Normally N/A in residential common parts.", evidence:"Fuel, gas cylinders, chemical storage; DSEAR relevance in commercial/industrial.", suggestedPriority:null, reference:"RRO 2005 Art. 12; DSEAR 2002" },

  { id:"ESCAPE-01", section:"Means of Escape", title:"Escape routes clear & adequate", prompt:"Are escape routes clear, unobstructed, and of adequate width and capacity?", polarity:"positive", applicability:"always", applicabilityRationale:"Means of escape is fundamental to every assessment.", evidence:"Obstructions, storage, routes not leading to a place of safety, adequacy for occupancy.", suggestedPriority:"high", reference:"RRO 2005 Art. 14" },
  { id:"ESCAPE-02", section:"Means of Escape", title:"Travel distances", prompt:"Are travel distances to a place of relative or ultimate safety acceptable for the use and occupancy?", polarity:"positive", applicability:"always", applicabilityRationale:"Always assessed; the acceptable distance differs by premises type and guide.", evidence:"Single-direction (dead-end) travel, distances against the relevant premises guide.", suggestedPriority:null, reference:"RRO 2005 Art. 14; premises-appropriate GOV.UK guide" },
  { id:"ESCAPE-03", section:"Means of Escape", title:"Final exits & security", prompt:"Do final exits open easily in the direction of escape without a key?", polarity:"positive", applicability:"always", applicabilityRationale:"Final exit usability is universally critical.", evidence:"Thumb-turns vs deadlocks, panic hardware where required, exits obstructed externally.", suggestedPriority:"high", reference:"RRO 2005 Art. 14" },
  { id:"ESCAPE-04", section:"Means of Escape", title:"Evacuation strategy appropriate", prompt:"Is the evacuation strategy (stay-put / simultaneous / phased) appropriate and supported by the fire protection provided?", polarity:"positive", applicability:"always", applicabilityRationale:"Every building has a strategy, explicit or implicit. The appropriate strategy differs entirely by type; the tool must never suggest one.", evidence:"Consistency between strategy and detection, compartmentation and management; occupant awareness.", suggestedPriority:null, reference:"RRO 2005; premises guide; BS 9792:2025 / PAS 79-1:2020 as methodology" },
  { id:"ESCAPE-05", section:"Means of Escape", title:"Assistance for disabled / vulnerable persons", prompt:"Are arrangements in place to assist those who cannot escape unaided?", polarity:"positive", applicability:"always", applicabilityRationale:"Consideration of assisted escape is a universal FSO duty.", evidence:"Refuges, evacuation lifts, PEEPs or RPEEP where in scope, staff assistance procedures.", suggestedPriority:null, reference:"RRO 2005 Art. 15; Fire Safety (Residential Evacuation Plans) (England) Regs 2025 where in scope" },

  { id:"DET-01", section:"Fire Detection & Warning", title:"Detection & alarm provided", prompt:"Is a fire detection and warning system provided appropriate to the premises and evacuation strategy?", polarity:"positive", applicability:"always", applicabilityRationale:"Some means of raising the alarm is required in all premises; category/type varies.", evidence:"System category and grade, coverage of risk areas and escape routes.", suggestedPriority:"high", reference:"RRO 2005 Art. 13; BS 5839 series" },
  { id:"DET-02", section:"Fire Detection & Warning", title:"System operational", prompt:"Is the system operational and free of faults at the time of inspection?", polarity:"positive", applicability:"always", applicabilityRationale:"Operational status is always checked where a system exists.", evidence:"Panel status, disablements, fault indicators.", suggestedPriority:"high", reference:"BS 5839 series" },
  { id:"DET-03", section:"Fire Detection & Warning", title:"Audibility / alerting", prompt:"Can the fire warning be detected by all relevant persons, including those asleep or with sensory impairment?", polarity:"positive", applicability:"always", applicabilityRationale:"Effective alerting of all occupants is universal.", evidence:"Sounder coverage, visual or vibrating alerting devices where needed.", suggestedPriority:"medium", reference:"BS 5839 series" },
  { id:"DET-04", section:"Fire Detection & Warning", title:"Servicing & testing records", prompt:"Is there evidence of routine testing and servicing of the detection and alarm system?", polarity:"positive", applicability:"context", applicabilityRationale:"Applies where a system is installed. N/A where none present or required.", evidence:"Weekly test log, periodic service certificates and dates.", suggestedPriority:"medium", reference:"BS 5839 series" },

  { id:"LIGHT-01", section:"Emergency Lighting & Signage", title:"Emergency lighting provided", prompt:"Is emergency escape lighting provided to escape routes and critical areas?", polarity:"positive", applicability:"context", applicabilityRationale:"Required where escape routes need illumination. May be N/A in small premises with adequate borrowed light — record rationale.", evidence:"Luminaire coverage at stairs, changes of direction, final exits.", suggestedPriority:"medium", reference:"RRO 2005 Art. 14; BS 5266 series" },
  { id:"LIGHT-02", section:"Emergency Lighting & Signage", title:"Emergency lighting maintained", prompt:"Is there evidence of testing and maintenance of the emergency lighting?", polarity:"positive", applicability:"context", applicabilityRationale:"Applies where emergency lighting is installed. N/A where none present or required.", evidence:"Monthly function test and annual full-duration test records.", suggestedPriority:"medium", reference:"BS 5266 series" },
  { id:"SIGN-01", section:"Emergency Lighting & Signage", title:"Fire safety signage", prompt:"Is fire safety signage present, adequate, and compliant with recognised guidance?", polarity:"positive", applicability:"always", applicabilityRationale:"Signage needs are universally assessed, though extent varies.", evidence:"Exit signs at direction changes, 'fire door keep shut' signs, assembly point signage where relevant, condition.", suggestedPriority:"low", reference:"RRO 2005 Art. 14; Safety Signs and Signals Regs 1996" },

  { id:"FFE-01", section:"Firefighting Equipment", title:"Provision appropriate", prompt:"Where provided, is firefighting equipment appropriate to the risk and correctly located?", polarity:"positive", applicability:"context", applicabilityRationale:"Appears where portable equipment is present or expected. In general-needs residential common parts, absence is often correct — may be N/A with rationale.", evidence:"Extinguisher types matched to risks, mounting, accessibility, signage.", suggestedPriority:null, reference:"RRO 2005 Art. 13; BS 5306 series" },
  { id:"FFE-02", section:"Firefighting Equipment", title:"Equipment maintained", prompt:"Where equipment is provided, is there evidence of servicing?", polarity:"positive", applicability:"context", applicabilityRationale:"Applies only where equipment is present. N/A where none provided.", evidence:"Service labels, annual maintenance dates.", suggestedPriority:"low", reference:"BS 5306 series" },

  { id:"PASS-01", section:"Passive Fire Protection", title:"Compartmentation", prompt:"Does compartmentation between fire compartments appear adequate and intact, so far as visible?", polarity:"positive", applicability:"always", applicabilityRationale:"Fundamental to most buildings. Assessed within the limits of a visual inspection; never infer adequacy from age or appearance alone.", evidence:"Visible breaches, gaps around services, damaged walls/ceilings; record visual-only limitations.", suggestedPriority:null, reference:"RRO 2005; Approved Document B; Fire Safety Act 2021 where applicable" },
  { id:"PASS-02", section:"Passive Fire Protection", title:"Fire doors", prompt:"Are fire doors in reasonable condition, self-closing, and effective, so far as inspected?", polarity:"positive", applicability:"always", applicabilityRationale:"Present in almost all in-scope premises. Scope may include flat entrance doors under the Fire Safety Act 2021.", evidence:"Gaps, damage, missing/damaged seals, propped-open doors, flat entrance door condition where in scope.", suggestedPriority:"high", reference:"RRO 2005; Fire Safety (England) Regs 2022; Fire Safety Act 2021" },
  { id:"PASS-03", section:"Passive Fire Protection", title:"Fire-stopping / service penetrations", prompt:"Is fire-stopping around service penetrations intact, so far as visible?", polarity:"positive", applicability:"context", applicabilityRationale:"Applies where penetrations pass through fire-resisting elements. Visibility varies; record limitations.", evidence:"Unsealed cable/pipe penetrations, riser cupboards, voids above suspended ceilings if accessible.", suggestedPriority:null, reference:"Approved Document B" },
  { id:"PASS-04", section:"Passive Fire Protection", title:"Smoke control", prompt:"Where provided, does the smoke control system (natural or mechanical) appear operational?", polarity:"positive", applicability:"context", applicabilityRationale:"Applies where smoke control is installed. N/A where none present or required.", evidence:"Automatic opening vents (AOVs), vents, service records.", suggestedPriority:null, reference:"Approved Document B; BS 7346 series" },

  { id:"FF-01", section:"Firefighter Access & Facilities", title:"Access for fire service", prompt:"Is there adequate access for firefighting appliances and personnel?", polarity:"positive", applicability:"always", applicabilityRationale:"Relevant to all premises, though requirements scale with size and height.", evidence:"Hardstanding, access roads, gated barriers, appliance-to-building distance.", suggestedPriority:null, reference:"Approved Document B" },
  { id:"FF-02", section:"Firefighter Access & Facilities", title:"Firefighting facilities", prompt:"Where provided or required, are risers, firefighting shafts and firefighting lifts present and maintained?", polarity:"positive", applicability:"context", applicabilityRationale:"Applies to taller/larger buildings where required. Normally N/A to low-rise.", evidence:"Dry/wet riser inlets, condition, test records; shaft/lift provision by height.", suggestedPriority:null, reference:"Approved Document B; BS 9990" },
  { id:"FF-03", section:"Firefighter Access & Facilities", title:"Fire service information", prompt:"Where required, is information provided for firefighters (e.g. premises information / secure information box)?", polarity:"positive", applicability:"context", applicabilityRationale:"Required for buildings in scope of the Fire Safety (England) Regs 2022. Normally N/A below those thresholds.", evidence:"Secure information box presence/contents, up-to-date building plans.", suggestedPriority:null, reference:"Fire Safety (England) Regulations 2022" },

  { id:"MGMT-01", section:"Management, Testing & Records", title:"Fire safety management", prompt:"Are there effective management arrangements for fire safety?", polarity:"positive", applicability:"always", applicabilityRationale:"A universal FSO requirement.", evidence:"Named responsibility, written policy, routine checks, evidence of competence.", suggestedPriority:null, reference:"RRO 2005 Art. 11 & 13" },
  { id:"MGMT-02", section:"Management, Testing & Records", title:"Emergency plan & procedures", prompt:"Is there an appropriate emergency plan and are procedures communicated to occupants?", polarity:"positive", applicability:"always", applicabilityRationale:"Required for all in-scope premises; complexity varies.", evidence:"Fire action notices, resident/staff information, plan matched to strategy.", suggestedPriority:"medium", reference:"RRO 2005 Art. 15" },
  { id:"MGMT-03", section:"Management, Testing & Records", title:"Training & drills", prompt:"Where staff are present, is fire safety training provided and are drills carried out?", polarity:"positive", applicability:"context", applicabilityRationale:"Applies where there are staff or an employer. Often N/A for long-term residential with no staff — record rationale.", evidence:"Training records, fire drill logs and dates.", suggestedPriority:null, reference:"RRO 2005 Art. 21" },
  { id:"MGMT-04", section:"Management, Testing & Records", title:"Testing, inspection & maintenance regime", prompt:"Is there an overall regime for testing and maintaining fire safety systems?", polarity:"positive", applicability:"always", applicabilityRationale:"Maintenance of fire precautions is a universal duty.", evidence:"Schedule covering alarm, emergency lighting, fire doors, risers and suppression as applicable.", suggestedPriority:"medium", reference:"RRO 2005 Art. 17" },
  { id:"MGMT-05", section:"Management, Testing & Records", title:"Records & documentation", prompt:"Are fire safety records maintained, accessible, and reasonably complete?", polarity:"positive", applicability:"always", applicabilityRationale:"Record-keeping supports demonstrable compliance.", evidence:"Logbook, certificates, action tracking, on-site accessibility.", suggestedPriority:"low", reference:"RRO 2005 Art. 9 & 17" },

  { id:"CONC-01", section:"Conclusions", title:"Significant findings", prompt:"Summarise the significant findings arising from the assessment.", polarity:"neutral", applicability:"always", applicabilityRationale:"Recording significant findings is a core FSO duty.", evidence:"Consolidation of the adverse findings above into a clear narrative.", suggestedPriority:null, reference:"RRO 2005 Art. 9(6)" },
  { id:"CONC-02", section:"Conclusions", title:"Action plan", prompt:"Record recommended actions with priority, responsible party, and target date.", polarity:"neutral", applicability:"always", applicabilityRationale:"An action plan is fundamental to a suitable and sufficient assessment.", evidence:"Each recommendation traceable to a finding; priority set by the assessor.", suggestedPriority:null, reference:"RRO 2005 Art. 9" },
  { id:"CONC-03", section:"Conclusions", title:"Overall risk & review", prompt:"Record the overall risk rating and the review date and review triggers.", polarity:"neutral", applicability:"always", applicabilityRationale:"Every assessment records an overall rating and review arrangements. The rating is assessor-determined via the risk matrix, never auto-generated.", evidence:"Overall rating from Risk Evaluation; review date and triggers for earlier review.", suggestedPriority:null, reference:"RRO 2005 Art. 9(3)" }
];

// Ordered list of section names, derived from the core (keeps section order stable)
const CORE_SECTIONS = UNIVERSAL_CORE.reduce((acc, q) => {
  if (!acc.includes(q.section)) acc.push(q.section);
  return acc;
}, []);

/* ============================================================
   Store — the ONLY place that talks to the database.
   ============================================================ */
const Store = {
  get currentId() { return sessionStorage.getItem("fraimsCurrentId") || null; },
  set currentId(id) {
    if (id) sessionStorage.setItem("fraimsCurrentId", id);
    else sessionStorage.removeItem("fraimsCurrentId");
  },

  toRow(a) {
    return {
      id: a.id,
      property_name: a.propertyName || null,
      property_reference: a.propertyReference || null,
      property_address: a.propertyAddress || null,
      client_name: a.clientName || null,
      assessor: a.assessor || null,
      status: a.status || "Draft",
      assessment_date: a.assessmentDate || null,
      premises_profile: a.premisesProfile || {},
      building_details: a.buildingDetails || {},
      findings: a.findings || {},
      photos: a.photos || {},
      recommendations: a.recommendations || [],
      risk_evaluation: a.riskEvaluation || {},
      approval: a.approval || {},
      generated_report: a.generatedReport || {}
    };
  },

  fromRow(r) {
    return {
      id: r.id,
      propertyName: r.property_name || "",
      propertyReference: r.property_reference || "",
      propertyAddress: r.property_address || "",
      clientName: r.client_name || "",
      assessor: r.assessor || "",
      status: r.status || "Draft",
      assessmentDate: r.assessment_date || "",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      premisesProfile: r.premises_profile || {},
      buildingDetails: r.building_details || {},
      findings: r.findings || {},
      photos: r.photos || {},
      recommendations: r.recommendations || [],
      riskEvaluation: r.risk_evaluation || {},
      approval: r.approval || {},
      generatedReport: r.generated_report || {}
    };
  },

  async save(assessment) {
    const row = this.toRow(assessment);
    const { data, error } = await supabaseClient
      .from("assessments").upsert(row).select().single();
    if (error) throw error;
    this.currentId = data.id;
    return this.fromRow(data);
  },

  async load(id) {
    const { data, error } = await supabaseClient
      .from("assessments").select("*").eq("id", id).single();
    if (error) throw error;
    return this.fromRow(data);
  },

  async loadCurrent() {
    if (!this.currentId) return null;
    try { return await this.load(this.currentId); }
    catch (e) { console.warn("Current assessment not found:", e.message); return null; }
  },

  async list(statusFilter) {
    let q = supabaseClient.from("assessments").select("*").order("updated_at", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    const { data, error } = await q;
    if (error) throw error;
    return data.map((r) => this.fromRow(r));
  }
};

function renderLoading(message) {
  document.querySelector(".container").innerHTML =
    `<section class="welcome"><p class="loading">${escapeHtml(message || "Loading…")}</p></section>`;
}

/* ============================================================
   New Assessment
   ============================================================ */
function startNewAssessment() {
  document.querySelector(".container").innerHTML = `
    <section class="welcome">
      <h2>New Fire Risk Assessment</h2>
      <p>Enter the basic property and assessment details.</p>
    </section>
    <section class="welcome">
      <form id="newAssessmentForm">
        <div class="form-group"><label for="propertyName">Property Name</label><input id="propertyName" required></div>
        <div class="form-group"><label for="propertyAddress">Property Address</label><textarea id="propertyAddress" required></textarea></div>
        <div class="form-group"><label for="clientName">Client Name</label><input id="clientName"></div>
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
        <div class="form-group"><label for="storeys">Number of Storeys</label><input id="storeys" type="number" min="1"></div>
        <div class="form-group"><label for="assessor">Assessor</label><input id="assessor" value="Daniel Todd"></div>
        <div class="form-group"><label for="assessmentDate">Assessment Date</label><input id="assessmentDate" type="date" required></div>
        <button type="submit" class="action-button action-button-primary">Save and Continue</button>
        <button type="button" class="action-button action-button-secondary" onclick="showDashboard()">Back to Dashboard</button>
      </form>
    </section>
  `;
  document.getElementById("assessmentDate").value = new Date().toISOString().split("T")[0];
  document.getElementById("newAssessmentForm").addEventListener("submit", saveNewAssessment);
}

async function saveNewAssessment(event) {
  event.preventDefault();
  const assessment = {
    id: "FRA-" + Date.now(),
    propertyName: document.getElementById("propertyName").value.trim(),
    propertyAddress: document.getElementById("propertyAddress").value.trim(),
    clientName: document.getElementById("clientName").value.trim(),
    assessor: document.getElementById("assessor").value.trim(),
    assessmentDate: document.getElementById("assessmentDate").value,
    status: "Draft",
    premisesProfile: {
      buildingType: document.getElementById("buildingType").value,
      storeys: document.getElementById("storeys").value
    }
  };
  try {
    await Store.save(assessment);
    showAssessmentWorkspace();
  } catch (err) {
    console.error("Save failed:", err);
    alert("Could not save assessment: " + (err.message || "unknown error"));
  }
}

async function showAssessmentWorkspace() {
  renderLoading("Loading assessment…");
  const assessment = await Store.loadCurrent();
  if (!assessment) { alert("No assessment is currently open."); showDashboard(); return; }

  document.querySelector(".container").innerHTML = `
    <section class="welcome">
      <h2>${escapeHtml(assessment.propertyName || "New Assessment")}</h2>
      <p>${escapeHtml(assessment.propertyAddress || "")}</p>
      <p><span class="status-badge">${escapeHtml(assessment.status || "Draft")}</span></p>
    </section>
    <section class="dashboard-grid">
      <button class="dashboard-card" onclick="showBuildingDetails()">
        <div class="icon">🏢</div><h3>Building Details</h3>
        <p>Record the construction, use, occupancy and fire strategy.</p>
      </button>
      <button class="dashboard-card" onclick="showPhotographs()">
        <div class="icon">📷</div><h3>Photographs</h3>
        <p>Upload and categorise site photographs.</p>
      </button>
      <button class="dashboard-card" onclick="showFireRiskFindings()">
        <div class="icon">🔥</div><h3>Fire Risk Findings</h3>
        <p>Record hazards, controls and significant findings.</p>
      </button>
    </section>
    <button class="action-button action-button-secondary" onclick="showDashboard()">Back to Dashboard</button>
  `;
}

function showDashboard() { location.reload(); }

async function showDraftAssessments() {
  renderLoading("Loading drafts…");
  let drafts;
  try { drafts = await Store.list("Draft"); }
  catch (err) { console.error(err); alert("Could not load drafts: " + (err.message || "unknown error")); showDashboard(); return; }

  const items = drafts.length
    ? drafts.map((a) => `
        <li onclick="openAssessment('${a.id}')">
          <div><div class="a-title">${escapeHtml(a.propertyName || "Untitled")}</div>
          <div class="a-sub">${escapeHtml(a.propertyAddress || "")}</div></div>
          <span class="status-badge">${escapeHtml(a.status)}</span>
        </li>`).join("")
    : `<p class="list-empty">No draft assessments found.</p>`;

  document.querySelector(".container").innerHTML = `
    <section class="welcome"><h2>Draft Assessments</h2><p>Continue an assessment that has not yet been approved.</p></section>
    <section class="welcome"><ul class="assessment-list">${items}</ul>
      <button class="action-button action-button-secondary" onclick="showDashboard()">Back to Dashboard</button></section>
  `;
}

async function openAssessment(id) { Store.currentId = id; showAssessmentWorkspace(); }

async function showCompletedAssessments() {
  renderLoading("Loading…");
  let completed;
  try { completed = await Store.list("Completed"); }
  catch (err) { console.error(err); alert("Could not load completed: " + (err.message || "unknown error")); showDashboard(); return; }

  const items = completed.length
    ? completed.map((a) => `
        <li onclick="openAssessment('${a.id}')">
          <div><div class="a-title">${escapeHtml(a.propertyName || "Untitled")}</div>
          <div class="a-sub">${escapeHtml(a.propertyAddress || "")}</div></div>
          <span class="status-badge">${escapeHtml(a.status)}</span>
        </li>`).join("")
    : `<p class="list-empty">No completed assessments yet.</p>`;

  document.querySelector(".container").innerHTML = `
    <section class="welcome"><h2>Completed Assessments</h2><p>Approved assessments and generated reports.</p></section>
    <section class="welcome"><ul class="assessment-list">${items}</ul>
      <button class="action-button action-button-secondary" onclick="showDashboard()">Back to Dashboard</button></section>
  `;
}

/* ============================================================
   Building Details
   ============================================================ */
async function showBuildingDetails() {
  renderLoading("Loading building details…");
  const assessment = await Store.loadCurrent();
  if (!assessment) { alert("No assessment is currently open."); showDashboard(); return; }
  const details = assessment.buildingDetails || {};

  document.querySelector(".container").innerHTML = `
    <section class="welcome"><h2>Building Details</h2><p>Record the main details of the premises.</p></section>
    <section class="welcome">
      <div class="form-group"><label for="buildingUse">Primary Use</label>
        <input id="buildingUse" value="${escapeHtml(details.buildingUse || "")}" placeholder="Example: Residential block"></div>
      <div class="form-group"><label for="yearBuilt">Approximate Year Built</label>
        <input id="yearBuilt" value="${escapeHtml(details.yearBuilt || "")}" placeholder="Example: 1985"></div>
      <div class="form-group"><label for="occupancy">Occupancy</label>
        <input id="occupancy" value="${escapeHtml(details.occupancy || "")}" placeholder="Example: General needs housing"></div>
      <div class="form-group"><label for="numberOfFlats">Number of Flats</label>
        <input id="numberOfFlats" type="number" value="${details.numberOfFlats || ""}"></div>
      <div class="form-group"><label for="fireStrategy">Fire Strategy</label>
        <select id="fireStrategy">
          <option value="">Select...</option>
          <option ${details.fireStrategy === "Stay Put" ? "selected" : ""}>Stay Put</option>
          <option ${details.fireStrategy === "Simultaneous Evacuation" ? "selected" : ""}>Simultaneous Evacuation</option>
          <option ${details.fireStrategy === "Phased Evacuation" ? "selected" : ""}>Phased Evacuation</option>
          <option ${details.fireStrategy === "Unknown" ? "selected" : ""}>Unknown</option>
        </select></div>
      <button class="action-button action-button-primary" onclick="saveBuildingDetails()">Save Building Details</button>
      <button class="action-button action-button-secondary" onclick="showAssessmentWorkspace()">Back to Workspace</button>
    </section>
  `;
}

async function saveBuildingDetails() {
  const assessment = await Store.loadCurrent();
  if (!assessment) { alert("No assessment is currently open."); showDashboard(); return; }
  assessment.buildingDetails = {
    buildingUse: document.getElementById("buildingUse").value.trim(),
    yearBuilt: document.getElementById("yearBuilt").value.trim(),
    occupancy: document.getElementById("occupancy").value.trim(),
    numberOfFlats: document.getElementById("numberOfFlats").value.trim(),
    fireStrategy: document.getElementById("fireStrategy").value
  };
  try {
    await Store.save(assessment);
    alert("Building details saved.");
    showAssessmentWorkspace();
  } catch (err) { console.error(err); alert("Could not save building details: " + (err.message || "unknown error")); }
}

/* ============================================================
   Photographs
   ============================================================ */
async function showPhotographs() {
  renderLoading("Loading photographs…");
  const assessment = await Store.loadCurrent();
  if (!assessment || !assessment.id) { alert("Please create and save an assessment first."); showDashboard(); return; }
  const photos = assessment.photos || {};

  const categoriesHtml = PHOTO_CATEGORIES.map((cat) => {
    const list = photos[cat.key] || [];
    const thumbs = list.length
      ? list.map((p, i) => `
          <div class="photo-thumb">
            <img src="${escapeHtml(p.url)}" alt="${escapeHtml(cat.title)} photo">
            <button class="remove-photo" title="Remove" onclick="removePhoto('${cat.key}', ${i})">×</button>
          </div>`).join("")
      : `<p class="photo-empty">No photographs uploaded yet.</p>`;
    return `
      <div class="photo-category">
        <h3>${cat.title}</h3>
        <div class="photo-upload-row">
          <input type="file" accept="image/*" id="file-${cat.key}">
          <button class="action-button action-button-primary" onclick="uploadPhoto('${cat.key}')">Upload</button>
        </div>
        <p class="upload-status" id="status-${cat.key}"></p>
        <div class="photo-thumbs">${thumbs}</div>
      </div>`;
  }).join("");

  document.querySelector(".container").innerHTML = `
    <section class="welcome"><h2>Photographs</h2><p>Upload site photographs grouped by report category.</p></section>
    <section class="welcome">${categoriesHtml}
      <button class="action-button action-button-secondary" onclick="showAssessmentWorkspace()">Back to Workspace</button></section>
  `;
}

async function uploadPhoto(categoryKey) {
  const assessment = await Store.loadCurrent();
  if (!assessment) { alert("No assessment is currently open."); showDashboard(); return; }
  const statusEl = document.getElementById("status-" + categoryKey);
  const fileInput = document.getElementById("file-" + categoryKey);
  const file = fileInput.files[0];
  if (!file) { setStatus(statusEl, "Choose a photo first.", "error"); return; }
  setStatus(statusEl, "Uploading…", "");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${assessment.id}/${categoryKey}/${Date.now()}-${safeName}`;
  try {
    const { error: uploadError } = await supabaseClient.storage.from(PHOTO_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabaseClient.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    if (!assessment.photos) assessment.photos = {};
    if (!assessment.photos[categoryKey]) assessment.photos[categoryKey] = [];
    assessment.photos[categoryKey].push({ path, url: urlData.publicUrl, name: file.name, uploadedAt: new Date().toISOString() });
    await Store.save(assessment);
    setStatus(statusEl, "Uploaded.", "success");
    showPhotographs();
  } catch (err) { console.error(err); setStatus(statusEl, "Upload failed: " + (err.message || "unknown error"), "error"); }
}

async function removePhoto(categoryKey, index) {
  const assessment = await Store.loadCurrent();
  if (!assessment) return;
  const list = (assessment.photos && assessment.photos[categoryKey]) || [];
  const photo = list[index];
  if (!photo) return;
  if (!confirm("Remove this photo?")) return;
  try {
    const { error } = await supabaseClient.storage.from(PHOTO_BUCKET).remove([photo.path]);
    if (error) throw error;
    list.splice(index, 1);
    assessment.photos[categoryKey] = list;
    await Store.save(assessment);
    showPhotographs();
  } catch (err) { console.error(err); alert("Could not remove photo: " + (err.message || "unknown error")); }
}

function setStatus(el, message, kind) {
  if (!el) return;
  el.textContent = message;
  el.className = "upload-status" + (kind ? " " + kind : "");
}

/* ============================================================
   FIRE RISK FINDINGS MODULE
   - Section list -> questions in a section
   - Debounced auto-save to the `findings` column (keyed by id)
   - Photo linking from photos already uploaded
   ============================================================ */

// In-memory working copy for the findings screen, plus a save timer.
let FRF = { assessment: null, saveTimer: null };

function blankFinding() {
  return {
    applicability: "applicable",
    response: "",
    finding: "",
    existingControls: "",
    evidence: "",
    recommendation: "",
    priority: "",
    responsibleParty: "",
    targetDate: "",
    linkedPhotos: [],
    assessorNotes: "",
    limitations: ""
  };
}

// All photos for the assessment, flattened to a pick list [{key,url,label}]
function allPhotos(assessment) {
  const out = [];
  const photos = assessment.photos || {};
  PHOTO_CATEGORIES.forEach((cat) => {
    (photos[cat.key] || []).forEach((p, i) => {
      out.push({ ref: `${cat.key}:${i}`, url: p.url, label: `${cat.title} ${i + 1}` });
    });
  });
  return out;
}

async function showFireRiskFindings() {
  renderLoading("Loading findings…");
  const assessment = await Store.loadCurrent();
  if (!assessment || !assessment.id) { alert("Please create and save an assessment first."); showDashboard(); return; }
  if (!assessment.findings) assessment.findings = {};
  FRF.assessment = assessment;
  renderSectionList();
}

function sectionStats(sectionName) {
  const qs = UNIVERSAL_CORE.filter((q) => q.section === sectionName);
  const findings = FRF.assessment.findings || {};
  let addressed = 0;
  qs.forEach((q) => {
    const f = findings[q.id];
    if (f && (f.response || f.finding || f.applicability === "not-applicable" || f.applicability === "not-inspected")) addressed++;
  });
  return { total: qs.length, addressed };
}

function renderSectionList() {
  const items = CORE_SECTIONS.map((name) => {
    const s = sectionStats(name);
    return `
      <li onclick="openFindingSection('${encodeURIComponent(name)}')">
        <span class="s-title">${escapeHtml(name)}</span>
        <span class="section-progress">${s.addressed} of ${s.total} addressed</span>
      </li>`;
  }).join("");

  document.querySelector(".container").innerHTML = `
    <section class="welcome">
      <h2>Fire Risk Findings</h2>
      <p>${escapeHtml(FRF.assessment.propertyName || "")} — universal core assessment. Select a section to record findings.</p>
    </section>
    <section class="welcome">
      <ul class="section-list">${items}</ul>
      <button class="action-button action-button-secondary" onclick="showAssessmentWorkspace()">Back to Workspace</button>
    </section>
  `;
}

function openFindingSection(encodedName) {
  const sectionName = decodeURIComponent(encodedName);
  const qs = UNIVERSAL_CORE.filter((q) => q.section === sectionName);
  const findings = FRF.assessment.findings || {};
  const photos = allPhotos(FRF.assessment);

  const blocks = qs.map((q) => {
    const f = findings[q.id] || blankFinding();
    const polarityLabel = q.polarity === "hazard" ? "Hazard (a 'Yes' is adverse)"
      : q.polarity === "positive" ? "Compliance (a 'No' is adverse)"
      : "Record only";

    const photoPicker = photos.length
      ? `<div class="photo-link-list">` + photos.map((p) => {
          const sel = (f.linkedPhotos || []).includes(p.ref) ? " selected" : "";
          const tick = sel ? `<span class="tick">✓</span>` : "";
return `<div class="photo-link${sel}" onclick="toggleLinkedPhoto(this,'${q.id}','${p.ref}')">                    <img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.label)}">${tick}
                  </div>`;
        }).join("") + `</div>`
      : `<p class="photo-empty">No photographs uploaded yet. Add them in the Photographs section to link here.</p>`;

    const suggested = q.suggestedPriority
      ? `<div class="suggested-hint">Suggested — assessor review required: ${escapeHtml(q.suggestedPriority)}</div>`
      : ``;

    return `
      <div class="question-block" id="qb-${q.id}">
        <div class="question-title">${escapeHtml(q.title)} <span style="font-weight:normal;color:#98a2b3;">(${q.id})</span></div>
        <p class="question-prompt">${escapeHtml(q.prompt)}</p>
        <div class="question-meta">
          <span class="meta-tag ${q.polarity}">${polarityLabel}</span>
          <span class="meta-tag">Applicability: ${escapeHtml(q.applicability)}</span>
          ${q.reference ? `<span class="meta-tag">${escapeHtml(q.reference)}</span>` : ``}
        </div>
        <div class="evidence-note"><strong>Evidence to look for:</strong> ${escapeHtml(q.evidence)}<br><em>${escapeHtml(q.applicabilityRationale)}</em></div>

        <div class="field-row">
          <div class="form-group">
            <label>Applicability</label>
            <select onchange="updateFinding('${q.id}','applicability',this.value)">
              <option value="applicable" ${f.applicability==="applicable"?"selected":""}>Applicable</option>
              <option value="not-applicable" ${f.applicability==="not-applicable"?"selected":""}>Not applicable</option>
              <option value="not-inspected" ${f.applicability==="not-inspected"?"selected":""}>Not inspected</option>
            </select>
          </div>
          <div class="form-group">
            <label>Response</label>
            <select onchange="updateFinding('${q.id}','response',this.value)">
              <option value="" ${f.response===""?"selected":""}>—</option>
              <option value="yes" ${f.response==="yes"?"selected":""}>Yes</option>
              <option value="no" ${f.response==="no"?"selected":""}>No</option>
              <option value="partial" ${f.response==="partial"?"selected":""}>Partial</option>
              <option value="unknown" ${f.response==="unknown"?"selected":""}>Unknown</option>
              <option value="not-applicable" ${f.response==="not-applicable"?"selected":""}>N/A</option>
            </select>
          </div>
        </div>

        <div class="form-group"><label>Finding / observation</label>
          <textarea oninput="updateFinding('${q.id}','finding',this.value)">${escapeHtml(f.finding)}</textarea></div>
        <div class="form-group"><label>Existing controls</label>
          <textarea oninput="updateFinding('${q.id}','existingControls',this.value)">${escapeHtml(f.existingControls)}</textarea></div>
        <div class="form-group"><label>Recommendation</label>
          <textarea oninput="updateFinding('${q.id}','recommendation',this.value)">${escapeHtml(f.recommendation)}</textarea></div>

        <div class="field-row">
          <div class="form-group">
            <label>Priority</label>
            <select onchange="updateFinding('${q.id}','priority',this.value)">
              <option value="" ${f.priority===""?"selected":""}>—</option>
              <option value="immediate" ${f.priority==="immediate"?"selected":""}>Immediate</option>
              <option value="high" ${f.priority==="high"?"selected":""}>High</option>
              <option value="medium" ${f.priority==="medium"?"selected":""}>Medium</option>
              <option value="low" ${f.priority==="low"?"selected":""}>Low</option>
              <option value="advisory" ${f.priority==="advisory"?"selected":""}>Advisory</option>
            </select>
            ${suggested}
          </div>
          <div class="form-group"><label>Responsible party</label>
            <input value="${escapeHtml(f.responsibleParty)}" oninput="updateFinding('${q.id}','responsibleParty',this.value)"></div>
        </div>

        <div class="form-group"><label>Limitations / notes</label>
          <textarea oninput="updateFinding('${q.id}','limitations',this.value)">${escapeHtml(f.limitations)}</textarea></div>

        <div class="form-group"><label>Linked photographs</label>${photoPicker}</div>
      </div>`;
  }).join("");

  document.querySelector(".container").innerHTML = `
    <div class="save-indicator" id="saveIndicator"></div>
    <section class="welcome">
      <h2>${escapeHtml(sectionName)}</h2>
      <p>${escapeHtml(FRF.assessment.propertyName || "")} — changes save automatically.</p>
    </section>
    <section class="welcome">
      ${blocks}
      <button class="action-button action-button-secondary" onclick="renderSectionList()">Back to Sections</button>
    </section>
  `;
}

// Update a single field of a finding, then debounce-save.
function updateFinding(questionId, field, value) {
  if (!FRF.assessment.findings[questionId]) FRF.assessment.findings[questionId] = blankFinding();
  FRF.assessment.findings[questionId][field] = value;
  scheduleFindingSave();
}

function toggleLinkedPhoto(el, questionId, ref) {
  if (!FRF.assessment.findings[questionId]) FRF.assessment.findings[questionId] = blankFinding();
  const arr = FRF.assessment.findings[questionId].linkedPhotos || [];
  const idx = arr.indexOf(ref);
  if (idx === -1) arr.push(ref); else arr.splice(idx, 1);
  FRF.assessment.findings[questionId].linkedPhotos = arr;
  // Reflect selection immediately without a full re-render.
  // `el` is the clicked .photo-link element, passed in explicitly (no global event).
  if (idx === -1) {
    el.classList.add("selected");
    if (!el.querySelector(".tick")) {
      const t = document.createElement("span");
      t.className = "tick";
      t.textContent = "✓";
      el.appendChild(t);
    }
  } else {
    el.classList.remove("selected");
    const t = el.querySelector(".tick");
    if (t) t.remove();
  }
  scheduleFindingSave();
}

// Debounced save — waits for a pause in editing, then writes once.
function scheduleFindingSave() {
  const ind = document.getElementById("saveIndicator");
  if (ind) { ind.textContent = "Editing…"; ind.className = "save-indicator saving"; }
  if (FRF.saveTimer) clearTimeout(FRF.saveTimer);
  FRF.saveTimer = setTimeout(commitFindingSave, 1000);
}

async function commitFindingSave() {
  const ind = document.getElementById("saveIndicator");
  if (ind) { ind.textContent = "Saving…"; ind.className = "save-indicator saving"; }
  try {
    const saved = await Store.save(FRF.assessment);
    // keep working copy's timestamps in sync without discarding edits
    FRF.assessment.updatedAt = saved.updatedAt;
    if (ind) { ind.textContent = "Saved ✓"; ind.className = "save-indicator saved"; }
  } catch (err) {
    console.error("Findings save failed:", err);
    if (ind) { ind.textContent = "Save failed — check connection. Your edits are kept on screen."; ind.className = "save-indicator error"; }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}