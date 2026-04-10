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
// Biology → B, Non-Biology → NB
// Project Type → A or B
// Part of Sample → code (H, WB, FP, etc.)
// Project Number → zero padded to 2 digits
// Sample Number → zero padded to 3 digits

export const generateSampleId = (sampleType, projectType, partOfSample, projectNumber, sampleNumber) => {
  if (!sampleType || !projectType || !partOfSample || !projectNumber || !sampleNumber) return "";

  const type = sampleType === "Biological" ? "B" : "NB";
  const project = String(projectType).toUpperCase();
  const part = String(partOfSample).toUpperCase();
  const projNum = String(projectNumber).padStart(2, "0");
  const sampleNum = String(sampleNumber).padStart(3, "0");

  return `${type}.${project}.${part}.${projNum}.${sampleNum}`;
};

/* ================= ISOLATED ID ================= */
// Format: B.A.H.01.005.FNG.NA.10-2.ISO-01
// Fungi → FNG, Bacteria → BCT
// agarMedia → code from AGAR_MEDIA_OPTIONS
// dilution → code from DILUTION_OPTIONS
// isoIndex = global 1-based index per sample

export const generateIsolatedId = (sampleId, isolatedType, agarMedia, dilution, isoIndex) => {
  if (!sampleId || !isolatedType || !agarMedia || !dilution || !isoIndex) return "";

  const typeCode = isolatedType === "Fungi" ? "FNG" : "BCT";
  const isoNum = String(isoIndex).padStart(2, "0");

  return `${sampleId}.${typeCode}.${agarMedia}.${dilution}.ISO-${isoNum}`;
};

/* ================= ISOLATED MORPHOLOGY ID ================= */
// Format: B.A.H.01.005.FNG.NA.10-2.ISO-01.ISOMOR-01
// isoMorIndex = global 1-based index per sample

export const generateIsoMorId = (isolatedId, isoMorIndex) => {
  if (!isolatedId || !isoMorIndex) return "";

  const isoMorNum = String(isoMorIndex).padStart(2, "0");

  return `${isolatedId}.ISOMOR-${isoMorNum}`;
};

/* ================= TEST ID ================= */
// Format: B.A.H.01.005.FNG.NA.10-2.ISO-01.ISOMOR-01.TEST-01
// testIndex = global 1-based index per sample
// now links from ISOMOR ID, not ISO ID

export const generateTestId = (isoMorId, testIndex) => {
  if (!isoMorId || !testIndex) return "";

  const testNum = String(testIndex).padStart(2, "0");

  return `${isoMorId}.TEST-${testNum}`;
};

/* ================= HELPERS ================= */

// Get next ISO index — global counter per sample
export const getNextIsoIndex = (primaryIsolatedRuns = []) => {
  return primaryIsolatedRuns.length + 1;
};

// Get next ISOMOR index — global counter per sample
export const getNextIsoMorIndex = (isolatedMorphologyRuns = []) => {
  return isolatedMorphologyRuns.length + 1;
};

// Get next TEST index — global counter per sample
export const getNextTestIndex = (allTestRuns = []) => {
  return allTestRuns.length + 1;
};