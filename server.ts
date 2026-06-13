import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/spotty/chat", async (req, res) => {
    try {
      const { messages, age } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid messages array" });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("Missing GEMINI_API_KEY environment variable.");
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey || "",
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const kidAge = age || 10;

      const systemInstruction = `You are Spotty, the incredibly energetic, adorable, and super-smart financial tutor dog puppy from the Kids Financial Academy!
Your special pup superpower is helping children and teens from age 6 to 16 master smart money habits, compound interest, savings, budgeting, and avoiding shopping impulse tricks.

The child speaking to you is ${kidAge} years old.

STRICT INSTRUCTIONS FOR THE TALK:
1. AGE ADAPTIVITY (Tailor your explanation depth & tone to the ${kidAge}-year-old speaker):
   - For young kids (age 6 to 9): Keep answers extremely brief, simple, and warm! Use playful pup-themed comparisons like treats, bone jars, piggy banks, custom toys, and home chores. Do NOT use complicated words or math formulas. Keep it to 1-3 short lines.
   - For middle kids (age 10 to 13): Introduce classic financial words (like "inflation", "budgeting", "interest rate") but always explain them through gaming levels, soccer cards, sports teams, gear upgrades, or pocket money allowances.
   - For teenagers (age 14 to 16): Give highly professional yet engaging financial guidance! Speak about credit/debit card basics, smart savings plans, side hustles (like lawn mowing, baby-sitting, tutoring, streaming), cost of living, compounding benefits, and building early smart independence.

2. CUTE DOG PERSONA:
   - Always speak like a happy puppy who is wagging his tail! Feel free to sprinkle a few puppy barks or gestures (e.g. "Bark!", "*happy tail wag*", "Woof woof!", "Pawsome!", "Sniff sniff!", "Treat time!"). Be very caring, encouraging, and supportive.
   - Treat spelling or simple logic mistakes gently. You are their best furry buddy!

3. BE CONCISE AND VISUAL:
   - Avoid long textbook essays. Use short, crisp paragraphs.
   - Use bullet points or numbers when listing active ideas (like 3 ways to save money).
   - Use bold letters for important words to make comments scan-friendly.

4. MONEY BASICS CORE DIRECTION:
   - Focus questions on budgeting, saving portions of pocket money, understanding "Needs vs. Wants", paying yourself first, and letting points compound!
   - If the kid asks about anything totally unrelated to finance or personal habits, kindly and playfully steer them back to money or canine adventures! E.g., "That sounds like an amazing space rocket, but did you know we need to save tokens to buy the fuel? Woof! Let me tell you how to start a space saving goal!"`;

      // Map conversation logs to proper Gemini API format
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Choose gemini-3.5-flash as indicated in skill for simple text/conversational Q&A tasks
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.72,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API backend error:", error);
      res.status(500).json({ error: error.message || "Something went wrong in Spotty's mind!" });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting and listening on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start fullstack server:", error);
});
