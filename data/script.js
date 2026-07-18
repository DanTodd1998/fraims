/* ============================================================
   FRAIMS — Supabase configuration
   ============================================================ */
const SUPABASE_URL = "https://jfalmitemyxdkavobqbl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYWxtaXRlbXl4ZGthdm9icWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNTgxMTksImV4cCI6MjA5OTYzNDExOX0.pKWexGA8HVZRvED56YwR-PMqLC5oBoxVrM8ya-lHAeg";
const PHOTO_BUCKET = "assessment-photos";

const PHOTO_CATEGORIES = [
  { ref: "A", key: "exterior", title: "Exterior & Fire Service Access" },
  { ref: "B", key: "escape_routes", title: "Means of Escape & Staircases" },
  { ref: "C", key: "management", title: "Fire Safety Management" },
  { ref: "D", key: "detection", title: "Fire Detection & Alarm" },
  { ref: "E", key: "fire_doors", title: "Fire Doors" },
  { ref: "F", key: "lighting", title: "Emergency Lighting" },
  { ref: "G", key: "signage", title: "Fire Safety Signage" },
  { ref: "H", key: "firefighting_equipment", title: "Firefighting Equipment" },
  { ref: "I", key: "compartmentation", title: "Compartmentation & Fire-Stopping" },
  { ref: "J", key: "electrical", title: "Electrical & Ignition Hazards" },
  { ref: "K", key: "heating_cooking", title: "Heating & Cooking Hazards" },
  { ref: "L", key: "housekeeping", title: "Combustibles & Housekeeping" },
  { ref: "M", key: "smoke_control", title: "Smoke Control" },
  { ref: "N", key: "firefighter_facilities", title: "Firefighter Facilities" },
  { ref: "O", key: "other", title: "Other Relevant Evidence" }
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
const SECTION_PHOTO_GUIDANCE = {
  "Scope & Responsible Persons": [
    "Building frontage and main entrance",
    "Address or property identification",
    "Fire action notices and resident information",
    "Any access limitations or areas not inspected"
  ],

  "Premises & Occupancy": [
    "General external views",
    "Typical internal layout",
    "Staircases, corridors and landings",
    "Any unusual occupancy or vulnerability factors"
  ],

"Fire Hazards — Ignition, Fuel, Oxygen": [    "Electrical installations and intake equipment",
    "Heating and cooking equipment",
    "Combustible storage and waste",
    "Any visible ignition sources or hazardous processes"
  ],

  "Means of Escape": [
    "Escape routes and corridors",
    "Staircases and landings",
    "Final exits",
    "Obstructions, dead ends or restricted routes"
  ],

  "Fire Detection & Warning": [
    "Alarm control panel",
    "Detectors",
    "Manual call points",
    "Zone plan and warning devices"
  ],

  "Emergency Lighting & Signage": [
    "Emergency luminaires",
    "Exit and directional signs",
    "Test switches or control equipment",
    "Any damaged, missing or obscured fittings"
  ],

  "Firefighting Equipment": [
    "Extinguishers and fire blankets",
    "Hose reels or other equipment where present",
    "Location signage",
    "Service labels or obvious defects"
  ],

  "Passive Fire Protection": [
    "Compartment walls and ceilings",
    "Service penetrations",
    "Visible fire-stopping",
    "Any apparent breaches or damage"
  ],

  "Firefighter Access & Facilities": [
    "Fire service access routes",
    "Risers, inlets and outlets where present",
    "Firefighting shafts or lifts where present",
    "Control rooms, panels or access information"
  ],

  "Management, Testing & Records": [
    "Fire logbook",
    "Testing and maintenance records",
    "Fire action notices",
    "Relevant certificates and management documents"
  ],

  "Conclusions": [
    "Any significant defects not already recorded",
    "Overall building context",
    "Any evidence supporting the final action plan"
  ]
};
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
      recommendations: a.actionPlan || [],
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
      actionPlan: r.recommendations || [],
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

  // Reset the action plan working copy so cell edits hydrate from fresh data.
  AP = { assessment: null, saveTimer: null };
  RISK = { assessment: null, saveTimer: null };

  // If a draft FRA is mid-generation (e.g. after a page reload), resume polling.
  if (assessment.generatedReport?.status === "generating") {
    pollDraftFRA(assessment.id);
  }

  // If a PDF is mid-generation, resume polling for it too.
  if (assessment.generatedReport?.pdfStatus === "generating") {
    pollFraPdf(assessment.id);
  }

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
    ${renderActionPlanSection(assessment)}
    ${renderDraftFRASection(assessment)}
    ${renderRiskEvaluationSection(assessment)}
<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:20px;">

  <button
    class="action-button action-button-primary"
    onclick="generateDraftFRA()">
    ✨ Generate Draft FRA
  </button>

  <button
    class="action-button action-button-secondary"
    onclick="showDashboard()">
    Back to Dashboard
  </button>

</div>  `;
}

// Builds the editable Action Plan block shown at the bottom of the workspace,
// immediately before Overall Risk Evaluation.
function renderActionPlanSection(assessment) {
  const actions = Array.isArray(assessment.actionPlan)
    ? assessment.actionPlan
    : [];

  const priorities = ["Immediate", "High", "Medium", "Low"];

  const rows = actions.length
    ? actions.map((a, i) => {
        const priorityOptions = priorities
          .map(
            (p) =>
              `<option value="${p}" ${a.priority === p ? "selected" : ""}>${p}</option>`
          )
          .join("");

        return `
          <tr>
            <td><textarea class="ap-cell" oninput="updateActionPlanCell(${i},'category',this.value)">${escapeHtml(a.category || "")}</textarea></td>
            <td><textarea class="ap-cell" oninput="updateActionPlanCell(${i},'finding',this.value)">${escapeHtml(a.finding || "")}</textarea></td>
            <td><textarea class="ap-cell" oninput="updateActionPlanCell(${i},'action',this.value)">${escapeHtml(a.action || "")}</textarea></td>
            <td>
              <select class="ap-cell" onchange="updateActionPlanCell(${i},'priority',this.value)">
                ${priorityOptions}
              </select>
            </td>
            <td><textarea class="ap-cell" oninput="updateActionPlanCell(${i},'responsiblePerson',this.value)">${escapeHtml(a.responsiblePerson || "")}</textarea></td>
            <td><textarea class="ap-cell" oninput="updateActionPlanCell(${i},'targetTimescale',this.value)">${escapeHtml(a.targetTimescale || "")}</textarea></td>
            <td><button class="remove-photo" title="Delete action" onclick="deleteActionPlanRow(${i})">×</button></td>
          </tr>`;
      }).join("")
    : `<tr><td colspan="7" class="list-empty" style="text-align:center;">No actions yet. Generate an action plan or add one manually.</td></tr>`;

  return `
    <section class="welcome" id="actionPlanSection">
      <div class="save-indicator" id="actionPlanSaveIndicator"></div>
      <h2>Action Plan</h2>
      <p>Corrective actions arising from the assessment. Every cell is editable, and changes save automatically.</p>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
        <button
          type="button"
          id="generateActionPlanBtn"
          class="action-button action-button-primary"
          onclick="generateActionPlan()">
          🤖 Generate Action Plan
        </button>

        <button
          type="button"
          class="action-button action-button-secondary"
          onclick="addActionPlanRow()">
          ➕ Add Action
        </button>
      </div>

      <div style="overflow-x:auto;">
        <table class="action-plan-table">
          <thead>
            <tr>
              <th>Hazard Category</th>
              <th>Finding</th>
              <th>Action Required</th>
              <th>Priority</th>
              <th>Responsible Person</th>
              <th>Target Timescale</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </section>`;
}

// Renders the draft FRA review section: shows progress while generating, an
// error if it failed, or the formatted report once ready. Structured so inline
// editing can be added later without changing the data model.
function renderDraftFRASection(assessment) {
  const report = assessment.generatedReport || {};
  const status = report.status;

  if (status === "generating") {
    return `
      <section class="welcome" id="draftFraSection">
        <h2>Draft Fire Risk Assessment</h2>
        <p class="loading">Generating the draft assessment with AI… this can take up to a minute or two. You can keep working; this will update automatically when it's ready.</p>
      </section>`;
  }

  if (status === "error") {
    return `
      <section class="welcome" id="draftFraSection">
        <h2>Draft Fire Risk Assessment</h2>
        <p class="upload-status error">Draft generation failed: ${escapeHtml(report.error || "unknown error")}. Please try again.</p>
      </section>`;
  }

  if (status !== "ready" || !report.draft) {
    // No report yet — nothing to show (the Generate button lives in the footer).
    return "";
  }

  const d = report.draft;

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
    ["limitations", "Limitations"]
  ];

  const narrative = sectionOrder
    .filter(([key]) => d[key] && String(d[key]).trim())
    .map(
      ([key, label]) => `
        <div class="draft-fra-block">
          <h3>${escapeHtml(label)}</h3>
          <p style="white-space:pre-wrap;line-height:1.6;">${escapeHtml(String(d[key]))}</p>
        </div>`
    )
    .join("");

  const recs = Array.isArray(d.recommendations) ? d.recommendations : [];
  const recRows = recs.length
    ? recs
        .map(
          (r) => `
            <tr>
              <td>${escapeHtml(String(r.action || ""))}</td>
              <td>${escapeHtml(String(r.priority || ""))}</td>
              <td>${escapeHtml(String(r.responsibleParty || ""))}</td>
              <td>${escapeHtml(String(r.targetDate || ""))}</td>
            </tr>`
        )
        .join("")
    : `<tr><td colspan="4" class="list-empty" style="text-align:center;">No recommendations returned.</td></tr>`;

  const recommendationsHtml = `
    <div class="draft-fra-block">
      <h3>Recommendations</h3>
      <div style="overflow-x:auto;">
        <table class="action-plan-table">
          <thead>
            <tr><th>Action</th><th>Priority</th><th>Responsible Party</th><th>Target Date</th></tr>
          </thead>
          <tbody>${recRows}</tbody>
        </table>
      </div>
    </div>`;

  // Build the photo appendix from the REAL uploaded photos (so images always
  // show), and attach the AI's caption/observation by matching photoId.
  const aiAppendix = Array.isArray(d.photoAppendix) ? d.photoAppendix : [];
  const aiById = {};
  aiAppendix.forEach((p) => {
    if (p && p.photoId) aiById[String(p.photoId).toUpperCase().trim()] = p;
  });

  // Enumerate real photos exactly as the background function builds their IDs.
  const realPhotos = [];
  const allPhotoData = assessment.photos || {};

  Object.entries(allPhotoData).forEach(([category, list]) => {
    if (category === "sectionPhotos") return;
    if (!Array.isArray(list)) return;
    list.forEach((photo, index) => {
      if (!photo || !photo.url) return;
      realPhotos.push({
        id: `${category.toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
        label: category,
        url: photo.url,
        name: photo.name || ""
      });
    });
  });

  const secPhotos =
    allPhotoData.sectionPhotos && typeof allPhotoData.sectionPhotos === "object"
      ? allPhotoData.sectionPhotos
      : {};
  Object.entries(secPhotos).forEach(([sectionName, list]) => {
    if (!Array.isArray(list)) return;
    list.forEach((photo, index) => {
      if (!photo || !photo.url) return;
      realPhotos.push({
        id: `SECTION-${String(index + 1).padStart(3, "0")}`,
        label: sectionName,
        url: photo.url,
        name: photo.name || ""
      });
    });
  });

  const appendixHtml = realPhotos.length
    ? `
      <div class="draft-fra-block">
        <h3>Photograph Appendix</h3>
        <div class="fra-appendix-grid">
          ${realPhotos
            .map((rp) => {
              const ai = aiById[rp.id.toUpperCase()] || null;
              const obs = ai
                ? `${ai.caption ? escapeHtml(String(ai.caption)) : ""}${ai.observation ? " " + escapeHtml(String(ai.observation)) : ""}`
                : "";
              return `
                <div class="fra-appendix-item" style="margin-bottom:16px;">
                  <img src="${escapeHtml(rp.url)}" alt="${escapeHtml(rp.id)}" style="max-width:100%;border-radius:6px;display:block;margin-bottom:6px;">
                  <strong>${escapeHtml(rp.id)}</strong> — ${escapeHtml(rp.label)}
                  ${obs ? `<div style="line-height:1.6;margin-top:4px;">${obs}</div>` : ""}
                </div>`;
            })
            .join("")}
        </div>
      </div>`
    : "";

  const generatedWhen = report.updatedAt
    ? new Date(report.updatedAt).toLocaleString()
    : "";

  // PDF controls: state depends on report.pdfStatus.
  let pdfControls;
  if (report.pdfStatus === "generating") {
    pdfControls = `<p class="loading">Generating PDF… this updates automatically when ready.</p>`;
  } else if (report.pdfStatus === "ready" && report.pdfUrl) {
    pdfControls = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <a class="action-button action-button-primary" href="${escapeHtml(report.pdfUrl)}" target="_blank" rel="noopener" style="text-decoration:none;">⬇️ Download PDF</a>
        <button type="button" class="action-button action-button-secondary" onclick="generateFraPdf()">Regenerate PDF</button>
      </div>`;
  } else if (report.pdfStatus === "error") {
    pdfControls = `
      <p class="upload-status error">PDF generation failed: ${escapeHtml(report.pdfError || "unknown error")}.</p>
      <button type="button" class="action-button action-button-primary" onclick="generateFraPdf()">📄 Try again</button>`;
  } else {
    pdfControls = `<button type="button" id="generatePdfBtn" class="action-button action-button-primary" onclick="generateFraPdf()">📄 Create PDF</button>`;
  }

  return `
    <section class="welcome" id="draftFraSection">
      <h2>Draft Fire Risk Assessment</h2>
      <p>AI-generated draft for assessor review${generatedWhen ? ` — generated ${escapeHtml(generatedWhen)}` : ""}. Review carefully; the assessor remains responsible for the final report.</p>
      <div style="margin:8px 0 16px;">${pdfControls}</div>
      ${narrative}
      ${recommendationsHtml}
      ${appendixHtml}
    </section>`;
}

async function generateFraPdf() {
  const assessment = await Store.loadCurrent();
  if (!assessment) { alert("No assessment loaded."); return; }

  const report = assessment.generatedReport || {};
  if (report.status !== "ready" || !report.draft) {
    alert("Please generate the draft Fire Risk Assessment first.");
    return;
  }

  try {
    // Mark PDF as generating and re-render so the user sees progress.
    assessment.generatedReport = { ...report, pdfStatus: "generating" };
    await Store.save(assessment);
    showAssessmentWorkspace();

    fetch("/.netlify/functions/generate-pdf-background", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessment })
    }).catch((err) => console.error("Could not start PDF generation:", err));

    pollFraPdf(assessment.id);
  } catch (err) {
    console.error("Generate PDF failed:", err);
    alert("Could not start PDF generation.");
  }
}

let fraPdfPollTimer = null;

function pollFraPdf(assessmentId, attempt = 0) {
  const MAX_ATTEMPTS = 60; // ~3 minutes at 3s
  if (fraPdfPollTimer) clearTimeout(fraPdfPollTimer);

  fraPdfPollTimer = setTimeout(async () => {
    if (Store.currentId !== assessmentId) return;

    let latest;
    try {
      latest = await Store.load(assessmentId);
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) pollFraPdf(assessmentId, attempt + 1);
      return;
    }

    const status = (latest.generatedReport || {}).pdfStatus;
    if (status === "ready" || status === "error") {
      if (Store.currentId === assessmentId) showAssessmentWorkspace();
      return;
    }
    if (attempt < MAX_ATTEMPTS) pollFraPdf(assessmentId, attempt + 1);
  }, 3000);
}

/* ============================================================
   RISK EVALUATION — PAS 79 / HSG65 5-point rating.
   The AI suggests a rating during Generate FRA; the assessor
   reviews, can override likelihood/severity, and confirms.
   Persists in assessment.riskEvaluation (risk_evaluation column).
   ============================================================ */
const RISK_LIKELIHOODS = ["Low", "Medium", "High"];
const RISK_SEVERITIES = ["Slight harm", "Moderate harm", "Extreme harm"];
const RISK_RATINGS = ["Trivial", "Tolerable", "Moderate", "Substantial", "Intolerable"];

// Standard PAS 79 / HSG65 matrix: likelihood (row) x severity (col) -> rating.
function riskMatrixRating(likelihood, severity) {
  const L = RISK_LIKELIHOODS.indexOf(likelihood);
  const S = RISK_SEVERITIES.indexOf(severity);
  if (L === -1 || S === -1) return "";
  // rows = Low/Medium/High, cols = Slight/Moderate/Extreme
  const matrix = [
    ["Trivial", "Tolerable", "Moderate"],       // Low
    ["Tolerable", "Moderate", "Substantial"],   // Medium
    ["Moderate", "Substantial", "Intolerable"]  // High
  ];
  return matrix[L][S];
}

function renderRiskEvaluationSection(assessment) {
  const report = assessment.generatedReport || {};
  // Prefer the confirmable copy; otherwise seed from the AI suggestion in the draft.
  let re = assessment.riskEvaluation && Object.keys(assessment.riskEvaluation).length
    ? assessment.riskEvaluation
    : null;

  const aiSuggestion =
    report.draft && report.draft.riskEvaluation ? report.draft.riskEvaluation : null;

  // Nothing to show until a draft (with a suggestion) exists or a rating is saved.
  if (!re && !aiSuggestion) return "";

  if (!re && aiSuggestion) {
    re = {
      likelihood: aiSuggestion.likelihood || "",
      severity: aiSuggestion.severity || "",
      rating: aiSuggestion.rating || riskMatrixRating(aiSuggestion.likelihood, aiSuggestion.severity),
      rationale: aiSuggestion.rationale || "",
      reviewPeriod: aiSuggestion.reviewPeriod || "",
      reviewTriggers: aiSuggestion.reviewTriggers || "",
      confirmed: false
    };
  }

  const likelihoodOpts = RISK_LIKELIHOODS.map(
    (l) => `<option value="${l}" ${re.likelihood === l ? "selected" : ""}>${l}</option>`
  ).join("");
  const severityOpts = RISK_SEVERITIES.map(
    (s) => `<option value="${s}" ${re.severity === s ? "selected" : ""}>${s}</option>`
  ).join("");

  const rating = re.rating || riskMatrixRating(re.likelihood, re.severity);
  const ratingColour = {
    Trivial: "#2e7d32",
    Tolerable: "#558b2f",
    Moderate: "#f9a825",
    Substantial: "#ef6c00",
    Intolerable: "#c62828"
  }[rating] || "#555";

  const confirmedBadge = re.confirmed
    ? `<span class="status-badge" style="background:#2e7d32;color:#fff;">Confirmed by assessor</span>`
    : `<span class="status-badge" style="background:#f9a825;color:#111;">AI-suggested — review &amp; confirm</span>`;

  return `
    <section class="welcome" id="riskEvaluationSection">
      <div class="save-indicator" id="riskSaveIndicator"></div>
      <h2>Overall Risk Evaluation</h2>
      <p>${confirmedBadge}</p>
      <p style="margin-top:6px;">The overall fire risk rating is determined by the assessor using the risk matrix. The AI provides a starting suggestion; you remain responsible for the final rating.</p>

      <div class="field-row" style="margin-top:12px;">
        <div class="form-group">
          <label>Likelihood of fire</label>
          <select id="riskLikelihood" onchange="updateRiskField('likelihood', this.value)">
            <option value="">—</option>
            ${likelihoodOpts}
          </select>
        </div>
        <div class="form-group">
          <label>Severity of outcome</label>
          <select id="riskSeverity" onchange="updateRiskField('severity', this.value)">
            <option value="">—</option>
            ${severityOpts}
          </select>
        </div>
      </div>

      <div style="margin:10px 0 4px;">
        <span style="font-size:0.9rem;color:#555;">Calculated overall risk rating:</span>
      </div>
      <div id="riskRatingDisplay" style="display:inline-block;padding:8px 16px;border-radius:6px;font-weight:bold;color:#fff;font-size:1.1rem;background:${ratingColour};">
        ${escapeHtml(rating || "Select likelihood and severity")}
      </div>

      ${re.rationale ? `
      <div class="form-group" style="margin-top:14px;">
        <label>Rationale (AI-suggested — editable)</label>
        <textarea oninput="updateRiskField('rationale', this.value)">${escapeHtml(re.rationale)}</textarea>
      </div>` : ""}

      <div class="field-row">
        <div class="form-group">
          <label>Review period</label>
          <input value="${escapeHtml(re.reviewPeriod || "")}" oninput="updateRiskField('reviewPeriod', this.value)" placeholder="e.g. 12 months">
        </div>
        <div class="form-group">
          <label>Review triggers</label>
          <input value="${escapeHtml(re.reviewTriggers || "")}" oninput="updateRiskField('reviewTriggers', this.value)" placeholder="e.g. material change, fire, refurbishment">
        </div>
      </div>

      <div style="margin-top:12px;">
        <button type="button" class="action-button action-button-primary" onclick="confirmRiskEvaluation()">
          ${re.confirmed ? "Update confirmed rating" : "✅ Confirm rating"}
        </button>
      </div>
    </section>`;
}

// Working copy for risk evaluation edits.
let RISK = { assessment: null, saveTimer: null };

async function ensureRiskWorkingCopy() {
  if (!RISK.assessment) {
    RISK.assessment = await Store.loadCurrent();
  }
  if (RISK.assessment && (!RISK.assessment.riskEvaluation || !Object.keys(RISK.assessment.riskEvaluation).length)) {
    // Seed from the AI suggestion on first edit if not yet saved.
    const sugg =
      RISK.assessment.generatedReport &&
      RISK.assessment.generatedReport.draft &&
      RISK.assessment.generatedReport.draft.riskEvaluation
        ? RISK.assessment.generatedReport.draft.riskEvaluation
        : {};
    RISK.assessment.riskEvaluation = {
      likelihood: sugg.likelihood || "",
      severity: sugg.severity || "",
      rating: sugg.rating || riskMatrixRating(sugg.likelihood, sugg.severity),
      rationale: sugg.rationale || "",
      reviewPeriod: sugg.reviewPeriod || "",
      reviewTriggers: sugg.reviewTriggers || "",
      confirmed: false
    };
  }
  return RISK.assessment;
}

async function updateRiskField(field, value) {
  const assessment = await ensureRiskWorkingCopy();
  if (!assessment) return;
  assessment.riskEvaluation[field] = value;

  // Recalculate rating live when likelihood or severity changes.
  if (field === "likelihood" || field === "severity") {
    const newRating = riskMatrixRating(
      assessment.riskEvaluation.likelihood,
      assessment.riskEvaluation.severity
    );
    assessment.riskEvaluation.rating = newRating;
    const disp = document.getElementById("riskRatingDisplay");
    if (disp) {
      const colour = {
        Trivial: "#2e7d32", Tolerable: "#558b2f", Moderate: "#f9a825",
        Substantial: "#ef6c00", Intolerable: "#c62828"
      }[newRating] || "#555";
      disp.textContent = newRating || "Select likelihood and severity";
      disp.style.background = colour;
    }
  }

  // Any manual change means it's no longer just the AI's untouched suggestion,
  // but it still needs explicit confirmation, so we leave confirmed as-is until
  // the assessor clicks Confirm.
  scheduleRiskSave();
}

function scheduleRiskSave() {
  const ind = document.getElementById("riskSaveIndicator");
  if (ind) { ind.textContent = "Editing…"; ind.className = "save-indicator saving"; }
  if (RISK.saveTimer) clearTimeout(RISK.saveTimer);
  RISK.saveTimer = setTimeout(commitRiskSave, 1000);
}

async function commitRiskSave() {
  const ind = document.getElementById("riskSaveIndicator");
  if (ind) { ind.textContent = "Saving…"; ind.className = "save-indicator saving"; }
  if (!RISK.assessment) return;
  try {
    const saved = await Store.save(RISK.assessment);
    RISK.assessment.updatedAt = saved.updatedAt;
    if (ind) { ind.textContent = "Saved ✓"; ind.className = "save-indicator saved"; }
  } catch (err) {
    console.error("Risk evaluation save failed:", err);
    if (ind) { ind.textContent = "Save failed — check connection."; ind.className = "save-indicator error"; }
  }
}

async function confirmRiskEvaluation() {
  const assessment = await ensureRiskWorkingCopy();
  if (!assessment) return;

  const re = assessment.riskEvaluation;
  if (!re.likelihood || !re.severity) {
    alert("Please select both a likelihood and a severity before confirming.");
    return;
  }
  re.rating = riskMatrixRating(re.likelihood, re.severity);
  re.confirmed = true;
  re.confirmedAt = new Date().toISOString();

  try {
    await Store.save(assessment);
    showAssessmentWorkspace();
  } catch (err) {
    console.error("Could not confirm risk rating:", err);
    alert("Could not save the confirmed rating.");
  }
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
async function showPhotographs(returnSectionName = "") {
  renderLoading("Loading photographs…");
  const assessment = await Store.loadCurrent();
  if (!assessment || !assessment.id) { alert("Please create and save an assessment first."); showDashboard(); return; }
  const photos = assessment.photos || {};
const activeSectionName = returnSectionName
  ? decodeURIComponent(returnSectionName)
  : "";

const visibleCategories = activeSectionName
  ? PHOTO_CATEGORIES.filter((cat) => {
      const sectionMap = {
        "Scope & Responsible Persons": ["exterior", "management", "other"],
        "Premises & Occupancy": ["exterior", "escape_routes", "other"],
        "Fire Hazards — Ignition, Fuel, Oxygen": ["electrical", "heating_cooking", "housekeeping", "other"],
        "Means of Escape": ["escape_routes", "signage", "lighting", "other"],
        "Fire Detection & Warning": ["detection", "other"],
        "Emergency Lighting & Signage": ["lighting", "signage", "other"],
        "Firefighting Equipment": ["firefighting_equipment", "other"],
        "Passive Fire Protection": ["compartmentation", "smoke_control", "other"],
        "Firefighter Access & Facilities": ["exterior", "firefighter_facilities", "other"],
        "Management, Testing & Records": ["management", "other"],
        "Conclusions": ["other"]
      };

      return (sectionMap[activeSectionName] || PHOTO_CATEGORIES.map((item) => item.key))
        .includes(cat.key);
    })
  : PHOTO_CATEGORIES;
const categoriesHtml = visibleCategories.map((cat) => {    const list = photos[cat.key] || [];
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
  <section class="welcome">
    <h2>Photographs</h2>
    <p>Upload site photographs grouped by report category.</p>
  </section>

  <section class="welcome">
    ${categoriesHtml}

    <button
      class="action-button action-button-secondary"
      onclick="${returnSectionName
        ? `openFindingSection('${returnSectionName}')`
        : `showAssessmentWorkspace()`}">
      ${returnSectionName ? "Back to Section" : "Back to Workspace"}
    </button>
  </section>
`;
}
async function removeSectionPhoto(encodedSectionName, photoIndex) {
  const sectionName = decodeURIComponent(encodedSectionName);
  const assessment = await Store.loadCurrent();

  const sectionPhotos =
    assessment?.photos?.sectionPhotos?.[sectionName];

  if (!sectionPhotos) {
    return;
  }

  const photo = sectionPhotos[photoIndex];

  if (!photo) {
    return;
  }

  if (!confirm("Remove this photograph?")) {
    return;
  }

  try {
    if (photo.path) {
      const { error: storageError } = await supabaseClient.storage
        .from(PHOTO_BUCKET)
        .remove([photo.path]);

      if (storageError) {
        throw storageError;
      }
    }

    sectionPhotos.splice(photoIndex, 1);

    await Store.save(assessment);

    FRF.assessment = await Store.loadCurrent();
    openFindingSection(encodeURIComponent(sectionName));
  } catch (err) {
    console.error("Could not remove section photograph:", err);
    alert("Could not remove the photograph.");
  }
}
async function uploadSectionPhotos(encodedSectionName) {
  const sectionName = decodeURIComponent(encodedSectionName);
  const assessment = await Store.loadCurrent();

  if (!assessment) {
    alert("No assessment is currently open.");
    showDashboard();
    return;
  }

  const statusEl = document.getElementById("sectionPhotoStatus");
  const fileInput = document.getElementById("sectionPhotoInput");
  const files = Array.from(fileInput?.files || []);

  if (!files.length) {
    setStatus(
      statusEl,
      "Choose at least one photograph first.",
      "error"
    );
    return;
  }

  if (!assessment.photos) {
    assessment.photos = {};
  }

  if (!assessment.photos.sectionPhotos) {
    assessment.photos.sectionPhotos = {};
  }

  if (!assessment.photos.sectionPhotos[sectionName]) {
    assessment.photos.sectionPhotos[sectionName] = [];
  }

  setStatus(statusEl, "Uploading…", "");

  try {
    for (const file of files) {
      const safeName =
        file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      const safeSection =
        sectionName.replace(/[^a-zA-Z0-9_-]/g, "_");

      const path =
        `${assessment.id}/sections/${safeSection}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabaseClient.storage
        .from(PHOTO_BUCKET)
        .getPublicUrl(path);

      assessment.photos.sectionPhotos[sectionName].push({
        path,
        url: urlData.publicUrl,
        name: file.name,
        uploadedAt: new Date().toISOString()
      });
    }

    await Store.save(assessment);

    FRF.assessment = await Store.loadCurrent();

    openFindingSection(
      encodeURIComponent(sectionName)
    );
  } catch (err) {
    console.error(err);

    setStatus(
      statusEl,
      "Upload failed: " + (err.message || "unknown error"),
      "error"
    );
  }
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
  console.log("Current FRA assessment for AI:", assessment);
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
  const sectionState =
  FRF.assessment.findings?.sectionStates?.[sectionName] || {
    status: "applicable",
    reason: ""
  };
  const photoGuidance = SECTION_PHOTO_GUIDANCE[sectionName] || [];
  const blocks = qs.map((q) => {
    const f = findings[q.id] || blankFinding();
    const polarityLabel = q.polarity === "hazard" ? "Hazard (a 'Yes' is adverse)"
      : q.polarity === "positive" ? "Compliance (a 'No' is adverse)"
      : "Record only";

    const photoPicker = photos.length
      ? `<div class="photo-link-list">` + photos.map((p) => {
          const sel = (f.linkedPhotos || []).includes(p.ref) ? " selected" : "";
          const tick = sel ? `<span class="tick">✓</span>` : "";
          return `<div class="photo-link${sel}" onclick="toggleLinkedPhoto(this,'${q.id}','${p.ref}')"><img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.label)}">${tick}</div>`;
        }).join("") + `</div>`
      : `<p class="photo-empty">No photographs uploaded yet. Add them in the Photographs section to link here.</p>`;

    const suggested = q.suggestedPriority
      ? `<div class="suggested-hint">Suggested — assessor review required: ${escapeHtml(q.suggestedPriority)}</div>`
      : ``;

    const aiButton = q.id === "PREM-01"
      ? `<button type="button" class="action-button action-button-primary" style="float:right;padding:6px 12px;font-size:0.85rem" onclick="generatePremisesDraft()">✨ Generate with AI</button>`
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

        <div class="form-group">
          <label>
            Finding / observation
            ${aiButton}
          </label>
          <textarea id="finding-${q.id}" oninput="updateFinding('${q.id}','finding',this.value)">${escapeHtml(f.finding)}</textarea>
        </div>

        <div class="form-group"><label>Linked photographs</label>${photoPicker}</div>
      </div>`;
  }).join("");

  document.querySelector(".container").innerHTML = `
    <div class="save-indicator" id="saveIndicator"></div>
   <section class="welcome">
  <h2>${escapeHtml(sectionName)}</h2>
  <p>${escapeHtml(FRF.assessment.propertyName || "")} — changes save automatically.</p>

  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
    <button
      type="button"
      class="action-button ${sectionState.status === "applicable" ? "" : "action-button-secondary"}"
      onclick="setSectionStatus('${encodeURIComponent(sectionName)}','applicable')">
      ✅ Applicable
    </button>

    <button
      type="button"
      class="action-button ${sectionState.status === "na" ? "" : "action-button-secondary"}"
      onclick="setSectionStatus('${encodeURIComponent(sectionName)}','na')">
      🚫 N/A
    </button>
  </div>

  ${
    sectionState.status === "na"
      ? `
        <div class="form-group" style="margin-top:14px;">
          <label>Reason not applicable</label>
          <textarea
            oninput="updateSectionNAReason('${encodeURIComponent(sectionName)}', this.value)"
            placeholder="Explain why this section is not applicable...">${escapeHtml(sectionState.reason || "")}</textarea>
        </div>
      `
      : ``
  }
