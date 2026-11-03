import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSampleFormContext } from "../../context/SampleFormContext";
import { toastSuccess, toastError } from "../../utils/toast";

/* ================= DISPLAY HELPERS ================= */
// Comma decimal for measurements (2.5 → "2,5"), keeps 0, blank when empty.
const comma = (v, unit = "") => {
  if (v === null || v === undefined || v === "") return null;
  return `${String(v).replace(".", ",")}${unit}`;
};
const val = (v) => (v === null || v === undefined || v === "" ? null : v);

/* ================= PROGRESS BAR ================= */
const ProgressBar = ({ label, percent }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm font-medium mb-1">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-300 ${
          percent === 100 ? "bg-green-500" : percent === 0 ? "bg-gray-300" : "bg-blue-600"
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

/* ================= PROGRESS CALC ================= */
const calculateProgress = (section) => {
  if (!section || typeof section !== "object") return 0;
  const flatValues = [];
  const flatten = (obj) => {
    Object.values(obj).forEach((v) => {
      if (Array.isArray(v)) {
        flatValues.push(v.length > 0 ? "filled" : "");
      } else if (v && typeof v === "object") {
        flatten(v);
      } else {
        flatValues.push(v);
      }
    });
  };
  flatten(section);
  if (flatValues.length === 0) return 0;
  const filled = flatValues.filter(
    (v) => v !== "" && v !== null && v !== false && v !== undefined
  ).length;
  return Math.round((filled / flatValues.length) * 100);
};

/* ================= REVIEW BUILDING BLOCKS ================= */
function ReviewCard({ title, percent, missing = [], children }) {
  return (
    <div className="border border-gray-100 rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{title}</h3>
        {typeof percent === "number" && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            percent === 100 ? "bg-green-50 text-green-700"
              : percent === 0 ? "bg-gray-100 text-gray-500"
              : "bg-blue-50 text-blue-700"
          }`}>
            {percent}%
          </span>
        )}
      </div>
      {children}
      {missing.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {missing.map((m) => (
            <span key={m} className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
              missing: {m}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm text-right ${value ? "text-gray-800" : "text-gray-300 italic"}`}>
        {value || "not set"}
      </span>
    </div>
  );
}

