import { useState } from "react";
import { useSampleForm } from "../../context/SampleFormContext";
import FileDropzone from "../../components/FileDropzone";
import { ChevronDown, ChevronUp, Plus, X, Trash2 } from "lucide-react";

const normalizeToArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, v]) => v === true)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()));
  }
  return [];
};

const DEFAULT_BIOCHEMICAL = [
  "Catalase", "Oxidase", "Urease", "Gelatin hydrolysis",
  "Sulfide production", "Nitrate reduction", "Fermentation", "Indole", "Citrate"
];

const DEFAULT_ENZYMATIC = [
  "Amylase", "Protease", "Lipase", "Cellulase",
  "Alkane hydroxylase", "Manganese peroxidase (MnP)", "Laccase"
];

const PATHOGENS = [
  "Methicillin-resistant Staphylococcus aureus", "Escherichia coli",
  "P. aeruginosa", "B. subtilis", "Salmonella typhi", "Salmonella typhimurium",
  "Acinetobacter baumannii", "Klebsiella pneumoniae",
  "Aeromonas hydrophila", "Vibrio parahaemolyticus"
];

const METHODS = [
  "Disk diffusion / Kirby bauer", "Agar Well diffusion",
  "Agar plug diffusion", "Soft-agar overlay"
];

const ACTIVITY_LEVELS = ["Low", "Medium", "High"];
const ANTIMALARIAL_OPTIONS = ["Plasmodium berghei", "Plasmodium falciparum"];

/* ================= EMPTY RUN FACTORIES ================= */
const createAntibacterialRun = () => ({
  id: crypto.randomUUID(),
  pathogen: "",
  method: "",
  activityLevel: "",
  activityNotes: "",
  antimalarialAssay: "",
  notes: "",
});

const createTestRun = () => ({
  id: crypto.randomUUID(),
  notes: "",
  checked: [],
  customTests: []
});

