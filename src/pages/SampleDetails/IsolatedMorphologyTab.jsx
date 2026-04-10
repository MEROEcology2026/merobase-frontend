import { ImageGrid } from "./SharedComponents";

export default function IsolatedMorphologyTab({ isolatedMorphologyRuns }) {
  const runs = Array.isArray(isolatedMorphologyRuns)
    ? isolatedMorphologyRuns
    : [];

  if (runs.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
        <p className="text-sm text-gray-400 italic">No isolated morphology entries recorded.</p>
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
          </div>

          {/* ================= ISOMOR ID ================= */}
          {run.isoMorId && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                Morphology ID
              </p>
              <p className="font-mono font-semibold text-purple-700 text-sm">
                {run.isoMorId}
              </p>
            </div>
          )}

          {/* ================= LINKED ISO ID ================= */}
          {run.linkedIsolatedId && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                Linked to Primary Isolated
              </p>
              <p className="font-mono text-sm text-blue-700">
                {run.linkedIsolatedId}
              </p>
            </div>
          )}

          {/* ================= MACROSCOPIC ================= */}
          {(run.macroscopic?.shape || run.macroscopic?.arrangement ||
            run.macroscopic?.images?.length > 0) && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Macroscopic Morphology
              </p>
              <div className="space-y-3 mb-3">
                <Row label="Shape" value={run.macroscopic?.shape} />
                <Row label="Arrangement" value={run.macroscopic?.arrangement} />
              </div>
              {run.macroscopic?.images?.length > 0 && (
                <ImageGrid title="" images={run.macroscopic.images} />
              )}
            </div>
          )}

          {/* ================= COLONY DESCRIPTION ================= */}
          {(run.colonyDescription?.shape || run.colonyDescription?.margin ||
            run.colonyDescription?.color) && (
            <div className="mb-4 pt-4 border-t">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Colony Description
              </p>
              <div className="space-y-3">
                <Row label="Shape" value={run.colonyDescription?.shape} />
                <Row label="Margin" value={run.colonyDescription?.margin} />
                <Row label="Elevation" value={run.colonyDescription?.elevation} />
                <Row label="Color" value={run.colonyDescription?.color} />
                <Row label="Texture" value={run.colonyDescription?.texture} />
                <Row label="Motility" value={run.colonyDescription?.motility} />
              </div>
            </div>
          )}

          {/* ================= MICROSCOPIC ================= */}
          {(run.microscopic?.shape || run.microscopic?.arrangement ||
            run.microscopic?.gramReaction || run.microscopic?.images?.length > 0) && (
            <div className="pt-4 border-t">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Microscopic Morphology
              </p>
              <div className="space-y-3 mb-3">
                <Row label="Shape" value={run.microscopic?.shape} />
                <Row label="Arrangement" value={run.microscopic?.arrangement} />
                <Row label="Gram reaction" value={run.microscopic?.gramReaction} />
              </div>
              {run.microscopic?.images?.length > 0 && (
                <ImageGrid title="" images={run.microscopic.images} />
              )}
            </div>
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