/* ================= COMPONENT ================= */
export default function Step6_ReviewSubmit() {
  const navigate = useNavigate();
  const { formData, mode, submitSample } = useSampleFormContext();
  const [submitting, setSubmitting] = useState(false);

  const meta  = formData.metadata || {};
  const morph = formData.morphology || {};
  const micro = formData.microbiology || {};
  const mol   = formData.molecular || {};
  const pub   = formData.publication || {};
  const tests = micro.microbiologyTests || {};

  const progress = useMemo(() => ({
    metadata:    calculateProgress(formData.metadata),
    morphology:  calculateProgress(formData.morphology),
    microbiology: calculateProgress(formData.microbiology),
    molecular:   calculateProgress(formData.molecular),
    publication: calculateProgress(formData.publication),
  }), [formData]);

  /* ================= DERIVED COUNTS ================= */
  const iso   = micro.primaryIsolatedRuns || [];
  const isoMor = micro.isolatedMorphologyRuns || [];
  const absy  = tests.antibacterialRuns || [];
  const aasy  = tests.antimalarialRuns  || [];
  const bt    = tests.biochemicalRuns   || [];
  const ebt   = tests.enzymaticRuns     || [];
  const molId = Array.isArray(tests.molecularIdentificationRuns)
    ? tests.molecularIdentificationRuns : [];
  const markers = mol.markers || [];
  const pubLinks = pub.links || [];

  const totalTests =
    absy.filter(r => r.testId).length +
    aasy.filter(r => r.testId).length +
    bt.filter(r => r.testId).length +
    ebt.filter(r => r.testId).length;

  /* ================= MISSING-FIELD HINTS ================= */
  const metaMissing = [
    !val(meta.sampleName) && "sample name",
    !val(meta.sampleType) && "sample type",
    !val(meta.partOfSample) && "part of sample",
    !val(meta.diveSite) && "dive site",
    !val(meta.collectorName) && "collector",
    !val(meta.collectionDate) && "collection date",
    meta.sampleType === "Biological" && !val(meta.species) && "species",
  ].filter(Boolean);

  const morphMissing = [
    (morph.semPhotos?.length || 0) === 0 && "SEM photos",
    (morph.microPhotos?.length || 0) === 0 && "microscope photos",
    !val(morph.notes) && "notes",
  ].filter(Boolean);

  const microMissing = [
    iso.length === 0 && "no primary isolated entries",
    iso.length > 0 && isoMor.length === 0 && "no isolated morphology",
    iso.length > 0 && totalTests === 0 && "no tests recorded",
  ].filter(Boolean);

  const molMissing = [
    !val(mol.dnaSource) && "DNA source",
    !val(mol.sequencingMethod) && "sequencing method",
    markers.length === 0 && "markers",
  ].filter(Boolean);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!meta.sampleName) {
      toastError("Sample name is required before submitting.");
      return;
    }
    try {
      setSubmitting(true);
      await submitSample();
      toastSuccess(
        mode === "edit" ? "Sample successfully updated!" : "Sample successfully registered!"
      );
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Submit failed:", err);
      toastError(
        err?.response?.data?.message || "Failed to save sample. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-2 text-center">Review &amp; Submit Sample</h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        {mode === "edit" ? "Updating an existing sample" : "Registering a new sample"}
      </p>

      {/* ================= SCOPE SUMMARY ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {[
          { label: "Isolates",    n: iso.length },
          { label: "ISOMOR",      n: isoMor.length },
          { label: "Tests",       n: totalTests },
          { label: "Molecular ID", n: molId.length },
        ].map((c) => (
          <div key={c.label} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-bold text-gray-800">{c.n}</p>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">{c.label}</p>
          </div>
        ))}
      </div>

      {/* ================= METADATA ================= */}
      <ReviewCard title="Metadata" percent={progress.metadata} missing={metaMissing}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <Row label="Sample name" value={val(meta.sampleName)} />
            <Row label="Old ID" value={val(meta.oldId)} />
            <Row label="Old project" value={val(meta.oldProject)} />
            <Row label="Sample type" value={val(meta.sampleType)} />
            <Row label="Part of sample" value={val(meta.partOfSample)} />
            <Row label="Project type" value={val(meta.projectType)} />
            <Row label="Project / sample no." value={[val(meta.projectNumber), val(meta.sampleNumber)].filter(Boolean).join(" / ") || null} />
            <Row label="Dive site" value={val(meta.diveSite)} />
          </div>
          <div>
            <Row label="Collector" value={val(meta.collectorName)} />
            <Row label="Collection date" value={val(meta.collectionDate)} />
            <Row label="Depth" value={comma(meta.depth, " m")} />
            <Row label="Temperature" value={comma(meta.temperature, "°C")} />
            <Row label="pH" value={comma(meta.ph)} />
            <Row label="DO" value={comma(meta.do, " mg/L")} />
            <Row label="Sample length" value={comma(meta.sampleLength, " cm")} />
            <Row label="GPS" value={(meta.latitude && meta.longitude) ? `${meta.latitude}, ${meta.longitude}` : null} />
          </div>
        </div>
        {meta.sampleType === "Biological" && (
          <div className="mt-2 pt-2 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <Row label="Kingdom" value={val(meta.kingdom)} />
              <Row label="Family" value={val(meta.family)} />
            </div>
            <div>
              <Row label="Genus" value={val(meta.genus)} />
              <Row label="Species" value={val(meta.species)} />
            </div>
          </div>
        )}
      </ReviewCard>

      {/* ================= MORPHOLOGY ================= */}
      <ReviewCard title="Morphology" percent={progress.morphology} missing={morphMissing}>
        <Row label="SEM photos" value={(morph.semPhotos?.length || 0) > 0 ? `${morph.semPhotos.length} uploaded` : null} />
        <Row label="Microscope photos" value={(morph.microPhotos?.length || 0) > 0 ? `${morph.microPhotos.length} uploaded` : null} />
        <Row label="Notes" value={val(morph.notes) ? "added" : null} />
      </ReviewCard>

      {/* ================= MICROBIOLOGY — per isolate ================= */}
      <ReviewCard title="Microbiology" percent={progress.microbiology} missing={microMissing}>
        {iso.length === 0 ? (
          <p className="text-sm text-gray-300 italic">No primary isolated entries.</p>
        ) : (
          <div className="space-y-3">
            {iso.map((r, i) => {
              const isoId = r.isolatedId;
              const mor = isoMor.find(m => m.linkedIsolatedId === isoId);
              const nAbsy = absy.filter(x => x.linkedId === isoId && x.testId).length;
              const nAasy = aasy.filter(x => x.linkedId === isoId && x.testId).length;
              const nBt   = bt.filter(x => x.linkedId === isoId && x.testId).length;
              const nEbt  = ebt.filter(x => x.linkedId === isoId && x.testId).length;
              const mId   = molId.find(x => x.linkedId === isoId && x.testId);
              return (
                <div key={r.id || i} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <p className="font-mono text-xs text-purple-700 font-semibold break-all mb-1">
                    {isoId || `Isolate #${i + 1} (ID not generated)`}
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <Tag ok={!!mor}>{mor ? "ISOMOR ✓" : "no ISOMOR"}</Tag>
                    {nAbsy > 0 && <Tag>ABSY ×{nAbsy}</Tag>}
                    {nAasy > 0 && <Tag>AASY ×{nAasy}</Tag>}
                    {nBt > 0   && <Tag>BT ×{nBt}</Tag>}
                    {nEbt > 0  && <Tag>EBT ×{nEbt}</Tag>}
                    {mId && <Tag>MOLID{mId.speciesName ? `: ${mId.speciesName}` : ""}</Tag>}
                    {(nAbsy + nAasy + nBt + nEbt) === 0 && !mId && (
                      <Tag warn>no tests</Tag>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ReviewCard>

      {/* ================= MOLECULAR (independent) ================= */}
      <ReviewCard title="Molecular (independent)" percent={progress.molecular} missing={molMissing}>
        <Row label="DNA source" value={val(mol.dnaSource)} />
        <Row label="Extraction method" value={val(mol.extractionMethod)} />
        <Row label="Sequencing method" value={val(mol.sequencingMethod)} />
        <Row label="Markers" value={markers.filter(m => m.markerGene).length > 0
          ? `${markers.filter(m => m.markerGene).length} marker(s)` : null} />
      </ReviewCard>

      {/* ================= PUBLICATION ================= */}
      <ReviewCard title="Publication" percent={progress.publication}>
        <Row label="Links" value={pubLinks.length > 0 ? `${pubLinks.length} link(s)` : null} />
      </ReviewCard>

      {/* ================= OVERALL PROGRESS ================= */}
      <div className="mt-6 mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Completion</p>
        <ProgressBar label="Metadata"     percent={progress.metadata} />
        <ProgressBar label="Morphology"   percent={progress.morphology} />
        <ProgressBar label="Microbiology" percent={progress.microbiology} />
        <ProgressBar label="Molecular"    percent={progress.molecular} />
        <ProgressBar label="Publication"  percent={progress.publication} />
      </div>

      {/* ================= SUBMIT BUTTON ================= */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`mt-4 w-full py-3 rounded-xl text-white font-semibold transition ${
          submitting
            ? "bg-gray-400 cursor-not-allowed"
            : mode === "edit"
            ? "bg-amber-600 hover:bg-amber-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {submitting ? "Saving..." : mode === "edit" ? "Update Sample" : "Submit Sample"}
      </button>
    </div>
  );
}

/* ================= TAG ================= */
function Tag({ children, ok, warn }) {
  const cls = warn
    ? "bg-amber-50 text-amber-700 border-amber-100"
    : ok
    ? "bg-green-50 text-green-700 border-green-100"
    : "bg-white text-gray-600 border-gray-200";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 font-medium ${cls}`}>
      {children}
    </span>
  );
}