</section>
    <section class="welcome">
      <section class="question-block">
  <div class="question-title">${escapeHtml(sectionName)}</div>

  <div class="form-group">
    <label>Assessor notes</label>
    <textarea
      id="sectionNotes"
      oninput="updateSectionNotes('${encodeURIComponent(sectionName)}', this.value)"
      placeholder="Add any notes to help generate the section assessment...">${escapeHtml((FRF.assessment.findings?.sectionNotes?.[sectionName]) || "")}</textarea>
  </div>
<div class="form-group">
  <label>📷 Section photographs</label>

  <div class="photo-upload-row">
    <input
      type="file"
      accept="image/*"
      multiple
      id="sectionPhotoInput">

    <button
      type="button"
      class="action-button action-button-primary"
      onclick="uploadSectionPhotos('${encodeURIComponent(sectionName)}')">
      Upload photographs
    </button>
  </div>

  <p
    class="upload-status"
    id="sectionPhotoStatus"></p>

<div
  class="photo-thumbs"
  id="sectionPhotoThumbs">
  ${
    (FRF.assessment.photos?.sectionPhotos?.[sectionName] || []).length
      ? (FRF.assessment.photos?.sectionPhotos?.[sectionName] || [])
          .map((photo, index) => `
            <div class="photo-thumb">
              <img
                src="${escapeHtml(photo.url)}"
                alt="${escapeHtml(sectionName)} photograph">

              <button
                type="button"
                class="remove-photo"
                title="Remove"
                onclick="removeSectionPhoto('${encodeURIComponent(sectionName)}', ${index})">
                ×
              </button>
            </div>
          `)
          .join("")
      : `<p class="photo-empty">No photographs uploaded yet.</p>`
  }
