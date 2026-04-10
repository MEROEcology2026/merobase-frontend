import { ImageGrid } from "./SharedComponents";

export default function MetadataTab({ metadata }) {
  if (!metadata) return null;

  return (
    <div className="space-y-4">

      {/* ================= TOP ROW — two cards side by side ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Collection Info */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Collection info
          </p>
          <div className="space-y-3">
            <Row label="Sample name" value={metadata.sampleName} />
            <Row label="Sample type" value={metadata.sampleType} />
            {/* ✅ ADDED: Part of Sample */}
            <Row label="Part of sample" value={metadata.partOfSample} />
            <Row label="Dive site" value={metadata.diveSite} />
            <Row label="Collection date" value={metadata.collectionDate} />
            <Row label="Collector" value={metadata.collectorName} />
            <Row label="Depth" value={metadata.depth ? `${metadata.depth} m` : null} />
            <Row label="Temperature" value={metadata.temperature ? `${metadata.temperature}°C` : null} />
            <Row label="Substrate" value={metadata.substrate} />
            <Row label="Sample length" value={metadata.sampleLength ? `${metadata.sampleLength} cm` : null} />
            <Row label="Storage location" value={metadata.storageLocation} />
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Classification
          </p>
          <div className="space-y-3">
            <Row label="Kingdom" value={metadata.kingdom} />
            <Row label="Family" value={metadata.family} />
            <Row label="Genus" value={metadata.genus} />
            <Row label="Species" value={metadata.species} />
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-6">
            Project
          </p>
          <div className="space-y-3">
            <Row label="Project type" value={metadata.projectType} />
            <Row label="Project number" value={metadata.projectNumber} />
            <Row label="Sample number" value={metadata.sampleNumber} />
          </div>
        </div>
      </div>

      {/* ================= GPS LOCATION ================= */}
      {(metadata.latitude || metadata.longitude) && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            GPS location
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Row label="Latitude" value={metadata.latitude} mono />
              <Row label="Longitude" value={metadata.longitude} mono />
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg h-28 flex flex-col items-center justify-center gap-1">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <p className="text-xs text-gray-500 mt-1">{metadata.diveSite || "Collection site"}</p>
              <p className="text-xs font-mono text-gray-400">
                {metadata.latitude && metadata.longitude
                  ? `${parseFloat(metadata.latitude).toFixed(4)}, ${parseFloat(metadata.longitude).toFixed(4)}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= SAMPLE PHOTO ================= */}
      {metadata.samplePhoto && (
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Sample photo
          </p>
          <ImageGrid
            title=""
            images={metadata.samplePhoto ? [metadata.samplePhoto] : []}
          />
        </div>
      )}

    </div>
  );
}

/* ================= ROW COMPONENT ================= */
function Row({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm text-gray-800 text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}