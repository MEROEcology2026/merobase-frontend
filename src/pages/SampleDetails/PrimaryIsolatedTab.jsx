import { InfoGrid, Info } from "./SharedComponents";

export default function PrimaryIsolatedTab({ primary }) {
  if (!primary) return null;

  /* ================= SUPPORT BOTH OLD AND NEW STRUCTURE ================= */
  const runs = Array.isArray(primary)
    ? primary
    : primary.primaryIsolatedRuns || [];

  const isSingleEntry = !Array.isArray(primary) && primary.isolatedId;

  if (isSingleEntry) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {primary.isolatedId}
            </span>
          </div>
          <div className="space-y-3">
            <Row label="Shelf" value={primary.shelf} />
            <Row label="Position in box" value={primary.positionInBox} />
            <Row label="Storage temperature" value={primary.storageTemperature} />
            <Row label="Agar media" value={primary.agarMedia} />
            <Row label="Solvent" value={primary.solvent} />
            <Row label="Incubation temperature" value={primary.incubationTemperature} />
            <Row label="Incubation time" value={primary.incubationTime} />
            <Row label="Oxygen requirement" value={primary.oxygenRequirement} />
          </div>
          {primary.notes && (
            <p className="text-xs text-gray-400 mt-4 italic border-t pt-3">{primary.notes}</p>
          )}
        </div>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
        <p className="text-sm text-gray-400 italic">No primary isolated entries recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {runs.map((run, index) => (
        <div key={run.id || index} className="bg-white border border-gray-100 rounded-xl p-5">

          {/* ================= RUN HEADER ================= */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-600">
              Entry #{index + 1}
            </span>
            {run.isolatedType && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                run.isolatedType === "Fungi"
                  ? "bg-green-50 text-green-700"
                  : "bg-purple-50 text-purple-700"
              }`}>
                {run.isolatedType === "Fungi" ? "Fungi (FNG)" : "Bacteria (BCT)"}
              </span>
            )}
          </div>

          {/* ================= ISO ID ================= */}
          {run.isolatedId && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                Isolated ID
              </p>
              <p className="font-mono font-semibold text-blue-700 text-sm">
                {run.isolatedId}
              </p>
            </div>
          )}

          {/* ================= FIELDS ================= */}
          <div className="space-y-3">
            <Row label="Shelf" value={run.shelf} />
            <Row label="Position in box" value={run.positionInBox} />
            <Row label="Storage temperature" value={run.storageTemperature} />
            <Row label="Agar media" value={run.agarMedia} />
            <Row label="Solvent" value={run.solvent} />
            <Row label="Incubation temperature" value={run.incubationTemperature} />
            <Row label="Incubation time" value={run.incubationTime} />
            <Row label="Oxygen requirement" value={run.oxygenRequirement} />
          </div>

          {run.notes && (
            <p className="text-xs text-gray-400 mt-4 italic border-t pt-3">{run.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ================= ROW ================= */
function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
}