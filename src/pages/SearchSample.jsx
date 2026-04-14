import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PlusCircle, Edit3,
  Search as SearchIcon, ChevronRight, Calendar, LogOut, BookOpen
} from "lucide-react";
import { DateRange } from "react-date-range";
import { useSampleFormContext } from "../context/SampleFormContext";
import { samplesAPI } from "../services/api";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function SearchSample() {
  const navigate = useNavigate();
  const { loadSampleForEdit, clearDraftOnly } = useSampleFormContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [kingdom, setKingdom] = useState("");
  const [projectType, setProjectType] = useState("");
  const [sampleType, setSampleType] = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const [range, setRange] = useState([
    { startDate: null, endDate: null, key: "selection" }
  ]);

  /* ================= LOAD FROM API ================= */
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await samplesAPI.getAll();
        setSamples(res.data.data || []);
      } catch (err) {
        console.error("Failed to load samples:", err);
        setSamples([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSamples();
  }, []);

  /* ================= CLOSE PICKER ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("merobase_token");
    localStorage.removeItem("merobase_user");
    navigate("/");
  };

  /* ================= EDIT HANDLER ================= */
  const handleEdit = async (sample) => {
    try {
      const res = await samplesAPI.getById(sample.sample_id);
      const full = res.data.data;
      loadSampleForEdit({
        metadata: {
          sampleId: full.sample_id,
          sampleName: full.sample_name,
          sampleType: full.sample_type,
          projectType: full.project_type,
          projectNumber: full.project_number,
          sampleNumber: full.sample_number,
          diveSite: full.dive_site,
          collectorName: full.collector_name,
          collectionDate: full.collection_date?.split("T")[0] || "",
          latitude: full.latitude,
          longitude: full.longitude,
          storageLocation: full.storage_location,
          kingdom: full.kingdom,
          genus: full.genus,
          family: full.family,
          species: full.species,
          depth: full.depth,
          temperature: full.temperature,
          substrate: full.substrate,
          sampleLength: full.sample_length,
        },
        morphology: full.morphology || {},
        microbiology: full.microbiology || {},
        molecular: full.molecular || {},
        publication: full.publication || { links: [] },
      });
      navigate("/add/step1", { state: { fromEdit: true } });
    } catch (err) {
      console.error("Failed to load sample for edit:", err);
      alert("Failed to load sample. Please try again.");
    }
  };

  /* ================= DROPDOWN OPTIONS ================= */
  const kingdoms = useMemo(
    () => [...new Set(samples.map(s => s.kingdom).filter(Boolean))],
    [samples]
  );

  const projectTypes = useMemo(
    () => [...new Set(samples.map(s => s.project_type).filter(Boolean))],
    [samples]
  );

  /* ================= FILTER LOGIC ================= */
  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      const searchable = [
        sample.sample_name, sample.species, sample.collector_name,
        sample.dive_site, sample.kingdom, sample.project_type, sample.sample_id
      ].filter(Boolean).join(" ").toLowerCase();

      const matchesQuery   = searchable.includes(query.toLowerCase());
      const matchesKingdom = !kingdom || sample.kingdom === kingdom;
      const matchesProject = !projectType || sample.project_type === projectType;
      const matchesType    = !sampleType || sample.sample_type === sampleType;

      let matchesDate = true;
      if (range[0].startDate && range[0].endDate && sample.collection_date) {
        const d = new Date(sample.collection_date);
        matchesDate = d >= range[0].startDate && d <= range[0].endDate;
      }

      return matchesQuery && matchesKingdom && matchesProject && matchesType && matchesDate;
    });
  }, [samples, query, kingdom, projectType, sampleType, range]);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* ================= SIDEBAR ================= */}
      <aside className={`bg-white shadow-xl transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} flex flex-col h-screen sticky top-0`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <h1 className="text-xl font-bold text-gray-700">MEROBase</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronRight className={`text-gray-600 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex flex-col mt-4 flex-1">
          <SidebarButton icon={<LayoutDashboard className="text-blue-600" />} label="Dashboard"
            open={sidebarOpen} onClick={() => navigate("/dashboard")} />
          <SidebarButton icon={<PlusCircle className="text-green-600" />} label="Add Sample"
            open={sidebarOpen} onClick={() => { clearDraftOnly(); navigate("/add/step1"); }} />
          <SidebarButton icon={<Edit3 className="text-yellow-600" />} label="Edit Sample"
            open={sidebarOpen} onClick={() => navigate("/editsample")} />
          <SidebarButton icon={<SearchIcon className="text-purple-600" />} label="Search Sample"
            open={sidebarOpen} active />
          {/* ✅ ADDED */}
          <SidebarButton icon={<BookOpen className="text-blue-500" />} label="Manual"
            open={sidebarOpen} onClick={() => navigate("/manual")} />
        </nav>

        <div className="p-2 border-t">
          <SidebarButton icon={<LogOut className="text-red-500" />} label="Logout"
            open={sidebarOpen} onClick={handleLogout} />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Search Samples</h1>

        {/* ================= FILTER PANEL ================= */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon size={18} className="absolute left-3 top-3 text-gray-400" />
              <input type="text" placeholder="Search by any keyword..."
                value={query} onChange={e => setQuery(e.target.value)}
                className="pl-10 w-full border rounded-lg px-3 py-2" />
            </div>

            <select value={kingdom} onChange={e => setKingdom(e.target.value)}
              className="border rounded-lg px-3 py-2">
              <option value="">All Kingdoms</option>
              {kingdoms.map(k => <option key={k} value={k}>{k}</option>)}
            </select>

            <select value={projectType} onChange={e => setProjectType(e.target.value)}
              className="border rounded-lg px-3 py-2">
              <option value="">All Projects</option>
              {projectTypes.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select value={sampleType} onChange={e => setSampleType(e.target.value)}
              className="border rounded-lg px-3 py-2">
              <option value="">All Sample Types</option>
              <option value="Biological">Biological</option>
              <option value="Non-Biological">Non-Biological</option>
            </select>

            <div ref={pickerRef} className="relative md:col-span-2">
              <label className="text-sm font-semibold flex items-center gap-1 mb-1">
                <Calendar size={14} /> Collection Date
              </label>
              <div className="flex gap-2">
                <button onClick={() => setShowPicker(!showPicker)}
                  className="flex-1 px-4 py-2 border rounded-lg text-left bg-white text-sm">
                  {range[0].startDate && range[0].endDate
                    ? `${range[0].startDate.toLocaleDateString()} – ${range[0].endDate.toLocaleDateString()}`
                    : "Select date range"}
                </button>
                {range[0].startDate && (
                  <button onClick={() => setRange([{ startDate: null, endDate: null, key: "selection" }])}
                    className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300">
                    Clear
                  </button>
                )}
              </div>
              {showPicker && (
                <div className="absolute z-50 mt-2">
                  <DateRange ranges={range} onChange={(item) => setRange([item.selection])} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= SAMPLE CARDS ================= */}
        {loading ? (
          <p className="text-gray-400 italic">Loading samples...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredSamples.length === 0 ? (
              <p className="text-gray-500 italic col-span-full">No samples found.</p>
            ) : (
              filteredSamples.map(sample => (
                <div key={sample.sample_id}
                  className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
                  <p className="text-xs font-mono text-blue-600 mb-1">{sample.sample_id}</p>
                  <h3 className="text-lg font-semibold mb-2">
                    {sample.sample_name || "Unnamed Sample"}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Project: {sample.project_type || "—"}</p>
                    <p>Kingdom: {sample.kingdom || "—"}</p>
                    <p>Sample Type: {sample.sample_type || "—"}</p>
                    <p>Date: {sample.collection_date?.split("T")[0] || "—"}</p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => navigate(`/sampledetails/${sample.sample_id}`)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded">
                      Details
                    </button>
                    <button
                      onClick={() => handleEdit(sample)}
                      className="flex-1 px-3 py-2 text-sm bg-yellow-500 text-white rounded">
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarButton({ icon, label, open, onClick, active }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition
        ${active ? "bg-purple-50" : "hover:bg-gray-100"}`}>
      {icon}
      {open && <span className="text-gray-700">{label}</span>}
    </button>
  );
}