import { Routes, Route, Link, useLocation } from "react-router-dom";
import { FaHome, FaUsers, FaSignOutAlt, FaBars, FaSearch, FaBell,FaClipboardList } from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdClass, MdAssignment, MdAdminPanelSettings } from 'react-icons/md';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import assessalogo from "./logo.png";
import { useState } from "react";
import "tailwindcss/tailwind.css";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Responsive Header */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start md:items-center mb-8">
          <div className="flex items-center w-full md:w-auto">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-all"
            >
              <FaBars className="text-2xl" />
            </button>
            <div className="md:hidden flex-1 ml-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 "
                />
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-blue-600">
              <FaBell className="text-2xl" />
            </button>
            <div className="flex items-center space-x-4 group cursor-pointer relative">
              <IoPersonCircleOutline className="text-4xl text-blue-600 transition-transform hover:scale-110" />
              <div className="text-right">
                <p className="font-bold text-gray-800">Admin Name</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
              {/* Dropdown Menu */}
              <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg w-48 hidden group-hover:block">
                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">Profile</Link>
                <Link to="/settings" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">Settings</Link>
                <Link to="/logout" className="block px-4 py-2 text-red-500 hover:bg-red-100">Logout</Link>
              </div>
            </div>
          </div>
        </div>
        
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          {/* 
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/students" element={<Students />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/assessments" element={<Assessments />} />
          */}
        </Routes>
      </main>
    </div>
  );
}

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`fixed md:relative z-50 bg-gradient-to-b from-blue-50 to-blue-100 text-gray-800 w-64 p-6 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl`}>
      <button className="absolute top-4 right-4 md:hidden text-gray-600 hover:text-blue-600 transition" onClick={() => setSidebarOpen(false)}>
        ✖
      </button>
      <div className="flex items-center justify-center mb-8">
        <img src={assessalogo} alt="Logo" className="w-32" />
      </div>
      <nav className="space-y-2">
        <NavItem icon={FaHome} label="Dashboard" path="/" />
        <NavItem icon={MdAdminPanelSettings} label="Teachers" path="/teachers" />
        <NavItem icon={FaUsers} label="Students" path="/students" />
        <NavItem icon={MdClass} label="Classes" path="/classes" />
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

function DashboardHome() {
  return (
    <>
      {/* Stats Cards with Unique Design */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Teachers</h3>
              <p className="text-2xl">25</p>
            </div>
            <MdAdminPanelSettings className="text-4xl opacity-75" />
          </div>
          <div className="mt-4">
            <p className="text-sm">Active: 20</p>
            <p className="text-sm">Inactive: 5</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-400 to-rose-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold">User Management</h3>
        <p className="text-2xl">1,234</p>
        <p className="text-sm mt-2">Total Users</p>
      </div>
      <FaUsers className="text-4xl opacity-75" />
    </div>
    <div className="mt-4 flex justify-between text-sm">
      <div>
        <p>Active: 1,100</p>
        <p>Pending: 24</p>
      </div>
      <Link 
        to="/admin/users" 
        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full"
      >
        Manage
      </Link>
    </div>
  </div>
  {/* Card 3: Analytics Overview */}
  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold">Analytics</h3>
        <p className="text-2xl">89%</p>
        <p className="text-sm mt-2">Engagement Rate</p>
      </div>
      <FaClipboardList className="text-4xl opacity-75" />
    </div>
    <div className="mt-4 flex justify-between text-sm">
      <div>
        <p>Assessments: 250</p>
        <p>Avg. Score: 78%</p>
      </div>
      <Link 
        to="/admin/analytics" 
        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full"
      >
        View
      </Link>
    </div>
  </div>
  {/* Card 4: Platform Health */}
  <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold">Platform Health</h3>
        <p className="text-2xl">99.9%</p>
        <p className="text-sm mt-2">Uptime</p>
      </div>
      <MdAdminPanelSettings className="text-4xl opacity-75" />
    </div>
    <div className="mt-4 flex justify-between text-sm">
      <div>
        <p>Active Servers: 3</p>
        <p>Issues: 0</p>
      </div>
      <Link 
        to="/admin/health" 
        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full"
      >
        Monitor
      </Link>
    </div>
  </div>
      </section>
      
<section className="mt-8">
  <h2 className="text-2xl font-bold mb-4">Key Performance Indicators (KPIs) & Recent Activities</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4">Student Engagement</h3>
      <div className="flex items-center justify-center">
        <div className="w-32 h-32">
          <CircularProgressbar
            value={95}
            text={`95%`}
            styles={buildStyles({
              textSize: '16px',
              pathColor: '#3B82F6',
              textColor: '#1E293B',
              trailColor: '#E5E7EB',
            })}
          />
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center">Average attendance rate: 95%</p>
      <p className="text-sm text-gray-500 text-center">Average participation rate: 90%</p>
    </div>

    {/* Pending Approvals Card */}
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
        Pending Approvals
        <span className="text-blue-600 text-sm">3 New Requests</span>
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="font-medium">New Teacher Account</p>
            <p className="text-sm text-gray-500">Sarah Johnson</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200">
              Approve
            </button>
            <button className="px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200">
              Deny
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div>
            <p className="font-medium">Class Creation Request</p>
            <p className="text-sm text-gray-500">Grade 10 Mathematics</p>
          </div>
          <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
            Review
          </button>
        </div>
      </div>
    </div>

    {/* Quick Actions Card */}
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <MdClass className="text-2xl text-blue-600 mb-2" />
          <span className="text-sm font-medium">Create New Class</span>
        </button>
        <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <FaUsers className="text-2xl text-green-600 mb-2" />
          <span className="text-sm font-medium">Add User</span>
        </button>
        <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          <MdAssignment className="text-2xl text-purple-600 mb-2" />
          <span className="text-sm font-medium">New Assessment</span>
        </button>
        <button className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
          <FaClipboardList className="text-2xl text-cyan-600 mb-2" />
          <span className="text-sm font-medium">Generate Report</span>
        </button>
      </div>
    </div>
  </div>
</section>

    </>
  );
}