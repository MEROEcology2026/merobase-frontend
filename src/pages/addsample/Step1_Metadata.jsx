import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import FormProgressBar from "../../components/FormProgressBar";
import FileDropzone from "../../components/FileDropzone";
import { useSampleForm } from "../../context/SampleFormContext";
import { generateSampleId, PART_OF_SAMPLE_OPTIONS } from "../../utils/sampleIdGenerator";

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

/* ================= FLY TO LOCATION ================= */
function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 15, { duration: 1.5 });
  }, [coords, map]);
  return null;
}

/* ================= LOCATION MARKER ================= */
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

  /* ================= MAP SEARCH STATE ================= */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [flyTo, setFlyTo] = useState(null);
  const searchRef = useRef(null);

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  const setValue = (field, value) => updateSection("metadata", { [field]: value });

  /* ================= LIVE SAMPLE ID ================= */
  /* ✅ UPDATED: now includes partOfSample */
  const previewId = generateSampleId(
    metadata.sampleType,
    metadata.projectType,
    metadata.partOfSample,
    metadata.projectNumber,
    metadata.sampleNumber
  );

  /* ================= SEARCH HANDLER ================= */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setValue("latitude", lat);
    setValue("longitude", lng);
    setFlyTo([lat, lng]);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(",")[0]);
  };

  /* ================= CLOSE RESULTS ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-8">
      <FormProgressBar step={1} steps={8} />

      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold">Base Sample Metadata</h1>
        <p className="text-sm text-gray-500">Core information describing the collected sample</p>
      </header>

      {/* ================= SAMPLE ID PREVIEW ================= */}
      <div className={`rounded-xl px-5 py-4 flex items-center justify-between ${
        previewId
          ? "bg-blue-50 border border-blue-200"
          : "bg-gray-50 border border-gray-200"
      }`}>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Auto-generated Sample ID
          </p>
          <p className={`text-xl font-bold font-mono ${
            previewId ? "text-blue-700" : "text-gray-400"
          }`}>
            {previewId || "Fill in Sample Type, Part of Sample, Project Type, Project Number and Sample Number"}
          </p>
        </div>
        {previewId && (
          <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
            Ready
          </div>
        )}
      </div>

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
          {/* ✅ Sample Type first */}
          <Select label="Sample Type" value={metadata.sampleType || ""}
            onChange={(v) => setValue("sampleType", v)} options={SAMPLE_TYPES} />

          {/* ✅ Part of Sample — right after Sample Type */}
          <div>
            <label className="block text-sm mb-1">
              Part of Sample <span className="text-red-500">*</span>
            </label>
            <select
              value={metadata.partOfSample || ""}
              onChange={(e) => setValue("partOfSample", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-base"
            >
              <option value="">Select Part of Sample</option>
              {PART_OF_SAMPLE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label} ({opt.code})
                </option>
              ))}
            </select>
          </div>

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
        <div ref={searchRef} className="relative mb-4">
          <div className="flex gap-2">
            <input type="text" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search location (e.g. Tulamben, Bali)..."
              className="flex-1 rounded-lg border px-3 py-2 text-base focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            <button type="button" onClick={handleSearch} disabled={searching}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300 transition">
              {searching ? "Searching..." : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="absolute z-50 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {searchResults.map((result) => (
                <button key={result.place_id} type="button"
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 border-b last:border-0 transition">
                  <p className="font-medium text-gray-800 truncate">
                    {result.display_name.split(",")[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{result.display_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-64 rounded-xl overflow-hidden mb-4">
          <MapContainer center={[-8.34, 115.54]} zoom={12} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker
              lat={metadata.latitude}
              lng={metadata.longitude}
              onLocationSelect={(lat, lng) => {
                setValue("latitude", lat);
                setValue("longitude", lng);
                setFlyTo([lat, lng]);
              }}
            />
            <FlyToLocation coords={flyTo} />
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
        {!value && <option value="">Select {label}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}