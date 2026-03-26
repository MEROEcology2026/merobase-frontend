import { useState } from "react";
import FormProgressBar from "../../components/FormProgressBar";
import FileDropzone from "../../components/FileDropzone";
import { useSampleForm } from "../../context/SampleFormContext";
import { resizeImage } from "../../utils/imageUtils";

const MARKER_GENES = ["16S rRNA","18S rRNA","ITS","COI","rbcL","H3"];
const DNA_SOURCES = ["Bacteria Culture","Paper Filter","Animal Tissue"];
const EXTRACTION_KITS = [
  "PureLink® Genomic DNA Kit (K1820-01, K1820-02, K1821-04)",
  "ZymoBIOMICS Quick-DNA Miniprep Plus Kit",
  "ZymoBIOMICS DNA Miniprep Kit (Lysis Tubes)"
];
const EXTRACTION_METHODS = ["Extraction Kit","Chelex 10%"];
const PCR_METHODS = ["HS Red Mix","Hot Start Green"];
const SEQUENCING_METHODS = ["Sanger","Illumina","Oxford Nanopore"];
const SEQUENCING_QUALITY = ["Excellent","Good","Moderate","Poor"];
const BIOINFO_PIPELINES = ["QIIME2","DADA2","Mothur","Custom Pipeline"];
const DNA_CONCENTRATION = ["<10 ng/µL","10–50 ng/µL","50–100 ng/µL",">100 ng/µL"];
const ACCESSION_STATUS = ["Not Submitted","Submitted","Published"];
const PRIMER_FORWARD_OPTIONS = [
  "Primer 27F - BASA, 258 µl","Primer LCO - BASA, 230 µl",
  "Primer FishBCL - BASA, 352 µl","Primer jg-LCO, 202 µl",
  "Primer 28S Rdna C2_F, 300 µl","Primer dgLCO1490_F, 300 µl",
  "Primer CO1porF1","Primer C1J2165_F","Primer COX1-R1_F",
  "Primer 16Sar-L - BASA","Primer H3F - BASA","Primer LCO1490"
];
const PRIMER_REVERSE_OPTIONS = [
  "Primer 1492R - BASA, 338 µl","Primer HCO - BASA, 327 µl",
  "Primer FishBCH - BASA, 408 µl","Primer jg-HCO, 264 µl",
  "Primer 28S Rdna D2_R, 300 µl","Primer dgHCO2198_R, 290 µl",
  "Primer CO1porR1","Primer C1Npor2760_R","Primer COX1-D2_R",
  "Primer 16s-xH - BASA","Primer H3R - BASA","Primer 16Sbr-H"
];

