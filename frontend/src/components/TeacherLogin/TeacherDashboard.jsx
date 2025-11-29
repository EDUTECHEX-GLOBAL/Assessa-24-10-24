// TeacherDashboard.jsx (updated)
import { useState, useEffect } from "react";
import { FaHome, FaSignOutAlt, FaBars, FaSearch, FaFileUpload, FaChartBar, FaUserGraduate, FaClipboardCheck, FaComments, FaFileImport, } from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdOutlineAutoAwesome, MdOutlineFeedback } from 'react-icons/md';
import { BiAnalyse, BiBookAdd } from 'react-icons/bi';
import assessalogo from "./logo.png";
import AssessmentUploadForm from './AssessmentUploadForm';
import AssessmentLibrary from "./AssessmentLibrary";
import ProgressTracking from "./ProgressTracking";
import SatProgressTracking from "./SatProgressTracking";
import TeacherProfile from './TeacherProfile';
import "tailwindcss/tailwind.css";
import TeacherDashboardBot from './TeacherDashboardBot';
import FeedbackHub from "./FeedbackHub";
import SatFeedbackHub from "./SatFeedbackHub"; // <-- NEW
import UploadAssessmentModal from './UploadAssessmentModal';
import ReviewAssessmentPage from './ReviewAssessmentPage';
import { FiBookOpen } from 'react-icons/fi';

