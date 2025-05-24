import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUsers, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import { MdAdminPanelSettings, MdAssignment } from 'react-icons/md';
import assessalogo from "./logo.png";

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`fixed md:relative z-50 bg-gradient-to-b from-blue-50 to-blue-100 text-gray-800 w-64 p-6 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl`}>
      <button className="absolute top-4 right-4 md:hidden text-gray-600 hover:text-blue-600 transition" onClick={() => setSidebarOpen(false)}>
        ✖
      </button>
      <div className="flex items-center justify-center mb-8">
        <img src={assessalogo} alt="Logo" className="w-32" />
      </div>
      <nav className="space-y-2">
        <NavItem icon={FaHome} label="Home" path="/admin-dashboard" />
        <NavItem icon={MdAdminPanelSettings} label="Teachers" path="/teachers" />
        <NavItem icon={FaUsers} label="Students" path="/students" />
        <NavItem icon={MdAssignment} label="Assessments" path="/assessments" />
      </nav>
      <div className="mt-8 border-t border-blue-200 pt-6">
        <NavItem icon={FaSignOutAlt} label="Logout" path="#" isLogout />
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, path, isLogout }) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link 
      to={path} 
      className={`flex items-center space-x-3 py-3 px-4 rounded-lg ${
        isLogout ? "text-red-500 hover:bg-red-100" : 
        isActive ? "bg-blue-200/50 text-blue-800" : "text-gray-700 hover:bg-blue-200/50 hover:text-blue-800"
      } transition-all group`}
    >
      <Icon className="text-xl" />
      <span className="text-lg font-medium">{label}</span>
    </Link>
  );
}