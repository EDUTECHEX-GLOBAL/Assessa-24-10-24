import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProgressTracking({ onBack }) {
  const [progressData, setProgressData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [feedbackObj, setFeedbackObj] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/assessments/teacher/student-progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (Array.isArray(res.data)) {
        setProgressData(res.data);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
      setError("Failed to load student progress data.");
    }
  };

  const fetchFeedback = async (entry) => {
    setLoadingFeedback(true);
    setFeedbackObj(null);
    setFeedbackError(null);
    setFeedbackSuccess(false);
    setSelectedEntry(entry);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/feedback/send`, {
        studentId: entry.studentId,
        submissionId: entry.submissionId,
      });

      // feedbackText is already an object from the updated backend
      setFeedbackObj(res.data.feedbackText || null);
    } catch (err) {
      console.error("Error generating feedback:", err);
      setFeedbackError("Failed to generate feedback.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const sendFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/feedback/send`,
        {
          studentId: selectedEntry.studentId,
          submissionId: selectedEntry.submissionId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFeedbackSuccess(true);
    } catch (err) {
      console.error("Error sending feedback:", err);
      setFeedbackError("Failed to send feedback.");
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  useEffect(() => {
    if (feedbackSuccess) {
      const timer = setTimeout(() => {
        setSelectedEntry(null);
        setFeedbackSuccess(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [feedbackSuccess]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Student Progress</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">Assessment</th>
              <th className="p-3 text-left">Score</th>
              <th className="p-3 text-left">Percentage</th>
              <th className="p-3 text-left">Duration</th>
              <th className="p-3 text-left">Submitted At</th>
              <th className="p-3 text-left">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {progressData.map((item, index) => (
              <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-medium">{item.studentName}</td>
                <td className="p-3">{item.studentClass}</td>
                <td className="p-3">{item.assessmentTitle}</td>
                <td className="p-3">{item.score} / {item.totalMarks}</td>
                <td className="p-3">{item.percentage?.toFixed(1)}%</td>
                <td className="p-3">
                  {item.timeTaken ? `${Math.floor(item.timeTaken / 60)}m ${item.timeTaken % 60}s` : "N/A"}
                </td>
                <td className="p-3">
                  {new Date(item.date).toLocaleString()}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => fetchFeedback(item)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Give Feedback
                  </button>
                </td>
              </tr>
            ))}
            {progressData.length === 0 && !error && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No submissions found for your assessments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Feedback Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl shadow-lg relative">
            <h3 className="text-xl font-semibold mb-2">
              Feedback for {selectedEntry.studentName}
            </h3>

            {loadingFeedback && (
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <svg className="animate-spin h-4 w-4 mr-2 text-gray-500" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l5-5-5-5v4a10 10 0 00-10 10h4z"
                  />
                </svg>
                Generating feedback...
              </div>
            )}

            {feedbackError && <p className="text-sm text-red-500 mb-2">{feedbackError}</p>}

            {!loadingFeedback && !feedbackError && (
              <>
                {feedbackObj ? (
                  <div className="mb-3 text-sm">
                    <p>
                      <strong>Overall Summary:</strong>
                      <br />
                      {feedbackObj.overallSummary || "No feedback available."}
                    </p>
                    <p className="mt-3">
                      <strong>Topic Strengths:</strong>{" "}
                      {feedbackObj.topicStrengths && feedbackObj.topicStrengths.length > 0
                        ? feedbackObj.topicStrengths.join(", ")
                        : "None"}
                    </p>
                    <p className="mt-3">
                      <strong>Topic Weaknesses:</strong>{" "}
                      {feedbackObj.topicWeaknesses && feedbackObj.topicWeaknesses.length > 0
                        ? feedbackObj.topicWeaknesses.join(", ")
                        : "None"}
                    </p>
                    <div className="mt-3">
                      <strong>Next Steps:</strong>
                      <ul className="list-disc pl-5">
                        {feedbackObj.nextSteps && feedbackObj.nextSteps.length > 0 ? (
                          feedbackObj.nextSteps.map((step, idx) => (
                            <li key={idx}>
                              <span className="font-medium">Action:</span> {step.action} <br />
                              <span className="font-medium">Resource:</span> {step.resource}
                            </li>
                          ))
                        ) : (
                          <li>None</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p>No feedback available.</p>
                )}
                {feedbackSuccess && <p className="text-green-600 text-sm mb-2">Feedback sent!</p>}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={sendFeedback}
                    disabled={loadingFeedback}
                    className={`px-4 py-1 text-sm rounded text-white ${
                      loadingFeedback
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Send Feedback
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
