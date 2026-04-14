import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PlusCircle, Edit3, Search,
  ChevronRight, LogOut, BookOpen
} from "lucide-react";
import { useSampleFormContext } from "../context/SampleFormContext";

const TABS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "id-system",       label: "ID System" },
  { id: "add-sample",      label: "Add Sample" },
  { id: "sample-details",  label: "Sample Details" },
  { id: "faq",             label: "FAQ" },
];

export default function ManualBook() {
  const navigate = useNavigate();
  const { clearDraftOnly } = useSampleFormContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("getting-started");

  const handleLogout = () => {
    localStorage.removeItem("merobase_token");
    localStorage.removeItem("merobase_user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ================= SIDEBAR ================= */}
      <aside className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"} flex flex-col h-screen sticky top-0 z-10`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <h1 className="font-bold text-gray-700">MEROBase</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronRight className={`transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2 mt-4 flex-1">
          <SidebarBtn icon={<LayoutDashboard />} label="Dashboard" open={sidebarOpen}
            onClick={() => navigate("/dashboard")} />
          <SidebarBtn icon={<PlusCircle />} label="Add Sample" open={sidebarOpen}
            onClick={() => { clearDraftOnly(); navigate("/add/step1"); }} />
          <SidebarBtn icon={<Edit3 />} label="Edit Sample" open={sidebarOpen}
            onClick={() => navigate("/editsample")} />
          <SidebarBtn icon={<Search />} label="Search" open={sidebarOpen}
            onClick={() => navigate("/searchsample")} />
          <SidebarBtn icon={<BookOpen />} label="Manual" open={sidebarOpen}
            onClick={() => navigate("/manual")} active />
        </nav>

        <div className="p-2 border-t">
          <SidebarBtn icon={<LogOut className="text-red-500" />} label="Logout"
            open={sidebarOpen} onClick={handleLogout} />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 overflow-y-auto">

        {/* ================= HEADER ================= */}
        <div className="bg-white border-b px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen size={20} className="text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Manual Book</h1>
          </div>
          <p className="text-sm text-gray-500">
            Complete guide to using MEROBase — marine biology sample database
          </p>
        </div>

        {/* ================= TABS ================= */}
        <div className="bg-white border-b px-8 overflow-x-auto">
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB CONTENT ================= */}
        <div className="px-8 py-8 max-w-4xl space-y-8">
          {activeTab === "getting-started" && <GettingStarted />}
          {activeTab === "id-system"       && <IDSystem />}
          {activeTab === "add-sample"      && <AddSample />}
          {activeTab === "sample-details"  && <SampleDetails />}
          {activeTab === "faq"             && <FAQ />}
        </div>
      </main>
    </div>
  );
}

/* ================= GETTING STARTED ================= */
function GettingStarted() {
  return (
    <div className="space-y-8">
      <Section title="Welcome to MEROBase">
        <p className="text-gray-600 leading-relaxed">
          MEROBase is a marine biology sample database designed to help researchers
          manage, track, and trace biological and non-biological samples collected
          from marine environments. Every sample gets a unique ID that traces its
          full research lineage — from collection to laboratory analysis.
        </p>
      </Section>

      <Section title="How to log in">
        <Steps steps={[
          { n:1, title:"Open the app", desc:"Navigate to the MEROBase URL in your browser." },
          { n:2, title:"Enter credentials", desc:"Use your username and password provided by your administrator." },
          { n:3, title:"Access dashboard", desc:"After login you will land on the Dashboard showing key statistics and recent samples." },
        ]} />
      </Section>

      <Section title="Navigation">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon:"📊", label:"Dashboard",   desc:"Overview of all samples, KPIs and recent activity." },
            { icon:"➕", label:"Add Sample",   desc:"Multi-step wizard to register a new sample." },
            { icon:"✏️", label:"Edit Sample",  desc:"Search and edit an existing sample." },
            { icon:"🔍", label:"Search",       desc:"Search samples by ID, name, species, collector and more." },
            { icon:"📖", label:"Manual",       desc:"This guide — how to use MEROBase and understand the ID system." },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Quick start">
        <Steps steps={[
          { n:1, title:"Add your first sample",    desc:'Click "Add Sample" in the sidebar. Fill in Step 1 — Metadata to generate your first Sample ID.' },
          { n:2, title:"Complete the wizard",       desc:"Move through all steps — Morphology, Microbiology, Molecular, Publication — filling in what is available." },
          { n:3, title:"Submit the sample",         desc:"Review all data in Step 6 and submit. The sample is now stored in the database." },
          { n:4, title:"View sample details",       desc:"Find your sample via Search and click it to view the full sample details page with ID Trace." },
        ]} />
      </Section>
    </div>
  );
}

