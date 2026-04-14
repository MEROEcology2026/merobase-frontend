// src/components/Sidebar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, PlusCircle, Edit3, Search, ChevronRight, BookOpen
} from "lucide-react";

export default function Sidebar({ activePage }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard",     icon: <LayoutDashboard className="text-blue-600" />,  path: "/dashboard" },
    { label: "Add Sample",    icon: <PlusCircle className="text-green-600" />,       path: "/add/step1" },
    { label: "Edit Sample",   icon: <Edit3 className="text-yellow-600" />,           path: "/editsample" },
    { label: "Search Sample", icon: <Search className="text-purple-600" />,          path: "/searchsample" },
    { label: "Manual",        icon: <BookOpen className="text-blue-500" />,          path: "/manual" },
  ];

  return (
    <div
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
      className={`h-screen bg-white shadow-xl transition-all duration-300 fixed
        ${sidebarOpen ? "w-56" : "w-16"} flex flex-col items-start`}
    >
      <div className="flex items-center space-x-2 p-4">
        <ChevronRight
          className={`transition-transform duration-300 ${sidebarOpen ? "rotate-90" : ""}`}
        />
        {sidebarOpen && <h1 className="text-lg font-bold text-gray-700">MEROBase</h1>}
      </div>

      <nav className="flex flex-col mt-4 w-full">
        {navItems.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex items-center space-x-3 w-full px-4 py-3 hover:bg-gray-100 transition rounded-lg ${
              activePage === item.label ? "bg-gray-100 font-semibold" : ""
            }`}
          >
            {item.icon}
            {sidebarOpen && <span className="text-gray-700">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}