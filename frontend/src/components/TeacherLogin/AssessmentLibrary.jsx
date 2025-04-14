import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AssessmentLibrary = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found, redirecting to login...");
        navigate("/login"); // Redirect to login page if not authenticated
        return;
      }

      try {
        const { data } = await axios.get("/api/assessments/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAssessments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assessments", error);
        setLoading(false);

        // Optional: handle unauthorized
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchAssessments();
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assessment Library</h1>
      {loading ? (
        <p>Loading assessments...</p>
      ) : assessments.length === 0 ? (
        <p>No assessments uploaded yet.</p>
      ) : (
        <div className="grid gap-4">
          {assessments.map((a) => (
            <div
              key={a._id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{a.assessmentName}</h2>
                <p className="text-sm text-gray-500">
                  {a.subject} • Grade {a.gradeLevel}
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href={a.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                >
                  Preview
                </a>
                <a
                  href={a.signedUrl}
                  download
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentLibrary;
