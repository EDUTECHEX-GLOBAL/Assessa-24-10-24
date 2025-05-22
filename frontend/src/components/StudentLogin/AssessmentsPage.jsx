import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        if (!token) {
          toast.error("No token found. Please log in again.");
          return;
        }

        const res = await fetch("http://localhost:5000/api/assessments/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setAssessments(data);
        } else {
          toast.error("Invalid response from server");
        }
      } catch (err) {
        toast.error("Failed to load assessments");
      }
    };

    fetchAssessments();
  }, []);

 const handleAttemptAssessment = async (assessmentId) => {
  try {
    const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
    const res = await fetch(
      `http://localhost:5000/api/assessments/${assessmentId}/attempt`,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        } 
      }
    );

    const data = await res.json();
    
    if (!res.ok) {
      console.error('Server response:', data); // Add this for debugging
      throw new Error(data.message || 'Failed to load assessment');
    }

    // Add validation
    if (!data.questions || data.questions.length === 0) {
      throw new Error('No questions available - please contact your teacher');
    }
    setCurrentAssessment(data);
    setTimeLeft(data.timeLimit * 60);
    setAnswers(new Array(data.questions.length).fill(null));
    setCurrentQuestionIndex(0);

  } catch (err) {
    console.error('Assessment load error:', err.message);
    toast.error(err.message);
  }
};

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAssessment = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const res = await fetch(
        `http://localhost:5000/api/assessments/${currentAssessment._id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers,
            timeTaken: currentAssessment.timeLimit * 60 - timeLeft,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Assessment submitted successfully!");
        setCurrentAssessment(null);
        // Optionally navigate to results page
      } else {
        toast.error(data.message || "Submission failed");
      }
    } catch (err) {
      toast.error("Error submitting assessment");
    }
  };

  // Timer effect
  useEffect(() => {
    if (!currentAssessment || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentAssessment, timeLeft]);

  // In the assessment rendering part:
if (currentAssessment) {
  const currentQuestion = currentAssessment.questions?.[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{currentAssessment.assessmentName}</h2>
        <div className="text-lg font-semibold">
          Time Left: {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {currentQuestion ? (
          <>
            <div className="mb-4">
              <span className="font-medium">Question {currentQuestionIndex + 1}:</span>
              <p className="mt-2 text-lg">{currentQuestion.questionText}</p>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded cursor-pointer ${
                    answers[currentQuestionIndex] === index
                      ? "bg-teal-100 border-teal-500"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </div>
              ))}
            </div>
          </>
        ) : (
  <div className="text-red-500">No question found for this index.</div>
)}


          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {currentQuestionIndex < currentAssessment.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-teal-600 text-white rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmitAssessment}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-teal-700 mb-6">Available Assessments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {assessments.map((a) => (
          <div key={a._id} className="border p-4 rounded-lg shadow bg-white">
            <h3 className="text-xl font-semibold">{a.assessmentName}</h3>
            <p className="text-gray-600">Subject: {a.subject}</p>
            <p className="text-gray-600">Grade: {a.gradeLevel}</p>
            <p className="text-sm text-gray-400 mt-1">
              Uploaded: {new Date(a.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {a.questions?.length || 0} questions • {a.timeLimit} mins
            </p>
            <button
              onClick={() => handleAttemptAssessment(a._id)}
              className="mt-3 w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
            >
              Attempt Assessment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}