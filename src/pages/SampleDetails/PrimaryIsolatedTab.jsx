import { InfoGrid, Info } from "./SharedComponents";

export default function PrimaryIsolatedTab({ primary }) {
  if (!primary) return null;

  /* ================= SUPPORT BOTH OLD AND NEW STRUCTURE ================= */
  const runs = Array.isArray(primary)
    ? primary
    : primary.primaryIsolatedRuns || [];

  /* Old single object structure fallback */
  const isSingleEntry = !Array.isArray(primary) && primary.isolatedId;

  if (isSingleEntry) {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
              Isolated ID
            </span>
            <span className="font-mono font-bold text-blue-700 text-sm">
              {primary.isolatedId}
            </span>
          </div>
          <InfoGrid>
            <Info label="Shelf" value={primary.shelf} />
            <Info label="Position in Box" value={primary.positionInBox} />
            <Info label="Storage Temperature" value={primary.storageTemperature} />
            <Info label="Agar Media" value={primary.agarMedia} />
            <Info label="Solvent" value={primary.solvent} />
            <Info label="Incubation Temperature" value={primary.incubationTemperature} />
            <Info label="Incubation Time" value={primary.incubationTime} />
            <Info label="Oxygen Requirement" value={primary.oxygenRequirement} />
          </InfoGrid>
          {primary.notes && (
            <p className="text-xs text-gray-500 mt-3 italic">Notes: {primary.notes}</p>
          )}
        </div>
      </div>
    );
  }

  if (runs.length === 0) {
    return <p className="text-sm text-gray-400 italic">No primary isolated entries recorded.</p>;
  }

  return (
    <div className="space-y-4">
      {runs.map((run, index) => (
        <div key={run.id || index} className="border rounded-lg p-4 bg-gray-50">

          {/* ================= RUN HEADER ================= */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">
                Entry #{index + 1}
              </span>
              {run.isolatedType && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  run.isolatedType === "Fungi"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {run.isolatedType === "Fungi" ? "Fungi (FNG)" : "Bacteria (BCT)"}
                </span>
              )}
            </div>
          </div>

          {/* ================= AUTO ID ================= */}
          {run.isolatedId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-0.5">
                Isolated ID
              </p>
              <p className="font-mono font-bold text-blue-700 text-sm">
                {run.isolatedId}
              </p>
            </div>
          )}

          {/* ================= FIELDS ================= */}
          <InfoGrid>
            <Info label="Shelf" value={run.shelf} />
            <Info label="Position in Box" value={run.positionInBox} />
            <Info label="Storage Temperature" value={run.storageTemperature} />
            <Info label="Agar Media" value={run.agarMedia} />
            <Info label="Solvent" value={run.solvent} />
            <Info label="Incubation Temperature" value={run.incubationTemperature} />
            <Info label="Incubation Time" value={run.incubationTime} />
            <Info label="Oxygen Requirement" value={run.oxygenRequirement} />
          </InfoGrid>

          {run.notes && (
            <p className="text-xs text-gray-500 mt-3 italic">Notes: {run.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}