require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/views/index.html"));
});

app.get("/analyze", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/views/analyze.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/views/index.html"));
});

app.post("/api/prompt", async (req, res) => {
  const prompt = req.body.prompt;
  console.log("Received prompt:", prompt);

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is empty" });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a project idea generator. Return JSON only.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = chatCompletion.choices[0].message.content;
    console.log("OpenAI response:", content);

    res.json({ reply: content });
  } catch (err) {
    console.error(
      "OpenAI API Error:",
      err.response ? err.response.data : err.message
    );
    res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
});
app.post("/api/analyze", async (req, res) => {
  const { idea, description } = req.body;

  if (
    !idea ||
    !description ||
    idea.trim() === "" ||
    description.trim() === ""
  ) {
    return res.status(400).json({ error: "Idea or description is empty" });
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
      ✅ Ensure all values are arrays where needed (e.g., technologies, plan).
      ✅ Include precise and useful tools (e.g., 'React.js', 'Node.js', 'PostgreSQL', 'Figma').
      ✅ Do **not** include any explanation, comments, or markdown — just the raw JSON.

      Return only valid JSON.
      `;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a project idea generator. Return JSON only.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = chatCompletion.choices[0].message.content;
    console.log("OpenAI response for analyze:", content);

    res.json({ reply: content });
  } catch (err) {
    console.error(
      "OpenAI API Error:",
      err.response ? err.response.data : err.message
    );
    res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
