import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Edit3,
  Search,
  ChevronRight,
} from "lucide-react";
import { useSampleFormContext } from "../../context/SampleFormContext";

const steps = [
  { path: "/add/step1", label: "Metadata" },
  { path: "/add/step2", label: "Morphology" },
  { path: "/add/step3a", label: "Microbiology - Primary Isolated" },
  { path: "/add/step3b", label: "Microbiology - Isolated Morphology" },
  { path: "/add/step3c", label: "Microbiology - Misc Tests" },
  { path: "/add/step4", label: "Molecular" },
  { path: "/add/step5", label: "Publication" },
  { path: "/add/review", label: "Review" },
];

export default function AddSampleWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { mode, clearDraftOnly } = useSampleFormContext();

  const currentStepIndex = steps.findIndex(
    (step) => step.path === location.pathname
  );

  /* ✅ FIXED: if mode is edit but user navigated here fresh, reset to add mode */
  useEffect(() => {
    const cameFromEdit = location.state?.fromEdit;
    if (mode === "edit" && !cameFromEdit) {
      clearDraftOnly();
    }
  }, []);

  const goNext = () => {
    if (currentStepIndex >= 0 && currentStepIndex < steps.length - 1) {
      navigate(steps[currentStepIndex + 1].path);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      navigate(steps[currentStepIndex - 1].path);
    }
  };

  return (
    <WizardLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      currentStepIndex={currentStepIndex}
      goNext={goNext}
      goBack={goBack}
    >
      <Outlet />
    </WizardLayout>
  );
}

/* ================= Layout Component ================= */
function WizardLayout({
  sidebarOpen,
  setSidebarOpen,
  currentStepIndex,
  goNext,
  goBack,
  children,
}) {
  const navigate = useNavigate();
  const { mode } = useSampleFormContext();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* ================= Sidebar ================= */}
      <aside
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={`fixed left-0 top-0 h-screen bg-white shadow-xl transition-all duration-300 z-20
          ${sidebarOpen ? "w-56" : "w-16"}
        `}
      >
        <div className="flex items-center gap-2 p-4 border-b">
          <ChevronRight
            className={`transition-transform ${sidebarOpen ? "rotate-90" : ""}`}
          />
          {sidebarOpen && (
            <h1 className="text-lg font-bold text-gray-700">MEROBase</h1>
          )}
        </div>

        <nav className="flex flex-col mt-4 gap-1 px-2">
          <SidebarButton
            icon={<LayoutDashboard className="text-blue-600" />}
            label="Dashboard"
            open={sidebarOpen}
            onClick={() => navigate("/dashboard")}
          />
          <SidebarButton
            icon={<PlusCircle className="text-green-600" />}
            label="Add Sample"
            open={sidebarOpen}
            onClick={() => {
              clearDraftOnly();
              navigate("/add/step1");
            }}
          />
          <SidebarButton
            icon={<Edit3 className="text-yellow-600" />}
            label="Edit Sample"
            open={sidebarOpen}
            onClick={() => navigate("/editsample")}
          />
          <SidebarButton
            icon={<Search className="text-purple-600" />}
            label="Search Sample"
            open={sidebarOpen}
            onClick={() => navigate("/searchsample")}
          />
        </nav>
      </aside>

      {/* ================= Main Content ================= */}
      <main className={`flex-1 transition-all ${sidebarOpen ? "ml-56" : "ml-16"}`}>
        <div className="p-6">
          <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow-lg p-6">

            {/* Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {mode === "edit"
                  ? "MEROBASE · Modify Sample"
                  : "MEROBASE · Add New Sample"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {mode === "edit"
                  ? "You are editing an existing sample record."
                  : "Fill in each step to register a new sample."}
              </p>
            </div>

            {/* Step Navigation Pills */}
            <div className="mb-6 flex flex-wrap gap-2 justify-center text-sm">
              {steps.map((step, idx) => (
                <NavLink
                  key={step.path}
                  to={step.path}
                  className={({ isActive }) =>
                    `px-3 py-1 rounded-full transition
                    ${isActive
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`
                  }
                >
                  {idx + 1}. {step.label}
                </NavLink>
              ))}
            </div>

            {/* Step Content */}
            <section className="mb-8">{children}</section>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              {currentStepIndex > 0 ? (
                <button type="button" onClick={goBack}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition">
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStepIndex < steps.length - 1 ? (
                <button type="button" onClick={goNext}
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                  Next
                </button>
              ) : (
                <span className="text-sm text-gray-500">
                  Review & submit in final step
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= Sidebar Button ================= */
function SidebarButton({ icon, label, open, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-100 transition">
      {icon}
      {open && <span className="text-gray-700 font-medium">{label}</span>}
    </button>
  );
}