</div>
</div>

  <div class="form-group">
    <label>Section assessment</label>
    <textarea
      id="sectionDraft"
      oninput="updateSectionDraft('${encodeURIComponent(sectionName)}', this.value)"
      placeholder="The AI-generated section paragraph will appear here...">${escapeHtml((FRF.assessment.findings?.sectionDrafts?.[sectionName]) || "")}</textarea>
  </div>

  <div style="display:flex;gap:10px;flex-wrap:wrap;">
   <button
  type="button"
  class="action-button action-button-primary"
  onclick="generateSectionAssessment('${encodeURIComponent(sectionName)}')">
  🤖 Generate assessment
</button>

    <button
      type="button"
      class="action-button action-button-secondary"
      onclick="clearSectionDraft('${encodeURIComponent(sectionName)}')">
      Clear
    </button>
  </div>
</section>

<div style="display:none;">
  ${blocks}
</div>
      <button class="action-button action-button-secondary" onclick="renderSectionList()">Back to Sections</button>
    </section>
    <section class="welcome">
  <h3>📷 What should I photograph?</h3>

  <ul style="margin:10px 0 0 20px;line-height:1.8;">
    ${photoGuidance.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
  </ul>

  <p style="margin-top:12px;color:#666;">
    Upload clear photographs showing both compliant features and any defects relevant to this section.
  </p>
  <button
  type="button"
  class="action-button action-button-primary"
  onclick="showPhotographs('${encodeURIComponent(sectionName)}')">
  📷 Upload photographs
</button>
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

async function generatePremisesDraft() {
  try {
    const response = await fetch("/.netlify/functions/ai-premises-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assessment: FRF.assessment
      })
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("AI generation failed:", result);
      alert(result.error || "AI generation failed.");
      return;
    }
    const textarea = document.getElementById("finding-PREM-01");
    if (!textarea) {
      alert("Premises textarea not found.");
      return;
    }
    textarea.value = result.text || "";
    updateFinding(
      "PREM-01",
      "finding",
      result.text || ""
    );
  } catch (err) {
    console.error("Could not contact AI:", err);
    alert("Could not contact AI.");
  }
}
async function generateDraftFRA() {
  const assessment = await Store.loadCurrent();

  if (!assessment) {
    alert("No assessment loaded.");
    return;
  }

  const existing = assessment.generatedReport || {};
  if (existing.status === "ready") {
    const proceed = confirm(
      "This will regenerate the draft Fire Risk Assessment and replace the current one. Continue?"
    );
    if (!proceed) return;
  }

  try {
    // Mark the report as generating so the UI shows progress and polling begins.
    assessment.generatedReport = {
      status: "generating",
      startedAt: new Date().toISOString()
    };
    await Store.save(assessment);
    showAssessmentWorkspace();

    // Fire the background function. It returns 202 immediately; the real work
    // continues server-side and the result is written back to Supabase.
    fetch("/.netlify/functions/generate-fra-background", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessment })
    }).catch((err) => {
      console.error("Could not start Draft FRA generation:", err);
    });

    // Begin polling for the finished report.
    pollDraftFRA(assessment.id);
  } catch (err) {
    console.error("Generate Draft FRA failed:", err);
    alert("Could not start the AI generator.");
  }
}

