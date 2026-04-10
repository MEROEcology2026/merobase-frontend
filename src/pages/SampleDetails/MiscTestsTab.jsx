export default function MiscTestsTab({ misc }) {
  if (!misc) return null;

  const antibacterialRuns = misc?.antibacterialRuns || [];
  const antimalarialRuns = misc?.antimalarialRuns || [];
  const biochemicalRuns = misc?.biochemicalRuns || [];
  const enzymaticRuns = misc?.enzymaticRuns || [];

  return (
    <div className="space-y-6">

      {/* ================= ANTIBACTERIAL RUNS ================= */}
      <Section title="Antibacterial Assay">
        {antibacterialRuns.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-3">
            {antibacterialRuns.map((run, index) => (
              <div key={run.id || index} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-600">Run #{index + 1}</span>
                </div>
                <TestIdBadge run={run} />
                <div className="space-y-3">
                  <Row label="Pathogen" value={run.pathogen} />
                  <Row label="Method" value={run.method} />
                  <Row label="Activity level" value={run.activityLevel} />
                  <Row label="Activity notes" value={run.activityNotes} />
                </div>
                {run.notes && (
                  <p className="text-xs text-gray-400 mt-4 italic border-t pt-3">{run.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ================= ANTIMALARIAL RUNS ================= */}
      <Section title="Antimalarial Assay">
        {antimalarialRuns.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-3">
            {antimalarialRuns.map((run, index) => (
              <div key={run.id || index} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-600">Run #{index + 1}</span>
                </div>
                <TestIdBadge run={run} />
                <div className="space-y-3">
                  <Row label="Plasmodium species" value={run.plasmodiumSpecies} />
                  <Row label="Method" value={run.method} />
                  <Row label="Activity level" value={run.activityLevel} />
                </div>
                {run.notes && (
                  <p className="text-xs text-gray-400 mt-4 italic border-t pt-3">{run.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ================= BIOCHEMICAL RUNS ================= */}
      <Section title="Biochemical Tests">
        {biochemicalRuns.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-3">
            {biochemicalRuns.map((run, index) => (
              <RunDisplay key={run.id || index} run={run} index={index} color="green" />
            ))}
          </div>
        )}
      </Section>

      {/* ================= ENZYMATIC RUNS ================= */}
      <Section title="Enzymatic Tests">
        {enzymaticRuns.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-3">
            {enzymaticRuns.map((run, index) => (
              <RunDisplay key={run.id || index} run={run} index={index} color="purple" />
            ))}
          </div>
        )}
      </Section>

      {/* ================= MOLECULAR IDENTIFICATION ================= */}
      {misc?.molecularIdentification?.hasIdentification && (
        <Section title="Molecular Identification">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="space-y-3">
              <Row label="Species name" value={misc.molecularIdentification?.speciesName} />
              <Row label="PCR platform" value={misc.molecularIdentification?.pcrPlatform} />
              <Row label="PCR protocol" value={misc.molecularIdentification?.pcrProtocolType} />
              <Row label="Sequencing method" value={misc.molecularIdentification?.sequencingMethod} />
              <Row label="Bioinformatics pipeline" value={misc.molecularIdentification?.bioinformaticsPipeline} />
              <Row label="Accession status" value={misc.molecularIdentification?.accessionStatus} />
              <Row label="Accession number" value={misc.molecularIdentification?.accessionNumber} />
            </div>
          </div>
        </Section>
      )}

      {/* ================= TEST NOTES ================= */}
      {misc?.testNotes && (
        <Section title="General Notes">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-sm text-gray-700">{misc.testNotes}</p>
          </div>
        </Section>
      )}
    </div>
  );
}

/* ================= TEST ID BADGE ================= */
function TestIdBadge({ run }) {
  if (!run.testId) return null;
  return (
    <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 mb-4">
      <div className="flex flex-wrap items-start gap-6">
        {run.linkedIsoMorId && (
          <div>
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
              Linked ISOMOR
            </p>
            <p className="font-mono text-xs text-purple-600">{run.linkedIsoMorId}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            Test ID
          </p>
          <p className="font-mono font-semibold text-purple-700 text-sm">{run.testId}</p>
        </div>
      </div>
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

  const tagMap = {
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };
  const dotMap = {
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-600">Run #{index + 1}</span>
      </div>

      <TestIdBadge run={run} />

      {allTests.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No tests checked.</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-2">
          {allTests.map((test) => (
            <span key={test}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tagMap[color]}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotMap[color]}`} />
              {test}
            </span>
          ))}
        </div>
      )}

      {run.notes && (
        <p className="text-xs text-gray-400 mt-4 italic border-t pt-3">{run.notes}</p>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */
function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-400 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 text-right">{value}</span>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-gray-400 italic">No data recorded.</p>;
}