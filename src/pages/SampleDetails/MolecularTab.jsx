import React from "react";
import { InfoGrid, Info, ImageGrid } from "./SharedComponents";

/**
 * Helper to safely display primer values
 */
const renderPrimer = (primer) => {
  if (!primer) return "-";

  if (typeof primer === "string") return primer;

  if (Array.isArray(primer)) return primer.join(", ");

  if (typeof primer === "object") {
    return primer.label || primer.name || JSON.stringify(primer);
  }

  return "-";
};

export default function MolecularTab({ molecular }) {
  if (!molecular) return null;

  // Backward compatibility:
  // If old structure (single marker), convert into markers array
  const markers =
    molecular.markers && molecular.markers.length > 0
      ? molecular.markers
      : molecular.markerGene
      ? [
          {
            markerGene: molecular.markerGene,
            primerForward: molecular.primerForward,
            primerReverse: molecular.primerReverse,
            pcrProtocolType: molecular.pcrProtocolType,
            accessionStatus: molecular.accessionStatus,
            accessionNumber: molecular.accessionNumber
          }
        ]
      : [];

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-6">Molecular Biology</h2>

      {/* ================= OLD ID ================= */}
      {molecular.oldId && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Old Molecular ID
          </p>
          <p className="font-mono text-sm text-amber-700">{molecular.oldId}</p>
        </div>
      )}

      {/* ================= GENERAL METADATA ================= */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4 text-gray-700">
          General Molecular Metadata
        </h3>

        <InfoGrid>
          <Info label="DNA Source" value={molecular.dnaSource} />
          <Info label="Extraction Method" value={molecular.extractionMethod} />
          <Info label="Extraction Kit" value={molecular.extractionKit} />
          <Info label="DNA Concentration" value={molecular.dnaConcentrationRange} />
          <Info label="PCR Method" value={molecular.pcrMethod} />
          <Info label="Sequencing Method" value={molecular.sequencingMethod} />
          <Info label="Sequencing Quality" value={molecular.sequencingQuality} />
          <Info label="Bioinformatics Pipeline" value={molecular.bioinformaticsPipeline} />
          <Info label="Phylogenetic Notes" value={molecular.phylogeneticNotes} />
        </InfoGrid>
      </div>

      {/* ================= MARKER-SPECIFIC ================= */}
      {markers.length > 0 && (
        <div className="space-y-8 mb-8">
          <h3 className="font-semibold text-gray-700">
            Marker Specific Data
          </h3>

          {markers.map((marker, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <h4 className="font-medium mb-4">
                Marker #{index + 1}
              </h4>

              <InfoGrid>
                <Info label="Marker Gene" value={marker.markerGene} />
                <Info
                  label="Primer Forward"
                  value={renderPrimer(marker.primerForward)}
                />
                <Info
                  label="Primer Reverse"
                  value={renderPrimer(marker.primerReverse)}
                />
                <Info
                  label="PCR Protocol Notes"
                  value={marker.pcrProtocolType}
                />
                <Info
                  label="Accession Status"
                  value={marker.accessionStatus}
                />
                <Info
                  label="Accession Number"
                  value={marker.accessionNumber}
                />
              </InfoGrid>
            </div>
          ))}
        </div>
      )}

      {/* ================= FILES ================= */}
      {/* ✅ gelImage is a single object — wrap as array for ImageGrid */}
      <ImageGrid
        title="Gel Image"
        images={molecular.gelImage ? [molecular.gelImage] : []}
      />

      <ImageGrid
        title="Raw Sequence Files"
        images={molecular.rawSequenceFiles || []}
      />
    </div>
  );
}