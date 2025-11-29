import React, { useEffect, useState } from "react";

export default function MeritBoardPage({ onBackHome }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentRank, setCurrentRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  const token = JSON.parse(localStorage.getItem("userInfo"))?.token || null;
  const currentUserName = JSON.parse(localStorage.getItem("userInfo"))?.name?.toLowerCase();

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch(
          "http://localhost:5000/api/assessments/leaderboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setCurrentRank(data.currentRank || null);
      } catch (err) {
        console.log("Leaderboard Error:", err);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      }
    }

    if (token) fetchLeaderboard();
  }, [token]);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200";
      case 2: return "bg-gradient-to-r from-slate-100 to-slate-150 text-slate-700 border border-slate-200";
      case 3: return "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200";
      default: return "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200";
    }
  };

  const getStatusColor = (rank) => {
    switch (rank) {
      case 1: return "bg-amber-50 text-amber-700 border-amber-200";
      case 2: return "bg-slate-50 text-slate-700 border-slate-200";
      case 3: return "bg-orange-50 text-orange-700 border-orange-200";
      default: return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const getStatusText = (rank) => {
    if (rank === 1) return "First";
    if (rank === 2) return "Second";
    if (rank === 3) return "Third";
    return `Rank ${rank}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className={`mb-5 transition-all duration-500 transform ${animate ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
          <button
            onClick={onBackHome}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-lg transition-all duration-300 shadow-sm border border-slate-200 hover:border-slate-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Title Section */}
        <div className={`mb-5 transition-all duration-500 delay-100 transform ${animate ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Merit Board
          </h1>
          <p className="text-slate-600 text-sm">Real-time academic performance rankings</p>
        </div>

        {/* Current Rank */}
        {currentRank && (
          <div className={`mb-5 transition-all duration-500 delay-200 transform ${animate ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl shadow-sm p-4 border border-cyan-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center border border-cyan-200">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 text-base">Your Current Standing</h3>
                    <p className="text-slate-500 text-sm">Keep up the great work!</p>
                  </div>
                </div>
                <div className="text-center bg-white px-4 py-3 rounded-lg border border-cyan-200">
                  <div className="text-xl font-semibold text-cyan-600">{currentRank}</div>
                  <div className="text-slate-500 text-sm">Current Rank</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Leaderboard Table */}
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-500 delay-300 transform ${animate ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
          
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-medium text-slate-800 text-base">Top Students Leaderboard</h2>
                <p className="text-slate-500 text-sm">Active student rankings</p>
              </div>
              <div className="text-slate-600 text-sm bg-white px-3 py-1 rounded border border-slate-200">
                {leaderboard.length} students
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="p-4 bg-slate-50/30">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400 border-t-transparent"></div>
                  <p className="text-slate-500 text-sm">Loading leaderboard...</p>
                </div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-10 bg-white rounded border border-slate-200">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-200">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No active students on leaderboard</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Table Headers */}
                <div className="grid grid-cols-12 gap-3 px-3 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-sm font-medium text-slate-700 border border-blue-100">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-7">Student</div>
                  <div className="col-span-2 text-center">Score</div>
                  <div className="col-span-2 text-center">Status</div>
                </div>

                {/* Table Rows */}
                <div className="space-y-2">
                  {leaderboard.slice(0, 15).map((student, index) => {
                    const rank = index + 1;
                    const isCurrentUser = student.name.toLowerCase() === currentUserName;
                    const animationDelay = 400 + (index * 80);
                    
                    return (
                      <div
                        key={index}
                        className={`grid grid-cols-12 gap-3 px-3 py-3 rounded-lg border transition-all duration-500 transform ${
                          animate ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
                        } ${
                          isCurrentUser 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300' 
                            : rank % 2 === 0 
                            ? 'bg-white border-slate-100 hover:border-blue-200' 
                            : 'bg-slate-50 border-slate-100 hover:border-blue-200'
                        }`}
                        style={{ transitionDelay: `${animationDelay}ms` }}
                      >
                        {/* Rank */}
                        <div className="col-span-1 flex justify-center items-center">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${getRankColor(rank)}`}>
                            {rank}
                          </div>
                        </div>
                        
                        {/* Student */}
                        <div className="col-span-7 flex items-center">
                          <div className="flex items-center gap-2">
                            <span className={`font-normal text-slate-700 text-base ${isCurrentUser ? 'text-blue-600 font-medium' : ''}`}>
                              {student.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 rounded border border-blue-200">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="text-center bg-white px-3 py-2 rounded border border-slate-200">
                            <div className="font-medium text-slate-800 text-base">
                              {student.totalScore || 0}
                            </div>
                            <div className="text-slate-500 text-xs">pts</div>
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="col-span-2 flex items-center justify-center">
                          <span className={`text-sm font-medium px-3 py-2 rounded border ${getStatusColor(rank)}`}>
                            {getStatusText(rank)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Simple Footer Text */}
        <div className={`text-center mt-6 transition-all duration-500 delay-1000 transform ${animate ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}`}>
          <p className="text-slate-500 text-sm">
            Complete more assessments to improve your ranking • Updated in real-time
          </p>
        </div>
      </div>
    </div>
  );
}