import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useSampleForm } from "../../context/SampleFormContext";
import { generateIsolatedId, getNextIsoIndex } from "../../utils/sampleIdGenerator";

const ISOLATED_TYPES = ["Fungi", "Bacteria"];

/* ================= EMPTY RUN FACTORY ================= */
const createIsolatedRun = (sampleId, isolatedType, isoIndex) => ({
  id: crypto.randomUUID(),
  isolatedId: generateIsolatedId(sampleId, isolatedType, isoIndex),
  isolatedType: isolatedType || "",
  shelf: "",
  positionInBox: "",
  storageTemperature: "-20°C",
  agarMedia: "",
  solvent: "Aquades",
  incubationTemperature: "",
  incubationTime: "",
  oxygenRequirement: "",
  notes: "",
});

export default function Step3A_PrimaryIsolated() {
  const { formData, updateSection, computedSampleId } = useSampleForm();

  const microbiology = formData.microbiology || {};
  const runs = microbiology.primaryIsolatedRuns?.length > 0
    ? microbiology.primaryIsolatedRuns
    : [];

  const [openRuns, setOpenRuns] = useState({});

  const toggleRun = (id) =>
    setOpenRuns((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ================= UPDATE HELPER ================= */
  const updateRuns = (newRuns) => {
    updateSection("microbiology", {
      ...microbiology,
      primaryIsolatedRuns: newRuns,
    });
  };

  /* ================= ADD RUN ================= */
  const addRun = () => {
    const nextIndex = getNextIsoIndex(runs);
    const defaultType = "Fungi";
    const newRun = createIsolatedRun(computedSampleId, defaultType, nextIndex);
    const updated = [...runs, newRun];
    updateRuns(updated);
    setOpenRuns((prev) => ({ ...prev, [newRun.id]: true }));
  };

  /* ================= REMOVE RUN ================= */
  const removeRun = (id) => {
    if (runs.length <= 1) return;
    updateRuns(runs.filter((r) => r.id !== id));
  };

  /* ================= UPDATE FIELD ================= */
  const updateField = (id, field, value) => {
    updateRuns(
      runs.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };

        /* ================= REGENERATE ISO ID if type changes ================= */
        if (field === "isolatedType") {
          const index = runs.findIndex((x) => x.id === id) + 1;
          updated.isolatedId = generateIsolatedId(computedSampleId, value, index);
        }

        return updated;
      })
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Microbiology — Primary Isolated
      </h1>

      {/* ================= SAMPLE ID REMINDER ================= */}
      {computedSampleId ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Sample ID</span>
          <span className="text-blue-700 font-mono font-bold">{computedSampleId}</span>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <p className="text-yellow-700 text-sm">
            Sample ID not generated yet — go back to Step 1 and fill in Sample Type, Project Type, Project Number and Sample Number.
          </p>
        </div>
      )}

      {/* ================= NO RUNS STATE ================= */}
      {runs.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-400 italic mb-4">No primary isolated entries yet.</p>
          <button type="button" onClick={addRun}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition mx-auto">
            <Plus size={14} /> Add First Entry
          </button>
        </div>
      )}

      {/* ================= RUNS ================= */}
      <div className="space-y-4">
        {runs.map((run, index) => {
          const isOpen = openRuns[run.id] !== false;
          return (
            <div key={run.id} className="border rounded-2xl shadow-sm bg-white overflow-hidden">

              {/* Run Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                <button type="button" onClick={() => toggleRun(run.id)}
                  className="flex items-center gap-3 flex-1 text-left">
                  <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Entry #{index + 1} — {run.isolatedType || "Type not set"}
                    </p>
                    {run.isolatedId && (
                      <p className="text-xs font-mono text-blue-600 mt-0.5">
                        {run.isolatedId}
                      </p>
                    )}
                  </div>
                </button>

                {runs.length > 1 && (
                  <button type="button" onClick={() => removeRun(run.id)}
                    className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700 transition ml-4">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>

              {/* Run Content */}
              {isOpen && (
                <div className="p-6 space-y-6">

                  {/* ================= AUTO ID DISPLAY ================= */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
                      Auto-generated Isolated ID
                    </p>
                    <p className="text-lg font-bold font-mono text-blue-700">
                      {run.isolatedId || "Select isolated type to generate ID"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* ================= ISOLATED TYPE ================= */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Isolated Type <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        {ISOLATED_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => updateField(run.id, "isolatedType", type)}
                            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${
                              run.isolatedType === type
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                            }`}
                          >
                            {type === "Fungi" ? "🍄 Fungi (FNG)" : "🦠 Bacteria (BCT)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Field label="Shelf" value={run.shelf}
                      onChange={(e) => updateField(run.id, "shelf", e.target.value)}
                      placeholder="e.g. Shelf A" />

                    <Field label="Position in Box" value={run.positionInBox}
                      onChange={(e) => updateField(run.id, "positionInBox", e.target.value)}
                      placeholder="e.g. A3" />

                    <SelectField label="Storage Temperature" value={run.storageTemperature}
                      onChange={(e) => updateField(run.id, "storageTemperature", e.target.value)}
                      options={["", "-20°C", "-80°C"]} />

                    <Field label="Agar Media" value={run.agarMedia}
                      onChange={(e) => updateField(run.id, "agarMedia", e.target.value)}
                      placeholder="e.g. Marine Agar" />

                    <SelectField label="Solvent" value={run.solvent}
                      onChange={(e) => updateField(run.id, "solvent", e.target.value)}
                      options={["", "Aquades", "Seawater 70% : Aquades 30%"]} />

                    <Field label="Incubation Temperature" value={run.incubationTemperature}
                      onChange={(e) => updateField(run.id, "incubationTemperature", e.target.value)}
                      placeholder="e.g. 28°C" />

                    <Field label="Incubation Time" value={run.incubationTime}
                      onChange={(e) => updateField(run.id, "incubationTime", e.target.value)}
                      placeholder="e.g. 48 hours" />

                    <Field label="Oxygen Requirement" value={run.oxygenRequirement}
                      onChange={(e) => updateField(run.id, "oxygenRequirement", e.target.value)}
                      placeholder="e.g. Aerobic / Anaerobic" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                    <textarea
                      value={run.notes || ""}
                      onChange={(e) => updateField(run.id, "notes", e.target.value)}
                      rows={3}
                      placeholder="Additional storage or isolation notes"
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= ADD BUTTON ================= */}
      {runs.length > 0 && (
        <button type="button" onClick={addRun}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
          <Plus size={14} /> Add Another Entry
        </button>
      )}
    </div>
  );
}

/* ================= FIELD COMPONENTS ================= */
function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input type="text" value={value || ""} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <select value={value || ""} onChange={onChange}
        className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt || "Select option"}</option>
        ))}
      </select>
    </div>
  );
}