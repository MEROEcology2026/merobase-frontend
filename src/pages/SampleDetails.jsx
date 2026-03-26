import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard, PlusCircle, Edit3, Search,
  ChevronRight, ChevronDown, LogOut, ArrowLeft
} from "lucide-react";
import { samplesAPI } from "../services/api";
import { useSampleFormContext } from "../context/SampleFormContext";

import MetadataTab from "./SampleDetails/MetadataTab";
import MorphologyTab from "./SampleDetails/MorphologyTab";
import PrimaryIsolatedTab from "./SampleDetails/PrimaryIsolatedTab";
import IsolatedMorphologyTab from "./SampleDetails/IsolatedMorphologyTab";
import MiscTestsTab from "./SampleDetails/MiscTestsTab";
import MolecularTab from "./SampleDetails/MolecularTab";
import PublicationTab from "./SampleDetails/PublicationTab";

export default function SampleDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loadSampleForEdit } = useSampleFormContext();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({
    metadata: true,
    morphology: false,
    primary: false,
    isolated: false,
    misc: false,
    molecular: false,
    publication: false,
  });

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ================= LOAD FROM API ================= */
  useEffect(() => {
    const fetchSample = async () => {
      try {
        const res = await samplesAPI.getById(id);
        setSample(res.data.data);
      } catch (err) {
        console.error("Failed to load sample:", err);
        setSample(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSample();
  }, [id]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("merobase_token");
    localStorage.removeItem("merobase_user");
    navigate("/");
  };

  /* ================= EDIT ================= */
  const handleEdit = () => {
    if (!sample) return;
    loadSampleForEdit({
      metadata: {
        sampleId: sample.sample_id,
        sampleName: sample.sample_name,
        sampleType: sample.sample_type,
        projectType: sample.project_type,
        projectNumber: sample.project_number,
        sampleNumber: sample.sample_number,
        diveSite: sample.dive_site,
        collectorName: sample.collector_name,
        collectionDate: sample.collection_date?.split("T")[0] || "",
        latitude: sample.latitude,
        longitude: sample.longitude,
        storageLocation: sample.storage_location,
        kingdom: sample.kingdom,
        genus: sample.genus,
        family: sample.family,
        species: sample.species,
        depth: sample.depth,
        temperature: sample.temperature,
        substrate: sample.substrate,
        sampleLength: sample.sample_length,
      },
      morphology: sample.morphology || {},
      microbiology: sample.microbiology || {},
      molecular: sample.molecular || {},
      publication: sample.publication || { links: [] },
    });
    navigate("/add/step1");
  };

  /* ================= LOADING / NOT FOUND ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading sample...
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 gap-4">
        <p>Sample not found.</p>
        <button
          onClick={() => navigate("/searchsample")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
        >
          Back to Search
        </button>
      </div>
    );
  }

  /* ================= MAP API RESPONSE TO TAB FORMAT ================= */
  const metadata = {
    sampleId: sample.sample_id,
    sampleName: sample.sample_name,
    sampleType: sample.sample_type,
    projectType: sample.project_type,
    projectNumber: sample.project_number,
    sampleNumber: sample.sample_number,
    diveSite: sample.dive_site,
    collectorName: sample.collector_name,
    collectionDate: sample.collection_date?.split("T")[0] || "",
    latitude: sample.latitude,
    longitude: sample.longitude,
    storageLocation: sample.storage_location,
    kingdom: sample.kingdom,
    genus: sample.genus,
    family: sample.family,
    species: sample.species,
    depth: sample.depth,
    temperature: sample.temperature,
    substrate: sample.substrate,
    sampleLength: sample.sample_length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ================= SIDEBAR ================= */}
      <aside className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"} flex flex-col h-screen sticky top-0`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <h1 className="font-bold text-gray-700">MEROBase</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronRight className={`transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-2 mt-4 flex-1">
          <SidebarBtn icon={<LayoutDashboard />} label="Dashboard" open={sidebarOpen} onClick={() => navigate("/dashboard")} />
          <SidebarBtn icon={<PlusCircle />} label="Add Sample" open={sidebarOpen} onClick={() => navigate("/add/step1")} />
          <SidebarBtn icon={<Edit3 />} label="Edit Sample" open={sidebarOpen} onClick={() => navigate("/editsample")} />
          <SidebarBtn icon={<Search />} label="Search" open={sidebarOpen} onClick={() => navigate("/searchsample")} />
        </nav>

        <div className="p-2 border-t">
          <SidebarBtn icon={<LogOut className="text-red-500" />} label="Logout" open={sidebarOpen} onClick={handleLogout} />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 max-w-6xl mx-auto p-8 space-y-6">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <h1 className="text-2xl font-bold">Sample Details</h1>
            <p className="text-sm text-gray-500">{sample.sample_id}</p>
          </div>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
          >
            Edit Sample
          </button>
        </header>

        {/* ================= COLLAPSIBLE SECTIONS ================= */}
        <Section title="Metadata & Collection" open={open.metadata} onToggle={() => toggle("metadata")}>
          <MetadataTab metadata={metadata} />
        </Section>

        <Section title="Morphology" open={open.morphology} onToggle={() => toggle("morphology")}>
          <MorphologyTab morphology={sample.morphology} />
        </Section>

        <Section title="Primary Isolated" open={open.primary} onToggle={() => toggle("primary")}>
          <PrimaryIsolatedTab primary={sample.microbiology?.primaryIsolated} />
        </Section>

        <Section title="Isolated Morphology" open={open.isolated} onToggle={() => toggle("isolated")}>
          <IsolatedMorphologyTab isolated={sample.microbiology?.isolatedMorphology} />
        </Section>

        <Section title="Miscellaneous Microbiology Tests" open={open.misc} onToggle={() => toggle("misc")}>
          <MiscTestsTab misc={sample.microbiology?.microbiologyTests} />
        </Section>

        <Section title="Molecular Biology" open={open.molecular} onToggle={() => toggle("molecular")}>
          <MolecularTab molecular={sample.molecular} />
        </Section>

        <Section title="Publication / Links" open={open.publication} onToggle={() => toggle("publication")}>
          <PublicationTab publication={sample.publication} />
        </Section>
      </main>
    </div>
  );
}

/* ================= SECTION ================= */
function Section({ title, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <button onClick={onToggle} className="flex items-center gap-2 mb-4 focus:outline-none w-full">
        <ChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </button>
      {open && children}
    </div>
  );
}

/* ================= SIDEBAR BUTTON ================= */
function SidebarBtn({ icon, label, open, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 w-full transition"
    >
      {icon}
      {open && <span className="text-gray-700">{label}</span>}
    </button>
  );
}