export default function Step3C_Misc() {
  const { formData, updateSection } = useSampleForm();
  const microTests = formData.microbiology?.microbiologyTests || {};

  /* ================= RUNS ================= */
  const antibacterialRuns = microTests.antibacterialRuns?.length > 0
    ? microTests.antibacterialRuns
    : [createAntibacterialRun()];

  const biochemicalRuns = microTests.biochemicalRuns?.length > 0
    ? microTests.biochemicalRuns
    : [createTestRun()];

  const enzymaticRuns = microTests.enzymaticRuns?.length > 0
    ? microTests.enzymaticRuns
    : [createTestRun()];

  const molecular = microTests.molecularIdentification || {};

  const [openAssay, setOpenAssay] = useState(true);
  const [openBio, setOpenBio] = useState(true);
  const [openEnzyme, setOpenEnzyme] = useState(true);
  const [openMolecular, setOpenMolecular] = useState(true);

  /* ================= UPDATE HELPER ================= */
  const updateMicroTests = (payload) => {
    updateSection("microbiology", {
      ...formData.microbiology,
      microbiologyTests: {
        ...microTests,
        ...payload
      }
    });
  };

  /* ================= ANTIBACTERIAL RUN HANDLERS ================= */
  const addAntibacterialRun = () => {
    updateMicroTests({
      antibacterialRuns: [...antibacterialRuns, createAntibacterialRun()]
    });
  };

  const removeAntibacterialRun = (id) => {
    if (antibacterialRuns.length <= 1) return;
    updateMicroTests({
      antibacterialRuns: antibacterialRuns.filter((r) => r.id !== id)
    });
  };

  const updateAntibacterialRun = (id, field, value) => {
    updateMicroTests({
      antibacterialRuns: antibacterialRuns.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      )
    });
  };

  /* ================= TEST RUN HANDLERS ================= */
  const addRun = (key) => {
    const current = microTests[key] || [createTestRun()];
    updateMicroTests({ [key]: [...current, createTestRun()] });
  };

  const removeRun = (key, id) => {
    const current = microTests[key] || [];
    if (current.length <= 1) return;
    updateMicroTests({ [key]: current.filter((r) => r.id !== id) });
  };

  const updateRun = (key, id, field, value) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map((r) => r.id === id ? { ...r, [field]: value } : r)
    });
  };

  const toggleCheck = (key, runId, testName) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map((r) => {
        if (r.id !== runId) return r;
        const checked = r.checked.includes(testName)
          ? r.checked.filter((v) => v !== testName)
          : [...r.checked, testName];
        return { ...r, checked };
      })
    });
  };

  const addCustomTest = (key, runId) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map((r) => {
        if (r.id !== runId) return r;
        return {
          ...r,
          customTests: [...(r.customTests || []), { id: crypto.randomUUID(), name: "" }]
        };
      })
    });
  };

  const updateCustomTest = (key, runId, testId, value) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map((r) => {
        if (r.id !== runId) return r;
        return {
          ...r,
          customTests: r.customTests.map((t) =>
            t.id === testId ? { ...t, name: value } : t
          )
        };
      })
    });
  };

  const removeCustomTest = (key, runId, testId) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map((r) => {
        if (r.id !== runId) return r;
        const removedName = r.customTests.find(t => t.id === testId)?.name;
        return {
          ...r,
          customTests: r.customTests.filter((t) => t.id !== testId),
          checked: r.checked.filter((c) => c !== removedName)
        };
      })
    });
  };

  const toggleCustomCheck = (key, runId, testId, testName) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map((r) => {
        if (r.id !== runId) return r;
        const checked = r.checked.includes(testName)
          ? r.checked.filter((v) => v !== testName)
          : [...r.checked, testName];
        return { ...r, checked };
      })
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Microbiology - Miscellaneous</h1>

      {/* ================= ANTIBACTERIAL ASSAY ================= */}
      <CollapsibleBox title="Antibacterial Assay" open={openAssay} setOpen={setOpenAssay}>
        <div className="space-y-4">
          {antibacterialRuns.map((run, index) => (
            <div key={run.id} className="border rounded-xl p-4 bg-gray-50 space-y-4">
              {/* Run header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Run #{index + 1}</h3>
                {antibacterialRuns.length > 1 && (
                  <button type="button"
                    onClick={() => removeAntibacterialRun(run.id)}
                    className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700 transition">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Pathogen"
                  value={run.pathogen || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "pathogen", e.target.value)}
                  options={["", ...PATHOGENS]}
                />
                <Select
                  label="Method"
                  value={run.method || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "method", e.target.value)}
                  options={["", ...METHODS]}
                />
                <Select
                  label="Antibacterial Activity"
                  value={run.activityLevel || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "activityLevel", e.target.value)}
                  options={["", ...ACTIVITY_LEVELS]}
                />
                <Select
                  label="Antimalarial Assay"
                  value={run.antimalarialAssay || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "antimalarialAssay", e.target.value)}
                  options={["", ...ANTIMALARIAL_OPTIONS]}
                />
              </div>

              {run.activityLevel && (
                <Input
                  label="Activity Notes"
                  value={run.activityNotes || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "activityNotes", e.target.value)}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Run Notes</label>
                <textarea
                  value={run.notes || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "notes", e.target.value)}
                  rows={2}
                  placeholder="Notes for this run..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white"
                />
              </div>
            </div>
          ))}

          <button type="button"
            onClick={addAntibacterialRun}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus size={14} /> Add Another Run
          </button>
        </div>
      </CollapsibleBox>

      {/* ================= BIOCHEMICAL TESTS ================= */}
      <CollapsibleBox title="Biochemical Tests" open={openBio} setOpen={setOpenBio}>
        <div className="space-y-4">
          {biochemicalRuns.map((run, index) => (
            <RunBlock
              key={run.id}
              run={run}
              index={index}
              defaultTests={DEFAULT_BIOCHEMICAL}
              canRemove={biochemicalRuns.length > 1}
              onRemove={() => removeRun("biochemicalRuns", run.id)}
              onNotesChange={(v) => updateRun("biochemicalRuns", run.id, "notes", v)}
              onToggle={(name) => toggleCheck("biochemicalRuns", run.id, name)}
              onAddCustom={() => addCustomTest("biochemicalRuns", run.id)}
              onUpdateCustom={(testId, v) => updateCustomTest("biochemicalRuns", run.id, testId, v)}
              onRemoveCustom={(testId) => removeCustomTest("biochemicalRuns", run.id, testId)}
              onToggleCustom={(testId, name) => toggleCustomCheck("biochemicalRuns", run.id, testId, name)}
            />
          ))}
          <button type="button"
            onClick={() => addRun("biochemicalRuns")}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus size={14} /> Add Another Run
          </button>
        </div>
      </CollapsibleBox>

      {/* ================= ENZYMATIC TESTS ================= */}
      <CollapsibleBox title="Enzymatic Biochemical Tests" open={openEnzyme} setOpen={setOpenEnzyme}>
        <div className="space-y-4">
          {enzymaticRuns.map((run, index) => (
            <RunBlock
              key={run.id}
              run={run}
              index={index}
              defaultTests={DEFAULT_ENZYMATIC}
              canRemove={enzymaticRuns.length > 1}
              onRemove={() => removeRun("enzymaticRuns", run.id)}
              onNotesChange={(v) => updateRun("enzymaticRuns", run.id, "notes", v)}
              onToggle={(name) => toggleCheck("enzymaticRuns", run.id, name)}
              onAddCustom={() => addCustomTest("enzymaticRuns", run.id)}
              onUpdateCustom={(testId, v) => updateCustomTest("enzymaticRuns", run.id, testId, v)}
              onRemoveCustom={(testId) => removeCustomTest("enzymaticRuns", run.id, testId)}
              onToggleCustom={(testId, name) => toggleCustomCheck("enzymaticRuns", run.id, testId, name)}
            />
          ))}
          <button type="button"
            onClick={() => addRun("enzymaticRuns")}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus size={14} /> Add Another Run
          </button>
        </div>
      </CollapsibleBox>

      {/* ================= TEST NOTES ================= */}
      <div className="border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">General Test Notes</h2>
        <textarea className="w-full rounded-lg border p-3 text-base"
          value={microTests.testNotes || ""}
          onChange={(e) => updateMicroTests({ testNotes: e.target.value })} />
      </div>

      {/* ================= MOLECULAR IDENTIFICATION ================= */}
      <CollapsibleBox title="Molecular Identification" open={openMolecular} setOpen={setOpenMolecular}>
        <Select
          label="Has the sample been molecularly identified?"
          value={molecular.hasIdentification ? "Yes" : "No"}
          onChange={(e) => updateMicroTests({
            molecularIdentification: { ...molecular, hasIdentification: e.target.value === "Yes" }
          })}
          options={["No", "Yes"]} />
        {molecular.hasIdentification && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input label="Species Name" value={molecular.speciesName || ""}
              onChange={(e) => updateMicroTests({
                molecularIdentification: { ...molecular, speciesName: e.target.value }
              })} />
            <Select label="PCR Platform" value={molecular.pcrPlatform || ""}
              onChange={(e) => updateMicroTests({
                molecularIdentification: { ...molecular, pcrPlatform: e.target.value }
              })}
              options={["", "Conventional PCR", "qPCR", "RT-PCR"]} />
            <Select label="PCR Protocol Type" value={molecular.pcrProtocolType || ""}
              onChange={(e) => updateMicroTests({
                molecularIdentification: { ...molecular, pcrProtocolType: e.target.value }
              })}
              options={["", "Standard", "Touchdown", "Nested"]} />
            <Select label="Sequencing Method" value={molecular.sequencingMethod || ""}
              onChange={(e) => updateMicroTests({
                molecularIdentification: { ...molecular, sequencingMethod: e.target.value }
              })}
              options={["", "Sanger", "NGS", "MinION"]} />
            <Select label="Bioinformatics Pipeline" value={molecular.bioinformaticsPipeline || ""}
              onChange={(e) => updateMicroTests({
                molecularIdentification: { ...molecular, bioinformaticsPipeline: e.target.value }
              })}
              options={["", "QIIME", "Mothur", "Custom"]} />
            <Select label="Accession / Submission" value={molecular.accessionStatus || "Unpublished"}
              onChange={(e) => updateMicroTests({
                molecularIdentification: { ...molecular, accessionStatus: e.target.value }
              })}
              options={["Unpublished", "Published"]} />
            {molecular.accessionStatus === "Published" && (
              <Input label="Accession Number" value={molecular.accessionNumber || ""}
                onChange={(e) => updateMicroTests({
                  molecularIdentification: { ...molecular, accessionNumber: e.target.value }
                })} />
            )}
            <div className="md:col-span-2">
              <FileDropzone
                multiple={false}
                accept=".fastq,.fq,.ab1,.txt,.fasta,.fa"
                existing={molecular.rawSequenceFile ? [molecular.rawSequenceFile] : []}
                onFiles={(files) => updateMicroTests({
                  molecularIdentification: { ...molecular, rawSequenceFile: files?.[0] || null }
                })} />
            </div>
          </div>
        )}
      </CollapsibleBox>
    </div>
  );
}