/* ================= ID SYSTEM ================= */
function IDSystem() {
  return (
    <div className="space-y-8">
      <Section title="Overview">
        <p className="text-gray-600 leading-relaxed">
          Every entry in MEROBase has a unique auto-generated ID. IDs follow a
          hierarchical system — each child ID inherits and extends its parent ID,
          so you can always trace the full lineage of any test result back to
          the original sample.
        </p>
      </Section>

      <Section title="Sample ID">
        <IDCard
          id="B.A.H.01.005"
          color="blue"
          parts={[
            { code:"B",   desc:"Sample type — B = Biological, NB = Non-Biological" },
            { code:"A",   desc:"Project type — A or B" },
            { code:"H",   desc:"Part of sample — H = Head (see table below)" },
            { code:"01",  desc:"Project number — zero padded to 2 digits" },
            { code:"005", desc:"Sample number — zero padded to 3 digits" },
          ]}
        />
        <p className="text-sm text-gray-500 mt-4 mb-2 font-medium">Part of Sample codes:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            ["WB","Whole body"], ["H","Head"], ["B","Body"], ["T","Tail"],
            ["G","Gill"], ["I","Intestines"], ["S","Stomach"], ["K","Kidney"],
            ["L","Liver"], ["FP","Filter Paper"], ["HRT","Heart"], ["E","Egg"],
            ["BNS","Bone"], ["M","Mucus"], ["TST","Tissue"],
          ].map(([code, label]) => (
            <div key={code} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
              <span className="font-mono text-xs font-bold text-blue-600 w-8 flex-shrink-0">{code}</span>
              <span className="text-xs text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Morphology ID">
        <IDCard
          id="B.A.H.01.005.MOR"
          color="green"
          parts={[
            { code:"B.A.H.01.005", desc:"Parent sample ID" },
            { code:"MOR",          desc:"Morphology suffix — one per sample" },
          ]}
        />
        <Note>Morphology is <strong>independent</strong> — it is not linked to the microbiology or molecular chain.</Note>
      </Section>

      <Section title="Molecular ID">
        <IDCard
          id="B.A.H.01.005.MOL"
          color="green"
          parts={[
            { code:"B.A.H.01.005", desc:"Parent sample ID" },
            { code:"MOL",          desc:"Molecular suffix — one per sample" },
          ]}
        />
        <Note>Molecular is <strong>independent</strong> — it is not linked to the microbiology or morphology chain.</Note>
      </Section>

      <Section title="Primary Isolated ID">
        <IDCard
          id="B.A.H.01.005.FNG.NA.10-2.ISO-01"
          color="purple"
          parts={[
            { code:"B.A.H.01.005", desc:"Parent sample ID" },
            { code:"FNG",          desc:"Isolated type — FNG = Fungi, BCT = Bacteria" },
            { code:"NA",           desc:"Agar media — NA = Nutrient Agar (AIA, ISP2, ISP4, SCA, NA, ZA)" },
            { code:"10-2",         desc:"Dilution — 10-2 or 10-3" },
            { code:"ISO-01",       desc:"Global counter — increments per sample regardless of type or agar" },
          ]}
        />
      </Section>

      <Section title="Isolated Morphology ID">
        <IDCard
          id="B.A.H.01.005.FNG.NA.10-2.ISO-01.ISOMOR"
          color="purple"
          parts={[
            { code:"B.A.H.01.005.FNG.NA.10-2.ISO-01", desc:"Parent isolated ID" },
            { code:"ISOMOR", desc:"Fixed suffix — no number, one ISOMOR per ISO entry" },
          ]}
        />
        <Note><strong>Rule:</strong> Each Primary Isolated entry can only have one Isolated Morphology entry. The system enforces this — once an ISO is linked, it is blocked from being selected again.</Note>
      </Section>

      <Section title="Microbiology Test IDs">
        <p className="text-sm text-gray-600 mb-4">
          Tests can be linked to either a Primary Isolated ID or an Isolated Morphology ID — whichever is most appropriate for the experiment.
          The counter is independent per test type and resets for each linked ID.
        </p>
        <div className="space-y-3">
          {[
            { id:"...ISO-01.ISOMOR.ABSY-01", label:"Antibacterial Assay", code:"ABSY", color:"amber" },
            { id:"...ISO-01.ISOMOR.AASY-01", label:"Antimalarial Assay",  code:"AASY", color:"amber" },
            { id:"...ISO-01.ISOMOR.BT-01",   label:"Biochemical Test",    code:"BT",   color:"amber" },
            { id:"...ISO-01.ISOMOR.EBT-01",  label:"Enzymatic Test",      code:"EBT",  color:"amber" },
          ].map(item => (
            <div key={item.code} className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-0.5">{item.label}</p>
                <p className="font-mono text-sm text-amber-800 font-medium">{item.id}</p>
              </div>
              <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded-full font-mono font-bold">{item.code}</span>
            </div>
          ))}
        </div>
        <Note>
          Example — if you run 2 antibacterial tests on ISOMOR-01 and 1 on ISO-01 directly:
          <br/>• ISO-01.ISOMOR.ABSY-01 → first test on ISOMOR
          <br/>• ISO-01.ISOMOR.ABSY-02 → second test on same ISOMOR
          <br/>• ISO-01.ABSY-01 → counter resets because different linked ID
        </Note>
      </Section>

      <Section title="Full hierarchy example">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2 font-mono text-xs">
          {[
            { indent:0, id:"B.A.H.01.005",                                    label:"Sample",              color:"#3B82F6" },
            { indent:1, id:"B.A.H.01.005.MOR",                                label:"Morphology",           color:"#22C55E" },
            { indent:1, id:"B.A.H.01.005.MOL",                                label:"Molecular",            color:"#22C55E" },
            { indent:1, id:"B.A.H.01.005.FNG.NA.10-2.ISO-01",                 label:"Primary Isolated",     color:"#8B5CF6" },
            { indent:2, id:"B.A.H.01.005.FNG.NA.10-2.ISO-01.ISOMOR",         label:"Isolated Morphology",  color:"#8B5CF6" },
            { indent:3, id:"B.A.H.01.005.FNG.NA.10-2.ISO-01.ISOMOR.ABSY-01", label:"Antibacterial",        color:"#F59E0B" },
            { indent:3, id:"B.A.H.01.005.FNG.NA.10-2.ISO-01.ISOMOR.AASY-01", label:"Antimalarial",         color:"#F59E0B" },
            { indent:3, id:"B.A.H.01.005.FNG.NA.10-2.ISO-01.ISOMOR.BT-01",   label:"Biochemical",          color:"#F59E0B" },
            { indent:1, id:"B.A.H.01.005.BCT.ISP2.10-3.ISO-02",               label:"Primary Isolated",     color:"#8B5CF6" },
            { indent:2, id:"B.A.H.01.005.BCT.ISP2.10-3.ISO-02.ISOMOR",       label:"Isolated Morphology",  color:"#8B5CF6" },
          ].map((row, i) => (
            <div key={i} style={{ paddingLeft: row.indent * 20 }}
              className="flex items-center gap-3">
              {row.indent > 0 && <span className="text-gray-300">└─</span>}
              <span style={{ color: row.color }} className="font-semibold">{row.id}</span>
              <span className="text-gray-400 text-xs normal-case font-sans">— {row.label}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ================= ADD SAMPLE ================= */
function AddSample() {
  return (
    <div className="space-y-8">
      <Section title="Overview">
        <p className="text-gray-600 leading-relaxed">
          Adding a sample is done through a multi-step wizard. Each step covers a
          different aspect of the sample. You can move freely between steps —
          all data is saved automatically as you go.
        </p>
      </Section>

      <Section title="The wizard steps">
        <div className="space-y-3">
          {[
            { step:"Step 1", title:"Metadata",             desc:"Fill in the core sample information — sample type, project, part of sample, collection site, collector name, GPS coordinates, taxonomy and storage. The Sample ID is generated automatically as you fill in the required fields." },
            { step:"Step 2", title:"Morphology",           desc:"Upload SEM and microscope photos and add morphology notes. A Morphology ID (B.A.H.01.005.MOR) is generated automatically and is independent of the microbiology chain." },
            { step:"Step 3A", title:"Primary Isolated",    desc:"Add one or more isolated entries. Select isolated type (Fungi or Bacteria), agar media and dilution. Each entry gets a unique ISO ID." },
            { step:"Step 3B", title:"Isolated Morphology", desc:"Link each Primary Isolated entry to one Isolated Morphology entry. The rule is strict — one ISO can only have one ISOMOR. The system blocks duplicate links automatically." },
            { step:"Step 3C", title:"Microbiology Tests",  desc:"Run antibacterial, antimalarial, biochemical and enzymatic tests. Link each test run to either an ISO or ISOMOR entry. Counters reset per linked ID." },
            { step:"Step 4",  title:"Molecular Analysis",  desc:"Record DNA extraction, PCR, sequencing and bioinformatics metadata. Upload gel images and raw sequence files. A Molecular ID is generated automatically and is independent." },
            { step:"Step 5",  title:"Publication",         desc:"Add publication links, DOI references and notes related to this sample." },
            { step:"Step 6",  title:"Review & Submit",     desc:"Review all entered data across all steps before final submission. Once submitted the sample is stored in the database and gets a permanent record." },
          ].map(item => (
            <div key={item.step} className="flex gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex-shrink-0">
                <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  {item.step}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Important rules">
        <div className="space-y-3">
          {[
            "The Sample ID is generated automatically — you cannot type it manually.",
            "All five fields in Step 1 are required to generate a Sample ID: Sample Type, Project Type, Part of Sample, Project Number and Sample Number.",
            "1 Primary Isolated entry = 1 Isolated Morphology entry. You cannot link the same ISO to two different ISOMOR entries.",
            "Test runs in Step 3C must be linked to either an ISO or ISOMOR ID to generate a test ID.",
            "Morphology (MOR) and Molecular (MOL) IDs are independent and do not connect to the microbiology chain.",
            "Starting a new Add Sample session always clears the previous draft.",
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-3 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
              <span className="text-yellow-500 font-bold text-sm flex-shrink-0">!</span>
              <p className="text-sm text-gray-700">{rule}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ================= SAMPLE DETAILS ================= */
function SampleDetails() {
  return (
    <div className="space-y-8">
      <Section title="Overview">
        <p className="text-gray-600 leading-relaxed">
          The Sample Details page shows all information for a single sample across
          six tabs. You can also edit or delete the sample from this page.
        </p>
      </Section>

      <Section title="The six tabs">
        <div className="space-y-3">
          {[
            { tab:"Metadata",          desc:"Core sample information — collection details, taxonomy, GPS location and storage." },
            { tab:"Microbiology",      desc:"Three sub-tabs: Primary Isolated (ISO entries), Isolated Morphology (ISOMOR entries with macroscopic/colony/microscopic data), and Microbiology Tests (ABSY/AASY/BT/EBT results)." },
            { tab:"Morphology",        desc:"SEM and microscope images and morphology notes." },
            { tab:"Molecular",         desc:"DNA extraction metadata, PCR details, sequencing results and marker-specific data." },
            { tab:"Publication",       desc:"Links, DOI references and publication notes." },
            { tab:"ID Trace",          desc:"Interactive mind map showing the full ID hierarchy of this sample. Pan, zoom and click nodes to explore the lineage." },
          ].map(item => (
            <div key={item.tab} className="flex gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex-shrink-0">
                <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                  {item.tab}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Using the ID Trace mind map">
        <Steps steps={[
          { n:1, title:"Open ID Trace tab",    desc:"Click the ID Trace tab on any Sample Details page." },
          { n:2, title:"Explore the tree",     desc:"The full ID hierarchy is shown as a horizontal tree — Sample on the left, tests on the right." },
          { n:3, title:"Click a card",         desc:"Click any node card to select it and highlight its full chain from root to that node. Everything else dims." },
          { n:4, title:"Expand or collapse",   desc:"Click the +/− button on any node to show or hide its children. This does not affect the selection." },
          { n:5, title:"Pan the canvas",       desc:"Click and drag on the empty canvas background to pan around." },
          { n:6, title:"Zoom",                 desc:"Scroll the mouse wheel to zoom in and out, centered on your cursor position. Use the + and − buttons or Reset to control zoom." },
          { n:7, title:"View full ID",         desc:"The right side panel shows the full ID, details and chain breadcrumb of the selected node. Click any pill in the chain to jump to that node." },
        ]} />
      </Section>

      <Section title="Editing a sample">
        <Steps steps={[
          { n:1, title:"Open sample details", desc:"Find the sample via Search and click it." },
          { n:2, title:"Click Edit Sample",   desc:'Click the yellow "Edit Sample" button in the top right.' },
          { n:3, title:"Navigate the wizard", desc:"The wizard opens pre-filled with all existing data. Navigate to the step you want to edit." },
          { n:4, title:"Save changes",        desc:"Go to Step 6 and submit to save your changes." },
        ]} />
      </Section>
    </div>
  );
}

/* ================= FAQ ================= */
function FAQ() {
  const faqs = [
    {
      q: "Why is my Sample ID not generating?",
      a: "All five fields are required — Sample Type, Project Type, Part of Sample, Project Number and Sample Number. Check that all are filled in Step 1."
    },
    {
      q: "Can I have multiple Isolated Morphology entries for one Primary Isolated?",
      a: "No. The rule is strict: 1 Primary Isolated = 1 Isolated Morphology. Once an ISO is linked to an ISOMOR, it is blocked from being selected again in Step 3B."
    },
    {
      q: "What is the difference between Morphology and Isolated Morphology?",
      a: "Morphology (Step 2) is the overall physical description of the sample itself — photos and notes. Isolated Morphology (Step 3B) is the morphology of a specific isolated microorganism (colony characteristics, gram reaction etc.)."
    },
    {
      q: "Can I link a test to a Primary Isolated ID instead of an Isolated Morphology ID?",
      a: "Yes. In Step 3C the link selector shows both ISO and ISOMOR entries grouped separately. You can freely choose either. The test ID will be generated based on whichever you select."
    },
    {
      q: "Why does the test counter reset?",
      a: "Test counters are independent per linked ID. If you link two tests to ISOMOR-01 they get ABSY-01 and ABSY-02. If you then link a test to ISO-01 directly the counter starts at ABSY-01 again because it's a different linked ID."
    },
    {
      q: "What are MOR and MOL IDs?",
      a: "B.A.H.01.005.MOR is the Morphology ID and B.A.H.01.005.MOL is the Molecular ID. Both are auto-generated and are completely independent — they do not connect to the microbiology chain."
    },
    {
      q: "Can I delete a sample?",
      a: "Yes. Open the Sample Details page and click the red Delete button in the top right. You will be asked to confirm before the sample is permanently removed."
    },
    {
      q: "What happens if I start a new Add Sample session?",
      a: "Starting a new session always clears the previous draft. Make sure to submit your sample before starting a new one — unsaved data will be lost."
    },
    {
      q: "How do I read the ID Trace mind map?",
      a: "The tree reads left to right — Sample ID is the root on the left, and branches extend right through Isolated → ISOMOR → Tests. Click any node to see its full ID in the right panel and highlight its chain."
    },
  ];

  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-8">
      <Section title="Frequently asked questions">
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition text-left">
                <span className="text-sm font-medium text-gray-700">{faq.q}</span>
                <span className="text-gray-400 flex-shrink-0 ml-4">
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ================= SHARED COMPONENTS ================= */
function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Steps({ steps }) {
  return (
    <div className="space-y-3">
      {steps.map(item => (
        <div key={item.n} className="flex gap-4">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            {item.n}
          </div>
          <div className="pt-0.5">
            <p className="text-sm font-semibold text-gray-700">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function IDCard({ id, color, parts }) {
  const colors = {
    blue:   { bg:"bg-blue-50",   border:"border-blue-200",   id:"text-blue-700",   dot:"bg-blue-500" },
    green:  { bg:"bg-green-50",  border:"border-green-200",  id:"text-green-700",  dot:"bg-green-500" },
    purple: { bg:"bg-purple-50", border:"border-purple-200", id:"text-purple-700", dot:"bg-purple-500" },
    amber:  { bg:"bg-amber-50",  border:"border-amber-200",  id:"text-amber-700",  dot:"bg-amber-500" },
  }[color];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-5 mb-4`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ID format</p>
      <p className={`font-mono text-lg font-bold ${colors.id} mb-4 break-all`}>{id}</p>
      <div className="space-y-2">
        {parts.map((p, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${colors.bg} border ${colors.border} ${colors.id} flex-shrink-0`}>
              {p.code}
            </span>
            <span className="text-xs text-gray-600">{p.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Note({ children }) {
  return (
    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-3">
      <span className="text-blue-500 font-bold text-sm flex-shrink-0">ℹ</span>
      <p className="text-xs text-blue-800 leading-relaxed">{children}</p>
    </div>
  );
}

function SidebarBtn({ icon, label, open, onClick, active }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition ${
        active ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
      }`}>
      {icon}
      {open && <span className={active ? "text-blue-600 font-medium" : "text-gray-700"}>{label}</span>}
    </button>
  );
}