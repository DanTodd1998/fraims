// Boilerplate content for FRA sections 1, 2, 3 and 6.
// These are the same on every report (the legal/regulatory framing).
// Editing here changes it for all future reports.

module.exports = {
  disclaimer: {
    title: "Disclaimer & Limitations",
    intro:
      "This Fire Risk Assessment (Type 1) has been prepared following a visual, non-invasive inspection of the premises. The assessment was limited to the accessible communal areas only. Unless specifically stated otherwise, the assessment did not include individual dwellings, concealed spaces, internal building fabric, or areas that were locked, restricted, or otherwise inaccessible at the time of inspection. No destructive or intrusive methods were employed, and the findings are therefore restricted to what was visible and reasonably identifiable on the date of inspection.",
    blocks: [
      { heading: "Access Restrictions", body: "Private flats, service risers, roof voids, ducts, cupboards, and other restricted or inaccessible areas were not inspected unless explicit arrangements had been made to grant access. Where access was not possible, this is noted as \u201cNot Accessed.\u201d No assumptions have been made regarding these areas, and no liability is accepted for defects, hazards, or risks that may exist but were not visible during the inspection." },
      { heading: "Scope and Use of Report", body: "This report has been produced solely for the named client and for the purpose set out in the agreed scope of works. It should not be copied, distributed, or relied upon by third parties without the express written consent of the author. Any unauthorised reliance on this assessment is at the sole risk of the user, and no responsibility or liability is accepted in such cases." },
      { heading: "Limitations of Findings", body: "The findings reflect the condition of the property on the date of inspection only. Building conditions, occupancy, and management practices can change over time. This assessment should not be taken as a guarantee of ongoing fire safety or compliance. The responsibility for ensuring continued compliance with the Regulatory Reform (Fire Safety) Order 2005 and other applicable legislation rests with the building owner, managing agent, or appointed responsible person." },
      { heading: "Legal and Regulatory Context", body: "This assessment has been undertaken in good faith, applying recognised fire safety standards and guidance current at the time of inspection. However, changes in legislation, case law, or official guidance may render elements of this report out of date. It remains the ongoing duty of the responsible person under the Regulatory Reform (Fire Safety) Order 2005 to maintain, review, and update fire safety arrangements in line with current legal requirements." }
    ]
  },

  regulations: {
    title: "Referenced Regulations & Guidelines",
    intro:
      "This assessment has been prepared with reference to a range of statutory instruments, approved documents, national standards, and best practice guidance relevant to fire safety management within residential blocks and communal buildings. The following documents, while not exhaustive, have informed the observations contained within this report:",
    blocks: [
      { heading: "Regulatory Reform (Fire Safety) Order 2005 (FSO)", body: "The cornerstone of fire safety legislation in England and Wales. The FSO places clear duties on the \u201cresponsible person\u201d (typically the freeholder, managing agent, or duty holder) to carry out suitable and sufficient fire risk assessments, maintain appropriate fire safety measures, and ensure that relevant persons are not exposed to undue risk. This assessment is aligned with the obligations set out under the Order but should not be regarded as a substitute for the client\u2019s full compliance duties." },
      { heading: "The Building Regulations 2010 \u2013 Approved Document Part B (Fire Safety)", body: "These regulations set statutory requirements for building design and construction, with particular emphasis on fire resistance, means of escape, internal compartmentation, and the performance of passive and active fire protection measures. The relevant provisions of Part B are referenced in the context of fire-resisting door sets and their role in preserving compartmentation and escape routes within multi-occupied residential premises." },
      { heading: "Fire Safety in Purpose-Built Blocks of Flats (LGA Guide, 2011)", body: "A widely respected best-practice document produced by the LGA, providing detailed and practical guidance on managing fire safety in purpose-built residential blocks. This guide covers both general fire precautions and specific issues such as evacuation strategies, stay-put policies, and the ongoing management of fire doors. It remains one of the most authoritative sector documents, although it is recognised as guidance rather than statute." },
      { heading: "Fire Safety (England) Regulations 2022", body: "Secondary legislation under the FSO placing specific duties on responsible persons in multi-occupied residential buildings. These include requirements for regular checks of fire doors, provision of safety information to residents, and wayfinding signage for firefighters. Where relevant, this assessment highlights areas where such duties may apply." },
      { heading: "British Standards and Supplementary Guidance (as applicable)", body: "BS 9991:2021 \u2013 Fire safety in the design, management, and use of residential buildings. BS 9999:2017 \u2013 Risk-based code of practice for fire safety in buildings. BS 8214:2016 \u2013 Fire-resisting timber-based door assemblies (installation & maintenance). BS 476 and BS EN 1634 series \u2013 Fire resistance testing for building elements." }
    ],
    notesTitle: "Important Notes on Scope and Application",
    notes: [
      "This FRA is a Type 1 assessment, meaning it was limited to a visual, non-intrusive inspection of the communal parts of the premises. Individual flats, concealed spaces, and locked areas were not inspected.",
      "The references above are intended to frame the observations made. They are not an exhaustive list of applicable legislation or standards.",
      "This assessment is advisory. It does not constitute legal advice, a building survey, or a certificate of compliance.",
      "The duty to ensure ongoing fire safety and legal compliance remains with the responsible person under the Fire Safety Order."
    ]
  },

  legal: {
    title: "Legal & Financial Implications",
    intro:
      "Failure to comply with fire safety legislation is not simply a technical breach \u2014 it carries serious legal, financial, and reputational consequences for building owners, freeholders, landlords, and other duty holders.",
    blocks: [
      { heading: "Legal Duties", body: "The Regulatory Reform (Fire Safety) Order 2005 (FSO) places a legal duty on the \u201cresponsible person\u201d (usually the freeholder, landlord, or duty holder) to take general fire precautions to ensure, so far as reasonably practicable, the safety of all relevant persons. The Fire Safety (England) Regulations 2022 introduced further obligations for multi-occupied residential buildings, including routine checks of communal fire doors, provision of fire safety information to residents, and wayfinding signage in high-rise premises. Breaches of the FSO are criminal offences and can result in enforcement notices, prohibition notices, unlimited fines, and, in the most serious cases, imprisonment." },
      { heading: "Enforcement Powers", body: "Local Fire and Rescue Authorities are the primary enforcing bodies. They carry out audits and inspections and have wide-ranging powers to require improvements or prohibit the use of unsafe premises. Prosecutions are not rare. Owners, freeholders, and landlords across the UK have faced substantial fines and, in some cases, custodial sentences for failing to maintain adequate fire precautions such as working alarms, clear escape routes, maintained compartmentation, and safe management arrangements." },
      { heading: "Insurance Consequences", body: "Insurers expect buildings to comply with statutory fire safety obligations. If a fire occurs and it is found that precautions were inadequate \u2014 for example, defective alarm systems, obstructed escape routes, or lack of maintenance in communal areas \u2014 insurance claims may be reduced, challenged, or declined. Non-compliance can also affect the cost and availability of cover. Demonstrating a robust fire risk assessment regime and ongoing compliance can help manage premiums and reduce disputes in the event of a claim." },
      { heading: "Reputational & Commercial Risks", body: "Failures in fire safety can result not only in legal and financial penalties but also in serious reputational harm. Inadequate fire safety management undermines confidence among residents, leaseholders, regulators, and insurers. In the property sector, reputational damage can reduce asset values, limit saleability, weaken investor confidence, and jeopardise the long-term financial stability of property portfolios." }
    ],
    summaryTitle: "Summary",
    summary: [
      ["Legal risk", "Unlimited fines, enforcement action, and potential imprisonment."],
      ["Insurance risk", "Reduced cover, invalidated claims, or higher premiums."],
      ["Financial risk", "Increased costs, devalued assets, and exposure to civil claims from residents."],
      ["Reputational risk", "Loss of trust, reputational damage, and commercial disadvantage."]
    ],
    outro:
      "Maintaining robust fire safety measures and complying with statutory duties is therefore not only essential for protecting life, but also for ensuring legal compliance, financial security, and the protection of long-term asset value."
  },

  monitoring: {
    title: "Monitoring & Review",
    intro:
      "Fire risk assessment is not a one-off exercise. The Regulatory Reform (Fire Safety) Order 2005 requires the responsible person to keep the assessment under regular review and to revise it where there is reason to suspect it is no longer valid or where significant changes have taken place.",
    blocks: [
      { heading: "Review of this Assessment", body: "This assessment is valid until {{validTo}} and should be formally reviewed on or before that date. A review should be undertaken sooner if any of the following occur: material alterations to the building, its layout, or its use; a change in occupancy profile, including the presence of vulnerable residents requiring evacuation assistance; a fire, near miss, or other significant fire-related incident; the introduction of new ignition sources, storage arrangements, or hazards within the common parts; changes to fire safety legislation or recognised guidance; or any other reason to suspect that the findings of this assessment are no longer valid." },
      { heading: "Ongoing Monitoring", body: "Between formal reviews, the responsible person should ensure that fire safety standards are maintained through routine, proportionate monitoring of the premises. This should include regular walkthrough checks of the communal areas to confirm that escape routes remain clear and unobstructed, that fire doors remain undamaged and self-closing effectively, and that housekeeping standards are maintained. Life safety systems should continue to be tested and serviced in accordance with the relevant British Standards, including periodic testing of the fire detection and alarm system, monthly functional testing and annual full-duration testing of the emergency lighting installation, and inspection and testing of the fixed electrical installation at the intervals recommended in the current EICR." },
      { heading: "Records", body: "Records of all tests, inspections, servicing visits, and monitoring checks should be retained and kept accessible, as these demonstrate ongoing compliance and support the effective management of fire safety at the premises. Certification appended to this report should be replaced with current versions as systems are re-tested and re-certified." }
    ]
  },

  // PAS 79-1 3x3 matrix. Rows = likelihood, Cols = consequence.
  riskMatrix: {
    likelihoods: ["Low", "Medium", "High"],
    consequences: ["Slight harm", "Moderate harm", "Extreme harm"],
    // grid[likelihood][consequence] = rating
    grid: {
      "Low":    { "Slight harm": "Trivial",   "Moderate harm": "Tolerable",    "Extreme harm": "Moderate" },
      "Medium": { "Slight harm": "Tolerable",  "Moderate harm": "Moderate",     "Extreme harm": "Substantial" },
      "High":   { "Slight harm": "Moderate",   "Moderate harm": "Substantial",  "Extreme harm": "Intolerable" }
    },
    definitions: [
      ["Trivial", "No action required and no detailed records need be kept."],
      ["Tolerable", "No major additional controls required; maintain existing measures and monitor to ensure controls remain effective."],
      ["Moderate", "Efforts should be made to reduce the risk within a defined time period."],
      ["Substantial", "Considerable resources may need to be allocated to reduce the risk; urgent attention required."],
      ["Intolerable", "The premises (or relevant part) should not be occupied until the risk is reduced."]
    ]
  }
};
