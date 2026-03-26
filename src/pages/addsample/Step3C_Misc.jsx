import { useState, useMemo } from "react";
import { useSampleForm } from "../../context/SampleFormContext";
import FileDropzone from "../../components/FileDropzone";
import { ChevronDown, ChevronUp } from "lucide-react";

const normalizeToArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    return Object.entries(value)
      .filter(([, v]) => v === true)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()));
  }
  return [];
};

export default function Step3C_Misc() {
  const { formData, updateSection } = useSampleForm();
  const microTests = formData.microbiology?.microbiologyTests || {};

  const biochemicalTests = useMemo(
    () => normalizeToArray(microTests.biochemicalTests),
    [microTests.biochemicalTests]
  );
  const enzymaticTests = useMemo(
    () => normalizeToArray(microTests.enzymaticTests),
    [microTests.enzymaticTests]
  );

  const antibacterial = microTests.antibacterialAssay || {};
  const molecular = microTests.molecularIdentification || {};

  const [openAssay, setOpenAssay] = useState(true);
  const [openBio, setOpenBio] = useState(true);
  const [openEnzyme, setOpenEnzyme] = useState(true);
  const [openMolecular, setOpenMolecular] = useState(true);

  /* ✅ FIXED: spread formData.microbiology to prevent sibling key erasure */
  const updateMicroTests = (payload) => {
    updateSection("microbiology", {
      ...formData.microbiology,
      microbiologyTests: {
        ...microTests,
        ...payload
      }
    });
  };

  const toggleCheckbox = (key, value, currentArray) => {
    const updated = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateMicroTests({ [key]: updated });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Microbiology - Miscellaneous</h1>

      {/* ================= ANTIBACTERIAL ASSAY ================= */}
      <CollapsibleBox title="Antibacterial Assay" open={openAssay} setOpen={setOpenAssay}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Pathogen"
            value={antibacterial.pathogen || ""}
            onChange={(e) => updateMicroTests({
              antibacterialAssay: { ...antibacterial, pathogen: e.target.value }
            })}
            options={["", "Methicillin-resistant Staphylococcus aureus", "Escherichia coli",
              "P. aeruginosa", "B. subtilis", "Salmonella typhi", "Salmonella typhimurium",
              "Acinetobacter baumannii", "Klebsiella pneumoniae",
              "Aeromonas hydrophila", "Vibrio parahaemolyticus"]}
          />
          <Select
            label="Method"
            value={antibacterial.method || ""}
            onChange={(e) => updateMicroTests({
              antibacterialAssay: { ...antibacterial, method: e.target.value }
            })}
            options={["", "Disk diffusion / Kirby bauer", "Agar Well diffusion",
              "Agar plug diffusion", "Soft-agar overlay"]}
          />
          <Select
            label="Antibacterial Activity"
            value={antibacterial.activityLevel || ""}
            onChange={(e) => updateMicroTests({
              antibacterialAssay: { ...antibacterial, activityLevel: e.target.value }
            })}
            options={["", "Low", "Medium", "High"]}
          />
        </div>

        {antibacterial.activityLevel && (
          <div className="mt-4">
            <Input
              label="Activity Notes"
              value={antibacterial.activityNotes || ""}
              onChange={(e) => updateMicroTests({
                antibacterialAssay: { ...antibacterial, activityNotes: e.target.value }
              })}
            />
          </div>
        )}

        {/* ✅ FIXED: antimalarialAssay is on microTests not antibacterialAssay */}
        <div className="mt-4">
          <Select
            label="Antimalarial Assay"
            value={microTests.antimalarialAssay || ""}
            onChange={(e) => updateMicroTests({ antimalarialAssay: e.target.value })}
            options={["", "Plasmodium berghei", "Plasmodium falciparum"]}
          />
        </div>
      </CollapsibleBox>

      {/* ================= BIOCHEMICAL TESTS ================= */}
      <CollapsibleBox title="Biochemical Tests" open={openBio} setOpen={setOpenBio}>
        <CheckboxGroup
          values={biochemicalTests}
          onToggle={(v) => toggleCheckbox("biochemicalTests", v, biochemicalTests)}
          options={["Catalase", "Oxidase", "Urease", "Gelatin hydrolysis",
            "Sulfide production", "Nitrate reduction", "Fermentation", "Indole", "Citrate"]}
        />
      </CollapsibleBox>

      {/* ================= ENZYMATIC TESTS ================= */}
      <CollapsibleBox title="Enzymatic Biochemical Tests" open={openEnzyme} setOpen={setOpenEnzyme}>
        <CheckboxGroup
          values={enzymaticTests}
          onToggle={(v) => toggleCheckbox("enzymaticTests", v, enzymaticTests)}
          options={["Amylase", "Protease", "Lipase", "Cellulase",
            "Alkane hydroxylase", "Manganese peroxidase (MnP)", "Laccase"]}
        />
      </CollapsibleBox>

      {/* ================= TEST NOTES ================= */}
      <div className="border rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Test Notes</h2>
        <textarea
          className="w-full rounded-lg border p-3 text-base"
          value={microTests.testNotes || ""}
          onChange={(e) => updateMicroTests({ testNotes: e.target.value })}
        />
      </div>

      {/* ================= MOLECULAR IDENTIFICATION ================= */}
      <CollapsibleBox title="Molecular Identification" open={openMolecular} setOpen={setOpenMolecular}>
        <Select
          label="Has the sample been molecularly identified?"
          value={molecular.hasIdentification ? "Yes" : "No"}
          onChange={(e) => updateMicroTests({
            molecularIdentification: { ...molecular, hasIdentification: e.target.value === "Yes" }
          })}
          options={["No", "Yes"]}
        />

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
                })}
              />
            </div>
          </div>
        )}
      </CollapsibleBox>
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

function CheckboxGroup({ values = [], onToggle, options }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={values.includes(opt)} onChange={() => onToggle(opt)} />
          {opt}
        </label>
      ))}
    </div>
  );
}