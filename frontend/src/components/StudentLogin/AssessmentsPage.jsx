import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AssessmentsPage({ onBackHome }) {
  // State declarations for assessments, current question, answers, timer, etc.
  const [assessments, setAssessments] = useState([]);
  const [satAssessments, setSatAssessments] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [viewType, setViewType] = useState("standard"); // Toggle between standard and SAT views
  const [difficultyFilter, setDifficultyFilter] = useState(""); // Filter by difficulty level
  const timerRef = useRef(null);

  // Fetch assessments from API on component mount
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const token = userInfo?.token;

        if (!token) {
          toast.error("No token found. Please log in again.");
          return;
        }

        // Fetch standard assessments
        const standardRes = await fetch("/api/assessments/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const standardData = await standardRes.json();
        if (Array.isArray(standardData)) {
          setAssessments(standardData);
        } else {
          toast.error("Failed to load standard assessments");
        }

        // Fetch SAT assessments
        const satRes = await fetch("/api/sat-assessments/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const satData = await satRes.json();
        if (Array.isArray(satData)) {
          setSatAssessments(satData);
        } else {
          toast.error("Failed to load SAT assessments");
        }
      } catch (err) {
        toast.error("Failed to load assessments");
      }
    };

    fetchAssessments();
  }, []);

  // Handle standard assessment attempt
  const handleAttemptAssessment = async (assessmentId) => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const res = await fetch(
        `/api/assessments/${assessmentId}/attempt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load assessment");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions available - please contact your teacher");
      }

      setCurrentAssessment({
        ...data,
        type: "standard" // Mark as standard assessment
      });
      setTimeLeft(data.timeLimit * 60);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setSubmissionResult(null);
    } catch (err) {
      console.error("Assessment load error:", err.message);
      toast.error(err.message);
    }
  };

  // Handle SAT assessment attempt
  const handleAttemptSATAssessment = async (assessmentId) => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const res = await fetch(
        `/api/sat-assessments/${assessmentId}/attempt`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load SAT assessment");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No SAT questions available");
      }

      setCurrentAssessment({
        ...data,
        assessmentName: data.satTitle,
        subject: data.sectionType,
        gradeLevel: "SAT",
        timeLimit: data.timeLimit || 30, // Default to 30 minutes if not specified
        type: "sat" // Mark as SAT assessment
      });
      setTimeLeft((data.timeLimit || 30) * 60);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrentQuestionIndex(0);
      setSubmissionResult(null);
    } catch (err) {
      console.error("SAT Assessment load error:", err.message);
      toast.error(err.message);
    }
  };

  // Handle MCQ answer selection
  const handleAnswerSelect = (optionIndex) => {
    if (submissionResult) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  // Handle grid-in answer input (for SAT math questions)
  const handleGridAnswerChange = (e) => {
    const value = e.target.value;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  // Navigation between questions
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

  // Submit assessment and calculate results
  const handleSubmitAssessment = async () => {
    if (isSubmitting || submissionResult) return;
    
    // Validate all questions are answered before submission
    const unanswered = answers.findIndex(a => a === null || a === undefined);
    if (unanswered !== -1) {
      toast.error(`Please answer question ${unanswered + 1} before submitting`);
      setCurrentQuestionIndex(unanswered);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const isSAT = currentAssessment.type === "sat";

      let payload;

      if (isSAT) {
        // Prepare SAT-specific payload
        payload = {
          answers: answers.map((answer, i) => {
            const question = currentAssessment.questions[i];
            if (question.type === "mcq") {
              return typeof answer === "number" ? answer : -1;
            } else {
              return typeof answer === "string" ? answer.trim() : "";
            }
        }),
          timeTaken: currentAssessment.timeLimit * 60 - timeLeft,
        };
      } else {
        // Prepare standard assessment payload
        payload = {
          answers: answers.map((selectedIndex) =>
            selectedIndex !== null ? selectedIndex : -1
          ),
          timeTaken: currentAssessment.timeLimit * 60 - timeLeft,
        };
      }

      const endpoint = isSAT
        ? `/api/sat-assessments/${currentAssessment._id}/submit`
        : `/api/assessments/${currentAssessment._id}/submit`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        const { score, totalMarks, percentage } = data;
        toast.success(`Assessment submitted! Your score: ${score}/${totalMarks}`);
        setSubmissionResult({ score, totalMarks, percentage });

        // Refresh assessments list after submission
        if (isSAT) {
          const updatedSatRes = await fetch("/api/sat-assessments/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedSatData = await updatedSatRes.json();
          setSatAssessments(updatedSatData);
        } else {
          const updatedStandardRes = await fetch("/api/assessments/all", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedStandardData = await updatedStandardRes.json();
          setAssessments(updatedStandardData);
        }
      } else {
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      toast.error(err.message || "Error submitting assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Timer effect for assessment countdown
  useEffect(() => {
    if (!currentAssessment || timeLeft <= 0 || submissionResult) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentAssessment, submissionResult]);

  // Render assessment taking interface
  if (currentAssessment) {
    const currentQuestion = currentAssessment.questions?.[currentQuestionIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const totalQuestions = currentAssessment.questions.length;

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
        {/* Header with back button, assessment info, and timer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <button
            onClick={() => {
              setCurrentAssessment(null);
              setSubmissionResult(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{currentAssessment.assessmentName}</h2>
            <p className="text-gray-600">{currentAssessment.subject} • {currentAssessment.gradeLevel}</p>
          </div>
          
          {!submissionResult && (
            <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Time: {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          )}
        </div>

        {/* Progress bar showing question completion */}
        {!submissionResult && (
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-teal-600 h-2.5 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Main question/answer interface */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          {submissionResult ? (
            // Results display after submission
            <div className="text-center space-y-6 py-8">
              <div className="inline-block p-4 bg-green-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800">Assessment Submitted!</h3>
              
              <div className="max-w-md mx-auto bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-lg border border-teal-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Your Score</p>
                    <p className="text-3xl font-bold text-teal-600">
                      {submissionResult.score}<span className="text-gray-400">/{submissionResult.totalMarks}</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Percentage</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {submissionResult.percentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium"
                onClick={() => {
                  setCurrentAssessment(null);
                  setSubmissionResult(null);
                }}
              >
                Back to Assessments
              </button>
            </div>
          ) : currentQuestion ? (
            // Question display and navigation
            <>
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-teal-100 text-teal-800 font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  {currentQuestionIndex + 1}
                </span>
                <p className="text-lg font-semibold text-gray-800 whitespace-pre-line pt-1">
                 {currentQuestion.questionText.replace(/^\d+[\.\)]\s*/, '')}
                </p>
              </div>

              {currentQuestion.passage && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-md">
                  <h4 className="font-semibold text-yellow-800 mb-2">Passage</h4>
                  <p className="text-gray-700 whitespace-pre-line">
                    {currentQuestion.passage}
                  </p>
                </div>
              )}
            </div>

            {/* Answer options (MCQ or grid-in) */}
            <div className="space-y-3 mb-8">
              {currentQuestion.type === "mcq" && currentQuestion.options?.length === 4 ? (
                currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      answers[currentQuestionIndex] === index
                        ? "bg-teal-50 border-teal-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`mr-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestionIndex] === index
                            ? "border-teal-500 bg-teal-500"
                            : "border-gray-300"
                        }`}
                      >
                        {answers[currentQuestionIndex] === index && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                ))
              ) : (
                <input
                  type="text"
                  placeholder="Enter your answer"
                  value={answers[currentQuestionIndex] || ""}
                  onChange={handleGridAnswerChange}
                  className="w-full border border-gray-300 p-3 rounded-lg text-lg"
                />
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-4 border-t border-gray-200">
              <div>
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handlePrevQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex justify-end">
                {currentQuestionIndex < currentAssessment.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition font-medium"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitAssessment}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Assessment
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            </>
          ) : (
            <div className="text-pink-500 p-4 bg-pink-50 rounded-lg">
              No question found for this index. Please contact your instructor.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main assessments list view
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={onBackHome}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-500 font-medium pb-5"
      >
        ← Back Home
      </button>
     
      {/* Assessments header with view toggle and filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-violet-700">Available Assessments</h2>

        <div className="flex items-center gap-4">
          {(viewType === "sat" || viewType === "standard") && (
            <div className="relative">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all cursor-pointer"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="very hard">Very Hard</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View type toggle (Standard vs SAT) */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewType("standard")}
          className={`px-4 py-2 rounded-lg border font-semibold transition ${
            viewType === "standard"
              ? "bg-teal-600 text-white"
              : "bg-white text-teal-600 border-teal-600"
          }`}
        >
          Standard Assessments
        </button>
        <button
          onClick={() => setViewType("sat")}
          className={`px-4 py-2 rounded-lg border font-semibold transition ${
            viewType === "sat"
              ? "bg-pink-400 text-white"
              : "bg-white text-pink-600 border-pink-600"
          }`}
        >
          SAT Assessments
        </button>
      </div>

      {/* Assessments grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(viewType === "standard"
          ? assessments.filter((a) =>
              difficultyFilter ? a.difficulty === difficultyFilter : true
            )
          : satAssessments.filter((a) =>
              difficultyFilter ? a.difficulty === difficultyFilter : true
            )
        ).map((a) => (
          <div
            key={a._id}
            className="border p-4 rounded-lg shadow bg-white hover:shadow-md transition"
          >
            <h3 className="text-xl font-semibold text-gray-800">
              {viewType === "standard" ? a.assessmentName : a.satTitle}
            </h3>
            <p className="text-gray-600 mt-2">
              {viewType === "standard"
                ? `Subject: ${a.subject}`
                : `Section: ${a.sectionType}`}
            </p>
            <p className="text-gray-600">
              {viewType === "standard"
                ? `Difficulty: ${a.difficulty?.toUpperCase() || "N/A"} • Grade: ${a.gradeLevel}`
                : `Difficulty: ${a.difficulty?.toUpperCase() || "N/A"}`}
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Uploaded: {new Date(a.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {a.questions?.length || 0} questions • {a.timeLimit || 30} mins
            </p>
            {a.submission ? (
              <div className="mt-3 w-full bg-green-500 text-white text-center py-2 rounded font-semibold">
                Completed! {a.submission.score}/{a.submission.totalMarks}
              </div>
            ) : (
              <button
                onClick={() =>
                  viewType === "standard"
                    ? handleAttemptAssessment(a._id)
                    : handleAttemptSATAssessment(a._id)
                }
                className="mt-3 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
              >
                {viewType === "standard" ? "Attempt Assessment" : "Attempt SAT"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}