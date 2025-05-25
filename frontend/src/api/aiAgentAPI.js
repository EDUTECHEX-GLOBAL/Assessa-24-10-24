// src/api/aiAgentAPI.js
import axios from "axios";

const aiAgentAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/ai-agent",
});

export default aiAgentAPI;
