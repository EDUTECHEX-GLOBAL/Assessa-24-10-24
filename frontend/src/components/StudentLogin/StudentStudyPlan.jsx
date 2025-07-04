import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SmartLearningModal from "./SmartLearningModal";
import { motion } from "framer-motion";

export default function StudentStudyPlan({ onBackHome }) {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [activeTab, setActiveTab] = useState("all");

  const fetchStudyPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) {
        throw new Error("Authentication required");
      }

      const targetStudentId = studentId || userInfo._id;
      
      const response = await fetch(`/api/study-plan/${targetStudentId}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorDetails = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.details) {
            errorDetails += ` - ${errorData.details}`;
          }
        } catch {}
        
        throw new Error(errorDetails);
      }

      const data = await response.json();
      setPlan(data);
      
      const initialCompleted = {};
      data.subjects?.forEach(subject => {
        subject.topics?.forEach(topic => {
          topic.tasks?.forEach(task => {
            if (task.isCompleted) {
              initialCompleted[task.id] = true;
            }
          });
        });
      });
      setCompletedTasks(initialCompleted);
    } catch (err) {
      console.error("Study plan fetch failed:", err);
      setError(err.message);
      
      if (err.message.includes("401")) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const renderTask = (task) => {
    if (!task) return null;
    
    const isDone = completedTasks[task.id];
    const taskTypeIcon = {
      'concept': '📚',
      'remediation': '🔍',
      'practice': '✏️'
    }[task.type] || '📝';

    return (
      <motion.div 
        key={task.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative p-5 rounded-xl border-l-4 ${isDone ? 
          'bg-gray-50 border-gray-300' : 
          'bg-white border-indigo-500 shadow-sm hover:shadow-md transition-shadow'}`
        }
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{taskTypeIcon}</span>
              <h4 className={`font-medium ${isDone ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {task.title || 'Untitled Task'}
              </h4>
              {task.priority === 'high' && !isDone && (
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">High Priority</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {task.description || 'No description available'}
            </p>
            {task.type === 'remediation' && task.marksLost && (
              <div className="mt-2 text-xs text-red-600 font-medium">
                ⚠️ Lost {task.marksLost} marks
              </div>
            )}
          </div>
          <button
            onClick={() => !isDone && setActiveTask(task)}
            disabled={isDone}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${isDone ? 
              'bg-gray-200 text-gray-500 cursor-default' : 
              'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg'}`
            }
          >
            {isDone ? '✓ Completed' : 'Start'}
          </button>
        </div>
        {!isDone && (
          <div className="absolute bottom-2 right-2">
            <button 
              onClick={() => toggleTaskCompletion(task.id)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Mark as complete
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  const renderSubject = (subject) => {
    if (!subject) return null;
    
    const completedMinutes = subject.topics?.reduce((sum, topic) => {
      return sum + ((topic.tasks || []).filter(t => completedTasks[t.id]).length * 15);
    }, 0) || 0;

    const completionPercentage = Math.round(completedMinutes / (subject.totalMinutes || 1) * 100);

    return (
      <motion.div 
        key={subject.subject}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                <span className="text-xl">📘</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {subject.subject || 'Unknown Subject'}
                </h3>
                <p className="text-sm text-gray-500">
                  {subject.goal || 'Improve your skills'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-indigo-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{completedMinutes} mins</span>
              <span>{subject.totalMinutes || 0} mins</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {(subject.topics || []).map(topic => (
            <div key={topic.name} className="border-t border-gray-100 pt-5">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900 text-lg">
                  {topic.name || 'General Topic'}
                </h4>
                {(topic.wrongCount || topic.marksLost) && (
                  <div className="flex gap-2">
                    {topic.wrongCount ? (
                      <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                        {topic.wrongCount} errors
                      </span>
                    ) : null}
                    {topic.marksLost ? (
                      <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full">
                        {topic.marksLost} marks lost
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(topic.tasks || []).map(renderTask)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const filteredSubjects = plan?.subjects?.filter(subject => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") {
      return subject.topics?.some(topic => 
        topic.tasks?.some(task => completedTasks[task.id])
      );
    }
    if (activeTab === "pending") {
      return subject.topics?.some(topic => 
        topic.tasks?.some(task => !completedTasks[task.id])
      );
    }
    return true;
  });

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/login");
      return;
    }
    
    fetchStudyPlan();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading your personalized study plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-red-100"
      >
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-center mb-2 text-gray-800">Error loading study plan</h3>
        <p className="text-gray-600 text-center mb-6">{error}</p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={fetchStudyPlan}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={onBackHome}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-indigo-50 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">No Study Plan Available</h3>
        <p className="text-gray-600 mb-6">Complete an assessment to generate your personalized study plan.</p>
        <button 
          onClick={onBackHome}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <button
            onClick={onBackHome}
            className="mb-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Study Plan</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
              Week {plan.week || 'Current'}
            </span>
            {plan.dueDate && (
              <span className="text-sm text-gray-500">
                Due {new Date(plan.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {['all', 'pending', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab 
                  ? 'bg-white shadow text-indigo-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {plan.aiTip && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-indigo-800 mb-1">AI Recommendation</h4>
              <p className="text-indigo-700">{plan.aiTip}</p>
            </div>
          </div>
        </motion.div>
      )}

      {(plan.focusAreas?.length > 0) && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-5">Priority Focus Areas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plan.focusAreas.slice(0, 4).map((area, index) => (
              <motion.div 
                key={`${area.subject}-${area.topic}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    index % 4 === 0 ? 'bg-red-50 text-red-600' :
                    index % 4 === 1 ? 'bg-amber-50 text-amber-600' :
                    index % 4 === 2 ? 'bg-green-50 text-green-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {index % 4 === 0 ? '❗' : index % 4 === 1 ? '⚠️' : index % 4 === 2 ? '✅' : '🔍'}
                  </div>
                  <h4 className="font-medium text-gray-900">{area.topic || 'General Topic'}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">{area.subject || 'General Subject'}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Errors</span>
                    <span className="font-medium">{area.wrongCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Marks Lost</span>
                    <span className="font-medium">{area.marksLost || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Completion</span>
                    <span className="font-medium">{area.completion || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        index % 4 === 0 ? 'bg-red-500' :
                        index % 4 === 1 ? 'bg-amber-500' :
                        index % 4 === 2 ? 'bg-green-500' :
                        'bg-blue-500'
                      }`} 
                      style={{ width: `${area.completion || 0}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {filteredSubjects?.length > 0 ? (
          filteredSubjects.map(renderSubject)
        ) : (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'completed' ? 'No completed tasks yet' : 'No pending tasks'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {activeTab === 'completed' 
                ? 'Start working on your tasks and mark them as complete when finished.' 
                : 'You have no pending tasks in this category. Great job!'}
            </p>
          </div>
        )}
      </div>

      <SmartLearningModal
        isOpen={!!activeTask}
        task={activeTask}
        onClose={(taskId) => {
          if (taskId) toggleTaskCompletion(taskId);
          setActiveTask(null);
        }}
      />
    </div>
  );
}