// Polls Supabase for the background function's result. Stops when the report is
// ready or errored, when the user navigates away, or after a safety timeout.
let draftFRAPollTimer = null;

function pollDraftFRA(assessmentId, attempt = 0) {
  const MAX_ATTEMPTS = 90; // ~4.5 minutes at 3s intervals
  if (draftFRAPollTimer) clearTimeout(draftFRAPollTimer);

  draftFRAPollTimer = setTimeout(async () => {
    // Stop if the user has moved to a different assessment.
    if (Store.currentId !== assessmentId) return;

    let latest;
    try {
      latest = await Store.load(assessmentId);
    } catch (err) {
      console.warn("Poll failed, will retry:", err.message);
      if (attempt < MAX_ATTEMPTS) pollDraftFRA(assessmentId, attempt + 1);
      return;
    }

    const report = latest.generatedReport || {};

    if (report.status === "ready" || report.status === "error") {
      // Only re-render if still viewing this assessment's workspace.
      if (Store.currentId === assessmentId) {
        showAssessmentWorkspace();
      }
      return;
    }

    if (attempt < MAX_ATTEMPTS) {
      pollDraftFRA(assessmentId, attempt + 1);
    } else {
      console.warn("Draft FRA polling timed out.");
    }
  }, 3000);
}
async function generateActionPlan() {
  const assessment = await Store.loadCurrent();

  if (!assessment) {
    alert("No assessment is currently open.");
    showDashboard();
    return;
  }

  const existing = Array.isArray(assessment.actionPlan)
    ? assessment.actionPlan
    : [];

  if (existing.length) {
    const proceed = confirm(
      "This will regenerate the action plan from the latest section assessments and replace the current table, including any manual edits. Continue?"
    );
    if (!proceed) {
      return;
    }
  }

  const btn = document.getElementById("generateActionPlanBtn");
  const originalLabel = btn ? btn.textContent : "";

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Generating…";
  }

  try {
    const response = await fetch("/.netlify/functions/ai-action-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assessment
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Action plan request failed.");
    }

    const actions = Array.isArray(result.actions) ? result.actions : [];

    assessment.actionPlan = actions;

    await Store.save(assessment);

    showAssessmentWorkspace();
  } catch (err) {
    console.error("Generate Action Plan failed:", err);
    alert(err.message || "Could not generate the action plan.");

    if (btn) {
      btn.disabled = false;
      btn.textContent = originalLabel;
    }
  }
}

