import { useState } from "react";
import { ChevronDown, Plus, Trash2, Link } from "lucide-react";
import { useSampleForm } from "../../context/SampleFormContext";
import { generateIsoMorId } from "../../utils/sampleIdGenerator";

/* ================= OPTIONS ================= */
const MACROSCOPIC_SHAPES      = ["Round", "Oval", "Irregular"];
const MACROSCOPIC_ARRANGEMENTS = ["Single", "Cluster", "Chains"];
const COLONY_SHAPES    = ["Circular", "Irregular", "Filamentous"];
const COLONY_MARGINS   = ["Entire", "Undulate", "Lobate"];
const COLONY_ELEVATIONS = ["Flat", "Raised", "Convex"];
const COLONY_COLORS    = ["White", "Cream", "Yellow", "Red"];
const COLONY_TEXTURES  = ["Smooth", "Rough", "Mucoid"];
const COLONY_MOTILITIES = ["Motile", "Non-motile"];
const MICROSCOPIC_SHAPES      = ["Coccus", "Bacillus", "Spiral"];
const MICROSCOPIC_ARRANGEMENTS = ["Single", "Pairs", "Chains"];
const GRAM_REACTIONS   = ["Positive", "Negative"];

/* ================= IMAGE RESIZE ================= */
const resizeImage = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const maxDim = 1024;
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h *= maxDim / w; w = maxDim; }
      if (h > w && h > maxDim) { w *= maxDim / h; h = maxDim; }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.7);
    };
  });

/* ================= EMPTY RUN FACTORY ================= */
const createMorRun = (linkedIsolatedId, isoMorId) => ({
  id: crypto.randomUUID(),
  linkedIsolatedId: linkedIsolatedId || "",
  isoMorId: isoMorId || "",
  macroscopic:       { shape: "", arrangement: "", images: [] },
  colonyDescription: { shape: "", margin: "", elevation: "", color: "", texture: "", motility: "" },
  microscopic:       { shape: "", arrangement: "", gramReaction: "", images: [] },
});

