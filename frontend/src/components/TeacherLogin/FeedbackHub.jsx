import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiAlertCircle,
  FiBookOpen,
  FiUser,
  FiAward,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
} from "react-icons/fi";

export default function FeedbackHub({ onBack }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

 useEffect(() => {
  console.log("🚀 useEffect in FeedbackHub running...");

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token:", token);
      console.log("🌍 API URL:", process.env.REACT_APP_API_URL);

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/feedback/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🎯 Feedback API response:", res.data);

      const parsedData = res.data.map((fb) => ({
        ...fb,
        feedbackText:
          typeof fb.feedbackText === "string"
            ? JSON.parse(fb.feedbackText)
            : fb.feedbackText,
      }));

      setFeedbacks(parsedData);
    } catch (err) {
      console.error("❌ Error fetching feedbacks", err);
      setError("Failed to fetch feedback data.");
    }
  };

  fetchFeedbacks();
}, []);


  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-white/70 rounded-xl shadow-md p-6 mb-6 border border-white/30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Assessment Feedback Hub
              </h2>
              <p className="text-gray-600 mt-1">All AI-generated feedback from student assessments</p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center px-4 py-2 text-blue-700 bg-blue-100/60 border border-blue-200 rounded-lg hover:bg-blue-200 transition-all"
              >
                <FiArrowLeft className="mr-2" />
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center">
            <FiAlertCircle className="mr-2" />
            {error}
          </div>
        )}

        {feedbacks.length === 0 && !error ? (
          <p className="text-gray-500">No feedbacks available yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => {
              const parsed = fb.feedbackText;

              return (
                <div key={fb._id} className="bg-white/80 rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FiUser /> {fb.studentId?.name || "Unnamed"}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FiBookOpen /> {fb.assessmentId?.assessmentName || "Untitled"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <FiAward /> Score: {fb.score} / {fb.total} ({fb.percentage.toFixed(1)}%)
                      </p>
                    </div>
                    <button
                      onClick={() => toggleExpand(fb._id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {expandedId === fb._id ? (
                        <span className="flex items-center gap-1"><FiChevronUp /> Collapse</span>
                      ) : (
                        <span className="flex items-center gap-1"><FiChevronDown /> Expand</span>
                      )}
                    </button>
                  </div>

                  {expandedId === fb._id && (
                    <div className="mt-4 text-sm text-gray-700 space-y-4">
                      <div>
                        <p className="font-semibold text-blue-700 mb-1">Summary</p>
                        <p>{parsed.overallSummary}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-green-700 mb-1">Strengths</p>
                        <ul className="list-disc pl-5">
                          {parsed.topicStrengths?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-yellow-700 mb-1">Areas for Improvement</p>
                        <ul className="list-disc pl-5">
                          {parsed.topicWeaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-purple-700 mb-1">Next Steps</p>
                        <ul className="list-disc pl-5">
                          {parsed.nextSteps?.map((step, i) => (
                            <li key={i}>
                              {step.action} –{" "}
                              <a
                                href={
                                  step.resource?.startsWith("http")
                                    ? step.resource
                                    : `https://www.google.com/search?q=${encodeURIComponent(step.resource)}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                {step.resource}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ Debug: Show feedbacks in raw form */}
        <pre className="text-xs bg-gray-100 mt-6 p-4 rounded border border-gray-300">
          {JSON.stringify(feedbacks, null, 2)}
        </pre>
      </div>
    </div>
  );
}