/* ============================================================
   ACTION PLAN — editable table with debounced auto-save.
   Working copy mirrors the FRF pattern used by the findings screen.
   ============================================================ */
let AP = { assessment: null, saveTimer: null };

// Ensure the working copy is loaded before an edit is applied. The workspace
// re-renders from Store.loadCurrent(), so we lazily hydrate AP.assessment the
// first time a cell is edited after a render.
async function ensureActionPlanWorkingCopy() {
  if (!AP.assessment) {
    AP.assessment = await Store.loadCurrent();
  }
  if (AP.assessment && !Array.isArray(AP.assessment.actionPlan)) {
    AP.assessment.actionPlan = [];
  }
  return AP.assessment;
}

async function updateActionPlanCell(index, field, value) {
  const assessment = await ensureActionPlanWorkingCopy();
  if (!assessment || !assessment.actionPlan[index]) return;
  assessment.actionPlan[index][field] = value;
  scheduleActionPlanSave();
}

async function addActionPlanRow() {
  const assessment = await ensureActionPlanWorkingCopy();
  if (!assessment) return;
  assessment.actionPlan.push({
    category: "",
    finding: "",
    action: "",
    priority: "Medium",
    responsiblePerson: "Responsible Person",
    targetTimescale: ""
  });
  await commitActionPlanSave();
  showAssessmentWorkspace();
}

