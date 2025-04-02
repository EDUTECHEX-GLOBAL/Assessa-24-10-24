import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaPaperPlane, FaSpinner, FaRobot, FaUser, FaRedo, FaClock, FaBars, FaTimes } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";

const ProblemsolvingAgent = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatEndRef = useRef(null);

  // Scroll to bottom after new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setLoading(true);
    setError("");

    const userMessage = { sender: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    try {
      const res = await axios.post("https://api.assessaai.com/api/ai-agent/ask-ai", { prompt });

      const aiResponse = { 
        sender: "ai", 
        text: res.data.message, 
        timestamp: new Date().toISOString() 
      };

      const newChat = {
        id: Date.now(),
        title: prompt.length > 20 ? `${prompt.substring(0, 20)}...` : prompt,
        timestamp: format(new Date(), "dd/MM/yyyy, HH:mm:ss"),
        messages: [...messages, userMessage, aiResponse],
      };

      setMessages((prev) => [...prev, aiResponse]);
      setRecentChats((prev) => [newChat, ...prev]);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } bg-white shadow-md transition-all duration-300 overflow-hidden md:w-72 sm:w-full fixed md:relative z-20`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-bold flex items-center">
            <FaClock className="mr-2 text-indigo-500" /> Recent Chats
          </h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-60px)]">
          {recentChats.length === 0 ? (
            <p className="text-gray-500 text-center">No recent chats</p>
          ) : (
            recentChats.map((chat) => (
              <div
                key={chat.id}
                className="p-4 bg-gray-100 rounded-lg shadow hover:bg-indigo-50 cursor-pointer transition"
                onClick={() => loadChat(chat)}
              >
                <p className="font-semibold text-sm md:text-base">{chat.title}</p>
                <p className="text-xs md:text-sm text-gray-500">{chat.timestamp}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">

        {/* Header */}
        <header className="bg-white shadow-md p-4 md:p-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-800 transition"
            >
              <FaBars size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <FaRobot className="text-indigo-500 mr-3" /> AI Agent
            </h1>
          </div>
          <button
            onClick={() => setMessages([])}
            className="flex items-center bg-red-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-red-600 transition"
          >
            <FaRedo className="mr-2" /> Reset Chat
          </button>
        </header>

        {/* Chat Window */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-gray-500 mt-10">
                Start a new conversation by asking a question!
              </p>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 md:p-4 rounded-lg shadow-md max-w-[80%] sm:max-w-[95%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="flex items-center">
                    {msg.sender === "user" ? (
                      <FaUser className="mr-2" />
                    ) : (
                      <FaRobot className="mr-2 text-indigo-500" />
                    )}
                    <div className="text-sm leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-center">
                <div className="p-4 rounded-lg bg-gray-200 text-gray-800 shadow-md">
                  <FaSpinner className="animate-spin mr-2" /> Generating response...
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 mt-4 text-center">{error}</p>
            )}

            <div ref={chatEndRef}></div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white p-4 md:p-6 shadow-md sticky bottom-0 z-10">
          <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Ask the AI agent..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 p-3 md:p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="submit"
              className="bg-indigo-500 text-white px-4 md:px-6 py-3 rounded-lg hover:bg-indigo-600 transition flex items-center"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <>
                  <FaPaperPlane className="mr-2" /> Send
                </>
              )}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default ProblemsolvingAgent;
