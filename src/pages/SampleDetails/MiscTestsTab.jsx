import { InfoGrid, Info } from "./SharedComponents";

export default function MiscTestsTab({ misc }) {
  if (!misc) return null;

  const antibacterialRuns = misc?.antibacterialRuns || [];
  const biochemicalRuns = misc?.biochemicalRuns || [];
  const enzymaticRuns = misc?.enzymaticRuns || [];

  return (
    <div className="space-y-6">

      {/* ================= ANTIBACTERIAL RUNS ================= */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Antibacterial Assay
        </h3>
        {antibacterialRuns.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No antibacterial tests recorded.</p>
        ) : (
          <div className="space-y-3">
            {antibacterialRuns.map((run, index) => (
              <div key={run.id || index} className="border rounded-lg p-4 bg-gray-50">

                {/* Run header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Run #{index + 1}</p>
                </div>

                {/* Test ID */}
                {run.testId && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mb-3">
                    <div className="flex items-center gap-4">
                      {run.linkedIsolatedId && (
                        <div>
                          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                            Linked ISO
                          </p>
                          <p className="font-mono text-xs text-purple-600">
                            {run.linkedIsolatedId}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider">
                          Test ID
                        </p>
                        <p className="font-mono font-bold text-purple-700 text-sm">
                          {run.testId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <InfoGrid>
                  <Info label="Pathogen" value={run.pathogen} />
                  <Info label="Method" value={run.method} />
                  <Info label="Activity Level" value={run.activityLevel} />
                  <Info label="Antimalarial Assay" value={run.antimalarialAssay} />
                </InfoGrid>
                {run.activityNotes && (
                  <div className="mt-2">
                    <Info label="Activity Notes" value={run.activityNotes} />
                  </div>
                )}
                {run.notes && (
                  <p className="text-xs text-gray-500 mt-2 italic">Notes: {run.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= BIOCHEMICAL RUNS ================= */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Biochemical Tests
        </h3>
        {biochemicalRuns.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No biochemical tests recorded.</p>
        ) : (
          <div className="space-y-3">
            {biochemicalRuns.map((run, index) => (
              <RunDisplay key={run.id || index} run={run} index={index} color="green" />
            ))}
          </div>
        )}
      </div>

      {/* ================= ENZYMATIC RUNS ================= */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Enzymatic Tests
        </h3>
        {enzymaticRuns.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No enzymatic tests recorded.</p>
        ) : (
          <div className="space-y-3">
            {enzymaticRuns.map((run, index) => (
              <RunDisplay key={run.id || index} run={run} index={index} color="purple" />
            ))}
          </div>
        )}
      </div>

      {/* ================= MOLECULAR IDENTIFICATION ================= */}
      {misc?.molecularIdentification?.hasIdentification && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            Molecular Identification
          </h3>
          <InfoGrid>
            <Info label="Species Name" value={misc.molecularIdentification?.speciesName} />
            <Info label="PCR Platform" value={misc.molecularIdentification?.pcrPlatform} />
            <Info label="PCR Protocol" value={misc.molecularIdentification?.pcrProtocolType} />
            <Info label="Sequencing Method" value={misc.molecularIdentification?.sequencingMethod} />
            <Info label="Bioinformatics Pipeline" value={misc.molecularIdentification?.bioinformaticsPipeline} />
            <Info label="Accession Status" value={misc.molecularIdentification?.accessionStatus} />
            <Info label="Accession Number" value={misc.molecularIdentification?.accessionNumber} />
          </InfoGrid>
        </div>
      )}

      {/* ================= TEST NOTES ================= */}
      {misc?.testNotes && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">General Notes</h3>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{misc.testNotes}</p>
        </div>
      )}
    </div>
  );
}

/* ================= RUN DISPLAY ================= */
function RunDisplay({ run, index, color }) {
  const checkedDefaults = run.checked || [];
  const checkedCustom = (run.customTests || [])
    .filter(t => run.checked?.includes(t.name) && t.name)
    .map(t => t.name);
  const allTests = [...new Set([...checkedDefaults, ...checkedCustom])];

  const colorMap = {
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };
  const dotMap = {
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">

      {/* Run header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">Run #{index + 1}</p>
      </div>

      {/* Test ID */}
      {run.testId && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mb-3">
          <div className="flex items-center gap-4">
            {run.linkedIsolatedId && (
              <div>
                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                  Linked ISO
                </p>
                <p className="font-mono text-xs text-purple-600">
                  {run.linkedIsolatedId}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider">
                Test ID
              </p>
              <p className="font-mono font-bold text-purple-700 text-sm">
                {run.testId}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tests */}
      {allTests.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No tests checked.</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-2">
          {allTests.map((test) => (
            <span key={test}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${colorMap[color]}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dotMap[color]}`} />
              {test}
            </span>
          ))}
        </div>
      )}

      {run.notes && (
        <p className="text-xs text-gray-500 mt-2 italic">Notes: {run.notes}</p>
      )}
    </div>
  );
}