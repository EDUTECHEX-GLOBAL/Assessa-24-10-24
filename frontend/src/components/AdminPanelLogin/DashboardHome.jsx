import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaClipboardList, FaUserClock } from 'react-icons/fa';
import { MdAdminPanelSettings, MdAssignment } from 'react-icons/md';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function DashboardHome() {
  const [approvalCounts, setApprovalCounts] = useState({
    total: 0,
    teachers: 0,
    students: 0,
  });

  useEffect(() => {
    const fetchApprovalCounts = async () => {
      try {
        const response = await fetch("/api/admin/approvals/counts");
        const data = await response.json();
        setApprovalCounts(data);
      } catch (error) {
        console.error("Error fetching approval counts:", error);
      }
    };

    fetchApprovalCounts();
  }, []);

  return (
    <>
      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Teachers Card */}
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

        {/* User Management Card */}
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

        {/* Analytics Card */}
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

        {/* Pending Approvals Card - Updated */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Pending Approvals</h3>
              <p className="text-2xl">{approvalCounts.total || "..."}</p>
              <p className="text-sm mt-2">New requests</p>
            </div>
            <FaUserClock className="text-4xl opacity-75" />
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div>
              <p>Teachers: {approvalCounts.teachers || 0}</p>
              <p>Students: {approvalCounts.students || 0}</p>
            </div>
            <Link 
              to="/admin-dashboard/approvals" 
              className="bg-white/20 hover:bg-white/30 px-3 py-3 rounded-full"
            >
              Review
            </Link>
          </div>
        </div>
      </section>

      {/* KPIs & Recent Activities Section */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Key Performance Indicators (KPIs) & Recent Activities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Student Engagement Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg text-blue-700 font-bold mb-4">Student Engagement</h3>
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

          {/* Recent Assessments Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg text-violet-900 font-bold mb-4 flex items-center justify-between">
              Recent Assessments
              <span className="text-blue-600 text-sm">5 New</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">AI Math Quiz</p>
                  <p className="text-sm text-gray-500">Generated 2 hours ago</p>
                </div>
                <button className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200">
                  View
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Science Test</p>
                  <p className="text-sm text-gray-500">Teacher-Written | 1 day ago</p>
                </div>
                <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200">
                  Analyze
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg text-green-600 font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <FaUsers className="text-2xl text-yellow-500 mb-2" />
                <span className="text-sm font-medium">Manage Teachers</span>
              </button>
              <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <MdAssignment className="text-2xl text-purple-600 mb-2" />
                <span className="text-sm font-medium">Review Submissions</span>
              </button>
              <button className="p-4 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition-colors">
                <FaClipboardList className="text-2xl text-cyan-600 mb-2" />
                <span className="text-sm font-medium">Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
