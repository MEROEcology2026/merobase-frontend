import { useState } from "react";
import { useSampleForm } from "../../context/SampleFormContext";
import FileDropzone from "../../components/FileDropzone";
import { ChevronDown, ChevronUp, Plus, X, Trash2, Link } from "lucide-react";
import {
  generateAntibacterialId, generateAntimalarialId,
  generateBiochemicalId, generateEnzymaticId,
  getNextAntibacterialIndex, getNextAntimalarialIndex,
  getNextBiochemicalIndex, getNextEnzymaticIndex,
  regenIds,
} from "../../utils/sampleIdGenerator";

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

const ANTIBACTERIAL_METHODS = [
  "Disk diffusion / Kirby bauer", "Agar Well diffusion",
  "Agar plug diffusion", "Soft-agar overlay"
];

const PLASMODIUM_SPECIES = ["Plasmodium berghei", "Plasmodium falciparum"];
const ANTIMALARIAL_METHODS = ["Disk diffusion", "Agar Well diffusion", "Micro dilution"];
const ACTIVITY_LEVELS = ["Low", "Medium", "High"];

/* ================= EMPTY RUN FACTORIES ================= */
const createAntibacterialRun = (linkedId, testId) => ({
  id: crypto.randomUUID(),
  linkedId: linkedId || "",
  testId: testId || "",
  pathogen: "", method: "", activityLevel: "", activityNotes: "", notes: "",
});

const createAntimalarialRun = (linkedId, testId) => ({
  id: crypto.randomUUID(),
  linkedId: linkedId || "",
  testId: testId || "",
  plasmodiumSpecies: "", method: "", activityLevel: "", notes: "",
});

const createTestRun = (linkedId, testId) => ({
  id: crypto.randomUUID(),
  linkedId: linkedId || "",
  testId: testId || "",
  notes: "", checked: [], customTests: []
});