export default function Step4_Molecular() {
  const { formData, updateSection } = useSampleForm();

  /* ✅ FIXED: molecular now uses markers array from context */
  const molecular = {
    ...formData.molecular,
    markers: formData.molecular?.markers?.length > 0
      ? formData.molecular.markers
      : [{ id: crypto.randomUUID(), markerGene: "", primerForward: "",
           primerReverse: "", pcrProtocolType: "", accessionStatus: "", accessionNumber: "" }]
  };

  const [open, setOpen] = useState({ files: true, metadata: true, markers: true });
  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const setValue = (field, value) => updateSection("molecular", { [field]: value });

  /* ✅ FIXED: removed normalizeImage, handle files directly */
  const handleGelImage = async (files) => {
    if (!files?.length) return;
    const data = await resizeImage(files[0]);
    setValue("gelImage", { id: crypto.randomUUID(), name: files[0].name, data });
  };

  const handleRawFiles = (files) => {
    const fileList = Array.from(files).map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
    }));
    setValue("rawSequenceFiles", fileList);
  };

  /* ✅ FIXED: no direct mutation, use map instead */
  const updateMarker = (index, field, value) => {
    const updated = molecular.markers.map((m, i) =>
      i === index ? { ...m, [field]: value } : m
    );
    updateSection("molecular", { markers: updated });
  };

  const addMarker = () => {
    updateSection("molecular", {
      markers: [
        ...molecular.markers,
        { id: crypto.randomUUID(), markerGene: "", primerForward: "",
          primerReverse: "", pcrProtocolType: "", accessionStatus: "", accessionNumber: "" }
      ]
    });
  };

  const removeMarker = (index) => {
    updateSection("molecular", {
      markers: molecular.markers.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8">
      <FormProgressBar step={4} steps={8} />

      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Molecular Analysis</h1>
        <p className="text-sm text-gray-500">DNA extraction, amplification, sequencing, and analysis metadata</p>
      </header>

      {/* ================= FILE UPLOADS ================= */}
      <Box title="Gel & RAW Sequence Files" open={open.files} toggle={() => toggle("files")}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label>Gel Image</Label>
            <FileDropzone
              accept="image/*"
              multiple={false}
              existing={molecular.gelImage ? [molecular.gelImage] : []}
              onFiles={handleGelImage}
            />
          </div>
          <div>
            <Label>RAW Sequence Files</Label>
            <FileDropzone
              multiple
              accept=".fastq,.fq,.ab1,.fasta,.fa,.txt"
              existing={molecular.rawSequenceFiles || []}
              onFiles={handleRawFiles}
            />
            {molecular.rawSequenceFiles?.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                {molecular.rawSequenceFiles.map(f => (
                  <li key={f.id} className="flex items-center gap-2">
                    <span>📄</span> {f.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Box>

      {/* ================= GENERAL METADATA ================= */}
      <Box title="General Molecular Metadata" open={open.metadata} toggle={() => toggle("metadata")}>
        <Grid>
          <Select label="DNA Source" value={molecular.dnaSource || ""} onChange={(v) => setValue("dnaSource", v)} options={DNA_SOURCES} />
          <Select label="DNA Extraction Method" value={molecular.extractionMethod || ""} onChange={(v) => setValue("extractionMethod", v)} options={EXTRACTION_METHODS} />
          <Select label="Extraction Kit Used" value={molecular.extractionKit || ""} onChange={(v) => setValue("extractionKit", v)} options={EXTRACTION_KITS} />
          <Select label="DNA Concentration Range" value={molecular.dnaConcentrationRange || ""} onChange={(v) => setValue("dnaConcentrationRange", v)} options={DNA_CONCENTRATION} />
          <Select label="PCR Method" value={molecular.pcrMethod || ""} onChange={(v) => setValue("pcrMethod", v)} options={PCR_METHODS} />
          <Select label="Sequencing Method" value={molecular.sequencingMethod || ""} onChange={(v) => setValue("sequencingMethod", v)} options={SEQUENCING_METHODS} />
          <Select label="Sequencing Quality" value={molecular.sequencingQuality || ""} onChange={(v) => setValue("sequencingQuality", v)} options={SEQUENCING_QUALITY} />
          <Select label="Bioinformatics Pipeline" value={molecular.bioinformaticsPipeline || ""} onChange={(v) => setValue("bioinformaticsPipeline", v)} options={BIOINFO_PIPELINES} />
        </Grid>
      </Box>

      {/* ================= MARKER-SPECIFIC ================= */}
      <Box title="Marker Specific Data" open={open.markers} toggle={() => toggle("markers")}>
        {molecular.markers.map((marker, index) => (
          /* ✅ FIXED: use marker.id as key instead of index */
          <div key={marker.id || index} className="border rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="font-semibold mb-4">Marker #{index + 1}</h3>
            <Grid>
              <Select label="Marker Gene / Target" value={marker.markerGene || ""} onChange={(v) => updateMarker(index, "markerGene", v)} options={MARKER_GENES} />
              <Select label="Primer – Forward" value={marker.primerForward || ""} onChange={(v) => updateMarker(index, "primerForward", v)} options={PRIMER_FORWARD_OPTIONS} />
              <Select label="Primer – Reverse" value={marker.primerReverse || ""} onChange={(v) => updateMarker(index, "primerReverse", v)} options={PRIMER_REVERSE_OPTIONS} />
              <div>
                <Label>PCR Protocol Notes</Label>
                <textarea rows={3} value={marker.pcrProtocolType || ""}
                  onChange={(e) => updateMarker(index, "pcrProtocolType", e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-base" />
              </div>
              <Select label="Accession / Submission Status" value={marker.accessionStatus || ""} onChange={(v) => updateMarker(index, "accessionStatus", v)} options={ACCESSION_STATUS} />
              <div>
                <Label>Accession Number</Label>
                <input type="text" value={marker.accessionNumber || ""}
                  onChange={(e) => updateMarker(index, "accessionNumber", e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-base" />
              </div>
            </Grid>
            {molecular.markers.length > 1 && (
              <button type="button" onClick={() => removeMarker(index)}
                className="mt-4 text-red-600 text-sm hover:underline">
                Remove Marker
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addMarker}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          + Add Another Marker
        </button>
      </Box>
    </div>
  );
}

function Box({ title, open, toggle, children }) {
  return (
    <section className="border rounded-xl shadow-sm">
      <button type="button" onClick={toggle}
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 rounded-t-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="p-6 space-y-4">{children}</div>}
    </section>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}

function Label({ children }) {
  return <label className="block text-sm mb-1">{children}</label>;
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-base">
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}