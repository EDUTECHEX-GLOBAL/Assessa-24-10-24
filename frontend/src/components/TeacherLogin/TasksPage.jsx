import React from "react";
import { FaClipboardCheck } from "react-icons/fa";

export default function TasksPage({ tasks, onBack }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm relative">

      {/* ------- TOP BACK BUTTON ------- */}
      <button
        onClick={onBack}
        className="mb-6 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-500 
               text-white rounded-lg hover:opacity-90 transition shadow"
      >
        ← Back to Dashboard
      </button>

      {/* ------- PAGE TITLE ------- */}
      <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center">
        <FaClipboardCheck className="mr-2 text-pink-500" />
        Upcoming Tasks
      </h2>

      {/* ------- TASK LIST ------- */}
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-lg"> No pending tasks</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border p-4 rounded-lg bg-white 
                         hover:bg-pink-50 hover:shadow transition"
            >
              <p className="font-semibold text-gray-900">{task.title}</p>

              <p className="text-sm text-gray-600">
                Student: {task.studentName}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Submitted: {task.submittedAt}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