async function deleteActionPlanRow(index) {
  const assessment = await ensureActionPlanWorkingCopy();
  if (!assessment || !assessment.actionPlan[index]) return;
  if (!confirm("Delete this action?")) return;
  assessment.actionPlan.splice(index, 1);
  await commitActionPlanSave();
  showAssessmentWorkspace();
}

// Debounced save — waits for a pause in editing, then writes once.
function scheduleActionPlanSave() {
  const ind = document.getElementById("actionPlanSaveIndicator");
  if (ind) { ind.textContent = "Editing…"; ind.className = "save-indicator saving"; }
  if (AP.saveTimer) clearTimeout(AP.saveTimer);
  AP.saveTimer = setTimeout(commitActionPlanSave, 1000);
}

async function commitActionPlanSave() {
  const ind = document.getElementById("actionPlanSaveIndicator");
  if (ind) { ind.textContent = "Saving…"; ind.className = "save-indicator saving"; }
  if (!AP.assessment) return;
  try {
    const saved = await Store.save(AP.assessment);
    AP.assessment.updatedAt = saved.updatedAt;
    if (ind) { ind.textContent = "Saved ✓"; ind.className = "save-indicator saved"; }
  } catch (err) {
    console.error("Action plan save failed:", err);
    if (ind) { ind.textContent = "Save failed — check connection. Your edits are kept on screen."; ind.className = "save-indicator error"; }
  }
}

