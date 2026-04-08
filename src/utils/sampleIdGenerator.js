/* ================= SAMPLE ID ================= */
// Format: B.A.01.005
// Biology → B, Non-Biology → NB
// Project Type → A or B
// Project Number → zero padded to 2 digits
// Sample Number → zero padded to 3 digits

export const generateSampleId = (sampleType, projectType, projectNumber, sampleNumber) => {
  if (!sampleType || !projectType || !projectNumber || !sampleNumber) return "";

  const type = sampleType === "Biological" ? "B" : "NB";
  const project = String(projectType).toUpperCase();
  const projNum = String(projectNumber).padStart(2, "0");
  const sampleNum = String(sampleNumber).padStart(3, "0");

  return `${type}.${project}.${projNum}.${sampleNum}`;
};

/* ================= ISOLATED ID ================= */
// Format: B.A.01.005.FNG.ISO-01
// Fungi → FNG, Bacteria → BCT
// isoIndex = 1-based index of this run globally

export const generateIsolatedId = (sampleId, isolatedType, isoIndex) => {
  if (!sampleId || !isolatedType || !isoIndex) return "";

  const typeCode = isolatedType === "Fungi" ? "FNG" : "BCT";
  const isoNum = String(isoIndex).padStart(2, "0");

  return `${sampleId}.${typeCode}.ISO-${isoNum}`;
};

/* ================= TEST ID ================= */
// Format: B.A.01.005.FNG.ISO-01.TEST-01
// testIndex = 1-based index of test within this ISO entry

export const generateTestId = (isolatedId, testIndex) => {
  if (!isolatedId || !testIndex) return "";

  const testNum = String(testIndex).padStart(2, "0");

  return `${isolatedId}.TEST-${testNum}`;
};

/* ================= HELPERS ================= */
// Get next ISO index for a sample — counts all existing runs globally
export const getNextIsoIndex = (primaryIsolatedRuns = []) => {
  return primaryIsolatedRuns.length + 1;
};

// Get next TEST index for a specific ISO ID
export const getNextTestIndex = (antibacterialRuns = [], isolatedId) => {
  const linked = antibacterialRuns.filter(r => r.linkedIsolatedId === isolatedId);
  return linked.length + 1;
};