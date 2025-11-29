import React, { useEffect, useState } from "react";

export default function DailyQuizScore({ quizType, token, onBack }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    async function loadScore() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/daily-quiz/score?type=${quizType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setScore(data.score);
        
        // Animate score counting
        let start = 0;
        const duration = 1200;
        const increment = data.score / (duration / 30);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= data.score) {
            setAnimatedScore(data.score);
            clearInterval(timer);
          } else {
            setAnimatedScore(Math.floor(start));
          }
        }, 30);
        
      } catch (error) {
        console.error("Failed to load score:", error);
      } finally {
        setLoading(false);
      }
    }
    loadScore();
  }, [quizType, token]);

  const getMessage = () => {
    if (score === null) return "";
    if (score === 10) return "Perfect Score! 🎉";
    if (score >= 7) return "Excellent Work! 💪";
    if (score >= 4) return "Good Progress! 👍";
    return "Keep Learning! 📚";
  };

  const getScoreColor = () => {
    if (score >= 9) return "text-green-600";
    if (score >= 7) return "text-blue-600";
    if (score >= 5) return "text-amber-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      {/* Reduced box size - changed from max-w-md to max-w-sm and reduced padding */}
      <div className="w-full max-w-sm bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 text-center transform hover:scale-[1.02] transition-all duration-300">
        
        {/* Header with Icon */}
        <div className="mb-5">
          <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Quiz Completed!</h1>
          <p className="text-gray-600 text-xs">
            {quizType === "standard" ? "Standard Quiz" : "SAT Quiz"}
          </p>
        </div>

        {/* Animated Score Display */}
        <div className="mb-5">
          <div className={`text-4xl font-bold ${getScoreColor()} mb-2 animate-pulse`}>
            {animatedScore}<span className="text-xl text-gray-500">/10</span>
          </div>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto"></div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            {getMessage()}
          </p>
          <p className="text-gray-600 text-xs">
            {score >= 7 
              ? "You're mastering the concepts!"
              : "Every attempt brings you closer to mastery!"
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Performance</span>
            <span className="font-semibold">{score * 10}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
              style={{ width: `${score * 10}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onBack}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}