import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaHome, FaBook, FaChartBar, FaTasks, FaSignOutAlt, FaBars, FaBell, FaSearch, FaRobot } from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdSchool, MdClass, MdAssignment, MdQuiz, MdMenuBook } from 'react-icons/md';
import assessalogo from "./logo.png";
import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";




const data = [
  { name: 'January', value: 20 },
  { name: 'March', value: 35 },
  { name: 'May', value: 60 },
  { name: 'July', value: 90 },
  { name: 'September', value: 50 },
  { name: 'December', value: 70 },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar visibility
  const [username, setUsername] = useState(""); // State for username
  const navigate = useNavigate();

  // Fetch username from localStorage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")); // Retrieve user info
    console.log("User Info from localStorage:", userInfo); // Debugging

    if (userInfo && userInfo.name) { // Access name directly from userInfo
      setUsername(userInfo.name); // Set the username
    }
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-r from-teal-400 to-purple-500">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 bg-white w-64 p-5 flex flex-col justify-between transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl`}>
        <button className="absolute top-4 right-4 md:hidden text-gray-600 hover:text-teal-600 transition" onClick={() => setSidebarOpen(false)}>
          ✖
        </button>
        <div className="flex justify-center mb-6">
          <img src={assessalogo} alt="Assessa Logo" className="w-28" />
        </div>
        <nav className="space-y-4">
          <a href="#" className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition">
            <FaHome className="text-xl" />
            <span className="text-lg font-medium">Home</span>
          </a>
          <a href="#" className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition">
            <FaBook className="text-xl" />
            <span className="text-lg font-medium">Assessments</span>
          </a>
          <a href="#" className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition">
            <FaChartBar className="text-xl" />
            <span className="text-lg font-medium">Progress</span>
          </a>
          <a href="#" className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition">
            <FaTasks className="text-xl" />
            <span className="text-lg font-medium">Study Plan</span>
          </a>
        </nav>
        <div className="flex-grow" />
        <a href="#" className="flex items-center space-x-2 py-3 px-4 rounded-lg text-red-500 hover:bg-red-100 transition">
          <FaSignOutAlt className="text-xl" />
          <span className="text-lg font-medium">Logout</span>
        </a>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-white rounded-tl-lg shadow-inner">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-start md:items-center mb-8">
          <div className="flex items-center w-full md:w-auto">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="md:hidden p-2 text-gray-600 hover:text-teal-600 transition-all"
            >
              <FaBars className="text-2xl" />
            </button>
            <div className="md:hidden flex-1 ml-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search your course"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search your course"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Profile and Notifications Section */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-teal-600 transition-all">
              <FaBell className="text-2xl" />
            </button>
            <div className="flex items-center space-x-2 group cursor-pointer">
              <IoPersonCircleOutline className="text-4xl text-teal-600 transition-transform hover:scale-110" />
              <div className="text-right">
                <p className="font-bold text-gray-800">{username || "Student"}</p>
                <p className="text-sm text-gray-500">Student</p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
  <h2 className="text-4xl font-bold text-gray-700 mb-2">
    Welcome,{" "}
    <span className="relative inline-block">
      <span className="font-sans bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
        {username || "Student"}
      </span>
      <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-purple-600"></span>
    </span>
    !
  </h2>
  <p className="text-lg text-gray-600">
    Your AI-Powered Assessment Dashboard
  </p>
</div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mb-8">
          <div className="bg-gradient-to-br from-purple-300 to-purple-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
            <MdSchool className="text-white text-[40px] mb-[10px]" />
            <p className="text-3xl font-bold">1</p>
            <p className="text-base">Assessment Hub</p>
          </div>
          <div className="bg-gradient-to-br from-teal-300 to-teal-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
            <MdMenuBook className="text-white text-[40px] mb-[10px]" />
            <p className="text-3xl font-bold">50</p>
            <p className="text-base">Subject Insights</p>
          </div>
          <div className="bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
            <FaRobot className="text-white text-[40px] mb-[10px]" />
            <p className="text-base">Problem Solving Agent</p>
              <button
                  onClick={() => navigate("/problemsolving-agent")}
                  className="mt-4 px-4 py-2 bg-white text-amber-600 font-bold rounded-full hover:bg-amber-300 hover:text-white transition"
              >
                Try AI Agent
              </button>
          </div>
          <div className="bg-gradient-to-br from-lime-300 to-lime-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
            <MdQuiz className="text-white text-[40px] mb-[10px]" />
            <p className="text-3xl font-bold">10</p>
            <p className="text-base">Quiz Quest</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-600">Assessment Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 text-sky-700 shadow-md p-6 rounded-lg flex items-center justify-center">
            <div>
              <h3 className="text-2xl font-semibold mb-2">AI Challenge of the Day</h3>
              <p className="text-3xl font-bold text-blue-800 pl-10">3h 20m</p>
              <p className="text-sm text-gray-500">Time left to complete</p>
              {/* Progress Bar (Centered Vertically) */}
  <div className="w-full mt-4">
    <div className="bg-rose-100 h-2 rounded-full relative">
      <div className="bg-indigo-600 h-2 w-2/3 rounded-full"></div>
    </div>
  </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}