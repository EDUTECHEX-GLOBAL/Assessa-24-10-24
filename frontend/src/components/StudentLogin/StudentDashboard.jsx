import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import {
  FaHome, FaBook, FaChartBar, FaTasks, FaSignOutAlt, FaBars, FaBell, FaSearch, FaRobot, FaTimes
} from 'react-icons/fa';

import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdSchool, MdQuiz, MdMenuBook, MdFeedback } from 'react-icons/md';

import assessalogo from "./logo.png";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useLocation } from "react-router-dom";

import Progress from "./Progress";
import StudentFeedback from './StudentFeedback';
import AssessmentsPage from './AssessmentsPage';
import UserProfile from './UserProfile';
import StudentStudyPlan from './StudentStudyPlan';
import StudentDashboardBot from './studentdashboardbot';
import { Modal, Button } from "antd";

import SatStudentStudyPlan from "./SatStudentStudyPlan";
import SatStudentFeedback from './SatStudentFeedback';
import SatProgress from './SatProgress';

import StudentNotificationBell from './studentNotificationBell.jsx';
import StudentNotificationPage from './studentNotificationPage';
import DailyQuiz from "./DailyQuiz";
import DailyQuizScore from "./DailyQuizScore";
import MeritBoardPage from "./MeritBoardPage";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedSection, setSelectedSection] = useState("home");
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [studyPlanModalVisible, setStudyPlanModalVisible] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedFeedbackType, setSelectedFeedbackType] = useState(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [selectedProgressType, setSelectedProgressType] = useState("standard"); // default
  const [userInfo, setUserInfo] = useState(null);
  const [quizInfo, setQuizInfo] = useState(null);
  const [quizTypeModal, setQuizTypeModal] = useState(false);
  const [todaySubmitted, setTodaySubmitted] = useState({
    standard: false,
    sat: false
  });
  const [currentQuizType, setCurrentQuizType] = useState(null);


useEffect(() => {
  const userData = JSON.parse(localStorage.getItem("userInfo"));
  console.log("User Info from localStorage:", userData);
  if (userData) {
    setUserInfo(userData);
    setUsername(userData.name);
    setUserId(userData._id);
  }
}, []);

// ===========================
// LOAD TODAY'S QUIZZES (STANDARD + SAT)
// ===========================
useEffect(() => {
  if (!userInfo?.token) return;  // Wait until userInfo loads

  let isMounted = true;  // prevent double update

  async function loadQuiz() {
    try {
      const headers = {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json",
      };

      const [stdRes, satRes] = await Promise.all([
        fetch(`http://localhost:5000/api/daily-quiz/today?type=standard`, { headers }),
        fetch(`http://localhost:5000/api/daily-quiz/today?type=sat`, { headers }),
      ]);

      const standard = stdRes.ok ? await stdRes.json() : null;
      const sat = satRes.ok ? await satRes.json() : null;

      if (!isMounted) return;

      setQuizInfo({
        standard,
        sat,
      });

      // ✅ CORRECT LOGIC: Track each quiz separately
      const standardSubmitted = standard?.submitted === true;
      const satSubmitted = sat?.submitted === true;

      // ✅ Save individually
      setTodaySubmitted({
        standard: standardSubmitted,
        sat: satSubmitted
      });

    } catch (err) {
      console.log("❌ Dashboard Quiz Load Error:", err);
    }
  }

  loadQuiz();
  return () => { isMounted = false }; // cleanup
}, [userInfo]);


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userInfo"));
    console.log("User Info from localStorage:", userData);
    if (userData) {
      setUserInfo(userData);
      setUsername(userData.name);
      setUserId(userData._id);
    }
  }, []);

  useEffect(() => {
    if (!userInfo?.token) return;  // 👈 Prevent early render mismatch

    const fetchAssessmentActivity = async () => {
      try {
        const token = userInfo.token;

        const response = await fetch(
          "http://localhost:5000/api/assessments/activity",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setActivityData(data);
      } catch (error) {
        console.log("Error fetching activity:", error);
      }
    };

    fetchAssessmentActivity();
  }, [userInfo]);   // ✅ FIX — run only when userInfo loads

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("userInfo");
      localStorage.removeItem("studentToken"); // ✅ FIXED: Change from "token" to "studentToken"
      toast.success("Logged out successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/student-login"); // ✅ FIXED: Change to match your student login route
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-r from-teal-400 to-purple-500">
      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 bg-white text-gray-800 w-64 p-6 transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 shadow-xl h-screen overflow-y-auto scrollbar-thin scrollbar-track-white/40 scrollbar-thumb-teal-300/40 hover:scrollbar-thumb-teal-400/60`}>
        <button
          className="absolute top-4 right-4 md:hidden text-gray-600 hover:text-teal-600 transition"
          onClick={() => setSidebarOpen(false)}
        >
          ✖
        </button>
        <div className="flex justify-center mb-6">
          <img src={assessalogo} alt="Assessa Logo" className="w-28" />
        </div>

        <nav className="space-y-2">
          <div
            onClick={() => setSelectedSection("home")}
            className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition cursor-pointer
              ${selectedSection === "home"
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
              ${selectedSection === "assessments"
                ? "bg-teal-100 text-teal-700 font-semibold"
                : "text-gray-700 hover:bg-teal-100 hover:text-teal-600"
              }`}
          >
            <FaBook className="text-xl" />
            <span className="text-lg font-medium">Assessments</span>
          </div>

          {/* Progress dropdown */}
          <div className="w-full">
            <div
              onClick={() => setProgressOpen(!progressOpen)}
              className={`flex items-center justify-between py-3 px-4 rounded-lg transition-all cursor-pointer ${selectedSection === "progress"
                ? "bg-teal-100 text-teal-700 font-semibold"
                : "text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                } ${progressOpen ? "rounded-b-none" : ""}`}
            >
              <div className="flex items-center space-x-2">
                <FaChartBar className="text-xl" />
                <span className="text-lg font-medium">Progress</span>
              </div>
              <div className={`transform transition-transform duration-300 ${progressOpen ? "rotate-180" : ""}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {progressOpen && (
              <div className="bg-white border border-t-0 border-teal-100 rounded-b-lg overflow-hidden shadow-sm">
                <div
                  className={`flex items-center px-6 py-3 cursor-pointer transition-all ${selectedSection === "progress" && selectedProgressType === "standard"
                    ? "bg-teal-50 text-teal-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                    }`}
                  onClick={() => {
                    setSelectedProgressType("standard");
                    setSelectedSection("progress");
                  }}
                >
                  <div className={`w-2 h-2 rounded-full mr-3 ${selectedSection === "progress" && selectedProgressType === "standard"
                    ? "bg-teal-500"
                    : "bg-gray-300"
                    }`}></div>
                  <span>Standard</span>
                  {selectedSection === "progress" && selectedProgressType === "standard" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div
                  className={`flex items-center px-6 py-3 cursor-pointer transition-all ${selectedSection === "progress" && selectedProgressType === "sat"
                    ? "bg-teal-50 text-teal-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                    }`}
                  onClick={() => {
                    setSelectedProgressType("sat");
                    setSelectedSection("progress");
                  }}
                >
                  <div className={`w-2 h-2 rounded-full mr-3 ${selectedSection === "progress" && selectedProgressType === "sat"
                    ? "bg-teal-500"
                    : "bg-gray-300"
                    }`}></div>
                  <span>SAT</span>
                  {selectedSection === "progress" && selectedProgressType === "sat" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            onClick={() => setSelectedSection("profile")}
            className={`flex items-center space-x-2 py-3 px-4 rounded-lg transition cursor-pointer
              ${selectedSection === "profile"
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

      {/* ✅ FIX APPLIED HERE: 
        1. Increased horizontal padding: Added 'px-4' for better spacing from the edges.
        2. Increased bottom padding: Changed 'pb-3 md:pb-5' to 'pb-8' for more comfortable scrolling space at the bottom.
      */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 md:pb-10 bg-white rounded-tl-lg shadow-inner">

        {selectedSection === "home" && (
          <>

            {/* Quiz Type Selection Popup */}
            {quizTypeModal && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-80 text-center animate-scaleIn">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
                    Choose Quiz Type
                  </h2>

                  <p className="text-gray-600 mb-6">
                    Select which quiz you want to attempt today
                  </p>

                          <button
            disabled={todaySubmitted.standard}
            className={`w-full mb-4 py-3 rounded-xl ${
              todaySubmitted.standard
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
            }`}
            onClick={() => {
              if (!todaySubmitted.standard) {
                setCurrentQuizType("standard");
                setSelectedSection("dailyQuiz");
                setQuizTypeModal(false);
              }
            }}
          >
            Standard Quiz
          </button>

                        <button
          disabled={todaySubmitted.sat}
          className={`w-full py-3 rounded-xl ${
            todaySubmitted.sat
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-400 to-purple-600 text-white"
          }`}
          onClick={() => {
            if (!todaySubmitted.sat) {
              setCurrentQuizType("sat");
              setSelectedSection("dailyQuiz");
              setQuizTypeModal(false);
            }
          }}
        >
          SAT Quiz
        </button>

                  <button
                    className="mt-4 text-gray-500 hover:text-gray-700"
                    onClick={() => setQuizTypeModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Sticky Header */}
            <div className="sticky top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md shadow-sm">



              <div className="flex flex-row justify-between items-center px-4 py-3 md:px-6 md:py-4">

                {/* Mobile Sidebar Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-teal-600 transition-all"
                >
                  <FaBars className="text-2xl" />
                </button>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl mx-4">

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search your course"
                      className="w-full pl-10 pr-4 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-300"
                    />
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                  </div>

                </div>

                {/* Notification + Profile */}
                <div className="flex items-center space-x-4">
                  <StudentNotificationBell
                    setSelectedSection={setSelectedSection}
                    studentToken={userInfo?.token || JSON.parse(localStorage.getItem("userInfo"))?.token}
                  />
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{username || "Student"}</p>
                    <p className="text-sm text-gray-500">Student</p>
                  </div>
                  <IoPersonCircleOutline className="text-4xl text-teal-600 transition-transform hover:scale-110" />
                </div>
              </div>
            </div>
            {/* Removed redundant pl-6/pl-10 here since padding is now on <main> */}
            <div> 
              <div className="mb-6 mt-2">
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
                <p className="text-lg text-gray-600">Your AI-Powered Assessment Dashboard</p>
              </div>

              {/* Top 4 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mb-8">
                {/* Feedback */}
                <div
                  onClick={() => setFeedbackModalVisible(true)}
                  className="cursor-pointer bg-gradient-to-br from-purple-300 to-purple-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform"
                >
                  <MdSchool className="text-white text-[40px] mb-[10px]" />
                  <p className="text-3xl font-bold">1</p>
                  <p className="text-lg font-semibold">Feedback Hub</p>
                </div>

                {/* Study Plan */}
                <div
                  onClick={() => setStudyPlanModalVisible(true)}
                  className="cursor-pointer bg-gradient-to-br from-teal-300 to-teal-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform"
                >
                  <MdMenuBook className="text-white text-[40px] mb-[6px]" />
                  <p className="text-lg font-semibold">Study Plan</p>
                  <p className="text-sm text-white/90 mt-1">Your weekly plan is ready</p>
                </div>

                {/* Problem Solving */}
                <div className="bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
                  <FaRobot className="text-white text-[40px] mb-[10px]" />
                  <p className="text-lg font-semibold">Problem Solving Agent</p>
                  <button
                    onClick={() => navigate("/problemsolving-agent")}
                    className="mt-4 px-4 py-2 bg-white text-amber-600 font-bold rounded-full hover:bg-amber-300 hover:text-white transition"
                  >
                    Try AI Agent
                  </button>
                </div>

               <div
  onClick={() => setSelectedSection("meritBoard")}
  className="cursor-pointer bg-gradient-to-br from-blue-300 to-blue-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform"
>
  <MdSchool className="text-white text-[40px] mb-2" />
  <p className="text-xl font-bold">Merit Board</p>
</div>


              </div>

              {/* 2 COLUMN GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Assessment Activity */}
                <div className="bg-white shadow-md p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-600">Assessment Activity</h3>

                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

      
      {/* AI Challenge of the Day - Lavender */}
<div
  onClick={() => setQuizTypeModal(true)}
  className={`
    rounded-xl p-6 transition-all duration-200 border 
    bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200
    ${
      todaySubmitted.standard && todaySubmitted.sat
        ? "cursor-default"
        : "cursor-pointer hover:shadow-lg hover:border-purple-300 group"
    }
  `}
>
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center space-x-3">
      <div
        className={`
          p-2 rounded-lg 
          ${
            todaySubmitted.standard && todaySubmitted.sat
              ? "bg-purple-300"
              : "bg-gradient-to-br from-purple-500 to-indigo-600"
          }
        `}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800">AI Challenge</h3>
        <p className={`text-sm font-medium ${todaySubmitted.standard && todaySubmitted.sat ? "text-gray-500" : "text-purple-600"}`}>
          Daily • Fresh Content
        </p>
      </div>
    </div>
  </div>

  {/* Body */}
  <div className="mb-6">
    <h2 className="text-xl font-bold text-gray-900 mb-2">
      {todaySubmitted.standard && todaySubmitted.sat ? (
    <button disabled>✔ Completed Both Quizzes</button>
) : todaySubmitted.standard ? (
    <button disabled>✔ Standard Completed</button>
) : todaySubmitted.sat ? (
    <button disabled>✔ SAT Completed</button>
) : (
    <button onClick={() => setQuizTypeModal(true)}>Start Challenge</button>
)}

    </h2>

    <p className="text-gray-600 text-sm leading-relaxed">
      {todaySubmitted.standard && todaySubmitted.sat
        ? "You've already completed both quizzes for today"
        : todaySubmitted.standard || todaySubmitted.sat
        ? "You've completed one quiz"
        : "Sharpen critical thinking with daily AI puzzles"}
    </p>
  </div>

  {/* Footer */}
  <div className="flex items-center justify-between">
    <div className="text-xs text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
      🎯 Perfect for quick practice
    </div>

    {todaySubmitted.standard && todaySubmitted.sat ? (
      <button
        disabled
        className="bg-purple-200 text-purple-700 cursor-not-allowed px-5 py-2.5 rounded-lg text-sm font-semibold"
      >
        ✔ Completed Today
      </button>
    ) : (
      <button
        onClick={() => setQuizTypeModal(true)}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all group-hover:scale-105 transform shadow-sm"
      >
        Start Challenge
      </button>
    )}
  </div>
</div>


              </div>
            </div>
          </>
        )}


        {selectedSection === "assessments" && (
          <AssessmentsPage onBackHome={() => setSelectedSection("home")} />
        )}
        {selectedSection === "meritBoard" && (
  <MeritBoardPage onBackHome={() => setSelectedSection("home")} />
)}

        {selectedSection === "profile" && (
          <UserProfile onBackHome={() => setSelectedSection("home")} />
        )}
        {selectedSection === "notifications" && (
          <StudentNotificationPage
            onBackHome={() => setSelectedSection("home")}
            studentToken={userInfo?.token || JSON.parse(localStorage.getItem("userInfo") || "null")?.token}
            setSelectedSection={setSelectedSection}
          />
        )}

              {/* Daily Quiz Nested View */}
      {selectedSection === "dailyQuiz" && (
        <DailyQuiz
          quizType={currentQuizType}
          token={userInfo?.token}
          onFinish={() => setSelectedSection("dailyQuizScore")}
        />
      )}

      {/* Daily Quiz Score View */}
      {selectedSection === "dailyQuizScore" && (
        <DailyQuizScore
          quizType={currentQuizType}
          token={userInfo?.token}
          onBack={() => setSelectedSection("home")}
        />
      )}

        {selectedSection === "progress" && (
          selectedProgressType === "standard" ? (
            <Progress onBack={() => setSelectedSection("home")} />
          ) : (
            <SatProgress onBack={() => setSelectedSection("home")} />
          )
        )}

        {selectedSection === "feedback" && selectedFeedbackType === "standard" && (
          <StudentFeedback onBackHome={() => setSelectedSection("home")} />
        )}

        {selectedSection === "feedback" && selectedFeedbackType === "sat" && (
          <SatStudentFeedback onBackHome={() => setSelectedSection("home")} />
        )}

        {selectedSection === "studyPlan" && selectedPlanType === "standard" && (
          <StudentStudyPlan onBackHome={() => setSelectedSection("home")} />
        )}
        {selectedSection === "studyPlan" && selectedPlanType === "sat" && (
          <SatStudentStudyPlan onBackHome={() => setSelectedSection("home")} />
        )}

      {/* Study Plan Modal - Keeping the original design */}
        <Modal
          open={studyPlanModalVisible}
          onCancel={() => setStudyPlanModalVisible(false)}
          footer={null}
          className="study-plan-modal rounded-2xl"
          width={520}
          closable={false}
        >
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent mb-2">
                Choose Your Study Plan
              </h2>
              <p className="text-gray-600">Select the type of study plan that best fits your needs</p>
            </div>

            <div className="space-y-4">
              <div
                className="relative p-5 rounded-xl backdrop-blur-md bg-blue-50/70 border-2 border-blue-300 cursor-pointer transition-all hover:shadow-lg"
                onClick={() => {
                  setSelectedPlanType("standard");
                  setStudyPlanModalVisible(false);
                  setSelectedSection("studyPlan");
                }}
              >
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-200/40 text-indigo-600 mr-4 flex-shrink-0">
                    <MdMenuBook className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-indigo-700 mb-1">Standard Study Plan</h3>
                    <p className="text-sm text-gray-600">Comprehensive curriculum-based learning with personalized recommendations</p>
                  </div>
                </div>
                <div className="absolute top-5 right-5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-500">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div
                className="relative p-5 rounded-xl backdrop-blur-md bg-purple-50/70 border-2 border-purple-300 cursor-pointer transition-all hover:shadow-lg"
                onClick={() => {
                  setSelectedPlanType("sat");
                  setStudyPlanModalVisible(false);
                  setSelectedSection("studyPlan");
                }}
              >
                <div className="flex items-start">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-200/40 text-purple-600 mr-4 flex-shrink-0">
                    <MdSchool className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-800 mb-1">SAT Study Plan</h3>
                    <p className="text-sm text-gray-600">Specialized preparation for SAT exams with practice tests and strategies</p>
                  </div>
                </div>
                <div className="absolute top-5 right-5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-purple-500">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setStudyPlanModalVisible(false)}
                className="px-6 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-lg transition-all shadow-sm hover:shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Feedback Hub Modal */}
        <Modal
          open={feedbackModalVisible}
          onCancel={() => setFeedbackModalVisible(false)}
          footer={null}
          className="feedback-modal"
          width={600}
          closable={false}
          style={{ top: 20 }}
        >
          <div className="relative">
            {/* Header with teal gradient background */}
            <div className="bg-gradient-to-r from-teal-400 to-emerald-500 p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Feedback Hub</h2>
                    <p className="text-teal-100">Select your feedback destination</p>
                  </div>
                </div>
                <button
                  onClick={() => setFeedbackModalVisible(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="p-6 bg-cyan-50 rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {/* Standard Feedback */}
                <div
                  className="bg-white rounded-xl p-5 shadow-md border border-cyan-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => {
                    setSelectedFeedbackType("standard");
                    setFeedbackModalVisible(false);
                    setSelectedSection("feedback");
                  }}
                >
                  {/* Decorative circles - positioned to not interfere with content */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-100 rounded-bl-full overflow-hidden -mr-4 -mt-4 opacity-60">
                    <div className="absolute top-4 -right-4 w-16 h-16 bg-cyan-200 rounded-full"></div>
                  </div>

                  <div className="flex items-start mb-4 relative z-10">
                    <div className="bg-cyan-100 p-3 rounded-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="pr-8"> {/* Added padding to prevent text overlap */}
                      <h3 className="text-lg font-semibold text-gray-700">Standard Feedback</h3>
                    </div>
                  </div>
                  <div className="flex items-center text-cyan-600 group-hover:translate-x-1 transition-transform relative z-10">
                    <span className="text-sm font-medium mr-2">View Feedback</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* SAT Feedback */}
                <div
                  className="bg-white rounded-xl p-5 shadow-md border border-violet-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() => {
                    setSelectedFeedbackType("sat");
                    setFeedbackModalVisible(false);
                    setSelectedSection("feedback");
                  }}
                >
                  {/* Decorative circles - positioned to not interfere with content */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-violet-100 rounded-bl-full overflow-hidden -mr-4 -mt-4 opacity-60">
                    <div className="absolute top-4 -right-4 w-16 h-16 bg-violet-200 rounded-full"></div>
                  </div>

                  <div className="flex items-start mb-4 relative z-10">
                    <div className="bg-violet-100 p-3 rounded-lg mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="pr-8"> {/* Added padding to prevent text overlap */}
                      <h3 className="text-lg font-semibold text-gray-700">SAT Feedback</h3>
                    </div>
                  </div>
                  <div className="flex items-center text-violet-600 group-hover:translate-x-1 transition-transform relative z-10">
                    <span className="text-sm font-medium mr-2">View Feedback</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-amber-100 rounded-lg p-4 border border-amber-200">
                <div className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-amber-800">
                    Your feedback is updated after each assessment. Check back regularly to track your progress!
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setFeedbackModalVisible(false)}
                  className="px-6 py-2.5 bg-fuchsia-100 text-gray-700 hover:bg-fuchsia-200 font-medium rounded-lg transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {userId && <StudentDashboardBot userId={userId} />}
      </main>
    </div>
  );
}