/* ================= RUN BLOCK ================= */
function RunBlock({
  run, index, defaultTests, canRemove,
  onRemove, onNotesChange, onToggle,
  onAddCustom, onUpdateCustom, onRemoveCustom, onToggleCustom
}) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Run #{index + 1}</h3>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700 transition">
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {defaultTests.map((test) => (
          <label key={test} className="flex items-center gap-3 text-sm cursor-pointer">
            <input type="checkbox"
              checked={run.checked?.includes(test) || false}
              onChange={() => onToggle(test)} />
            {test}
          </label>
        ))}
      </div>

      {run.customTests?.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-xs text-gray-500 font-medium">Custom tests:</p>
          {run.customTests.map((test) => (
            <div key={test.id} className="flex items-center gap-2">
              <input type="checkbox"
                checked={run.checked?.includes(test.name) || false}
                onChange={() => onToggleCustom(test.id, test.name)}
                disabled={!test.name} />
              <input type="text"
                value={test.name}
                onChange={(e) => onUpdateCustom(test.id, e.target.value)}
                placeholder="Enter test name..."
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white" />
              <button type="button" onClick={() => onRemoveCustom(test.id)}
                className="text-red-500 hover:text-red-700 transition">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" onClick={onAddCustom}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition">
        <Plus size={13} /> Add custom test
      </button>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Run Notes</label>
        <textarea
          value={run.notes || ""}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          placeholder="Notes for this run..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white" />
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */
function CollapsibleBox({ title, open, setOpen, children }) {
  return (
    <div className="border rounded-xl overflow-hidden">
      <button type="button"
        className="w-full flex justify-between items-center p-4 bg-gray-50"
        onClick={() => setOpen(!open)}>
        <span className="text-lg font-semibold">{title}</span>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm">{label}</label>
      <input className="border rounded-lg p-3 text-base" value={value || ""} onChange={onChange} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm">{label}</label>
      <select className="border rounded-lg p-3 text-base" value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt === "" ? "— Select —" : opt}</option>
        ))}
      </select>
    </div>
  );
}