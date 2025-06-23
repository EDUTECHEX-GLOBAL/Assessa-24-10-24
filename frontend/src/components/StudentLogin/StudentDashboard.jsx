import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  FaHome, FaBook, FaChartBar, FaTasks, FaSignOutAlt, FaBars, FaBell, FaSearch, FaRobot
} from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdSchool, MdQuiz, MdMenuBook } from 'react-icons/md';
import assessalogo from "./logo.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import Progress from "./Progress";




// ✅ Importing the AssessmentsPage component
import AssessmentsPage from './AssessmentsPage'; // Make sure this path is correct
import UserProfile from './UserProfile'; // Ensure the path is correct



const data = [
  { name: 'January', value: 20 },
  { name: 'March', value: 35 },
  { name: 'May', value: 60 },
  { name: 'July', value: 90 },
  { name: 'September', value: 50 },
  { name: 'December', value: 70 },
];



export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedSection, setSelectedSection] = useState("home"); // ✅ Track selected section
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    console.log("User Info from localStorage:", userInfo);
    if (userInfo && userInfo.name) {
      setUsername(userInfo.name);
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");
      toast.success("Logged out successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
    }
  };
  
  

  return (
    <div className="flex h-screen bg-gradient-to-r from-teal-400 to-purple-500">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 bg-white text-gray-800 w-64 p-6 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl`}>
        <button className="absolute top-4 right-4 md:hidden text-gray-600 hover:text-teal-600 transition" onClick={() => setSidebarOpen(false)}>
          ✖
        </button>
        <div className="flex justify-center mb-6">
          <img src={assessalogo} alt="Assessa Logo" className="w-28" />
        </div>

        {/* ✅ Updated sidebar links to buttons that control view via setSelectedSection */}
        <nav className="space-y-2">
          <div
  onClick={() => setSelectedSection("home")}
  className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition cursor-pointer
    ${
      selectedSection === "home"
        ? "bg-teal-100 text-teal-700 font-semibold"
        : "text-gray-700 hover:bg-teal-100 hover:text-teal-600"
    }`}
>
  <FaHome className="text-xl" />
  <span className="text-lg font-medium">Home</span>
</div>

          <div
  onClick={() => setSelectedSection("assessments")}
  className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition cursor-pointer
    ${
      selectedSection === "assessments"
        ? "bg-teal-100 text-teal-700 font-semibold"
        : "text-gray-700 hover:bg-teal-100 hover:text-teal-600"
    }`}
>
  <FaBook className="text-xl" />
  <span className="text-lg font-medium">Assessments</span>
</div>

          <div
  onClick={() => setSelectedSection("progress")}
  className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition cursor-pointer ${
    selectedSection === "progress"
      ? "bg-teal-100 text-teal-700 font-semibold"
      : "text-gray-700 hover:bg-teal-100 hover:text-teal-600"
  }`}
>
  <FaChartBar className="text-xl" />
  <span className="text-lg font-medium">Progress</span>
</div>

          <div className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition cursor-pointer">
            <FaTasks className="text-xl" />
            <span className="text-lg font-medium">Study Plan</span>
          </div>
          <div
  onClick={() => setSelectedSection("profile")}
  className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition cursor-pointer
    ${
      selectedSection === "profile"
        ? "bg-teal-100 text-teal-700 font-semibold"
        : "text-gray-700 hover:bg-teal-100 hover:text-teal-600"
    }`}
>
  <IoPersonCircleOutline className="text-xl" />
  <span className="text-lg font-medium">My Profile</span>
</div>

        </nav>

        <div className="flex-grow"></div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 py-3 px-4 rounded-lg text-red-500 hover:bg-red-100 transition w-full"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="text-lg font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ✅ Main Content Switches Based on Selected Section */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-white rounded-tl-lg shadow-inner">
        {selectedSection === "home" && (
          <>
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

              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-teal-600 transition-all">
                  <FaBell className="text-2xl" />
                </button>
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{username || "Student"}</p>
                    <p className="text-sm text-gray-500">Student</p>
                  </div>
                  <IoPersonCircleOutline className="text-4xl text-teal-600 transition-transform hover:scale-110" />
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
                  <div className="w-full mt-4">
                    <div className="bg-rose-100 h-2 rounded-full relative">
                      <div className="bg-indigo-600 h-2 w-2/3 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ✅ Conditionally render Assessments page */}
        {selectedSection === "assessments" && (
          <AssessmentsPage onBackHome={() => setSelectedSection("home")} />
        )}
        {selectedSection === "profile" && (
    <UserProfile onBackHome={() => setSelectedSection("home")} />
  )}
  {selectedSection === "progress" && (
  <Progress onBack={() => setSelectedSection("home")} />
)}

      </main>
    </div>
  );
}
