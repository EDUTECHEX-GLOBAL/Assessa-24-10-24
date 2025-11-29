import React, { useEffect, useState } from "react";

export default function DailyQuiz({ quizType, onFinish, token }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");

  // ==========================
  // LOAD QUIZ
  // ==========================
  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/daily-quiz/today?type=${quizType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.status === 404) {
          setError("Today's quiz is not generated yet.");
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.submitted) {
          onFinish();
          return;
        }

        if (!data.questions || data.questions.length === 0) {
          setError("Quiz not available right now.");
          setLoading(false);
          return;
        }

        const cleanQuestions = data.questions.map((q) => ({
          questionText: q.questionText || q.question || "",
          options: q.options || [],
          correctAnswer: q.correctAnswer,
        }));

        setQuestions(cleanQuestions);
      } catch (err) {
        setError("Unable to load quiz.");
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizType, token, onFinish]);

  // ==========================
  // SUBMIT QUIZ
  // ==========================
  const handleSubmit = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/daily-quiz/submit?type=${quizType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        }
      );

      onFinish();
    } catch (err) {
      alert("Failed to submit quiz.");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-lg font-semibold">
        Loading quiz...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-lg text-red-600 font-medium">
        {error}
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="w-full flex flex-col items-center py-6 px-4">

      {/* TITLE */}
      <div className="w-full max-w-2xl mb-6 text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {quizType === "standard" ? "Standard Quiz" : "SAT Quiz"}
        </h1>

        {/* Progress Bar */}
        <div className="w-full bg-gray-300 h-2 rounded-full mt-4">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>

        <p className="text-gray-600 mt-3 text-md tracking-wide">
          Question {current + 1} of {questions.length}
        </p>
      </div>

      {/* QUESTION CARD */}
      <div
        className="
        w-full max-w-2xl
        bg-white/95 backdrop-blur-xl
        border border-gray-200
        rounded-2xl shadow-lg
        p-6
      "
      >
        <p className="text-xl font-semibold text-gray-900 mb-5 leading-snug">
          {current + 1}. {q.questionText}
        </p>

        {/* OPTIONS */}
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <label
              key={i}
              className={`block cursor-pointer border rounded-xl p-3 text-gray-800 
              flex items-center gap-3 transition-all
              ${
                answers[current] === i
                  ? "bg-indigo-100 border-indigo-500 shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <input
                type="radio"
                className="w-5 h-5 text-indigo-600"
                name={`q-${current}`}
                onChange={() => setAnswers({ ...answers, [current]: i })}
                checked={answers[current] === i}
              />
              <span className="text-[1rem]">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="w-full max-w-2xl flex justify-between mt-8">
        <button
          disabled={current === 0}
          onClick={() => setCurrent(current - 1)}
          className={`px-6 py-3 rounded-xl font-semibold shadow 
            ${
              current === 0
                ? "bg-gray-300 text-gray-500"
                : "bg-gray-900 text-white hover:bg-black"
            }
          `}
        >
          Previous
        </button>

        {current === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrent(current + 1)}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
