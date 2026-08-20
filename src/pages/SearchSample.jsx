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

/* ================= KINGDOM ACCENT (left-edge tick) ================= */
const KINGDOM_TINT = {
  Animalia:  "#0E7490",
  Plantae:   "#15803D",
  Fungi:     "#B45309",
  Bacteria:  "#7C3AED",
  Protista:  "#BE185D",
  Chromista: "#0891B2",
  Undecided: "#9CA3AF",
};
const kingdomTint = (k) => KINGDOM_TINT[k] || "#9CA3AF";

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
        sample.dive_site, sample.kingdom, sample.project_type, sample.sample_id,
        sample.identified_species
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

  const activeFilters =
    (kingdom ? 1 : 0) + (projectType ? 1 : 0) + (sampleType ? 1 : 0) +
    (range[0].startDate && range[0].endDate ? 1 : 0);

  const clearAll = () => {
    setQuery(""); setKingdom(""); setProjectType(""); setSampleType("");
    setRange([{ startDate: null, endDate: null, key: "selection" }]);
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] font-sans">
      {/* ================= SIDEBAR ================= */}
      <aside className={`bg-white border-r border-stone-200 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} flex flex-col h-screen sticky top-0`}>
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          {sidebarOpen && <h1 className="text-xl font-bold text-stone-700">MEROBase</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronRight className={`text-stone-500 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
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
          <SidebarButton icon={<BookOpen className="text-blue-500" />} label="Manual"
            open={sidebarOpen} onClick={() => navigate("/manual")} />
        </nav>

        <div className="p-2 border-t border-stone-200">
          <SidebarButton icon={<LogOut className="text-red-500" />} label="Logout"
            open={sidebarOpen} onClick={handleLogout} />
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-8">
        {/* ── header ── */}
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Specimen Register</h1>
          <span className="text-sm text-stone-400 font-mono">
            {loading ? "…" : `${filteredSamples.length} of ${samples.length}`}
          </span>
        </div>
        <p className="text-sm text-stone-500 mb-6">Search and browse catalogued samples.</p>

        {/* ================= FILTER TOOLBAR ================= */}
        <div className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 mb-6
                        flex flex-wrap items-center gap-2">
          {/* search */}
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon size={16} className="absolute left-3 top-2.5 text-stone-400" />
            <input type="text" placeholder="Search name, species, collector, site, ID…"
              value={query} onChange={e => setQuery(e.target.value)}
              className="pl-9 w-full text-sm bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-stone-400" />
          </div>

          <div className="h-5 w-px bg-stone-200 hidden md:block" />

          <FilterSelect value={kingdom} onChange={setKingdom} placeholder="All kingdoms" options={kingdoms} />
          <FilterSelect value={projectType} onChange={setProjectType} placeholder="All projects" options={projectTypes} />
          <FilterSelect value={sampleType} onChange={setSampleType} placeholder="All types"
            options={["Biological", "Non-Biological"]} />

          {/* date */}
          <div ref={pickerRef} className="relative">
            <button onClick={() => setShowPicker(!showPicker)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition
                ${range[0].startDate
                  ? "border-cyan-300 bg-cyan-50 text-cyan-800"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
              <Calendar size={14} />
              {range[0].startDate && range[0].endDate
                ? `${range[0].startDate.toLocaleDateString()} – ${range[0].endDate.toLocaleDateString()}`
                : "Date"}
            </button>
            {showPicker && (
              <div className="absolute right-0 z-50 mt-2 bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
                <DateRange ranges={range} onChange={(item) => setRange([item.selection])} />
                {range[0].startDate && (
                  <button onClick={() => setRange([{ startDate: null, endDate: null, key: "selection" }])}
                    className="w-full text-xs text-stone-500 hover:text-stone-800 py-2 border-t border-stone-100">
                    Clear dates
                  </button>
                )}
              </div>
            )}
          </div>

          {(query || activeFilters > 0) && (
            <button onClick={clearAll}
              className="text-xs text-stone-400 hover:text-stone-700 px-2 py-1 transition">
              Clear all
            </button>
          )}
        </div>

        {/* ================= SPECIMEN TABLE ================= */}
        <SpecimenTable
          loading={loading}
          rows={filteredSamples}
          onDetails={(s) => navigate(`/sampledetails/${s.sample_id}`)}
          onEdit={handleEdit}
        />
      </main>
    </div>
  );
}

/* ================= SPECIMEN TABLE ================= */
function SpecimenTable({ loading, rows, onDetails, onEdit, onDelete, isAdmin }) {
  if (loading) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl p-12 text-center text-stone-400 text-sm">
        Loading specimens…
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="bg-white border border-dashed border-stone-300 rounded-xl p-12 text-center">
        <p className="text-stone-500 text-sm mb-1">No specimens match your search.</p>
        <p className="text-stone-400 text-xs">Try clearing a filter or widening the date range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
      {/* column header — hidden on mobile */}
      <div className="hidden md:grid grid-cols-[190px_1fr_180px_120px_auto] gap-4 px-5 py-2.5
                      border-b border-stone-200 bg-stone-50/70">
        <ColHead>Catalogue №</ColHead>
        <ColHead>Specimen</ColHead>
        <ColHead>Origin</ColHead>
        <ColHead>Logged</ColHead>
        <ColHead>{""}</ColHead>
      </div>

      <div className="divide-y divide-stone-100">
        {rows.map((s) => (
          <SpecimenRow key={s.sample_id} s={s}
            onDetails={onDetails} onEdit={onEdit}
            onDelete={onDelete} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}

function ColHead({ children }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
      {children}
    </span>
  );
}

/* ================= SPECIMEN ROW ================= */
function SpecimenRow({ s, onDetails, onEdit, onDelete, isAdmin }) {
  const tint = kingdomTint(s.kingdom);
  const logged = s.collection_date
    ? new Date(s.collection_date).toLocaleDateString("en-GB",
        { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const origin = [s.kingdom, s.dive_site].filter(Boolean).join(" · ") || "—";

  return (
    <div className="group relative grid grid-cols-1 md:grid-cols-[190px_1fr_180px_120px_auto]
                    gap-2 md:gap-4 px-5 py-3.5 md:items-center hover:bg-stone-50/70 transition">
      {/* kingdom tick */}
      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r"
        style={{ background: tint }} />

      {/* catalogue number */}
      <div className="pl-2">
        <span className="font-mono text-[13px] text-cyan-800 font-medium break-all">
          {s.sample_id}
        </span>
        {s.sample_type && (
          <span className="md:hidden ml-2 text-[10px] text-stone-400 uppercase tracking-wide">
            {s.sample_type}
          </span>
        )}
      </div>

      {/* specimen — name + italic-serif species */}
      <div className="pl-2 md:pl-0 min-w-0">
        <p className="text-[15px] font-semibold text-stone-900 leading-snug truncate">
          {s.sample_name || "Unnamed specimen"}
        </p>
        {s.identified_species ? (
          <p className="text-[13px] text-stone-600 leading-snug truncate"
             style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }}>
            {s.identified_species}
          </p>
        ) : (
          <p className="text-[12px] text-stone-300 italic leading-snug">Not yet identified</p>
        )}
      </div>

      {/* origin */}
      <div className="pl-2 md:pl-0 text-[13px] text-stone-600 truncate">
        <span className="md:hidden text-stone-400 mr-1">Origin:</span>{origin}
      </div>

      {/* logged date */}
      <div className="pl-2 md:pl-0 text-[13px] text-stone-500 font-mono">
        <span className="md:hidden text-stone-400 mr-1 font-sans">Logged:</span>{logged}
      </div>

      {/* actions */}
      <div className="pl-2 md:pl-0 flex items-center gap-2 md:justify-end pt-1 md:pt-0">
        <button onClick={() => onDetails(s)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-700 text-white hover:bg-cyan-800 transition">
          Details
        </button>
        <button onClick={() => onEdit(s)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition">
          Edit
        </button>
        {isAdmin && onDelete && (
          <button onClick={() => onDelete(s.sample_id)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

/* ================= FILTER SELECT ================= */
function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`text-sm px-2.5 py-1.5 rounded-lg border bg-white transition cursor-pointer
        focus:ring-2 focus:ring-cyan-200 focus:outline-none
        ${value ? "border-cyan-300 text-cyan-800 bg-cyan-50" : "border-stone-200 text-stone-600"}`}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ================= SIDEBAR BUTTON ================= */
function SidebarButton({ icon, label, open, onClick, active }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 transition border-l-2
        ${active
          ? "bg-purple-50 border-purple-500"
          : "border-transparent hover:bg-stone-50"}`}>
      {icon}
      {open && <span className="text-stone-700 text-sm">{label}</span>}
    </button>
  );
}