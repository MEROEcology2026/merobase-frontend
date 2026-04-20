import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, LineChart, Line,
  CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, PlusCircle, Edit3, Search, ChevronLeft, LogOut, BookOpen,
} from "lucide-react";
import { samplesAPI, authAPI } from "../services/api";
import { useSampleFormContext } from "../context/SampleFormContext";

const COLORS = ["#2563EB","#10B981","#F59E0B","#8B5CF6","#EC4899","#6366F1","#9CA3AF"];

const ROLE_COLORS = {
  admin: { bg:"bg-blue-100",  text:"text-blue-700",  dot:"bg-blue-500",  label:"Admin" },
  user:  { bg:"bg-green-100", text:"text-green-700", dot:"bg-green-500", label:"User"  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { clearDraftOnly } = useSampleFormContext();
  const [samples, setSamples] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState([]);

  /* ── current user from localStorage ── */
  const currentUser = JSON.parse(localStorage.getItem("merobase_user") || "{}");

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

  /* ✅ Fetch active users — refresh every 30 seconds */
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const res = await authAPI.getActiveUsers();
        setActiveUsers(res.data.data || []);
      } catch (err) {
        console.error("Failed to load active users:", err);
      }
    };
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("merobase_token");
    localStorage.removeItem("merobase_user");
    navigate("/");
  };

  const totalSamples  = samples.length;
  const totalProjects = new Set(samples.map((s) => s.project_type).filter(Boolean)).size;
  const totalKingdoms = new Set(samples.map((s) => s.kingdom).filter(Boolean)).size;
  const totalSpecies  = new Set(samples.map((s) => s.species).filter(Boolean)).size;

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
          <NavItem icon={<PlusCircle />} label="Add Sample" open={sidebarOpen}
            onClick={() => { clearDraftOnly(); navigate("/add/step1"); }} />
          <NavItem icon={<Edit3 />} label="Edit Sample" open={sidebarOpen}
            onClick={() => navigate("/editsample")} />
          <NavItem icon={<Search />} label="Search Sample" open={sidebarOpen}
            onClick={() => navigate("/searchsample")} />
          <NavItem icon={<BookOpen />} label="Manual" open={sidebarOpen}
            onClick={() => navigate("/manual")} />
        </nav>

        {/* ── current user badge ── */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-b">
            <p className="text-xs text-gray-400 mb-1">Logged in as</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {currentUser.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{currentUser.username}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                  ${currentUser.role === "admin"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-2 border-t">
          <NavItem icon={<LogOut className="text-red-500" />} label="Logout"
            open={sidebarOpen} onClick={handleLogout} />
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
              <KPI title="Total Samples"  value={totalSamples} />
              <KPI title="Total Projects" value={totalProjects} />
              <KPI title="Total Kingdoms" value={totalKingdoms} />
              <KPI title="Total Species"  value={totalSpecies} />
            </div>

            {/* Latest + Active Users */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <InfoCard title="Latest Registered" sample={latestRegistered} />
              <InfoCard title="Latest Edited"     sample={latestEdited} />

              {/* ✅ ACTIVE USERS WIDGET */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Active Users</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    activeUsers.length > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {activeUsers.length} online
                  </span>
                </div>

                {activeUsers.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No active users right now</p>
                ) : (
                  <div className="space-y-3">
                    {activeUsers.map((u) => {
                      const rc = ROLE_COLORS[u.role] || ROLE_COLORS.user;
                      const isMe = u.username === currentUser.username;
                      const lastSeen = u.last_active_at
                        ? new Date(u.last_active_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })
                        : "—";
                      return (
                        <div key={u.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* green pulse dot */}
                            <div className="relative">
                              <div className={`w-2 h-2 rounded-full ${rc.dot}`} />
                              <div className={`absolute inset-0 w-2 h-2 rounded-full ${rc.dot} animate-ping opacity-60`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {u.username}
                                {isMe && (
                                  <span className="ml-1.5 text-xs text-gray-400">(you)</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-400">Last seen {lastSeen}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rc.bg} ${rc.text}`}>
                            {rc.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-gray-300 mt-4">
                  Refreshes every 30 seconds · Active = last 15 min
                </p>
              </div>
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

            {/* System Status */}
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
    { id: "todo",    label: "What's Next" },
    { id: "bugs",    label: "Known Issues" },
  ];

  const working = [
    { group: "Login & Security", items: [
      "You can log in with your username and password",
      "Pages are protected — no one can access without logging in",
      "You can log out from the sidebar",
      "User roles are enforced — admin can delete, user1/user2 can only add and edit",
    ]},
    { group: "Managing Samples", items: [
      "You can add new samples through the step-by-step form — form always starts blank",
      "Sample ID is auto-generated from Sample Type, Project Type, Part of Sample, Project Number and Sample Number",
      "You can search and filter samples by kingdom, project, type, date and sample ID",
      "You can edit any existing sample from Edit Sample, Search, and Sample Details pages",
      "Admin can delete samples — user1 and user2 cannot",
      "Sample details page shows all information in one place",
    ]},
    { group: "Microbiology", items: [
      "Supports multiple Primary Isolated entries per sample",
      "Each ISO entry has its own Isolated Morphology (1 ISO = 1 ISOMOR enforced)",
      "Antibacterial, Antimalarial, Biochemical and Enzymatic tests linked to ISO directly",
      "Test IDs auto-generated per linked ISO — counters reset per ISO",
    ]},
    { group: "Dashboard", items: [
      "Shows total number of samples, projects, kingdoms, and species",
      "Charts show breakdown by kingdom, project type, and collection date",
      "Shows the most recently added and recently edited sample",
      "Active users widget shows who is online right now (last 15 minutes)",
    ]},
  ];

  const todo = [
    { group: "Coming Soon", items: [
      "Export sample list to Excel or PDF",
      "Collection locations on a single map",
      "Image uploads — Cloudinary/S3 storage (under evaluation)",
      "Batch import via CSV",
      "Activity log — who created or edited what and when",
    ]},
  ];

  const bugs = [
    { group: "Things to be aware of", items: [
      "Login session lasts 7 days — after that you will need to log in again",
      "Collection dates might show one day earlier due to timezone differences",
      "Always use the Add Sample button in the sidebar to start a new sample",
      "Image uploads are disabled for now — do not attempt to upload photos",
    ]},
  ];

  const content = { working, todo, bugs };

  const tabStyles = {
    working: { active:"bg-green-100 text-green-700 border-transparent", dot:"bg-green-500" },
    todo:    { active:"bg-yellow-100 text-yellow-700 border-transparent", dot:"bg-yellow-500" },
    bugs:    { active:"bg-red-100 text-red-700 border-transparent", dot:"bg-red-500" },
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
              activeTab === tab.id
                ? tabStyles[tab.id].active
                : "border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}>
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
    <button onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition
        ${active ? "bg-blue-50 font-semibold" : "hover:bg-gray-100"}`}>
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
          <p className="text-xs font-mono text-blue-600 mb-1">{sample.sample_id}</p>
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