import { useState, useEffect } from "react";

export default function SmartLearningModal({ isOpen, task, onClose }) {
  const [step, setStep] = useState(1);
  const [understanding, setUnderstanding] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setUnderstanding(0);
      setAnswer("");
      setIsCorrect(null);
    }
  }, [isOpen, task]);

  if (!isOpen || !task) return null;

  const handleSubmit = () => {
    if (task.type === 'practice') {
      // Validate answer for practice questions
      const correct = task.correctAnswer === parseInt(answer);
      setIsCorrect(correct);
      if (!correct) return;
    }
    onClose(task.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold text-indigo-700">
          {task.type === 'concept' ? 'Concept Review' : 
           task.type === 'remediation' ? 'Question Review' : 'Practice Session'}
        </h2>

        {step === 1 && (
          <>
            {task.type === 'remediation' && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3">
                <p className="font-semibold text-sm">❌ You missed this question:</p>
                <p className="text-sm mt-1">{task.questionText}</p>
                <div className="text-xs mt-2 grid grid-cols-2 gap-1">
                  <span className="text-red-600">Your answer: {task.studentAnswer}</span>
                  <span className="text-green-600">Correct: {task.correctAnswer}</span>
                </div>
                {task.explanation && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold">Explanation:</p>
                    <p className="text-xs">{task.explanation}</p>
                  </div>
                )}
              </div>
            )}

            {task.type === 'concept' && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm font-semibold">📚 Concept Overview</p>
                <p className="text-sm mt-1">{task.description}</p>
              </div>
            )}

            {task.type === 'practice' && (
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm font-semibold">✏️ New Practice Question</p>
                <p className="text-sm mt-1">{task.questionText}</p>
                <div className="space-y-2 mt-3">
                  {task.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAnswer(i.toString())}
                      className={`w-full text-left p-2 text-sm rounded border ${answer === i.toString() ? 'bg-blue-100 border-blue-300' : 'border-gray-300'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {isCorrect === false && (
                  <p className="text-red-500 text-xs mt-2">Incorrect, try again</p>
                )}
              </div>
            )}

            <div className="pt-4">
              <p className="text-sm mb-2">Rate your understanding now:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setUnderstanding(num)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${understanding === num ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={understanding < 1 || (task.type === 'practice' && !answer)}
                className={`px-4 py-2 text-sm rounded ${(understanding < 1 || (task.type === 'practice' && !answer)) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Explain this in your own words:</p>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Type your explanation here..."
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
              >
                Mark Complete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}