function setSectionStatus(encodedName, status) {
  const sectionName = decodeURIComponent(encodedName);

  if (!FRF.assessment.findings) {
    FRF.assessment.findings = {};
  }

  if (!FRF.assessment.findings.sectionStates) {
    FRF.assessment.findings.sectionStates = {};
  }

  const current =
    FRF.assessment.findings.sectionStates[sectionName] || {
      status: "applicable",
      reason: ""
    };

  FRF.assessment.findings.sectionStates[sectionName] = {
    ...current,
    status
  };

  scheduleFindingSave();
  openFindingSection(encodedName);
}
function updateSectionNAReason(encodedName, reason) {
  const sectionName = decodeURIComponent(encodedName);

  if (!FRF.assessment.findings) {
    FRF.assessment.findings = {};
  }

  if (!FRF.assessment.findings.sectionStates) {
    FRF.assessment.findings.sectionStates = {};
  }

  if (!FRF.assessment.findings.sectionStates[sectionName]) {
    FRF.assessment.findings.sectionStates[sectionName] = {
      status: "na",
      reason: ""
    };
  }

  FRF.assessment.findings.sectionStates[sectionName].reason = reason;

  scheduleFindingSave();
}
async function generateSectionAssessment(encodedSectionName) {
  const sectionName =
    decodeURIComponent(encodedSectionName);

  try {
    const assessment = await Store.loadCurrent();

    if (!assessment) {
      throw new Error("No assessment is currently open.");
    }

    const notes =
      document.getElementById("sectionNotes")?.value || "";

    const photos =
      assessment.photos?.sectionPhotos?.[sectionName] || [];

    const response = await fetch("/.netlify/functions/ai-section-draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        assessment,
        sectionName,
        assessorNotes: notes,
        photos,
        sectionGuidance:
          SECTION_PHOTO_GUIDANCE[sectionName] || []
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "AI request failed.");
    }

    const draftEl =
      document.getElementById("sectionDraft");

    if (!draftEl) {
      throw new Error("Section assessment field was not found.");
    }

    draftEl.value = result.draft || "";

    // Persist the generated draft so it survives navigation and feeds the action plan.
    updateSectionDraft(encodedSectionName, result.draft || "");

  } catch (err) {
    console.error("Section assessment generation failed:", err);
    alert(err.message || "Could not generate assessment.");
  }
}

/* ============================================================
   SECTION NOTES & DRAFTS — persisted inside the findings column
   so they survive navigation and are included in the assessment
   object sent to the action plan and draft FRA generators.
   ============================================================ */
function updateSectionNotes(encodedName, value) {
  const sectionName = decodeURIComponent(encodedName);
  if (!FRF.assessment.findings) FRF.assessment.findings = {};
  if (!FRF.assessment.findings.sectionNotes) FRF.assessment.findings.sectionNotes = {};
  FRF.assessment.findings.sectionNotes[sectionName] = value;
  scheduleFindingSave();
}

function updateSectionDraft(encodedName, value) {
  const sectionName = decodeURIComponent(encodedName);
  if (!FRF.assessment.findings) FRF.assessment.findings = {};
  if (!FRF.assessment.findings.sectionDrafts) FRF.assessment.findings.sectionDrafts = {};
  FRF.assessment.findings.sectionDrafts[sectionName] = value;
  scheduleFindingSave();
}

function clearSectionDraft(encodedName) {
  const draftEl = document.getElementById("sectionDraft");
  if (draftEl) draftEl.value = "";
  updateSectionDraft(encodedName, "");
}
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}