// In your TeacherDashboard.jsx, add these imports:
import TeacherNotificationBell from './teacherNotificationBell';
import TeacherNotificationPage from './teacherNotificationPage';
import TasksPage from "./TasksPage";
import { FaRegCalendarAlt } from "react-icons/fa";
// --- DashboardHome now receives the counts as props ---
function DashboardHome({ setCurrentView, setShowUploadForm, assessmentLibraryCount, uploadAssessmentsCount, newThisWeekCount, satAssessmentCount, setSelectedAssessmentId, upcomingTasks }) {

  // Calculate standard assessments (assuming assessmentLibraryCount includes only standard assessments)
  const standardAssessmentCount = assessmentLibraryCount;
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [insightsError, setInsightsError] = useState(null);
  const [showAllInsights, setShowAllInsights] = useState(false);
const [allInsights, setAllInsights] = useState([]);

useEffect(() => {
  async function fetchInsights() {
    try {
      setLoadingInsights(true);
      setInsightsError(null);

      const token = localStorage.getItem("token");
      const API_BASE_URL = process.env.REACT_APP_API_URL || "";

      const res = await fetch(`${API_BASE_URL}/api/teachers/insights`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load insights");

      const data = await res.json();
      setInsights(data.insights || []);
      setAllInsights(data.allInsights || []);

    } catch (err) {
      setInsightsError("Unable to load insights right now.");
    } finally {
      setLoadingInsights(false);
    }
  }

  fetchInsights();
}, []);

  return (
    <>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assessment Library Card */}
        <div
          onClick={() => setCurrentView("library")}
          className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-indigo-300 to-cyan-400 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between"
        >
          <div>
            <p className="text-lg font-semibold mb-1">Assessment Library</p>
            <p className="text-sm">
              <span className="font-regular text-xs">Standard:</span> {standardAssessmentCount}
            </p>
            <p className="text-sm">
              <span className="font-regular text-xs">SAT:</span> {satAssessmentCount}
            </p>
            <p className="text-xs mt-2 opacity-90">+{newThisWeekCount} new this week</p>
          </div>
          <BiBookAdd className="text-4xl opacity-80" />
        </div>

        {/* Upload Assessments Card */}
        <div 
          className="bg-gradient-to-br from-red-300 to-pink-400 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setShowUploadForm(true)}
        >
          <div>
            <p className="text-lg font-semibold mb-1">Upload Assessments</p>
            <p className="text-sm">
              <span className="font-regular text-xs text-white">Standard:</span> {uploadAssessmentsCount}
            </p>
            <p className="text-sm">
              <span className="font-regular text-xs text-white">SAT:</span> {satAssessmentCount}
            </p>
          </div>
          <FaFileImport className="text-4xl opacity-80" />
        </div>


        <div 
            onClick={() => {
              setSelectedAssessmentId("688c8ebd4cacce66b68194f2"); // placeholder
              setCurrentView("review");
            }}

          className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-teal-300 to-green-500 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between"
        >
          <div>
            <p className="text-lg font-semibold">Review Assessments</p>
            <p className="text-xs mt-1 opacity-90">Teacher Review Portal</p>
          </div>
       <FaClipboardCheck className="text-4xl opacity-80" />


        </div>



{/* Smart Review Tasks (Simple & Clean) */}
<div
  onClick={() => setCurrentView("tasks")}
  className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-md p-6 h-44 rounded-lg flex items-center justify-between"
>
  <div>
    <p className="text-lg font-semibold mb-1">Smart Review Tasks</p>

    {/* Short clean caption */}
    <p className="text-sm opacity-90">Quick review assistant</p>

  </div>

  <FaRegCalendarAlt className="text-4xl opacity-80" />
</div>


      </section>

{/* AI Insights Section */}
<section className="mt-8">
  <div className="flex items-center justify-between mb-5">
    <h3 className="text-2xl font-semibold text-gray-700">AI Teaching Insights</h3>
    {insights.length > 0 && (
      <button
        onClick={() => setShowAllInsights(!showAllInsights)}
        className="text-sm bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 px-4 py-2 rounded-lg hover:shadow-sm transition-all duration-200 border border-blue-200"
      >
        {showAllInsights ? "Show Less" : "Show All"}
      </button>
    )}
  </div>

  {loadingInsights ? (
    <div className="p-5 bg-white/80 rounded-xl shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  ) : insightsError ? (
    <div className="p-4 bg-white/80 rounded-xl shadow-sm border border-red-100">
      <p className="text-red-500 text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        {insightsError}
      </p>
    </div>
  ) : insights.length === 0 ? (
    <div className="p-6 bg-white/80 rounded-xl shadow-sm border border-gray-100 text-center">
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-100">
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <p className="text-gray-600 text-sm">No insights yet. Ask students to attempt assessments.</p>
    </div>
  ) : (
    <div className="space-y-4">
      {/* Top 3 Insights */}
      {insights.map((insight, index) => {
        const topThreeColors = [
          { 
            bg: "bg-blue-50", 
            border: "border-blue-200",
            bar: "bg-blue-400",
            title: "text-blue-700",
            iconBg: "bg-blue-100 text-blue-600"
          },
          { 
            bg: "bg-green-50", 
            border: "border-green-200",
            bar: "bg-green-400",
            title: "text-green-700",
            iconBg: "bg-green-100 text-green-600"
          },
          { 
            bg: "bg-purple-50", 
            border: "border-purple-200",
            bar: "bg-purple-400",
            title: "text-purple-700",
            iconBg: "bg-purple-100 text-purple-600"
          }
        ];

        const style = topThreeColors[index] || topThreeColors[0];

        return (
          <div 
            key={index} 
            className={`relative p-5 rounded-xl border shadow-sm ${style.bg} ${style.border}`}
          >
            {/* Colored accent bar */}
            <div className={`absolute left-0 top-0 w-2.5 h-full rounded-l-xl ${style.bar}`} />

            <div className="flex items-start gap-4 ml-3">
              {/* Icon with background */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.iconBg} shadow-sm`}>
                <span className="text-base">{insight.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className={`text-base font-semibold mb-2 ${style.title}`}>
                  {insight.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Expanded Insights */}
      {showAllInsights && allInsights.length > 3 && (
        <div className="mt-5 space-y-4">
          <div className="border-t border-gray-200 pt-5">
            <h4 className="text-base font-semibold text-gray-700 mb-4">Additional Insights</h4>
            
            {allInsights.slice(3).map((insight, i) => {
              const moreColors = [
                { 
                  bg: "bg-amber-50", 
                  border: "border-amber-200",
                  bar: "bg-amber-400",
                  title: "text-amber-700",
                  iconBg: "bg-amber-100 text-amber-600"
                },
                { 
                  bg: "bg-pink-50", 
                  border: "border-pink-200",
                  bar: "bg-pink-400",
                  title: "text-pink-700",
                  iconBg: "bg-pink-100 text-pink-600"
                },
                { 
                  bg: "bg-teal-50", 
                  border: "border-teal-200",
                  bar: "bg-teal-400",
                  title: "text-teal-700",
                  iconBg: "bg-teal-100 text-teal-600"
                }
              ];

              const style = moreColors[i % moreColors.length];

              return (
                <div 
                  key={i} 
                  className={`relative p-4 rounded-lg border shadow-sm ${style.bg} ${style.border}`}
                >
                  <div className={`absolute left-0 top-0 w-2 h-full rounded-l-lg ${style.bar}`} />

                  <div className="flex items-start gap-3 ml-2">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${style.iconBg}`}>
                      <span className="text-sm">{insight.icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h5 className={`text-sm font-semibold mb-1 ${style.title}`}>
                        {insight.title}
                      </h5>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )}
</section>

    </>
  );
}



// --- Main Component ---
export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);


  const [assessmentLibraryCount, setAssessmentLibraryCount] = useState(0);
  const [uploadAssessmentsCount, setUploadAssessmentsCount] = useState(0);
  const [newThisWeekCount, setNewThisWeekCount] = useState(0);
  const [satAssessmentCount, setSatAssessmentCount] = useState(0); 
  const [progressMenuOpen, setProgressMenuOpen] = useState(false);
  const [feedbackMenuOpen, setFeedbackMenuOpen] = useState(false); // <-- NEW
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");



  useEffect(() => {
    const storedInfo = localStorage.getItem("teacherInfo");
    if (storedInfo) {
      setTeacherInfo(JSON.parse(storedInfo));
    }
  }, []);

 useEffect(() => {
  async function fetchTasks() {
    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = process.env.REACT_APP_API_URL || "";

      const res = await fetch(`${API_BASE_URL}/api/assessments/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      // ✅ Updated logic (no parenthesis errors)
      if (Array.isArray(data.tasks)) {
        setUpcomingTasks(data.tasks);
      } else if (Array.isArray(data)) {
        setUpcomingTasks(data);
      } else {
        console.error("Unexpected tasks data:", data);
      }
    } catch (err) {
      console.error("Failed to fetch upcoming tasks:", err);
    }
  }

  fetchTasks();
}, []);



  useEffect(() => {
    async function fetchDashboardCounts() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.replace(/^"|"$/g, "")}`
        };

        const API_BASE_URL = process.env.REACT_APP_API_URL || "";

        const [libRes, uploadRes, newRes, satRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/assessments/library/count`, { method: "GET", headers }),
          fetch(`${API_BASE_URL}/api/assessments/uploaded/count`, { method: "GET", headers }),
          fetch(`${API_BASE_URL}/api/assessments/library/new-this-week/count`, { method: "GET", headers }),
          fetch(`${API_BASE_URL}/api/sat-assessments/library/count`, { method: "GET", headers }), // 👈 SAT count
        ]);

        const libData = await libRes.json();
        const uploadData = await uploadRes.json();
        const newData = await newRes.json();
        const satData = await satRes.json();

        setAssessmentLibraryCount(libData.count);
        setUploadAssessmentsCount(uploadData.count);
        setNewThisWeekCount(newData.count);
        setSatAssessmentCount(satData.count || 0);
      } catch (err) {
        console.error("Failed to fetch dashboard counts", err);
      }
    }
    fetchDashboardCounts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("teacherInfo");
    window.location.href = "/teacher-login";
  };


  
  // Render content based on currentView:
  const renderContent = () => {
    switch (currentView) {
      case "library":
        return <AssessmentLibrary onBack={() => setCurrentView("dashboard")} />;
      case "progress-standard":
        return <ProgressTracking type="standard" onBack={() => setCurrentView("dashboard")} />;
      case "progress-sat":
        return <SatProgressTracking onBack={() => setCurrentView("dashboard")} />;
      case "feedback-standard": // teacher view for standard feedbacks
        return <FeedbackHub onBack={() => setCurrentView("dashboard")} />;
      case "feedback-sat": // teacher view for SAT feedbacks
        return <SatFeedbackHub onBack={() => setCurrentView("dashboard")} />;
      case "profile":
        return (
          <TeacherProfile
            teacherInfo={teacherInfo}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      case "review":
        return (
          <ReviewAssessmentPage
            assessmentId={selectedAssessmentId}
            teacherInfo={teacherInfo}
            onBack={() => setCurrentView("dashboard")}
          />
        );
       case "tasks":
  const filteredTasks = upcomingTasks.filter((task) => {
    const matchesSearch =
      task.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assessmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    const matchesSubject =
      subjectFilter === "all" || task.subject === subjectFilter;

    const matchesGrade =
      gradeFilter === "all" || String(task.grade) === String(gradeFilter);

    return (
      matchesSearch &&
      matchesPriority &&
      matchesSubject &&
      matchesGrade
    );
  });

  return (
    <div className="space-y-6 scale-[0.97] origin-top-left animate-fade-in">

      {/* Back Button */}
      <button
        onClick={() => setCurrentView("dashboard")}
        className="px-3 py-1.5 text-sm rounded-lg 
          bg-gradient-to-r from-pink-100 to-purple-100 
          text-purple-700 shadow hover:shadow-md hover:scale-105 
          transition-all duration-200"
      >
        ← Back to Dashboard
      </button>

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-700 flex items-center gap-2 animate-slide-down">
        Smart Review Tasks
      </h2>

      {/* Search + Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3 
        bg-white/70 p-4 rounded-xl shadow-sm border border-gray-200
        animate-pop-in">

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, subject, assessment..."
            className="px-4 py-2 w-72 rounded-full border border-gray-300 bg-white 
              focus:ring-2 focus:ring-indigo-400 shadow-sm transition-all"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-400" />
        </div>

        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 rounded-full bg-pink-50 border border-pink-200 
            text-pink-700 shadow-sm hover:bg-pink-100 transition-all cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Subject */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-2 rounded-full bg-purple-50 border border-purple-200 
            text-purple-700 shadow-sm hover:bg-purple-100 transition-all cursor-pointer"
        >
          <option value="all">All Subjects</option>
          <option value="Math">Math</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
          <option value="Social">Social</option>
        </select>

        {/* Grade */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-4 py-2 rounded-full bg-blue-50 border border-blue-200 
            text-blue-700 shadow-sm hover:bg-blue-100 transition-all cursor-pointer"
        >
          <option value="all">All Grades</option>
          {[6, 7, 8, 9, 10, 11, 12].map((g) => (
            <option value={g} key={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      {/* Smart Task Cards */}
      <div className="space-y-6">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 text-lg text-center mt-10 animate-fade-in">
            No tasks pending 🎉 Students are doing great!
          </p>
        ) : (
          filteredTasks.map((task, index) => {
            const priorityColor =
              task.priority === "high"
                ? "bg-red-100 text-red-800 border-red-300"
                : task.priority === "medium"
                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                : "bg-green-100 text-green-800 border-green-300";

            return (
              <div
                key={task.id}
                className="p-5 bg-white rounded-xl shadow border border-gray-200 
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-200
                  animate-fade-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {task.assessmentTitle}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {task.assessmentType === "sat" ? "SAT" : "Standard"} · {task.subject} · Grade {task.grade}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColor}`}
                  >
                    {task.priority.toUpperCase()} PRIORITY
                  </span>
                </div>

                {/* Student */}
                <p className="mt-3 text-gray-700 font-medium">
                  👤 {task.studentName} ({task.studentClass})
                </p>

                {/* Score & Time */}
                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <p className="bg-blue-50 px-3 py-2 rounded-lg font-medium">
                    Score: {task.score}/{task.totalMarks}
                  </p>
                  <p className="bg-purple-50 px-3 py-2 rounded-lg font-medium">
                    Percentage: {task.percentage}%
                  </p>
                  <p className="bg-orange-50 px-3 py-2 rounded-lg font-medium">
                    Time: {task.timeTaken}s
                  </p>
                </div>

                {/* Weak Topics */}
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">Mistakes: {task.mistakes}</p>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {task.weakTopics.map((t, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded-md text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fast Warning */}
                {task.suspiciousFast && (
                  <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-center gap-2">
                    ⚠️ Attempt completed unusually fast — review carefully!
                  </div>
                )}

                {/* Submitted */}
                <p className="text-xs text-gray-400 mt-3">
                  Submitted: {new Date(task.submittedAt).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );


       case "notifications":
  return (
   <TeacherNotificationPage
  onBackHome={() => setCurrentView("dashboard")}
  teacherToken={
    teacherInfo?.token ||
    JSON.parse(localStorage.getItem("teacherInfo") || "null")?.token
  }
  setCurrentView={setCurrentView}  
/>

  );


      case "dashboard":
      default:
        return (
          <DashboardHome
            setCurrentView={setCurrentView}
            setShowUploadForm={setShowUploadForm}
            assessmentLibraryCount={assessmentLibraryCount}
            uploadAssessmentsCount={uploadAssessmentsCount}
            newThisWeekCount={newThisWeekCount}
            satAssessmentCount={satAssessmentCount}
            setSelectedAssessmentId={setSelectedAssessmentId}
            upcomingTasks={upcomingTasks}  
          />
        );
    }
  };


  return (
   <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
<aside
  className={`fixed md:relative z-50 bg-gradient-to-b from-blue-50 to-blue-100 text-gray-800 w-64 p-6 transition-transform ${
    sidebarOpen ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 shadow-xl h-screen overflow-y-auto scrollbar-thin scrollbar-track-blue-50 scrollbar-thumb-blue-200`}
>

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

  {/* Collapsible Progress Tracking Dropdown */}
<div className="mb-2">
  <button 
    onClick={() => setProgressMenuOpen(!progressMenuOpen)}
    className={`flex items-center justify-between w-full py-3 px-4 rounded-lg text-left transition-all duration-200 ${
      progressMenuOpen 
        ? "bg-blue-50 text-blue-800" 
        : "text-gray-700 hover:bg-blue-50/80 hover:text-blue-800"
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-1.5 rounded-lg ${
        progressMenuOpen ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
      }`}>
        <FaChartBar className="text-lg" />
      </div>
      <span className="text-lg font-medium">Progress Tracking</span>
    </div>
    <span className={`transition-transform duration-200 ${
      progressMenuOpen ? "rotate-180 text-blue-600" : "text-gray-500"
    }`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </span>
  </button>
  
  {progressMenuOpen && (
    <div className="ml-12 mt-1 space-y-2">
      <button 
        onClick={() => setCurrentView("progress-standard")}
        className={`flex items-center w-full py-2.5 px-3 rounded-lg transition-all duration-150 ${
          currentView === "progress-standard" 
            ? "bg-blue-100/80 text-blue-800 font-medium" 
            : "hover:bg-gray-100/50 text-gray-700 hover:text-blue-700"
        }`}
      >
        <div className={`w-6 h-6 mr-2 flex items-center justify-center rounded-md ${
          currentView === "progress-standard" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-600"
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span>Standard Assessments</span>
      </button>
      
      <button 
        onClick={() => setCurrentView("progress-sat")}
        className={`flex items-center w-full py-2.5 px-3 rounded-lg transition-all duration-150 ${
          currentView === "progress-sat" 
            ? "bg-blue-100/80 text-blue-800 font-medium" 
            : "hover:bg-gray-100/50 text-gray-700 hover:text-blue-700"
        }`}
      >
        <div className={`w-6 h-6 mr-2 flex items-center justify-center rounded-md ${
          currentView === "progress-sat" 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-600"
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span>SAT Assessments</span>
      </button>
    </div>
  )}
</div>

  {/* Feedback Hub Dropdown */}
  <div className="mb-2">
    <button
      onClick={() => setFeedbackMenuOpen(!feedbackMenuOpen)}
      className={`flex items-center justify-between w-full py-3 px-4 rounded-lg text-left transition-all duration-200 ${
        feedbackMenuOpen ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-blue-50/80 hover:text-blue-800"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-1.5 rounded-lg ${feedbackMenuOpen ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
          <MdOutlineFeedback className="text-lg" />
        </div>
        <span className="text-lg font-medium">Feedback Hub</span>
      </div>
      <span className={`transition-transform duration-200 ${feedbackMenuOpen ? "rotate-180 text-blue-600" : "text-gray-500"}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    </button>

    {feedbackMenuOpen && (
      <div className="ml-12 mt-1 space-y-2">
        <button
          onClick={() => setCurrentView("feedback-standard")}
          className={`flex items-center w-full py-2.5 px-3 rounded-lg transition-all duration-150 ${
            currentView === "feedback-standard" ? "bg-blue-100/80 text-blue-800 font-medium" : "hover:bg-gray-100/50 text-gray-700 hover:text-blue-700"
          }`}
        >
          <div className={`w-6 h-6 mr-2 flex items-center justify-center rounded-md ${currentView === "feedback-standard" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
            <FiBookOpen size={14} />
          </div>
          <span>Standard Feedbacks</span>
        </button>

        <button
          onClick={() => setCurrentView("feedback-sat")}
          className={`flex items-center w-full py-2.5 px-3 rounded-lg transition-all duration-150 ${
            currentView === "feedback-sat" ? "bg-blue-100/80 text-blue-800 font-medium" : "hover:bg-gray-100/50 text-gray-700 hover:text-blue-700"
          }`}
        >
          <div className={`w-6 h-6 mr-2 flex items-center justify-center rounded-md ${currentView === "feedback-sat" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
            <FiBookOpen size={14} />
          </div>
          <span>SAT Feedbacks</span>
        </button>
      </div>
    )}
  </div>

  <div className="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700">
    <BiAnalyse className="text-xl" />
    <span className="text-lg font-medium">AI Analysis</span>
  </div>

  <button 
    onClick={() => setCurrentView("profile")}
    className={`flex items-center space-x-3 py-3 px-4 rounded-lg w-full text-left ${currentView === "profile" ? "bg-blue-200/50 text-blue-800" : "text-gray-700 hover:bg-blue-200/50 hover:text-blue-800"}`}
  >
    <IoPersonCircleOutline className="text-xl" />
    <span className="text-lg font-medium">My Profile</span>
  </button>
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

     <main className="flex-1 flex flex-col overflow-hidden">

  {/* --- Sticky Top Bar (Search + Bell + Profile) --- */}
  <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b shadow-sm">
    <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 p-4 md:p-6">

      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-all"
      >
        <FaBars className="text-2xl" />
      </button>

      {/* Search Input */}
      <div className="flex-1 max-w-2xl w-full">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search student assessments..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notification Bell + Profile */}
      <div className="flex items-center space-x-4 cursor-pointer">
        <TeacherNotificationBell 
          setSelectedSection={setCurrentView}
          teacherToken={teacherInfo?.token || JSON.parse(localStorage.getItem("teacherInfo"))?.token}
        />

        <div className="text-right">
          <p className="font-bold text-gray-800">{teacherInfo?.name || "Loading..."}</p>
          <p className="text-sm text-gray-500">{teacherInfo?.role || "Teacher"}</p>
        </div>

        <IoPersonCircleOutline className="text-4xl text-blue-600 transition-transform hover:scale-110" />
      </div>

    </div>
  </div>

  {/* --- Scrollable Page Content --- */}
  <div className="flex-1 overflow-y-auto p-4 md:p-8">

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
        <p className="text-lg text-gray-600">Your AI-Powered Teaching Dashboard</p>
      </div>
    )}

    {showUploadForm && <UploadAssessmentModal onClose={() => setShowUploadForm(false)} />}

    {renderContent()}

  </div>

</main>

      {teacherInfo?._id && <TeacherDashboardBot userId={teacherInfo._id} />}

    </div>
  );
}
