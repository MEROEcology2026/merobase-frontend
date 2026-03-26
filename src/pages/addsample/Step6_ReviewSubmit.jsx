import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSampleFormContext } from "../../context/SampleFormContext";

/* ================= PROGRESS BAR ================= */
const ProgressBar = ({ label, percent }) => (
  <div className="mb-5">
    <div className="flex justify-between text-sm font-medium mb-1">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-300 ${percent === 100 ? "bg-green-500" : "bg-blue-600"}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

/* ================= PROGRESS CALC ================= */
/* ✅ FIXED: flatten nested objects for accurate progress */
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
  const filled = flatValues.filter((v) => v !== "" && v !== null && v !== false && v !== undefined).length;
  return Math.round((filled / flatValues.length) * 100);
};

/* ================= COMPONENT ================= */
export default function Step6_ReviewSubmit() {
  const navigate = useNavigate();
  const { formData, mode, submitSample } = useSampleFormContext();

  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState(null);

  /* ================= SAMPLE PREVIEW ================= */
  const meta = formData.metadata || {};

  /* ================= PROGRESS ================= */
  const progress = useMemo(() => ({
    metadata: calculateProgress(formData.metadata),
    morphology: calculateProgress(formData.morphology),
    microbiology: calculateProgress(formData.microbiology),
    molecular: calculateProgress(formData.molecular),
    publication: calculateProgress(formData.publication)
  }), [formData]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!meta.sampleName) {
      setPopup({ type: "error", message: "Sample name is required before submitting." });
      return;
    }

    try {
      setSubmitting(true);
      /* ✅ FIXED: calls real API via submitSample */
      await submitSample();
      setPopup({
        type: "success",
        message: mode === "edit" ? "Sample successfully updated!" : "Sample successfully registered!"
      });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Submit failed:", err);
      setPopup({
        type: "error",
        message: err?.response?.data?.message || "Failed to save sample. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-2 text-center">
        Review & Submit Sample
      </h2>

      <p className="text-sm text-gray-500 text-center mb-6">
        {mode === "edit" ? "Updating an existing sample" : "Registering a new sample"}
      </p>

      {/* ================= SAMPLE PREVIEW ================= */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-1">
        <p><span className="font-medium">Sample Name:</span> {meta.sampleName || "—"}</p>
        <p><span className="font-medium">Sample Type:</span> {meta.sampleType || "—"}</p>
        <p><span className="font-medium">Kingdom:</span> {meta.kingdom || "—"}</p>
        <p><span className="font-medium">Species:</span> {meta.species || "—"}</p>
        <p><span className="font-medium">Collector:</span> {meta.collectorName || "—"}</p>
        <p><span className="font-medium">Collection Date:</span> {meta.collectionDate || "—"}</p>
        <p><span className="font-medium">Dive Site:</span> {meta.diveSite || "—"}</p>
        <p><span className="font-medium">Project Type:</span> {meta.projectType || "—"}</p>
      </div>

      {/* ================= PROGRESS ================= */}
      <ProgressBar label="Metadata Completion" percent={progress.metadata} />
      <ProgressBar label="Morphology Completion" percent={progress.morphology} />
      <ProgressBar label="Microbiology Completion" percent={progress.microbiology} />
      <ProgressBar label="Molecular Completion" percent={progress.molecular} />
      <ProgressBar label="Publication Completion" percent={progress.publication} />

      {/* ================= SUBMIT BUTTON ================= */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`mt-8 w-full py-3 rounded-xl text-white font-semibold transition ${
          submitting
            ? "bg-gray-400 cursor-not-allowed"
            : mode === "edit"
            ? "bg-amber-600 hover:bg-amber-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {submitting ? "Saving..." : mode === "edit" ? "Update Sample" : "Submit Sample"}
      </button>

      {/* ================= POPUP ================= */}
      {popup && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
          <div className={`px-6 py-4 rounded-xl shadow-lg text-white max-w-sm text-center ${
            popup.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}>
            <p className="font-semibold">{popup.message}</p>
            {popup.type === "error" && (
              <button
                onClick={() => setPopup(null)}
                className="mt-3 text-sm underline opacity-80"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}