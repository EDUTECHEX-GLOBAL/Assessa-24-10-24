// components/StudentFeedback.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiAlertCircle } from "react-icons/fi";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function StudentFeedback({ onBackHome }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ Token is missing in localStorage.");
        setError("You are not logged in. Please login to view feedback.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/feedback/student`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFeedbacks(res.data);
      } catch (err) {
        console.error("❌ Axios error:", err);
        const message =
          err?.response?.data?.message ||
          "Failed to load feedbacks. Please try again later.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📘 Feedback Hub</h1>
          <button
            onClick={onBackHome}
            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>

        {loading && (
          <div className="text-center text-gray-600">Loading feedback...</div>
        )}

        {error && (
          <div className="flex items-center bg-rose-100 text-rose-700 p-4 rounded-md mb-4">
            <FiAlertCircle className="mr-2" />
            {error}
          </div>
        )}

        {!loading && feedbacks.length === 0 && !error && (
          <div className="text-center text-gray-500">
            No feedback available yet.
          </div>
        )}

        {feedbacks.map((fb, index) => (
          <div
            key={index}
            className="bg-white/80 p-6 rounded-lg shadow mb-6 border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-indigo-700 mb-2">
              {fb.assessmentName} - {fb.percentage.toFixed(1)}%
            </h2>
            <p className="text-gray-600 text-sm mb-3">
              Date: {new Date(fb.date).toLocaleDateString()}
            </p>

            {fb.feedbackText && (
              <>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800">📄 Summary</h3>
                  <p className="text-gray-700">
                    {fb.feedbackText.overallSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-emerald-700 mb-1">
                      ✅ Strengths
                    </h4>
                    <ul className="list-disc pl-5 text-gray-700">
                      {fb.feedbackText.topicStrengths?.length > 0 ? (
                        fb.feedbackText.topicStrengths.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))
                      ) : (
                        <li>No specific strengths</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-700 mb-1">
                      ⚠️ Weaknesses
                    </h4>
                    <ul className="list-disc pl-5 text-gray-700">
                      {fb.feedbackText.topicWeaknesses?.length > 0 ? (
                        fb.feedbackText.topicWeaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))
                      ) : (
                        <li>No specific weaknesses</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sky-700 mb-1">
                    📌 Recommended Actions
                  </h4>
                  <ul className="list-disc pl-5 text-gray-700">
                    {fb.feedbackText.nextSteps?.length > 0 ? (
                      fb.feedbackText.nextSteps.map((step, i) => (
                        <li key={i}>
                          <strong>Action:</strong> {step.action}
                          {step.resource && (
                            <>
                              {" "}
                              | <strong>Resource:</strong>{" "}
                              <a
                                href={step.resource}
                                className="text-blue-600 underline"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {step.resource}
                              </a>
                            </>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>No specific next steps</li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
