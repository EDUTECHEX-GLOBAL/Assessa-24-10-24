import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaHome, FaBook, FaChartBar, FaTasks, FaSignOutAlt } from 'react-icons/fa';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { MdSchool, MdClass, MdAssignment, MdQuiz } from 'react-icons/md';
import assessalogo from "./logo.png";
import { useEffect, useState } from "react";

const data = [
  { name: 'January', value: 20 },
  { name: 'March', value: 35 },
  { name: 'May', value: 60 },
  { name: 'July', value: 90 },
  { name: 'September', value: 50 },
  { name: 'December', value: 70 },
];

export default function Dashboard() {
   // State variables for API data
   const [courses, setCourses] = useState([]);
   const [progress, setProgress] = useState({ totalClasses: 0, assignments: 0, quizzes: 0 });
   const [tasks, setTasks] = useState([]);
   const [activity, setActivity] = useState({ percentage: 0 });
   const [chartData, setChartData] = useState([]);
 
   useEffect(() => {
     // Fetch Courses
     fetch("http://localhost:5000/api/courses")
       .then((res) => res.json())
       .then((data) => setCourses(data))
       .catch((err) => console.error("Error fetching courses:", err));
 
     // Fetch Progress
     fetch("http://localhost:5000/api/progress")
       .then((res) => res.json())
       .then((data) => setProgress(data))
       .catch((err) => console.error("Error fetching progress:", err));
 
    // Fetch Tasks
fetch("http://localhost:5000/api/tasks/tasks", {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Ensure token is included
})
  .then((res) => res.json())
  .then((data) => setTasks(data))
  .catch((err) => console.error("Error fetching tasks:", err));

 
     // Fetch Activity
     fetch("http://localhost:5000/api/activity")
       .then((res) => res.json())
       .then((data) => {
         setActivity(data);
         if (data.chart) setChartData(data.chart);
       })
       .catch((err) => console.error("Error fetching activity:", err));
   }, []);
 
  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-teal-400 to-purple-500 md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-lg p-5 flex flex-col justify-between md:h-screen sticky top-0">
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
            <span className="text-lg font-medium">Courses</span>
          </a>
          <a href="#" className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition">
            <FaChartBar className="text-xl" />
            <span className="text-lg font-medium">Progress</span>
          </a>
          <a href="#" className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-teal-100 hover:text-teal-600 transition">
            <FaTasks className="text-xl" />
            <span className="text-lg font-medium">Tasks</span>
          </a>
        </nav>
        <div className="flex-grow" />
        <a href="#" className="flex items-center space-x-2 py-3 px-4 rounded-lg text-red-500 hover:bg-red-100 transition">
          <FaSignOutAlt className="text-xl" />
          <span className="text-lg font-medium">Logout</span>
        </a>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto md:p-10 bg-white rounded-tl-lg shadow-inner">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-800">Welcome, Student!</h2>
            <p className="text-gray-500">Your AI-Powered Assessment Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search your course"
              className="border rounded-lg px-4 py-2 w-full md:w-auto shadow-sm focus:ring focus:ring-teal-300"
            />
            <IoPersonCircleOutline className="text-gray-600 text-4xl" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mb-8">
          <div className="bg-gradient-to-br from-purple-300 to-purple-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
            <MdSchool className="text-white text-[40px] mb-[10px]" />
            <p className="text-3xl font-bold">1</p>
            <p className="text-base">Enrolled Courses</p>
          </div>
          <div className="bg-gradient-to-br from-teal-300 to-teal-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
            <MdClass className="text-white text-[40px] mb-[10px]" />
            <p className="text-3xl font-bold">50</p>
            <p className="text-base">Total Classes</p>
          </div>
          <div className="bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
            <MdAssignment className="text-white text-[40px] mb-[10px]" />
            <p className="text-3xl font-bold">25</p>
            <p className="text-base">Assignments</p>
          </div>
          <div className="bg-gradient-to-br from-lime-300 to-lime-500 text-white shadow-md p-6 rounded-lg flex flex-col items-center justify-center transform hover:scale-[1.03] transition-transform">
            <MdQuiz className="text-white text-[40px] mb-[10px]" />
            <p className="text-3xl font-bold">10</p>
            <p className="text-base">Quizzes</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white shadow-md p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-600">Course Activity</h3>
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
              <h3 className="text-lg font-semibold mb-2">Daily Activity</h3>
              <p className="text-5xl font-bold">80%</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
