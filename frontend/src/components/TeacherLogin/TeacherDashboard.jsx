import { useState, useEffect } from "react";
import { FaHome, FaSignOutAlt, FaBars, FaSearch, FaFileUpload, FaChartBar, FaUserGraduate, FaClipboardCheck, FaComments, FaFileImport } from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdOutlineAutoAwesome, MdOutlineFeedback } from 'react-icons/md';
import { BiAnalyse, BiBookAdd } from 'react-icons/bi';
import assessalogo from "./logo.png";
import AssessmentUploadForm from './AssessmentUploadForm';
import AssessmentLibrary from "./AssessmentLibrary";
import "tailwindcss/tailwind.css";

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard', 'library', 'progress', etc.
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    const storedInfo = localStorage.getItem("teacherInfo");
    if (storedInfo) {
      setTeacherInfo(JSON.parse(storedInfo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacherInfo");
    window.location.href = "/teacher-login";
  };

  const renderContent = () => {
    switch(currentView) {
      case "library":
        return <AssessmentLibrary onBack={() => setCurrentView("dashboard")} />;
      case "progress":
        return <StudentProgress />;
      case "feedback":
        return <FeedbackHub />;
      case "dashboard":
      default:
        return (
          <DashboardHome 
            setCurrentView={setCurrentView}
            setShowUploadForm={setShowUploadForm}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 bg-gradient-to-b from-blue-50 to-blue-100 text-gray-800 w-64 p-6 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-xl`}>
        <button className="absolute top-4 right-4 md:hidden text-gray-600 hover:text-blue-600 transition" onClick={() => setSidebarOpen(false)}>
          ✖
        </button>
        <div className="flex items-center justify-center mb-8">
          <img src={assessalogo} alt="Logo" className="w-32" />
        </div>
        <nav className="space-y-2">
          <button 
            onClick={() => setCurrentView("dashboard")}
            className={`flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left ${currentView === "dashboard" ? "bg-blue-200/50 text-blue-800" : "text-gray-700 hover:bg-blue-200/50 hover:text-blue-800"}`}
          >
            <FaHome className="text-xl" />
            <span className="text-lg font-medium">Home</span>
          </button>
          {/* Progress Tracking - No onClick */}
          <div className="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700">
            <FaChartBar className="text-xl" />
            <span className="text-lg font-medium">Progress Tracking</span>
          </div>
          
          {/* Feedback Hub - No onClick */}
          <div className="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700">
            <MdOutlineFeedback className="text-xl" />
            <span className="text-lg font-medium">Feedback Hub</span>
          </div>
          
          {/* AI Analysis - No onClick */}
          <div className="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700">
            <BiAnalyse className="text-xl" />
            <span className="text-lg font-medium">AI Analysis</span>
          </div>
        </nav>
        <div className="mt-8 border-t border-blue-200 pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left text-red-500 hover:bg-red-100"
          >
            <FaSignOutAlt className="text-xl" />
            <span className="text-lg font-medium">Logout</span>
          </button>
        </div>
      </aside>
      
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
            <div className="text-right">
              <p className="font-bold text-gray-800">
                {teacherInfo?.name || "Loading..."}
              </p>
              <p className="text-sm text-gray-500">
                {teacherInfo?.role || "Teacher"}
              </p>
            </div>
            <IoPersonCircleOutline className="text-4xl text-blue-600 transition-transform hover:scale-110" />
          </div>
        </div>

        {/* Dynamic Content Area */}
        {currentView === "dashboard" && (
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
        )}

        {showUploadForm && <AssessmentUploadForm onClose={() => setShowUploadForm(false)} />}
        {renderContent()}
      </main>
    </div>
  );
}

function DashboardHome({ setCurrentView, setShowUploadForm }) {
  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assessment Library Card */}
        <div
          onClick={() => setCurrentView("library")}
          className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-indigo-300 to-cyan-400 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between"
        >
          <div>
            <p className="text-3xl font-bold mb-1">28</p>
            <p>Assessment Library</p>
            <p className="text-xs mt-1 opacity-90">+5 new this week</p>
          </div>
          <BiBookAdd className="text-4xl opacity-80" />
        </div>

        {/* Upload Assessments Card */}
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
        </div>
      </section>
    </>
  );
}

// Keep your other components (StudentProgress, FeedbackHub) the same as before

// Page Components (keep your existing ones)
function AssessmentTemplates() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Assessment Template Library</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <FaFileUpload /> Upload New Template
        </button>
      </div>
    </div>
  );
}

function StudentAssessments() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student-Generated Assessments</h2>
    </div>
  );
}

function StudentProgress() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Progress Tracking</h2>
    </div>
  );
}

function FeedbackHub() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Assessment Feedback Hub</h2>
    </div>
  );
}