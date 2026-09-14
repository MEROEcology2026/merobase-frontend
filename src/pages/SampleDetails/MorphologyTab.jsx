import React from "react";
import { ImageGrid } from "./SharedComponents";

export default function MorphologyTab({ morphology }) {
  if (!morphology) return null;

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Morphology</h2>

      {/* ================= IDS ================= */}
      {morphology.oldId && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Old Morphology ID
          </p>
          <p className="font-mono text-sm text-amber-700">{morphology.oldId}</p>
        </div>
      )}

      <ImageGrid
        title="SEM Photos"
        images={morphology.semPhotos || []}
      />

      {/* ✅ fixed field name: Step 2 saves microscope images as microPhotos */}
      <ImageGrid
        title="Microscope Photos"
        images={morphology.microPhotos || []}
      />

      {/* ✅ notes were never displayed before */}
      {morphology.notes && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Notes
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{morphology.notes}</p>
        </div>
      )}
    </div>
  );
}