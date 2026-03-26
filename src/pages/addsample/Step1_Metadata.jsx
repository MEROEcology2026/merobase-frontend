import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import FormProgressBar from "../../components/FormProgressBar";
import FileDropzone from "../../components/FileDropzone";
import { useSampleForm } from "../../context/SampleFormContext";

const SAMPLE_TYPES = ["Biological", "Non-Biological"];
const DIVE_SITES = [
  "USAT Liberty – Tulamben", "Tulamben Drop Off", "Coral Garden – Tulamben",
  "Kubu Wall", "Batu Kelebit", "Secret Bay – Gilimanuk",
  "Pemuteran Reef", "Menjangan Island", "Other",
];
const SUBSTRATES = [
  "Live Coral", "Dead Coral", "Rubble", "Sand", "Mud",
  "Rock", "Seagrass", "Artificial Structure", "Other",
];
const KINGDOMS = [
  "Animalia", "Plantae", "Fungi", "Protista",
  "Bacteria", "Archaea", "Undetermined",
];
const STORAGE_LOCATIONS = [
  "Cool Room (4°C)", "Refrigerator (4°C)", "Freezer (-20°C)",
  "Ultra Freezer (-80°C)", "Room Temperature",
  "Ethanol Preserved", "Formalin Preserved",
];

/* ================= LOCATION MARKER (outside component) ================= */
function LocationMarker({ lat, lng, onLocationSelect }) {
  const [pos, setPos] = useState(
    lat && lng ? [parseFloat(lat), parseFloat(lng)] : null
  );

  useEffect(() => {
    if (lat && lng) setPos([parseFloat(lat), parseFloat(lng)]);
  }, [lat, lng]);

  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng]);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return pos ? <Marker position={pos} /> : null;
}

/* ================= MAIN ================= */
export default function Step1_Metadata() {
  const { formData, updateSection } = useSampleForm();
  const metadata = formData.metadata || {};

  const [open, setOpen] = useState({
    photo: true, general: true, bio: true, map: true,
  });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const setValue = (field, value) => updateSection("metadata", { [field]: value });

  return (
    <div className="space-y-8">
      <FormProgressBar step={1} steps={8} />

      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold">Base Sample Metadata</h1>
        <p className="text-sm text-gray-500">Core information describing the collected sample</p>
      </header>

      {/* ================= SAMPLE PHOTO ================= */}
      <Box title="Sample Photo" open={open.photo} toggle={() => toggle("photo")}>
        <FileDropzone
          multiple={false}
          accept="image/*"
          existing={metadata.samplePhoto}
          onFiles={(file) => updateSection("metadata", { samplePhoto: file })}
        />
        <p className="text-sm text-gray-400 mt-2">
          Drag & drop or click to upload sample photo
        </p>
      </Box>

      {/* ================= GENERAL INFO ================= */}
      <Box title="General Sample Information" open={open.general} toggle={() => toggle("general")}>
        <Grid>
          <Select label="Sample Type" value={metadata.sampleType || ""}
            onChange={(v) => setValue("sampleType", v)} options={SAMPLE_TYPES} />
          <Input label="Sample Name" value={metadata.sampleName || ""}
            onChange={(v) => setValue("sampleName", v)} />
          <Input label="Sample Number" value={metadata.sampleNumber || ""}
            onChange={(v) => setValue("sampleNumber", v)} />
          <Input label="Sample Length (cm)" type="number"
            value={metadata.sampleLength || ""} onChange={(v) => setValue("sampleLength", v)} />
          <Select label="Dive Site" value={metadata.diveSite || ""}
            onChange={(v) => setValue("diveSite", v)} options={DIVE_SITES} />
          <Input label="Depth (m)" type="number"
            value={metadata.depth || ""} onChange={(v) => setValue("depth", v)} />
          <Input label="Temperature (°C)" type="number"
            value={metadata.temperature || ""} onChange={(v) => setValue("temperature", v)} />
          <Select label="Substrate" value={metadata.substrate || ""}
            onChange={(v) => setValue("substrate", v)} options={SUBSTRATES} />
          <Select label="Project Type" value={metadata.projectType || ""}
            onChange={(v) => setValue("projectType", v)} options={["A", "B"]} />
          <Input label="Project Number" value={metadata.projectNumber || ""}
            onChange={(v) => setValue("projectNumber", v)} />
          {/* ✅ FIXED: dateAcquired → collectionDate */}
          <Input label="Collection Date" type="date"
            value={metadata.collectionDate || ""}
            onChange={(v) => setValue("collectionDate", v)} />
          <Input label="Collector Name" value={metadata.collectorName || ""}
            onChange={(v) => setValue("collectorName", v)} />
        </Grid>
      </Box>

      {/* ================= CLASSIFICATION & STORAGE ================= */}
      <Box title="Classification & Storage" open={open.bio} toggle={() => toggle("bio")}>
        {metadata.sampleType === "Biological" ? (
          <Grid>
            <Select label="Kingdom" value={metadata.kingdom || ""}
              onChange={(v) => setValue("kingdom", v)} options={KINGDOMS} />
            <Input label="Genus" value={metadata.genus || ""}
              onChange={(v) => setValue("genus", v)} />
            <Input label="Family" value={metadata.family || ""}
              onChange={(v) => setValue("family", v)} />
            <Input label="Species" value={metadata.species || ""}
              onChange={(v) => setValue("species", v)} />
            <Select label="Storage Location" full
              value={metadata.storageLocation || ""}
              onChange={(v) => setValue("storageLocation", v)}
              options={STORAGE_LOCATIONS} />
          </Grid>
        ) : (
          <Select label="Storage Location"
            value={metadata.storageLocation || ""}
            onChange={(v) => setValue("storageLocation", v)}
            options={STORAGE_LOCATIONS} />
        )}
      </Box>

      {/* ================= MAP ================= */}
      <Box title="Map Location Picker" open={open.map} toggle={() => toggle("map")}>
        <div className="h-64 rounded-xl overflow-hidden mb-4">
          <MapContainer center={[-8.34, 115.54]} zoom={12} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker
              lat={metadata.latitude}
              lng={metadata.longitude}
              onLocationSelect={(lat, lng) => {
                setValue("latitude", lat);
                setValue("longitude", lng);
              }}
            />
          </MapContainer>
        </div>
        <Grid>
          <Input label="Latitude" value={metadata.latitude || ""}
            onChange={(v) => setValue("latitude", v)} />
          <Input label="Longitude" value={metadata.longitude || ""}
            onChange={(v) => setValue("longitude", v)} />
        </Grid>
      </Box>
    </div>
  );
}

/* ================= UI HELPERS ================= */
function Box({ title, open, toggle, children }) {
  return (
    <section className="border rounded-xl">
      <button type="button" onClick={toggle}
        className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 rounded-t-xl">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="p-6">{children}</div>}
    </section>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}

function Input({ label, value, onChange, type = "text", full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm mb-1">{label}</label>
      <input type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-base" />
    </div>
  );
}

function Select({ label, value, onChange, options, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-base">
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}