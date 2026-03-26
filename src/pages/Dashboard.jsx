import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, LineChart, Line,
  CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, PlusCircle, Edit3, Search, ChevronLeft, LogOut,
} from "lucide-react";
import { samplesAPI } from "../services/api";

const COLORS = ["#2563EB","#10B981","#F59E0B","#8B5CF6","#EC4899","#6366F1","#9CA3AF"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [samples, setSamples] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    localStorage.removeItem("merobase_token");
    localStorage.removeItem("merobase_user");
    navigate("/");
  };

  const totalSamples = samples.length;
  const totalProjects = new Set(samples.map((s) => s.project_type).filter(Boolean)).size;
  const totalKingdoms = new Set(samples.map((s) => s.kingdom).filter(Boolean)).size;
  const totalSpecies = new Set(samples.map((s) => s.species).filter(Boolean)).size;

  const latestRegistered = useMemo(() => {
    return [...samples]
      .filter((s) => s.created_at)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  }, [samples]);

  const latestEdited = useMemo(() => {
    return [...samples]
      .filter((s) => s.updated_at)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
  }, [samples]);

  const kingdomData = useMemo(() => {
    const acc = {};
    samples.forEach((s) => {
      const k = s.kingdom || "Undecided";
      acc[k] = (acc[k] || 0) + 1;
    });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [samples]);

  const projectData = useMemo(() => {
    const acc = {};
    samples.forEach((s) => {
      const p = s.project_type || "Unknown";
      acc[p] = (acc[p] || 0) + 1;
    });
    return Object.entries(acc).map(([name, value]) => ({ name, value }));
  }, [samples]);

  const dateData = useMemo(() => {
    const acc = {};
    samples.forEach((s) => {
      const d = s.collection_date?.split("T")[0];
      if (!d) return;
      acc[d] = (acc[d] || 0) + 1;
    });
    return Object.entries(acc)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, value]) => ({ date, value }));
  }, [samples]);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* ========== SIDEBAR ========== */}
      <aside className={`bg-white shadow-xl transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"} flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          {sidebarOpen && <h1 className="text-xl font-bold text-gray-700">MEROBase</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronLeft className={`transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
          </button>
        </div>

        <nav className="mt-4 space-y-1 flex-1">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" open={sidebarOpen} active />
          <NavItem icon={<PlusCircle />} label="Add Sample" open={sidebarOpen} onClick={() => navigate("/add/step1")} />
          <NavItem icon={<Edit3 />} label="Edit Sample" open={sidebarOpen} onClick={() => navigate("/editsample")} />
          <NavItem icon={<Search />} label="Search Sample" open={sidebarOpen} onClick={() => navigate("/searchsample")} />
        </nav>

        <div className="p-2 border-t">
          <NavItem icon={<LogOut className="text-red-500" />} label="Logout" open={sidebarOpen} onClick={handleLogout} />
        </div>
      </aside>

      {/* ========== MAIN ========== */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 italic">Loading samples...</p>
          </div>
        ) : (
          <>
            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <KPI title="Total Samples" value={totalSamples} />
              <KPI title="Total Projects" value={totalProjects} />
              <KPI title="Total Kingdoms" value={totalKingdoms} />
              <KPI title="Total Species" value={totalSpecies} />
            </div>

            {/* Latest */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <InfoCard title="Latest Registered" sample={latestRegistered} />
              <InfoCard title="Latest Edited" sample={latestEdited} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartBox title="Kingdom Types">
                {kingdomData.length === 0 ? (
                  <p className="text-gray-400 italic text-sm">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={kingdomData} dataKey="value" label>
                        {kingdomData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartBox>

              <ChartBox title="Project Types">
                {projectData.length === 0 ? (
                  <p className="text-gray-400 italic text-sm">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={projectData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {projectData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartBox>

              <ChartBox title="Collection Date">
                {dateData.length === 0 ? (
                  <p className="text-gray-400 italic text-sm">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={dateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#2563EB" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartBox>
            </div>

            {/* ================= SYSTEM STATUS ================= */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">System Status</h2>
              <StatusPanel />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ================= STATUS PANEL ================= */
function StatusPanel() {
  const [activeTab, setActiveTab] = useState("working");

  const tabs = [
    { id: "working", label: "What's Working" },
    { id: "todo", label: "What's Next" },
    { id: "bugs", label: "Known Issues" },
  ];

  const working = [
    { group: "Login & Security", items: [
      "You can log in with your username and password",
      "Pages are protected — no one can access without logging in",
      "You can log out from the sidebar",
    ]},
    { group: "Managing Samples", items: [
      "You can add new samples through the step-by-step form",
      "You can search and filter samples by kingdom, project, type, and date",
      "You can edit any existing sample",
      "You can delete samples you no longer need",
      "Sample details page shows all information in one place",
    ]},
    { group: "Adding Sample Details", items: [
      "You can pick a collection location on the map or search by name",
      "You can upload SEM and microscope photos",
      "Biochemical and enzymatic tests support multiple runs with notes",
      "You can add custom tests on top of the default ones",
      "Molecular data supports multiple marker genes",
      "Publication links can be added",
    ]},
    { group: "Dashboard", items: [
      "Shows total number of samples, projects, kingdoms, and species",
      "Charts show breakdown by kingdom, project type, and collection date",
      "Shows the most recently added and recently edited sample",
    ]},
  ];

  const todo = [
    { group: "Coming Soon", items: [
      "Sample details page is missing some fields like dive site, depth, and temperature — these will be added soon",
      "Sequence files in molecular section show as broken images — this will be fixed to show a proper file list",
      "The live website hasn't received the latest updates yet — needs a push to go live",
    ]},
    { group: "Future Features", items: [
      "Export your sample list to Excel or PDF",
      "See all collection locations on a single map",
      "Different user levels — e.g. admin can edit, viewer can only read",
      "Sample photos stored properly on the server instead of inside the database",
    ]},
  ];

  const bugs = [
    { group: "Things to be aware of", items: [
      "The live website is still running an older version — local version is more up to date",
      "If you used the app before it was connected to the database, old test samples might still appear in search — you can clear them from browser settings",
      "Login session lasts 7 days — after that you'll need to log in again",
      "Collection dates might show one day earlier than expected due to timezone differences",
      "The file upload button in some steps might not work consistently — being fixed",
    ]},
  ];

  const content = { working, todo, bugs };

  const tabStyles = {
    working: { active: "bg-green-100 text-green-700 border-transparent", dot: "bg-green-500" },
    todo: { active: "bg-yellow-100 text-yellow-700 border-transparent", dot: "bg-yellow-500" },
    bugs: { active: "bg-red-100 text-red-700 border-transparent", dot: "bg-red-500" },
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
              activeTab === tab.id
                ? tabStyles[tab.id].active
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {content[activeTab].map((group) => (
          <div key={group.group}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {group.group}
            </p>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${tabStyles[activeTab].dot}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */
function NavItem({ icon, label, open, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition
        ${active ? "bg-blue-50 font-semibold" : "hover:bg-gray-100"}`}
    >
      {icon}
      {open && <span>{label}</span>}
    </button>
  );
}

function KPI({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}

function InfoCard({ title, sample }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {sample ? (
        <>
          <p className="font-medium">{sample.sample_name || "Unnamed Sample"}</p>
          <p className="text-sm text-gray-500">Species: {sample.species || "—"}</p>
          <p className="text-sm text-gray-500">
            Date: {sample.collection_date?.split("T")[0] || "—"}
          </p>
        </>
      ) : (
        <p className="italic text-gray-400">No data</p>
      )}
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}