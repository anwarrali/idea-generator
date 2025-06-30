const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
app.get("/", (req, res) => {
  res.send("Server is running!");
});
const path = require("path");
app.use(express.static(path.join(__dirname, "../client")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "index.html"));
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
