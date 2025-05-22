import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
import { FaPaperPlane, FaSpinner, FaRobot, FaUser, FaRedo, FaClock, FaBars, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import aiAgentAPI from "../../api/aiAgentAPI";






const ProblemsolvingAgent = () => {
  const [mode, setMode] = useState("chat");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [curriculum, setCurriculum] = useState("CBSE");
  const [grade, setGrade] = useState(10);
  const [subject, setSubject] = useState("Math");
  const [topic, setTopic] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [questionToEvaluate, setQuestionToEvaluate] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatEndRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generatedQuestions, evaluationResult]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [generatedQuestions, evaluationResult]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return setError("Please enter a message.");
    setLoading(true);
    setError("");

    const userMessage = { sender: "user", text: prompt, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setPrompt("");

    try {
      const res = await aiAgentAPI.post("/chat", { message: prompt, history: messages.map(m => m.text) });
      const aiResponse = { sender: "ai", text: res.data.response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiResponse]);

      const newChat = {
        id: Date.now(),
        title: prompt.substring(0, 20) + (prompt.length > 20 ? '...' : ''),
        timestamp: format(new Date(), "dd/MM/yyyy, HH:mm:ss"),
        messages: [...messages, userMessage, aiResponse]
      };
      setRecentChats(prev => [newChat, ...prev]);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGeneratedQuestions(null);

    try {
      const res = await aiAgentAPI.post("/generate-assessment", {
        num_questions: numQuestions,
        curriculum,
        grade,
        subject,
        topic
      });
      setGeneratedQuestions(res.data.questions);
    } catch (err) {
      console.error(err);
      setError("Failed to generate assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEvaluationResult(null);

    try {
      const res = await aiAgentAPI.post("/evaluate-answer", {
        question: questionToEvaluate,
        correct_option: correctOption,
        selected_option: selectedOption
      });
      setEvaluationResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to evaluate answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setMode("chat");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-72 translate-x-0" : "-translate-x-full"} bg-white/80 backdrop-blur-lg shadow-lg transition-all duration-300 fixed z-20 h-full border-r border-gray-200/50`}>
        <div className="p-4 border-b border-gray-200/50 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center text-indigo-600">
            <FaClock className="mr-2"/> Recent Chats
          </h2>
          {/* <button 
            onClick={() => setSidebarOpen(false)} 
            className="p-1 rounded-full hover:bg-gray-100/50 transition-colors"
          >
            <FaChevronLeft className="text-gray-500 hover:text-gray-700"/>
          </button> */}
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-60px)]">
          {recentChats.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent chats</p>
          ) : (
            recentChats.map(chat => (
              <div
                key={chat.id}
                className="p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md border border-gray-200/30 hover:border-indigo-200/70 cursor-pointer transition-all duration-200"
                onClick={() => loadChat(chat)}
              >
                <p className="font-medium text-sm text-gray-700 truncate">{chat.title}</p>
                <p className="text-xs text-gray-500 mt-1">{chat.timestamp}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'} h-full`}>
        {/* Header - Always show the toggle button */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200/50">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-full hover:bg-gray-100/50 transition-colors"
            >
              {sidebarOpen ? (
                <FaChevronLeft className="text-gray-600 hover:text-gray-800"/>
              ) : (
                <FaChevronRight className="text-gray-600 hover:text-gray-800"/>
              )}
            </button>
            <h1 className="text-2xl font-bold flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <FaRobot className="text-indigo-500 mr-3"/> AI Learning Assistant
            </h1>
            <div className="hidden md:flex space-x-2">
              <button
                onClick={() => setMode("chat")}
                className={`px-4 py-1.5 rounded-full transition-all ${mode === 'chat' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/80 hover:bg-gray-100/50 border border-gray-200/50'}`}>
                Chat
              </button>
              <button
                onClick={() => setMode("generate")}
                className={`px-4 py-1.5 rounded-full transition-all ${mode === 'generate' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/80 hover:bg-gray-100/50 border border-gray-200/50'}`}>
                Generate MCQs
              </button>
              {/* <button
                onClick={() => setMode("evaluate")}
                className={`px-4 py-1.5 rounded-full transition-all ${mode === 'evaluate' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/80 hover:bg-gray-100/50 border border-gray-200/50'}`}>
                Evaluate Answer
              </button> */}
            </div>
          </div>
          <button
            onClick={() => { setMessages([]); setGeneratedQuestions(null); setEvaluationResult(null); }}
            className="flex items-center bg-red-500/20 backdrop-blur-sm border border-red-200/50 text-red-600 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <FaRedo className="mr-2"/> New Chat
          </button>
        </header>

        {/* Chat View */}
        {mode === 'chat' && (
          <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50/80 to-indigo-50/30 h-[calc(100vh-64px)]">
             <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: 'calc(100vh - 64px - 80px)' }}>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md p-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50">
                    <FaRobot className="mx-auto text-4xl text-indigo-500 mb-4"/>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">How can I help you today?</h2>
                    {/* <p className="text-gray-500">Ask me anything about chemistry, math, or other subjects.</p> */}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] md:max-w-[80%] flex ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 mx-2 flex items-end ${msg.sender === 'user' ? 'text-blue-500' : 'text-indigo-500'}`}>
                        {msg.sender === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                            <FaUser size={14} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                            <FaRobot size={14} />
                          </div>
                        )}
                      </div>
                      <div
                        className={`p-4 rounded-xl shadow-sm ${msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none border border-blue-400/30' 
                          : 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-none border border-gray-200/50'}`}
                      >
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                        {msg.sender === 'ai' && (
                          <div className="text-xs mt-2 text-gray-500">
                            {format(new Date(msg.timestamp), 'HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start items-center">
                  <div className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200/50 flex items-center shadow-sm">
                    <FaSpinner className="animate-spin mr-2 text-indigo-500" /> Generating response...
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </main>
            <footer className="bg-white/80 backdrop-blur-lg p-4 border-t border-gray-200/50">
              <form onSubmit={handleChatSubmit} className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Ask the AI assistant..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="flex-1 p-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70 backdrop-blur-sm shadow-sm transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-3 rounded-xl hover:shadow-md transition-all flex items-center"
                >
                  {loading ? <FaSpinner className="animate-spin mr-2"/> : <FaPaperPlane className="mr-2"/>}
                  Send
                </button>
              </form>
            </footer>
          </div>
        )}

        {/* Generate MCQs View */}
        {mode === 'generate' && (
          <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-br from-gray-50/80 to-indigo-50/30">
            <form onSubmit={handleGenerateSubmit} className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">Generate Assessment Questions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                  <input 
                    type="number" 
                    value={numQuestions} 
                    onChange={e=>setNumQuestions(e.target.value)} 
                    className="w-full p-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Curriculum</label>
                  <input 
                    type="text" 
                    value={curriculum} 
                    onChange={e=>setCurriculum(e.target.value)} 
                    className="w-full p-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <input 
                    type="number" 
                    value={grade} 
                    onChange={e=>setGrade(e.target.value)} 
                    className="w-full p-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={subject} 
                    onChange={e=>setSubject(e.target.value)} 
                    className="w-full p-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <input 
                  type="text" 
                  value={topic} 
                  onChange={e=>setTopic(e.target.value)} 
                  className="w-full p-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-lg hover:shadow-md transition-all flex items-center justify-center"
              >
                {loading? <FaSpinner className="animate-spin mr-2"/> : <FaPaperPlane className="mr-2"/>} Generate MCQs
              </button>

              {generatedQuestions && (
                <div className="mt-8 bg-white/90 p-6 rounded-xl shadow-sm border border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Generated Questions</h3>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{generatedQuestions}</ReactMarkdown>
                  </div>
                </div>
              )}
            </form>
          </main>
        )}

        {/* Evaluate Answer View */}
        {mode === 'evaluate' && (
          <main ref={contentRef} className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-br from-gray-50/80 to-indigo-50/30">
            <form onSubmit={handleEvaluateSubmit} className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200/50">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">Evaluate Student Answer</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                <textarea 
                  value={questionToEvaluate} 
                  onChange={e=>setQuestionToEvaluate(e.target.value)} 
                  className="w-full p-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Option</label>
                  <input 
                    type="text" 
                    value={correctOption} 
                    onChange={e=>setCorrectOption(e.target.value)} 
                    className="w-full p-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selected Option</label>
                  <input 
                    type="text" 
                    value={selectedOption} 
                    onChange={e=>setSelectedOption(e.target.value)} 
                    className="w-full p-3 border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white/70"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-lg hover:shadow-md transition-all flex items-center justify-center"
              >
                {loading? <FaSpinner className="animate-spin mr-2"/> : <FaPaperPlane className="mr-2"/>} Evaluate Answer
              </button>

              {evaluationResult && (
                <div className="mt-8 bg-white/90 p-6 rounded-xl shadow-sm border border-gray-200/50">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Evaluation Result</h3>
                  <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <p className="font-medium text-gray-700">{evaluationResult.result}</p>
                  </div>
                </div>
              )}
            </form>
          </main>
        )}
      </div>
    </div>
  );
};

export default ProblemsolvingAgent;