export default function Step3B_IsolatedMorphology() {
  const { formData, updateSection } = useSampleForm();
  const microbiology = formData.microbiology || {};
  const runs = microbiology.isolatedMorphologyRuns || [];
  const [openRuns, setOpenRuns] = useState({});

  /* ================= ISO OPTIONS FROM STEP 3A ================= */
  const isolatedOptions = (microbiology.primaryIsolatedRuns || [])
    .filter((r) => r.isolatedId)
    .map((r) => ({
      value: r.isolatedId,
      label: `${r.isolatedId} (${r.isolatedType || "Unknown"})`,
    }));

  /* ================= WHICH ISOs ALREADY HAVE AN ISOMOR ================= */
  const usedIsoIds = new Set(runs.map(r => r.linkedIsolatedId).filter(Boolean));
  const availableIsoOptions = isolatedOptions.filter(o => !usedIsoIds.has(o.value));

  const toggleRun = (id) =>
    setOpenRuns((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ================= UPDATE HELPER ================= */
  const updateRuns = (newRuns) => {
    updateSection("microbiology", {
      ...microbiology,
      isolatedMorphologyRuns: newRuns,
    });
  };

  /* ================= ADD RUN ================= */
  const addRun = () => {
    // Only add if there are ISOs without an ISOMOR yet
    if (availableIsoOptions.length === 0) return;
    const firstIsoId = availableIsoOptions[0]?.value || "";
    const isoMorId   = firstIsoId ? generateIsoMorId(firstIsoId) : "";
    const newRun     = createMorRun(firstIsoId, isoMorId);
    const updated    = [...runs, newRun];
    updateRuns(updated);
    setOpenRuns((prev) => ({ ...prev, [newRun.id]: true }));
  };

  /* ================= REMOVE RUN ================= */
  const removeRun = (id) => {
    if (runs.length <= 1) return;
    updateRuns(runs.filter((r) => r.id !== id));
  };

  /* ================= UPDATE ISO LINK ================= */
  const updateIsoLink = (id, isolatedId) => {
    // Check if another run already uses this ISO
    const alreadyUsed = runs.some(r => r.id !== id && r.linkedIsolatedId === isolatedId);
    if (alreadyUsed) return; // block duplicate
    const isoMorId = isolatedId ? generateIsoMorId(isolatedId) : "";
    updateRuns(
      runs.map((r) => r.id === id ? { ...r, linkedIsolatedId: isolatedId, isoMorId } : r)
    );
  };

  /* ================= UPDATE FIELD ================= */
  const updateField = (id, section, field, value) => {
    updateRuns(
      runs.map((r) => {
        if (r.id !== id) return r;
        return { ...r, [section]: { ...r[section], [field]: value } };
      })
    );
  };

  /* ================= HANDLE IMAGE UPLOAD ================= */
  const handleImages = async (id, section, files) => {
    const run      = runs.find((r) => r.id === id);
    const existing = run?.[section]?.images || [];
    if (existing.length + files.length > 2) {
      alert("Maximum 2 images allowed.");
      return;
    }
    const normalized = await Promise.all(Array.from(files).map(resizeImage));
    updateRuns(
      runs.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          [section]: {
            ...r[section],
            images: [
              ...existing,
              ...normalized.map((data) => ({ id: crypto.randomUUID(), data })),
            ],
          },
        };
      })
    );
  };

  const allIsosCovered = isolatedOptions.length > 0 && availableIsoOptions.length === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Microbiology — Isolated Morphology
      </h1>

      {/* ================= RULE REMINDER ================= */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <p className="text-blue-700 text-sm">
          Each Primary Isolated entry can only have <strong>one</strong> Isolated Morphology entry.
          {allIsosCovered && " All isolated entries already have a morphology entry."}
        </p>
      </div>

      {/* ================= ISO WARNING ================= */}
      {isolatedOptions.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <p className="text-yellow-700 text-sm">
            No primary isolated entries found — go to Step 3A first.
          </p>
        </div>
      )}

      {/* ================= NO RUNS STATE ================= */}
      {runs.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-400 italic mb-4">No isolated morphology entries yet.</p>
          <button type="button" onClick={addRun}
            disabled={availableIsoOptions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition mx-auto disabled:opacity-40 disabled:cursor-not-allowed">
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
                      Entry #{index + 1}
                    </p>
                    {run.isoMorId && (
                      <p className="text-xs font-mono text-purple-600 mt-0.5">
                        {run.isoMorId}
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

              {isOpen && (
                <div className="p-6 space-y-6">

                  {/* ================= ISOMOR ID DISPLAY ================= */}
                  <div className={`border rounded-lg px-4 py-3 ${
                    run.isoMorId
                      ? "bg-purple-50 border-purple-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-purple-500">
                      Isolated Morphology ID
                    </p>
                    <p className="text-lg font-bold font-mono text-purple-700 break-all">
                      {run.isoMorId || "Link to a Primary Isolated entry to generate ID"}
                    </p>
                  </div>

                  {/* ================= ISO SELECTOR ================= */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Link size={14} className="text-blue-600" />
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        Link to Primary Isolated Entry
                      </p>
                    </div>
                    {isolatedOptions.length === 0 ? (
                      <p className="text-xs text-yellow-600">No isolated entries — go to Step 3A first.</p>
                    ) : (
                      <select
                        value={run.linkedIsolatedId || ""}
                        onChange={(e) => updateIsoLink(run.id, e.target.value)}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      >
                        <option value="">— Select Primary Isolated ID —</option>
                        {isolatedOptions.map((opt) => {
                          const alreadyUsed = usedIsoIds.has(opt.value) && run.linkedIsolatedId !== opt.value;
                          return (
                            <option key={opt.value} value={opt.value} disabled={alreadyUsed}>
                              {opt.label}{alreadyUsed ? " (already has ISOMOR)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  {/* ================= MACROSCOPIC ================= */}
                  <CollapsibleSection title="Macroscopic Morphology">
                    <FileUpload
                      existing={run.macroscopic?.images || []}
                      onFiles={(files) => handleImages(run.id, "macroscopic", files)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <SelectInput label="Shape" value={run.macroscopic?.shape || ""}
                        options={MACROSCOPIC_SHAPES}
                        onChange={(v) => updateField(run.id, "macroscopic", "shape", v)} />
                      <SelectInput label="Arrangement" value={run.macroscopic?.arrangement || ""}
                        options={MACROSCOPIC_ARRANGEMENTS}
                        onChange={(v) => updateField(run.id, "macroscopic", "arrangement", v)} />
                    </div>
                  </CollapsibleSection>

                  {/* ================= COLONY DESCRIPTION ================= */}
                  <CollapsibleSection title="Colony Description">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SelectInput label="Shape" value={run.colonyDescription?.shape || ""}
                        options={COLONY_SHAPES}
                        onChange={(v) => updateField(run.id, "colonyDescription", "shape", v)} />
                      <SelectInput label="Margin" value={run.colonyDescription?.margin || ""}
                        options={COLONY_MARGINS}
                        onChange={(v) => updateField(run.id, "colonyDescription", "margin", v)} />
                      <SelectInput label="Elevation" value={run.colonyDescription?.elevation || ""}
                        options={COLONY_ELEVATIONS}
                        onChange={(v) => updateField(run.id, "colonyDescription", "elevation", v)} />
                      <SelectInput label="Color" value={run.colonyDescription?.color || ""}
                        options={COLONY_COLORS}
                        onChange={(v) => updateField(run.id, "colonyDescription", "color", v)} />
                      <SelectInput label="Texture" value={run.colonyDescription?.texture || ""}
                        options={COLONY_TEXTURES}
                        onChange={(v) => updateField(run.id, "colonyDescription", "texture", v)} />
                      <SelectInput label="Motility" value={run.colonyDescription?.motility || ""}
                        options={COLONY_MOTILITIES}
                        onChange={(v) => updateField(run.id, "colonyDescription", "motility", v)} />
                    </div>
                  </CollapsibleSection>

                  {/* ================= MICROSCOPIC ================= */}
                  <CollapsibleSection title="Microscopic Morphology">
                    <FileUpload
                      existing={run.microscopic?.images || []}
                      onFiles={(files) => handleImages(run.id, "microscopic", files)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <SelectInput label="Shape" value={run.microscopic?.shape || ""}
                        options={MICROSCOPIC_SHAPES}
                        onChange={(v) => updateField(run.id, "microscopic", "shape", v)} />
                      <SelectInput label="Arrangement" value={run.microscopic?.arrangement || ""}
                        options={MICROSCOPIC_ARRANGEMENTS}
                        onChange={(v) => updateField(run.id, "microscopic", "arrangement", v)} />
                      <SelectInput label="Gram Reaction" value={run.microscopic?.gramReaction || ""}
                        options={GRAM_REACTIONS}
                        onChange={(v) => updateField(run.id, "microscopic", "gramReaction", v)} />
                    </div>
                  </CollapsibleSection>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= ADD BUTTON ================= */}
      {runs.length > 0 && !allIsosCovered && (
        <button type="button" onClick={addRun}
          disabled={availableIsoOptions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
          <Plus size={14} /> Add Another Entry
        </button>
      )}

      {/* ================= ALL COVERED STATE ================= */}
      {allIsosCovered && runs.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-green-700 text-sm">
            ✓ All primary isolated entries have an isolated morphology entry.
          </p>
        </div>
      )}
    </div>
  );
}

/* ================= COLLAPSIBLE SECTION ================= */
function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        <ChevronDown className={`transition-transform w-4 h-4 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

function SelectInput({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function FileUpload({ existing = [], onFiles }) {
  return (
    <>
      <label className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition">
        <input type="file" multiple accept="image/*" hidden
          onChange={(e) => onFiles(e.target.files)} />
        <p className="text-gray-500 text-sm">Drag & drop or click to upload images</p>
      </label>
      {existing.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {existing.map((img) => (
            <img key={img.id} src={img.data} alt="preview"
              className="w-full h-32 object-cover rounded-lg" />
          ))}
        </div>
      )}
    </>
  );
}