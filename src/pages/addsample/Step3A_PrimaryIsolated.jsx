import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSampleForm } from "../../context/SampleFormContext";

export default function Step3A_PrimaryIsolated() {
  const { formData, updateSection } = useSampleForm();

  /* ✅ FIXED: primaryIsolatedData → primaryIsolated */
  const data = formData.microbiology?.primaryIsolated || {};
  const [open, setOpen] = useState(true);

  /* ================= HANDLERS ================= */
  const update = (field, value) => {
    updateSection("microbiology", {
      ...formData.microbiology,
      primaryIsolated: {
        ...data,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Microbiology - Primary Isolated Data
      </h1>

      <div className="border rounded-2xl shadow-sm bg-white">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gray-50 hover:bg-gray-100 transition"
        >
          <h2 className="text-lg font-semibold text-gray-700">
            Primary Isolated Information
          </h2>
          <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Isolated ID" value={data.isolatedId}
                onChange={(e) => update("isolatedId", e.target.value)}
                placeholder="e.g. ISO-001" />

              <Field label="Shelf" value={data.shelf}
                onChange={(e) => update("shelf", e.target.value)}
                placeholder="e.g. Shelf A" />

              {/* ✅ FIXED: position → positionInBox */}
              <Field label="Position in Box" value={data.positionInBox}
                onChange={(e) => update("positionInBox", e.target.value)}
                placeholder="e.g. A3" />

              <Select label="Storage Temperature" value={data.storageTemperature}
                onChange={(e) => update("storageTemperature", e.target.value)}
                options={["", "-20 °C", "-80 °C"]} />

              <Field label="Agar Media" value={data.agarMedia}
                onChange={(e) => update("agarMedia", e.target.value)}
                placeholder="e.g. Marine Agar" />

              <Select label="Solvent" value={data.solvent}
                onChange={(e) => update("solvent", e.target.value)}
                options={["", "Aquades", "Seawater 70% : Aquades 30%"]} />

              <Field label="Incubation Temperature" value={data.incubationTemperature}
                onChange={(e) => update("incubationTemperature", e.target.value)}
                placeholder="e.g. 28 °C" />

              <Field label="Incubation Time" value={data.incubationTime}
                onChange={(e) => update("incubationTime", e.target.value)}
                placeholder="e.g. 48 hours" />

              <Field label="Oxygen Requirement" value={data.oxygenRequirement}
                onChange={(e) => update("oxygenRequirement", e.target.value)}
                placeholder="e.g. Aerobic / Anaerobic" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
              <textarea
                value={data.notes || ""}
                onChange={(e) => update("notes", e.target.value)}
                rows={4}
                placeholder="Additional storage or isolation notes"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value || ""}
        onChange={onChange}
        className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt || "Select option"}</option>
        ))}
      </select>
    </div>
  );
}