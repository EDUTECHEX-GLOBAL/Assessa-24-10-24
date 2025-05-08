import { Routes, Route } from "react-router-dom";
import { FaHome, FaSignOutAlt, FaBars, FaSearch, FaFileUpload, FaChartBar, FaUserGraduate, FaClipboardCheck, FaComments, FaFileImport } from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdOutlineAutoAwesome, MdOutlineFeedback } from 'react-icons/md';
import { BiAnalyse, BiBookAdd } from 'react-icons/bi';
import assessalogo from "./logo.png";
import { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import AssessmentUploadForm from './AssessmentUploadForm';
import { useNavigate } from "react-router-dom";

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const navigate = useNavigate(); // Add this import at the top
   // Add this logout handler function
  const handleLogout = async () => {
    try {
      // Optional: Call your backend logout endpoint if you have one
      // await axios.post(`${process.env.REACT_APP_API_URL}/api/teachers/logout`);
      
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("teacherInfo");
      
      // Redirect to login page
      navigate("/teacher-login"); // or window.location.href = "/teacher-login"
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear storage and redirect even if API fails
      localStorage.removeItem("token");
      localStorage.removeItem("teacherInfo");
      navigate("/teacher-login");
    }
  };
  // Load teacher info on component mount
  useEffect(() => {
    const storedInfo = localStorage.getItem("teacherInfo");
    if (storedInfo) {
      setTeacherInfo(JSON.parse(storedInfo));
    }
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Header */}
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
                  placeholder="Search assessments..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search student assessments..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 group cursor-pointer w-full md:w-auto justify-end">
    <IoPersonCircleOutline className="text-4xl text-blue-600 transition-transform hover:scale-110" />
    <div className="text-right">
      <p className="font-bold text-gray-800">
        {teacherInfo?.name || "Loading..."}
      </p>
      <p className="text-sm text-gray-500">
        {teacherInfo?.role || "Teacher"}
      </p>
    </div>
  </div>
        </div>
        <div className="mb-8">
    <h2 className="text-4xl font-bold text-gray-700 mb-2">
      Welcome,{" "}
      <span className="relative inline-block">
        <span className="font-sans bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          {teacherInfo?.name || "Teacher"}
        </span>
        <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></span>
      </span>
      !
    </h2>
    <p className="text-lg text-gray-600">
      Your AI-Powered Teaching Dashboard
    </p>
  </div>

        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/templates" element={<AssessmentTemplates />} />
          <Route path="/monitor" element={<StudentAssessments />} />
          <Route path="/progress" element={<StudentProgress />} />
          <Route path="/feedback" element={<FeedbackHub />} />
        </Routes>
      </main>
    </div>
  );
}

function Sidebar({ sidebarOpen, setSidebarOpen, handleLogout }) {
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
        <NavItem icon={FaChartBar} label="Progress Tracking" path="/progress" />
        <NavItem icon={MdOutlineFeedback} label="Feedback Hub" path="/feedback" />
        <NavItem icon={BiAnalyse} label="AI Analysis" path="/analysis" />
      </nav>
      <div className="mt-8 border-t border-blue-200 pt-6">
      <NavItem 
        icon={FaSignOutAlt} 
        label="Logout" 
        isLogout 
        handleLogout={handleLogout} // Pass the handler here
        className="hover:bg-blue-200/50 transition-all"
      />
      </div>
    </aside>
  );
}

