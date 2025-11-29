import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function SystemUsagePage() {
  const [activeTab, setActiveTab] = useState("today");

  // backend expected format:
  // today: {}, week: {}, month: {}
  const [usage, setUsage] = useState({
    today: {
      totalActivities: "—",
      logins: "—",
      assessmentActions: "—",
    },
    week: {
      totalActivities: "—",
      logins: "—",
      assessmentActions: "—",
    },
    month: {
      totalActivities: "—",
      logins: "—",
      assessmentActions: "—",
    }
  });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/admin/dashboard/system-usage", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        setUsage({
          today: {
            totalActivities: data.today?.totalActivities ?? "—",
            logins: data.today?.logins ?? "—",
            assessmentActions: data.today?.assessmentActions ?? "—",
          },
          week: {
            totalActivities: data.week?.totalActivities ?? "—",
            logins: data.week?.logins ?? "—",
            assessmentActions: data.week?.assessmentActions ?? "—",
          },
          month: {
            totalActivities: data.month?.totalActivities ?? "—",
            logins: data.month?.logins ?? "—",
            assessmentActions: data.month?.assessmentActions ?? "—",
          },
        });
      } catch (err) {
        console.error("System usage fetch error:", err);
      }
    };

    fetchUsage();
  }, []);

  // select proper dataset based on tab
  const current = usage[activeTab];

  return (
    <div className="p-6">

      {/* Back Button */}
      <Link 
        to="/admin-dashboard" 
        className="text-orange-600 font-medium hover:underline"
      >
        ← Back Home
      </Link>

      {/* Page Container */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-4">

        <h2 className="text-2xl font-bold mb-6 text-purple-700">
          System Usage Overview
        </h2>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">

          <button
            onClick={() => setActiveTab("today")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "today"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setActiveTab("week")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "week"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Week
          </button>

          <button
            onClick={() => setActiveTab("month")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Month
          </button>

        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <div className="bg-gray-50 border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Activities</h3>
            <p className="text-3xl font-bold mt-4 text-blue-600">
              {current.totalActivities}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === "today" && "Last 24 hours"}
              {activeTab === "week" && "Last 7 days"}
              {activeTab === "month" && "Last 30 days"}
            </p>
          </div>

          <div className="bg-gray-50 border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-700">Logins</h3>
            <p className="text-3xl font-bold mt-4 text-indigo-600">
              {current.logins}
            </p>
            <p className="text-sm text-gray-500 mt-1">Teachers + Students</p>
          </div>

          <div className="bg-gray-50 border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-700">Assessment Actions</h3>
            <p className="text-3xl font-bold mt-4 text-green-600">
              {current.assessmentActions}
            </p>
            <p className="text-sm text-gray-500 mt-1">Created / Attempted</p>
          </div>

        </div>

        {/* Recent Activity Section */}
        <div className="mt-10 mb-4 border-b pb-2">
          <h3 className="text-xl font-bold text-gray-800">Recent Activity Log</h3>
        </div>

        <p className="text-gray-500">No recent activity to display.</p>

      </div>

    </div>
  );
}