export default function Step3C_Misc() {
  const { formData, updateSection } = useSampleForm();
  const microTests = formData.microbiology?.microbiologyTests || {};

  /* ================= ✅ ONLY ISO OPTIONS — no ISOMOR ================= */
  const isolatedRuns = formData.microbiology?.primaryIsolatedRuns || [];
  const linkOptions = isolatedRuns
    .filter(r => r.isolatedId)
    .map(r => ({
      value: r.isolatedId,
      label: `${r.isolatedId} (${r.isolatedType || "Unknown"})`,
    }));

  /* ================= RUNS ================= */
  const antibacterialRuns = microTests.antibacterialRuns?.length > 0
    ? microTests.antibacterialRuns : [createAntibacterialRun()];
  const antimalarialRuns = microTests.antimalarialRuns?.length > 0
    ? microTests.antimalarialRuns : [createAntimalarialRun()];
  const biochemicalRuns = microTests.biochemicalRuns?.length > 0
    ? microTests.biochemicalRuns : [createTestRun()];
  const enzymaticRuns = microTests.enzymaticRuns?.length > 0
    ? microTests.enzymaticRuns : [createTestRun()];
  const molecular = microTests.molecularIdentification || {};

  const [openAntibacterial, setOpenAntibacterial] = useState(true);
  const [openAntimalarial, setOpenAntimalarial]   = useState(true);
  const [openBio,      setOpenBio]      = useState(true);
  const [openEnzyme,   setOpenEnzyme]   = useState(true);
  const [openMolecular, setOpenMolecular] = useState(true);

  /* ================= UPDATE HELPER ================= */
  const updateMicroTests = (payload) => {
    updateSection("microbiology", {
      ...formData.microbiology,
      microbiologyTests: { ...microTests, ...payload }
    });
  };

  /* ================= ANTIBACTERIAL HANDLERS ================= */
  const addAntibacterialRun = () => {
    const firstId   = linkOptions[0]?.value || "";
    const nextIndex = getNextAntibacterialIndex(antibacterialRuns, firstId);
    const testId    = firstId ? generateAntibacterialId(firstId, nextIndex) : "";
    updateMicroTests({
      antibacterialRuns: [...antibacterialRuns, createAntibacterialRun(firstId, testId)]
    });
  };

  const removeAntibacterialRun = (id) => {
    if (antibacterialRuns.length <= 1) return;
    const updated = antibacterialRuns.filter(r => r.id !== id);
    updateMicroTests({ antibacterialRuns: regenIds(updated, generateAntibacterialId) });
  };

  const updateAntibacterialRun = (id, field, value) => {
    const updated = antibacterialRuns.map(r => r.id !== id ? r : { ...r, [field]: value });
    const final   = field === "linkedId" ? regenIds(updated, generateAntibacterialId) : updated;
    updateMicroTests({ antibacterialRuns: final });
  };

  /* ================= ANTIMALARIAL HANDLERS ================= */
  const addAntimalarialRun = () => {
    const firstId   = linkOptions[0]?.value || "";
    const nextIndex = getNextAntimalarialIndex(antimalarialRuns, firstId);
    const testId    = firstId ? generateAntimalarialId(firstId, nextIndex) : "";
    updateMicroTests({
      antimalarialRuns: [...antimalarialRuns, createAntimalarialRun(firstId, testId)]
    });
  };

  const removeAntimalarialRun = (id) => {
    if (antimalarialRuns.length <= 1) return;
    const updated = antimalarialRuns.filter(r => r.id !== id);
    updateMicroTests({ antimalarialRuns: regenIds(updated, generateAntimalarialId) });
  };

  const updateAntimalarialRun = (id, field, value) => {
    const updated = antimalarialRuns.map(r => r.id !== id ? r : { ...r, [field]: value });
    const final   = field === "linkedId" ? regenIds(updated, generateAntimalarialId) : updated;
    updateMicroTests({ antimalarialRuns: final });
  };

  /* ================= BIOCHEMICAL HANDLERS ================= */
  const addBiochemicalRun = () => {
    const firstId   = linkOptions[0]?.value || "";
    const nextIndex = getNextBiochemicalIndex(biochemicalRuns, firstId);
    const testId    = firstId ? generateBiochemicalId(firstId, nextIndex) : "";
    const current   = microTests.biochemicalRuns || [createTestRun()];
    updateMicroTests({ biochemicalRuns: [...current, createTestRun(firstId, testId)] });
  };

  const removeBiochemicalRun = (id) => {
    const current = microTests.biochemicalRuns || [];
    if (current.length <= 1) return;
    const updated = current.filter(r => r.id !== id);
    updateMicroTests({ biochemicalRuns: regenIds(updated, generateBiochemicalId) });
  };

  const updateBiochemicalRun = (id, field, value) => {
    const current = microTests.biochemicalRuns || [];
    const updated = current.map(r => r.id !== id ? r : { ...r, [field]: value });
    const final   = field === "linkedId" ? regenIds(updated, generateBiochemicalId) : updated;
    updateMicroTests({ biochemicalRuns: final });
  };

  /* ================= ENZYMATIC HANDLERS ================= */
  const addEnzymaticRun = () => {
    const firstId   = linkOptions[0]?.value || "";
    const nextIndex = getNextEnzymaticIndex(enzymaticRuns, firstId);
    const testId    = firstId ? generateEnzymaticId(firstId, nextIndex) : "";
    const current   = microTests.enzymaticRuns || [createTestRun()];
    updateMicroTests({ enzymaticRuns: [...current, createTestRun(firstId, testId)] });
  };

  const removeEnzymaticRun = (id) => {
    const current = microTests.enzymaticRuns || [];
    if (current.length <= 1) return;
    const updated = current.filter(r => r.id !== id);
    updateMicroTests({ enzymaticRuns: regenIds(updated, generateEnzymaticId) });
  };

  const updateEnzymaticRun = (id, field, value) => {
    const current = microTests.enzymaticRuns || [];
    const updated = current.map(r => r.id !== id ? r : { ...r, [field]: value });
    const final   = field === "linkedId" ? regenIds(updated, generateEnzymaticId) : updated;
    updateMicroTests({ enzymaticRuns: final });
  };

  /* ================= CHECKBOX HANDLERS ================= */
  const toggleCheck = (key, runId, testName) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map(r => {
        if (r.id !== runId) return r;
        const checked = r.checked.includes(testName)
          ? r.checked.filter(v => v !== testName)
          : [...r.checked, testName];
        return { ...r, checked };
      })
    });
  };

  const addCustomTest = (key, runId) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map(r => r.id !== runId ? r : {
        ...r, customTests: [...(r.customTests || []), { id: crypto.randomUUID(), name: "" }]
      })
    });
  };

  const updateCustomTest = (key, runId, testId, value) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map(r => r.id !== runId ? r : {
        ...r, customTests: r.customTests.map(t => t.id === testId ? { ...t, name: value } : t)
      })
    });
  };

  const removeCustomTest = (key, runId, testId) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map(r => {
        if (r.id !== runId) return r;
        const removedName = r.customTests.find(t => t.id === testId)?.name;
        return {
          ...r,
          customTests: r.customTests.filter(t => t.id !== testId),
          checked: r.checked.filter(c => c !== removedName)
        };
      })
    });
  };

  const toggleCustomCheck = (key, runId, testId, testName) => {
    const current = microTests[key] || [];
    updateMicroTests({
      [key]: current.map(r => {
        if (r.id !== runId) return r;
        const checked = r.checked.includes(testName)
          ? r.checked.filter(v => v !== testName)
          : [...r.checked, testName];
        return { ...r, checked };
      })
    });
  };

  /* ================= ✅ SIMPLIFIED LINK SELECTOR — ISO ONLY ================= */
  const LinkSelector = ({ linkedId, testId, onChange }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:col-span-2">
      <div className="flex items-center gap-2 mb-2">
        <Link size={14} className="text-blue-600" />
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
          Link to Primary Isolated
        </p>
      </div>
      {linkOptions.length === 0 ? (
        <p className="text-xs text-yellow-600 bg-yellow-50 rounded px-3 py-2">
          No primary isolated entries found — go to Step 3A first.
        </p>
      ) : (
        <select value={linkedId || ""} onChange={(e) => onChange(e.target.value)}
          className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none">
          <option value="">— Select Primary Isolated ID —</option>
          {linkOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
      {testId && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
            Auto-generated Test ID:
          </p>
          <p className="text-sm font-bold font-mono text-blue-700 break-all">{testId}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Microbiology - Miscellaneous</h1>

      {linkOptions.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <p className="text-yellow-700 text-sm">
            No primary isolated entries found. Go to Step 3A first — each test run must be linked to a Primary Isolated entry.
          </p>
        </div>
      )}

      {/* ================= ANTIBACTERIAL ASSAY ================= */}
      <CollapsibleBox title="Antibacterial Assay" open={openAntibacterial} setOpen={setOpenAntibacterial}>
        <div className="space-y-4">
          {antibacterialRuns.map((run, index) => (
            <div key={run.id} className="border rounded-xl p-4 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-700">Run #{index + 1}</h3>
                  {run.testId && (
                    <p className="text-xs font-mono text-blue-600 mt-0.5 break-all">{run.testId}</p>
                  )}
                </div>
                {antibacterialRuns.length > 1 && (
                  <button type="button" onClick={() => removeAntibacterialRun(run.id)}
                    className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700 transition ml-4 flex-shrink-0">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LinkSelector
                  linkedId={run.linkedId}
                  testId={run.testId}
                  onChange={(v) => updateAntibacterialRun(run.id, "linkedId", v)} />
                <Select label="Pathogen" value={run.pathogen || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "pathogen", e.target.value)}
                  options={["", ...PATHOGENS]} />
                <Select label="Method" value={run.method || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "method", e.target.value)}
                  options={["", ...ANTIBACTERIAL_METHODS]} />
                <Select label="Antibacterial Activity" value={run.activityLevel || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "activityLevel", e.target.value)}
                  options={["", ...ACTIVITY_LEVELS]} />
              </div>
              {run.activityLevel && (
                <Input label="Activity Notes" value={run.activityNotes || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "activityNotes", e.target.value)} />
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Run Notes</label>
                <textarea value={run.notes || ""}
                  onChange={(e) => updateAntibacterialRun(run.id, "notes", e.target.value)}
                  rows={2} placeholder="Notes for this run..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addAntibacterialRun}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus size={14} /> Add Another Run
          </button>
        </div>
      </CollapsibleBox>

      {/* ================= ANTIMALARIAL ASSAY ================= */}
      <CollapsibleBox title="Antimalarial Assay" open={openAntimalarial} setOpen={setOpenAntimalarial}>
        <div className="space-y-4">
          {antimalarialRuns.map((run, index) => (
            <div key={run.id} className="border rounded-xl p-4 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-700">Run #{index + 1}</h3>
                  {run.testId && (
                    <p className="text-xs font-mono text-blue-600 mt-0.5 break-all">{run.testId}</p>
                  )}
                </div>
                {antimalarialRuns.length > 1 && (
                  <button type="button" onClick={() => removeAntimalarialRun(run.id)}
                    className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700 transition ml-4 flex-shrink-0">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LinkSelector
                  linkedId={run.linkedId}
                  testId={run.testId}
                  onChange={(v) => updateAntimalarialRun(run.id, "linkedId", v)} />
                <Select label="Plasmodium Species" value={run.plasmodiumSpecies || ""}
                  onChange={(e) => updateAntimalarialRun(run.id, "plasmodiumSpecies", e.target.value)}
                  options={["", ...PLASMODIUM_SPECIES]} />
                <Select label="Method" value={run.method || ""}
                  onChange={(e) => updateAntimalarialRun(run.id, "method", e.target.value)}
                  options={["", ...ANTIMALARIAL_METHODS]} />
                <Select label="Activity Level" value={run.activityLevel || ""}
                  onChange={(e) => updateAntimalarialRun(run.id, "activityLevel", e.target.value)}
                  options={["", ...ACTIVITY_LEVELS]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Run Notes</label>
                <textarea value={run.notes || ""}
                  onChange={(e) => updateAntimalarialRun(run.id, "notes", e.target.value)}
                  rows={2} placeholder="Notes for this run..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addAntimalarialRun}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus size={14} /> Add Another Run
          </button>
        </div>
      </CollapsibleBox>

      {/* ================= BIOCHEMICAL TESTS ================= */}
      <CollapsibleBox title="Biochemical Tests" open={openBio} setOpen={setOpenBio}>
        <div className="space-y-4">
          {biochemicalRuns.map((run, index) => (
            <RunBlock key={run.id} run={run} index={index}
              defaultTests={DEFAULT_BIOCHEMICAL}
              canRemove={biochemicalRuns.length > 1}
              linkOptions={linkOptions}
              onLinkChange={(v) => updateBiochemicalRun(run.id, "linkedId", v)}
              onRemove={() => removeBiochemicalRun(run.id)}
              onNotesChange={(v) => updateBiochemicalRun(run.id, "notes", v)}
              onToggle={(name) => toggleCheck("biochemicalRuns", run.id, name)}
              onAddCustom={() => addCustomTest("biochemicalRuns", run.id)}
              onUpdateCustom={(testId, v) => updateCustomTest("biochemicalRuns", run.id, testId, v)}
              onRemoveCustom={(testId) => removeCustomTest("biochemicalRuns", run.id, testId)}
              onToggleCustom={(testId, name) => toggleCustomCheck("biochemicalRuns", run.id, testId, name)} />
          ))}
          <button type="button" onClick={addBiochemicalRun}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus size={14} /> Add Another Run
          </button>
        </div>
      </CollapsibleBox>

      {/* ================= ENZYMATIC TESTS ================= */}
      <CollapsibleBox title="Enzymatic Biochemical Tests" open={openEnzyme} setOpen={setOpenEnzyme}>
        <div className="space-y-4">
          {enzymaticRuns.map((run, index) => (
            <RunBlock key={run.id} run={run} index={index}
              defaultTests={DEFAULT_ENZYMATIC}
              canRemove={enzymaticRuns.length > 1}
              linkOptions={linkOptions}
              onLinkChange={(v) => updateEnzymaticRun(run.id, "linkedId", v)}
              onRemove={() => removeEnzymaticRun(run.id)}
              onNotesChange={(v) => updateEnzymaticRun(run.id, "notes", v)}
              onToggle={(name) => toggleCheck("enzymaticRuns", run.id, name)}
              onAddCustom={() => addCustomTest("enzymaticRuns", run.id)}
              onUpdateCustom={(testId, v) => updateCustomTest("enzymaticRuns", run.id, testId, v)}
              onRemoveCustom={(testId) => removeCustomTest("enzymaticRuns", run.id, testId)}
              onToggleCustom={(testId, name) => toggleCustomCheck("enzymaticRuns", run.id, testId, name)} />
          ))}
          <button type="button" onClick={addEnzymaticRun}
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
              onChange={(e) => updateMicroTests({ molecularIdentification: { ...molecular, speciesName: e.target.value } })} />
            <Select label="PCR Platform" value={molecular.pcrPlatform || ""}
              onChange={(e) => updateMicroTests({ molecularIdentification: { ...molecular, pcrPlatform: e.target.value } })}
              options={["", "Conventional PCR", "qPCR", "RT-PCR"]} />
            <Select label="PCR Protocol Type" value={molecular.pcrProtocolType || ""}
              onChange={(e) => updateMicroTests({ molecularIdentification: { ...molecular, pcrProtocolType: e.target.value } })}
              options={["", "Standard", "Touchdown", "Nested"]} />
            <Select label="Sequencing Method" value={molecular.sequencingMethod || ""}
              onChange={(e) => updateMicroTests({ molecularIdentification: { ...molecular, sequencingMethod: e.target.value } })}
              options={["", "Sanger", "NGS", "MinION"]} />
            <Select label="Bioinformatics Pipeline" value={molecular.bioinformaticsPipeline || ""}
              onChange={(e) => updateMicroTests({ molecularIdentification: { ...molecular, bioinformaticsPipeline: e.target.value } })}
              options={["", "QIIME", "Mothur", "Custom"]} />
            <Select label="Accession / Submission" value={molecular.accessionStatus || "Unpublished"}
              onChange={(e) => updateMicroTests({ molecularIdentification: { ...molecular, accessionStatus: e.target.value } })}
              options={["Unpublished", "Published"]} />
            {molecular.accessionStatus === "Published" && (
              <Input label="Accession Number" value={molecular.accessionNumber || ""}
                onChange={(e) => updateMicroTests({ molecularIdentification: { ...molecular, accessionNumber: e.target.value } })} />
            )}
            <div className="md:col-span-2">
              <FileDropzone
                multiple={false}
                accept=".fastq,.fq,.ab1,.txt,.fasta,.fa"
                existing={molecular.rawSequenceFile ? [molecular.rawSequenceFile] : []}
                onFiles={(files) => updateMicroTests({ molecularIdentification: { ...molecular, rawSequenceFile: files?.[0] || null } })} />
            </div>
          </div>
        )}
      </CollapsibleBox>
    </div>
  );
}

/* ================= RUN BLOCK ================= */
function RunBlock({
  run, index, defaultTests, canRemove, linkOptions,
  onLinkChange, onRemove, onNotesChange, onToggle,
  onAddCustom, onUpdateCustom, onRemoveCustom, onToggleCustom
}) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-700">Run #{index + 1}</h3>
          {run.testId && (
            <p className="text-xs font-mono text-blue-600 mt-0.5 break-all">{run.testId}</p>
          )}
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="flex items-center gap-1 text-red-500 text-sm hover:text-red-700 transition ml-4 flex-shrink-0">
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>

      {/* ✅ ISO ONLY SELECTOR */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Link size={14} className="text-blue-600" />
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Link to Primary Isolated
          </p>
        </div>
        {linkOptions.length === 0 ? (
          <p className="text-xs text-yellow-600 bg-yellow-50 rounded px-3 py-2">
            No primary isolated entries found — go to Step 3A first.
          </p>
        ) : (
          <select value={run.linkedId || ""} onChange={(e) => onLinkChange(e.target.value)}
            className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none">
            <option value="">— Select Primary Isolated ID —</option>
            {linkOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
        {run.testId && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Test ID:</p>
            <p className="text-sm font-bold font-mono text-blue-700 break-all">{run.testId}</p>
          </div>
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
              <input type="text" value={test.name}
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
        <textarea value={run.notes || ""} onChange={(e) => onNotesChange(e.target.value)}
          rows={2} placeholder="Notes for this run..."
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