// Update the NavItem component definition to receive handleLogout
function NavItem({ icon: Icon, label, path, isLogout, className = "", handleLogout }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isLogout) {
      // Confirm before logging out
      if (window.confirm("Are you sure you want to log out?")) {
        handleLogout();
      }
    } else {
      navigate(path);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-center space-x-3 py-3 px-4 rounded-lg 
        ${isLogout ? 
          "text-red-500 hover:bg-red-100" : 
          "text-gray-700 hover:bg-blue-200/50 hover:text-blue-800"
        } 
        transition-all group ${className} cursor-pointer`
      }
    >
      <Icon className="text-xl" />
      <span className="text-lg font-medium">{label}</span>
    </div>
  );
}

function DashboardHome() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const navigate = useNavigate(); // Add this here

  return (
    <>
    {showUploadForm && <AssessmentUploadForm onClose={() => setShowUploadForm(false)} />}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assessment Templates Card */}
        <div
          onClick={() => navigate("/assessment-library")}
          className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-indigo-300 to-cyan-400 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between"
        >
          <div>
            <p className="text-3xl font-bold mb-1">28</p>
            <p>Assessment Library</p>
            <p className="text-xs mt-1 opacity-90">+3 new this week</p>
          </div>
          <BiBookAdd className="text-4xl opacity-80" />
        </div>

        {/* upload Assessments Card */}
        <div 
          className="bg-gradient-to-br from-red-300 to-pink-400 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setShowUploadForm(true)}
        >
          <div>
            <p className="text-3xl font-bold mb-1">156</p>
            <p>Upload Assessments</p>
          </div>
          <FaFileImport className="text-4xl opacity-80" />
        </div>

        {/* Completion Rate Card */}
        <div className="bg-gradient-to-br from-teal-300 to-green-500 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold mb-1">82%</p>
            <p>Average Completion</p>
            <p className="text-xs mt-1 opacity-90">5 students behind</p>
          </div>
          <FaChartBar className="text-4xl opacity-80" />
        </div>

        {/* Feedback Card */}
        <div className="bg-gradient-to-br from-orange-300 to-yellow-500 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold mb-1">47</p>
            <p>Pending Feedback</p>
            <p className="text-xs mt-1 opacity-90">12 high priority</p>
          </div>
          <FaComments className="text-4xl opacity-80" />
        </div>
      </section>
    
      {/* Recent Activity */}
      <section className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Recent Assessment Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-all">
            <div className="min-w-fit pt-1">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <BiBookAdd className="text-blue-600 text-lg" />
              </div>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-800">New Template Uploaded</p>
                <span className="text-sm text-gray-500">3h ago</span>
              </div>
              <p className="text-gray-600 mt-1">Advanced Algebra - 10 Question Format</p>
              <div className="mt-2 border-t border-gray-100 pt-2">
                <span className="text-sm text-blue-600">View Template →</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-all">
            <div className="min-w-fit pt-1">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FaUserGraduate className="text-green-600 text-lg" />
              </div>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-800">Student Assessment Submitted</p>
                <span className="text-sm text-gray-500">7h ago</span>
              </div>
              <p className="text-gray-600 mt-1">Michael B. - Science Self-Assessment</p>
              <div className="mt-2 border-t border-gray-100 pt-2">
                <span className="text-sm text-blue-600">Review Assessment →</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-all">
            <div className="min-w-fit pt-1">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <MdOutlineAutoAwesome className="text-purple-600 text-lg" />
              </div>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-start">
                <p className="font-medium text-gray-800">AI Analysis Complete</p>
                <span className="text-sm text-gray-500">1d ago</span>
              </div>
              <p className="text-gray-600 mt-1">Class 10B - Common Knowledge Gaps Identified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      {/* <section className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-all">
            <FaFileUpload className="text-blue-600 text-2xl mb-2" />
            <span className="font-medium">Upload Template</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-all">
            <FaClipboardCheck className="text-green-600 text-2xl mb-2" />
            <span className="font-medium">Review Assessments</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-all">
            <MdOutlineFeedback className="text-purple-600 text-2xl mb-2" />
            <span className="font-medium">Give Feedback</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-all">
            <BiAnalyse className="text-orange-600 text-2xl mb-2" />
            <span className="font-medium">Run Analysis</span>
          </button>
        </div>
      </section> */}
    </>
  );
}

// Page Components
function AssessmentTemplates() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Assessment Template Library</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <FaFileUpload /> Upload New Template
        </button>
      </div>
      {/* Template management components */}
    </div>
  );
}

function StudentAssessments() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student-Generated Assessments</h2>
      {/* Assessment monitoring components */}
    </div>
  );
}

function StudentProgress() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Progress Tracking</h2>
      {/* Progress tracking components */}
    </div>
  );
}

function FeedbackHub() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Assessment Feedback Hub</h2>
      {/* Feedback management components */}
    </div>
  );
}