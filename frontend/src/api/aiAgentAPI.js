// src/api/aiAgentAPI.js
import axios from "axios";

const aiAgentAPI = axios.create({
  baseURL: "http://localhost:5000/api/ai-agent", // Your Node.js controller route
});

export default aiAgentAPI;
