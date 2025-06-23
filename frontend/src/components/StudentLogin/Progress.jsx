import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Progress = ({ onBack }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        const response = await axios.get(`${API_BASE}/api/assessments/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setProgressData(response.data);
        } else {
          console.warn("Unexpected response:", response.data);
          setProgressData([]); // fallback to empty array
        }
      } catch (err) {
        setError("Failed to load progress data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [API_BASE]);

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition"
      >
        Back to Dashboard
      </button>

      <h2 className="text-2xl font-semibold mb-4">Progress Tracker</h2>

      {loading && <p>Loading progress data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {Array.isArray(progressData) && progressData.length > 0 ? (
        <ul className="space-y-4">
          {progressData.map((item, index) => (
            <li
              key={index}
              className="bg-white p-4 shadow rounded border border-gray-200"
            >
              <p className="font-medium text-lg">{item.assessmentTitle}</p>
              <p>Score: {item.score}</p>
              <p>Percentage: {item.percentage}%</p>
              <p>Date: {new Date(item.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No progress records found.</p>
      )}
    </div>
  );
};

export default Progress;
