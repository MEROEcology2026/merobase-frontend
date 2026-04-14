import { useState } from "react";
import FormProgressBar from "../../components/FormProgressBar";
import { useSampleForm } from "../../context/SampleFormContext";
import { resizeImage } from "../../utils/imageUtils";
import { generateMorphologyId } from "../../utils/sampleIdGenerator";

export default function Step2_Morphology() {
  const { formData, updateSection, computedSampleId } = useSampleForm();
  const morphology = formData.morphology || {};

  /* ================= MORPHOLOGY ID ================= */
  const morphologyId = generateMorphologyId(computedSampleId);

  const [open, setOpen] = useState({ sem: true, microscope: true, notes: true });
  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleMultipleImages = async (field, files) => {
    const existingCount = morphology[field]?.length || 0;
    if (existingCount + files.length > 2) {
      alert("Maximum 2 images allowed for this section.");
      return;
    }

    const newFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        const data = await resizeImage(file);
        return { id: crypto.randomUUID(), name: file.name, data };
      })
    );

    updateSection("morphology", {
      [field]: [...(morphology[field] || []), ...newFiles],
    });
  };

  const removeImage = (field, id) => {
    updateSection("morphology", {
      [field]: morphology[field].filter((img) => img.id !== id),
    });
  };

  const handleChange = (field, value) =>
    updateSection("morphology", { [field]: value });

  return (
    <div className="space-y-8">
      <FormProgressBar step={2} steps={8} />

      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Morphology</h1>
        <p className="text-sm text-gray-500">Upload SEM & Microscope images and add notes</p>
      </header>

      {/* ================= MORPHOLOGY ID PREVIEW ================= */}
      <div className={`rounded-xl px-5 py-4 flex items-center justify-between ${
        morphologyId
          ? "bg-blue-50 border border-blue-200"
          : "bg-gray-50 border border-gray-200"
      }`}>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Morphology ID
          </p>
          <p className={`text-xl font-bold font-mono ${
            morphologyId ? "text-blue-700" : "text-gray-400"
          }`}>
            {morphologyId || "Go back to Step 1 and complete the Sample ID first"}
          </p>
        </div>
        {morphologyId && (
          <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium flex-shrink-0">
            Independent
          </div>
        )}
      </div>

      {/* ================= SEM PHOTOS ================= */}
      <Box title="SEM Photos" open={open.sem} toggle={() => toggle("sem")}>
        <FileUpload onFiles={(files) => handleMultipleImages("semPhotos", files)} />
        {morphology.semPhotos?.length > 0 && (
          <ImageGrid
            images={morphology.semPhotos}
            onRemove={(id) => removeImage("semPhotos", id)}
          />
        )}
      </Box>

      {/* ================= MICROSCOPE PHOTOS ================= */}
      <Box title="Microscope Photos" open={open.microscope} toggle={() => toggle("microscope")}>
        <FileUpload onFiles={(files) => handleMultipleImages("microPhotos", files)} />
        {morphology.microPhotos?.length > 0 && (
          <ImageGrid
            images={morphology.microPhotos}
            onRemove={(id) => removeImage("microPhotos", id)}
          />
        )}
      </Box>

      {/* ================= NOTES ================= */}
      <Box title="Morphology Notes" open={open.notes} toggle={() => toggle("notes")}>
        <textarea
          value={morphology.notes || ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none"
          placeholder="Describe morphology observations, structure, textures, size, or notable features"
        />
      </Box>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */
function Box({ title, open, toggle, children }) {
  return (
    <section className="border rounded-xl">
      <button type="button" onClick={toggle}
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 rounded-t-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="p-6 space-y-4">{children}</div>}
    </section>
  );
}

function FileUpload({ onFiles }) {
  return (
    <label className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition">
      <input type="file" multiple accept="image/*" hidden
        onChange={(e) => onFiles(e.target.files)} />
      <p className="text-gray-500">Drag & drop or click to upload images</p>
    </label>
  );
}

function ImageGrid({ images, onRemove }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {images.map((img) => (
        <div key={img.id} className="relative">
          <img src={img.data} alt={img.name}
            className="w-full h-32 object-cover rounded-lg shadow" />
          <button onClick={() => onRemove(img.id)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}