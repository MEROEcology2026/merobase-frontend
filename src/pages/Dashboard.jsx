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

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("merobase_token");
    localStorage.removeItem("merobase_user");
    navigate("/");
  };

  /* ================= KPI ================= */
  const totalSamples = samples.length;

  const totalProjects = new Set(
    samples.map((s) => s.project_type).filter(Boolean)
  ).size;

  const totalKingdoms = new Set(
    samples.map((s) => s.kingdom).filter(Boolean)
  ).size;

  const totalSpecies = new Set(
    samples.map((s) => s.species).filter(Boolean)
  ).size;

  /* ================= LATEST ================= */
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

  /* ================= ANALYTICS ================= */
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

  /* ================= UI ================= */
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
          </>
        )}
      </main>
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