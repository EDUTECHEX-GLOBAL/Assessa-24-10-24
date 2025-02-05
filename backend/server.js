const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const connectDB = require("./config/dbConfig");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/webapp-routes/userRoutes");
const internRoutes = require("./routes/webapp-routes/internshipPostRoutes");
const skillnaavRoute = require("./routes/skillnaavRoute");
const applicationRoutes = require("./routes/webapp-routes/applicationRoutes");

app.use("/api/users", userRoutes);
app.use("/api/interns", internRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/skillnaav", skillnaavRoute);
app.use("/api/contact", skillnaavRoute);

// AWS Bedrock Client
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const MODEL_ID = process.env.MODEL_ID || "meta.llama3-70b-instruct-v1:0";

// Fetch search results from Serper.dev
async function fetchSearchResults(topic) {
    try {
        const response = await axios.post(
            "https://google.serper.dev/search",
            { q: topic, num: 5 },
            { headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" } }
        );

        return response.data.organic.map((result) => ({
            title: result.title,
            link: result.link,
            snippet: result.snippet,
        }));
    } catch (error) {
        console.error("Error fetching search results:", error);
        return [];
    }
}

// Generate AI response using AWS Bedrock
async function generateAIResponse(topic) {
  try {
      // Use Llama3's required prompt format
      const prompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>
      Provide a detailed, structured explanation of "${topic}" in a **bullet-point format**. 
      Ensure the response includes:
      - Key concepts
      - Important details
      - Examples or applications
      
      Format the response clearly using:
      - Bullet points (- or *)
      - Numbered lists (1., 2., 3.)
      
      Use concise yet informative points.
      
      <|eot_id|><|start_header_id|>assistant<|end_header_id|>
      `;      

      const input = {
          prompt: prompt,
          max_gen_len: 1000,
          temperature: 0.6,
          top_p: 0.9
      };

      const command = new InvokeModelCommand({
          modelId: MODEL_ID,
          body: JSON.stringify(input),
          contentType: "application/json",
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      if (!responseBody.generation || responseBody.generation.trim() === "") {
          console.warn("AWS Bedrock returned an empty response:", responseBody);
          return "AI was unable to generate a response. Please try again.";
      }

      return responseBody.generation;
  } catch (error) {
      console.error("Error generating AI response:", error);
      return "Failed to generate AI response.";
  }
}

// AI-Powered Study Recommendation API
app.post("/api/ai/study-recommendations", async (req, res) => {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    try {
        const [aiResponse, sources] = await Promise.all([
            generateAIResponse(topic),
            fetchSearchResults(topic),
        ]);

        res.json({ topic, aiResponse, sources });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "client/build")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "client/build/index.html"));
    });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
