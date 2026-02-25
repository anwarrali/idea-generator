const OpenAI = require("openai");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});

// Validate API key
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

// Security: Don't log the full API key, just check if it exists
console.log("✅ OPENAI_API_KEY is set");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/", limiter); // Apply rate limiting to API routes
app.use(express.static(path.join(__dirname, "../client")));

// Helper function to validate JSON structure
function validateProjectResponse(parsed) {
  const required = ["idea", "requirements", "technologies", "plan"];
  const reqFields = ["functional", "non_functional", "skills_needed"];

  // Check main structure
  for (const field of required) {
    if (!parsed[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Check requirements structure
  for (const field of reqFields) {
    if (
      !parsed.requirements[field] ||
      !Array.isArray(parsed.requirements[field])
    ) {
      throw new Error(`Requirements missing or invalid: ${field}`);
    }
  }

  // Check arrays
  if (!Array.isArray(parsed.technologies)) {
    throw new Error("Technologies must be an array");
  }

  if (!Array.isArray(parsed.plan)) {
    throw new Error("Plan must be an array");
  }

  return true;
}

// Sanitize AI response
function sanitizeAIResponse(content) {
  // Remove markdown code blocks if present
  let clean = content.replace(/```json|```/g, "").trim();

  // Try to extract JSON if it's wrapped in other text
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    clean = jsonMatch[0];
  }

  return clean;
}

app.post("/api/prompt", async (req, res) => {
  const prompt = req.body.prompt;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is empty" });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Consistent model
      messages: [
        {
          role: "system",
          content:
            "You are a project idea generator. Return ONLY valid JSON without any additional text, markdown, or explanation.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = chatCompletion.choices[0].message.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Sanitize and validate
    const sanitized = sanitizeAIResponse(content);
    let parsed;

    try {
      parsed = JSON.parse(sanitized);
      validateProjectResponse(parsed);
    } catch (parseError) {
      console.error("❌ Invalid JSON from OpenAI:", content);
      return res.status(500).json({
        error: "Invalid response format from AI",
        details: "The AI returned an invalid format. Please try again.",
      });
    }

    res.json({ reply: content });
  } catch (err) {
    console.error("❌ OpenAI API Error:", err.message);
    res.status(500).json({
      error: "Failed to generate project idea",
      details: "Please try again in a moment.",
    });
  }
});

app.post("/api/analyze", async (req, res) => {
  const { idea, description } = req.body;

  if (!idea?.trim() || !description?.trim()) {
    return res.status(400).json({ error: "Idea and description are required" });
  }

  const prompt = `
    You are a senior technical project consultant.

    A user has submitted the following idea:
    - Idea Title: ${idea}
    - Description: ${description}

    Please generate a **detailed and professional** project analysis in **valid JSON format only**, using this exact structure:

    {
      "idea": "A professional and refined project title",
      "requirements": {
        "functional": [
          "List of clearly defined, specific, and actionable functional requirements"
        ],
        "non_functional": [
          "List of non-functional requirements (performance, scalability, UX, security, etc.)"
        ],
        "skills_needed": [
          "Technical skills or knowledge areas required to build the project"
        ]
      },
      "technologies": [
        "List of modern, relevant programming languages, frameworks, libraries, and tools"
      ],
      "plan": [
        "Step 1: ...",
        "Step 2: ...",
        "...",
        "Final Step: Deployment or Launch"
      ]
    }

    ✅ Make the output detailed and technically sound.
    ✅ Ensure all values are arrays where needed.
    ✅ Include precise and useful tools (e.g., 'React.js', 'Node.js', 'PostgreSQL').
    ✅ Do **not** include any explanation, comments, or markdown — just the raw JSON.

    Return only valid JSON.
  `;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Consistent model
      messages: [
        {
          role: "system",
          content:
            "You are a project idea generator. Return ONLY valid JSON without any additional text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = chatCompletion.choices[0].message.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Sanitize and validate
    const sanitized = sanitizeAIResponse(content);
    let parsed;

    try {
      parsed = JSON.parse(sanitized);
      validateProjectResponse(parsed);
    } catch (parseError) {
      console.error("❌ Invalid JSON from OpenAI:", content);
      return res.status(500).json({
        error: "Invalid response format from AI",
        details: "The AI returned an invalid format. Please try again.",
      });
    }

    res.json({ reply: content });
  } catch (err) {
    console.error("❌ OpenAI API Error:", err.message);
    res.status(500).json({
      error: "Failed to analyze project idea",
      details: "Please try again in a moment.",
    });
  }
});

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/views/index.html"));
});

app.get("/analyze", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/views/analyze.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../client/views/index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({
    error: "Internal server error",
    details: "Something went wrong. Please try again.",
  });
});

const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ API URL: ${API_URL}`);
});
