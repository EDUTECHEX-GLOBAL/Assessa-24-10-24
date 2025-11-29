import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReportsManagement() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    engagement: { attendanceRate: 0, participationRate: 0, overallEngagement: 0 },
    teacherHighlights: [],
    recentAssessments: []
  });

  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    fetchReportsData();
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const fetchReportsData = async () => {
    try {
      const token = localStorage.getItem("token");

      const engageRes = await fetch("/api/admin/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const engageData = await engageRes.json();

      const teacherRes = await fetch("/api/admin/dashboard/teacher-highlights", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const teacherData = await teacherRes.json();

      const topRes = await fetch("/api/notice/top-performers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const topData = await topRes.json();

      const recentRes = await fetch("/api/admin/dashboard/recent-assessments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recentData = await recentRes.json();

      setStats(prev => ({
        ...prev,
        ...engageData,
        teacherHighlights: teacherData,
        recentAssessments: recentData
      }));

      setTopPerformers(topData.slice(0, 3));
    } catch (err) {
      console.error("Reports fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 transition-all duration-500 transform ${animate ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Reports & Analytics
            </h1>
            <p className="text-slate-600">Monitor student engagement & teacher performance</p>
          </div>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-all duration-500 delay-100 transform ${animate ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
          {/* Engagement Rate Card */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 shadow-sm border border-cyan-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-cyan-600 text-sm font-medium">Overall Engagement</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.engagement.overallEngagement}%</h3>
              </div>
              <div className="bg-gradient-to-r from-cyan-100 to-blue-100 p-3 rounded-xl border border-cyan-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-cyan-600">
              <span>Student participation metrics</span>
            </div>
          </div>
          
          {/* Attendance Rate Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm border border-emerald-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Attendance Rate</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.engagement.attendanceRate}%</h3>
              </div>
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-3 rounded-xl border border-emerald-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-emerald-600">
              <span>Class attendance percentage</span>
            </div>
          </div>
          
          {/* Participation Rate Card */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-violet-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-violet-600 text-sm font-medium">Participation Rate</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.engagement.participationRate}%</h3>
              </div>
              <div className="bg-gradient-to-r from-violet-100 to-purple-100 p-3 rounded-xl border border-violet-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-violet-600">
              <span>Active student involvement</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 delay-200 transform ${animate ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
          
          {/* Top Performers Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-2 rounded-lg border border-amber-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Top Student Performers</h2>
                  <p className="text-sm text-slate-600">Leading students this week</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {topPerformers.length > 0 ? (
                  topPerformers.map((s, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-slate-50 to-slate-25 p-4 rounded-xl border border-slate-200 hover:border-amber-200 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium shadow-sm ${
                            index === 0 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200' : 
                            index === 1 ? 'bg-gradient-to-r from-slate-100 to-slate-150 text-slate-700 border border-slate-200' : 
                            'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{s.name}</p>
                            <div className="mt-1">
                              <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-200">
                                Class {s.class}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-semibold text-amber-600">{s.percentage}%</span>
                          <p className="text-xs text-slate-500">Score</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 border border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-slate-700">No top performers</h3>
                    <p className="mt-1 text-xs text-slate-500">No performance data available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Teacher Highlights Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-fuchsia-50 to-pink-50">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-fuchsia-100 to-pink-100 p-2 rounded-lg border border-fuchsia-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Teacher Highlights</h2>
                  <p className="text-sm text-slate-600">Most active teachers</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.teacherHighlights.length > 0 ? (
                  stats.teacherHighlights.map((t, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-slate-50 to-slate-25 p-4 rounded-xl border border-slate-200 hover:border-fuchsia-200 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <p className="font-medium text-slate-800">{t.name}</p>
                        <span className="bg-gradient-to-r from-fuchsia-50 to-pink-50 text-fuchsia-700 px-3 py-1 rounded-lg text-sm font-medium border border-fuchsia-200">
                          {t.uploads} Uploads
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-200">
                          Standard: {t.standard}
                        </span>
                        <span className="text-xs bg-rose-50 text-rose-700 px-2 py-1 rounded-lg border border-rose-200">
                          SAT: {t.sat}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-md font-medium text-slate-700">No teacher highlights</h3>
                    <p className="mt-1 text-sm text-slate-500">No teacher activity data available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assessments Section */}
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8 transition-all duration-500 delay-300 transform ${animate ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-teal-100 to-cyan-100 p-2 rounded-lg border border-teal-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Recent Assessments</h2>
                <p className="text-sm text-slate-600 mt-1">Latest uploaded assessments</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.recentAssessments.length > 0 ? (
                stats.recentAssessments.slice(0, 4).map((a, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-slate-50 to-slate-25 p-5 rounded-xl border border-slate-200 hover:border-teal-300 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="font-semibold text-slate-800">{a.title}</p>
                      <span className={`text-xs px-3 py-1 rounded-lg font-medium border ${
                        a.type === 'Quiz' ? 'bg-lime-50 text-lime-700 border-lime-200' :
                        a.type === 'Test' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        a.type === 'Assignment' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        'bg-violet-50 text-violet-700 border-violet-200'
                      }`}>
                        {a.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-medium text-slate-800">{a.teacherName}</span> in{" "}
                      <span className="font-medium text-teal-700">{a.subject}</span>
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500">{a.uploadedAgo}</p>
                      <div className="flex space-x-2">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">
                          {a.standard}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-700">No recent assessments</h3>
                  <p className="mt-2 text-sm text-slate-500">No assessment data available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}