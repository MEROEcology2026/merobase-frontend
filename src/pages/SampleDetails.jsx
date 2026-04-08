import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LayoutDashboard, PlusCircle, Edit3, Search,
  ChevronRight, LogOut, ArrowLeft, Trash2
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

const TABS = [
  { id: "metadata",   label: "Metadata" },
  { id: "isolated",   label: "Primary Isolated" },
  { id: "morphology", label: "Morphology" },
  { id: "isomorpho",  label: "Isolated Morphology" },
  { id: "tests",      label: "Microbiology Tests" },
  { id: "molecular",  label: "Molecular" },
  { id: "publication",label: "Publication" },
];

export default function SampleDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { loadSampleForEdit, clearDraftOnly } = useSampleFormContext();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("metadata");

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

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this sample?")) return;
    try {
      await samplesAPI.delete(sample.sample_id);
      navigate("/searchsample");
    } catch (err) {
      console.error("Failed to delete sample:", err);
      alert("Failed to delete sample. Please try again.");
    }
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
    navigate("/add/step1", { state: { fromEdit: true } });
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
        <button onClick={() => navigate("/searchsample")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
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

  const isolatedRuns = sample.microbiology?.primaryIsolatedRuns || [];

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
        </nav>

        <div className="p-2 border-t">
          <SidebarBtn icon={<LogOut className="text-red-500" />} label="Logout"
            open={sidebarOpen} onClick={handleLogout} />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 overflow-y-auto">

        {/* ================= TOPBAR ================= */}
        <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleDelete}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
              <Trash2 size={14} /> Delete
            </button>
            <button onClick={handleEdit}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition">
              Edit Sample
            </button>
          </div>
        </div>

        {/* ================= HERO ================= */}
        <div className="bg-white border-b px-8 py-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="inline-block font-mono text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
                {sample.sample_id}
              </span>
              <h1 className="text-2xl font-semibold text-gray-900">
                {sample.sample_name || "Unnamed Sample"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {[sample.collector_name, sample.collection_date?.split("T")[0]]
                  .filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {sample.sample_type && (
              <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                {sample.sample_type}
              </span>
            )}
            {sample.kingdom && (
              <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                {sample.kingdom}
              </span>
            )}
            {sample.project_type && (
              <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">
                Project {sample.project_type}
              </span>
            )}
            {sample.dive_site && (
              <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                {sample.dive_site}
              </span>
            )}
            {sample.substrate && (
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                {sample.substrate}
              </span>
            )}
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
            <KPI label="Depth" value={sample.depth ? `${sample.depth} m` : "—"} />
            <KPI label="Temperature" value={sample.temperature ? `${sample.temperature}°C` : "—"} />
            <KPI label="Sample length" value={sample.sample_length ? `${sample.sample_length} cm` : "—"} />
            <KPI label="Isolated entries" value={isolatedRuns.length > 0 ? `${isolatedRuns.length} ${isolatedRuns.length === 1 ? "entry" : "entries"}` : "None"} />
          </div>
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
        <div className="px-8 py-6 max-w-5xl">

          {activeTab === "metadata" && (
            <MetadataTab metadata={metadata} />
          )}

          {activeTab === "isolated" && (
            <PrimaryIsolatedTab primary={isolatedRuns} />
          )}

          {activeTab === "morphology" && (
            <MorphologyTab morphology={sample.morphology} />
          )}

          {activeTab === "isomorpho" && (
            <IsolatedMorphologyTab isolated={sample.microbiology?.isolatedMorphology} />
          )}

          {activeTab === "tests" && (
            <MiscTestsTab misc={sample.microbiology?.microbiologyTests} />
          )}

          {activeTab === "molecular" && (
            <MolecularTab molecular={sample.molecular} />
          )}

          {activeTab === "publication" && (
            <PublicationTab publication={sample.publication} />
          )}

        </div>
      </main>
    </div>
  );
}

/* ================= KPI ================= */
function KPI({ label, value }) {
  return (
    <div className="bg-white px-5 py-3">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

/* ================= SIDEBAR BUTTON ================= */
function SidebarBtn({ icon, label, open, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 w-full transition">
      {icon}
      {open && <span className="text-gray-700">{label}</span>}
    </button>
  );
}