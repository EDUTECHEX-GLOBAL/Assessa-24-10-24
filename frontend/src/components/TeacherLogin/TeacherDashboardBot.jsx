import { useState, useEffect } from "react";
import { FiSend, FiX } from "react-icons/fi";
import { RiRobot2Line, RiRobot2Fill } from "react-icons/ri";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function TeacherDashboardBot({ userId }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I'm your Teaching Assistant. How can I guide you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0); // 🕐 Cooldown tracking

  const sendQuery = async () => {
    const now = Date.now();
    if (loading || !query.trim()) return;

    // ⏱ Prevent spam within 5 seconds
    if (now - lastSentAt < 5000) {
      alert("⏳ Please wait a few seconds before asking again.");
      return;
    }

    setLastSentAt(now);
    const newMessages = [...messages, { role: "user", text: query }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat/teacher", {
        userId,
        query,
      });
      const reply = res.data.reply;
      setMessages([...newMessages, { role: "bot", text: reply }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: "bot",
          text: "❌ Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setQuery("");
      setLoading(false);
    }
  };

  useEffect(() => {
    const chatContainer = document.querySelector(".chat-messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <motion.div
        className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <button
          className={`p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 ${
            open
              ? "bg-purple-600"
              : "bg-gradient-to-br from-purple-500 to-purple-600"
          } text-white`}
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <FiX className="text-xl sm:text-2xl" />
          ) : (
            <RiRobot2Fill className="text-xl sm:text-2xl" />
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-40 h-[70vh] max-h-[600px] bg-white rounded-xl shadow-lg flex flex-col border border-gray-200 overflow-hidden backdrop-blur-sm bg-opacity-90"
          >
            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <RiRobot2Line className="text-xl sm:text-2xl" />
                <span className="font-medium text-sm sm:text-base">
                  Teaching Assistant
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="flex-1 p-3 sm:p-4 overflow-y-auto chat-messages space-y-3 bg-gradient-to-b from-purple-50 to-purple-100">
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[85%] sm:max-w-[80%] ${
                      m.role === "user"
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-purple-100"
                    }`}
                  >
                    <p className="text-sm sm:text-base">{m.text}</p>
                    <div
                      className={`text-xs mt-1 opacity-80 text-right ${
                        m.role === "user"
                          ? "text-purple-100"
                          : "text-purple-600"
                      }`}
                    >
                      {m.role === "user" ? "You" : "Assistant"}
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-xl rounded-bl-none shadow-sm border border-purple-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                      <div
                        className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-purple-100 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-purple-400 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="Ask me anything..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendQuery()}
                  disabled={loading}
                />
                <motion.button
                  onClick={sendQuery}
                  disabled={loading || !query.trim()}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-full ${
                    loading || !query.trim()
                      ? "bg-purple-100 text-purple-300"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                  } transition-all shadow-sm`}
                >
                  <FiSend className="text-lg" />
                </motion.button>
              </div>
              <p className="text-xs text-purple-500 mt-2 text-center">
                Ask about assessments, feedback, student analytics, and more.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
