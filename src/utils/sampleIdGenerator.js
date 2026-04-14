/* ================= PART OF SAMPLE CODES ================= */
export const PART_OF_SAMPLE_OPTIONS = [
  { label: "Whole body",    code: "WB" },
  { label: "Head",          code: "H" },
  { label: "Body",          code: "B" },
  { label: "Tail",          code: "T" },
  { label: "Gill",          code: "G" },
  { label: "Intestines",    code: "I" },
  { label: "Stomach",       code: "S" },
  { label: "Kidney",        code: "K" },
  { label: "Liver",         code: "L" },
  { label: "Filter Paper",  code: "FP" },
  { label: "Heart",         code: "HRT" },
  { label: "Egg",           code: "E" },
  { label: "Bone",          code: "BNS" },
  { label: "Mucus",         code: "M" },
  { label: "Tissue",        code: "TST" },
];

/* ================= AGAR MEDIA CODES ================= */
export const AGAR_MEDIA_OPTIONS = [
  { label: "AIA",           code: "AIA" },
  { label: "ISP 2",         code: "ISP2" },
  { label: "ISP 4",         code: "ISP4" },
  { label: "SC",            code: "SCA" },
  { label: "Nutrient Agar", code: "NA" },
  { label: "Zobell Agar",   code: "ZA" },
];

/* ================= DILUTION CODES ================= */
export const DILUTION_OPTIONS = [
  { label: "10⁻²", code: "10-2" },
  { label: "10⁻³", code: "10-3" },
];

/* ================= SAMPLE ID ================= */
// Format: B.A.H.01.005
export const generateSampleId = (sampleType, projectType, partOfSample, projectNumber, sampleNumber) => {
  if (!sampleType || !projectType || !partOfSample || !projectNumber || !sampleNumber) return "";
  const type    = sampleType === "Biological" ? "B" : "NB";
  const project = String(projectType).toUpperCase();
  const part    = String(partOfSample).toUpperCase();
  const projNum = String(projectNumber).padStart(2, "0");
  const sampleNum = String(sampleNumber).padStart(3, "0");
  return `${type}.${project}.${part}.${projNum}.${sampleNum}`;
};

/* ================= MORPHOLOGY ID ================= */
// Format: B.A.H.01.005.MOR — independent
export const generateMorphologyId = (sampleId) => {
  if (!sampleId) return "";
  return `${sampleId}.MOR`;
};

/* ================= MOLECULAR ID ================= */
// Format: B.A.H.01.005.MOL — independent
export const generateMolecularId = (sampleId) => {
  if (!sampleId) return "";
  return `${sampleId}.MOL`;
};

/* ================= ISOLATED ID ================= */
// Format: B.A.H.01.005.FNG.NA.10-2.ISO-01
export const generateIsolatedId = (sampleId, isolatedType, agarMedia, dilution, isoIndex) => {
  if (!sampleId || !isolatedType || !agarMedia || !dilution || !isoIndex) return "";
  const typeCode = isolatedType === "Fungi" ? "FNG" : "BCT";
  const isoNum   = String(isoIndex).padStart(2, "0");
  return `${sampleId}.${typeCode}.${agarMedia}.${dilution}.ISO-${isoNum}`;
};

/* ================= ISOLATED MORPHOLOGY ID ================= */
// Format: B.A.H.01.005.FNG.NA.10-2.ISO-01.ISOMOR
// ✅ NO number — 1 ISO = 1 ISOMOR, always flat
export const generateIsoMorId = (isolatedId) => {
  if (!isolatedId) return "";
  return `${isolatedId}.ISOMOR`;
};

/* ================= TEST IDs ================= */
// Tests can link to either ISO or ISOMOR — counter resets per linked ID
// Format: [linkedId].ABSY-01
export const generateAntibacterialId = (linkedId, index) => {
  if (!linkedId || !index) return "";
  return `${linkedId}.ABSY-${String(index).padStart(2, "0")}`;
};

// Format: [linkedId].AASY-01
export const generateAntimalarialId = (linkedId, index) => {
  if (!linkedId || !index) return "";
  return `${linkedId}.AASY-${String(index).padStart(2, "0")}`;
};

// Format: [linkedId].BT-01
export const generateBiochemicalId = (linkedId, index) => {
  if (!linkedId || !index) return "";
  return `${linkedId}.BT-${String(index).padStart(2, "0")}`;
};

// Format: [linkedId].EBT-01
export const generateEnzymaticId = (linkedId, index) => {
  if (!linkedId || !index) return "";
  return `${linkedId}.EBT-${String(index).padStart(2, "0")}`;
};

/* ================= HELPERS ================= */

// Global ISO counter per sample
export const getNextIsoIndex = (primaryIsolatedRuns = []) => {
  return primaryIsolatedRuns.length + 1;
};

// Per-linked-ID counters — count only runs with same linked ID
export const getNextAntibacterialIndex = (runs = [], linkedId) => {
  return runs.filter(r => r.linkedId === linkedId).length + 1;
};

export const getNextAntimalarialIndex = (runs = [], linkedId) => {
  return runs.filter(r => r.linkedId === linkedId).length + 1;
};

export const getNextBiochemicalIndex = (runs = [], linkedId) => {
  return runs.filter(r => r.linkedId === linkedId).length + 1;
};

export const getNextEnzymaticIndex = (runs = [], linkedId) => {
  return runs.filter(r => r.linkedId === linkedId).length + 1;
};

/* ================= REGEN HELPER ================= */
// Walks runs in order, counts per linkedId group
export const regenIds = (runs, generator) => {
  const counters = {};
  return runs.map((r) => {
    if (!r.linkedId) return { ...r, testId: "" };
    counters[r.linkedId] = (counters[r.linkedId] || 0) + 1;
    return { ...r, testId: generator(r.linkedId, counters[r.linkedId]) };
  });
};