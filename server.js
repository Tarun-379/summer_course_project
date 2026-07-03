// ============================================================
// server.js
// ------------------------------------------------------------
// This is the BACKEND of the chatbot.
// It runs on Node.js using the Express framework.
//
// Responsibilities of this file:
//   1. Serve the static frontend files (HTML/CSS/JS) from /public
//   2. Provide a POST /chat endpoint that:
//        - receives a user message from the frontend
//        - forwards it to the Google Gemini API (server-side
//          only, so the API key is NEVER exposed to the browser)
//        - returns the AI's reply as JSON
//   3. Handle errors gracefully and return friendly messages
// ============================================================

// ---- 1. Load environment variables from .env -----------------
// This MUST be the first thing that runs, so that
// process.env.GEMINI_API_KEY is available everywhere below.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ---- 2. Basic sanity check for the API key --------------------
// If the developer forgot to set up their .env file, fail fast
// with a clear message instead of a confusing crash later.
if (!process.env.GEMINI_API_KEY) {
  console.error(
    '\n❌ ERROR: GEMINI_API_KEY is missing.\n' +
      'Create a ".env" file in the project root (copy .env.example) ' +
      'and add your Gemini API key there.\n'
  );
  process.exit(1); // Stop the server — no point running without a key.
}

// ---- 3. Initialize the Gemini client ---------------------------
// The API key lives only here, on the server. The browser never
// sees it because all AI calls are proxied through this backend.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction:
    "You are a friendly, helpful assistant. Keep answers concise and clear.",
});

// ---- 4. Create the Express app ---------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// ---- 5. Middleware ----------------------------------------------
app.use(cors()); // Allow cross-origin requests (useful during local dev)
app.use(express.json()); // Parse incoming JSON request bodies

// Serve the frontend files from the project root.
// The UI lives in index.html, style.css, and script.js at the repository root.
app.use(express.static(__dirname));

// ---- 6. In-memory conversation store (very simple) --------------
// NOTE: This is a minimal, single-user demo. It keeps the last
// conversation in server memory only (resets when the server
// restarts). For a real multi-user app you'd store this per
// session/user in a database instead.
//
// Gemini expects history as an array of { role, parts } objects,
// where role is "user" or "model" (NOT "assistant").
let conversationHistory = [];

// ---- 7. POST /chat  — the main chatbot endpoint ------------------
app.post('/chat', async (req, res) => {
  try {
    const userMessage = (req.body.message || '').trim();

    // Basic input validation
    if (!userMessage) {
      return res.status(400).json({
        error: 'Message cannot be empty. Please type something and try again.',
      });
    }

    // Guard against the history growing forever — keep only the
    // last 20 turns to control token usage.
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    // ---- Start a chat session with the existing history ----
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    // ---- Send the new message and wait for Gemini's reply ----
    const result = await chat.sendMessage(userMessage);
    const botReply = result.response.text()?.trim();

    if (!botReply) {
      throw new Error('Empty response received from the AI model.');
    }

    // Save both the user's message and the model's reply into
    // history, so future messages have context.
    conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    conversationHistory.push({ role: 'model', parts: [{ text: botReply }] });

    // Send the reply back to the frontend
    res.json({ reply: botReply });
  } catch (error) {
    // ---- Centralized error handling ----
    console.error('❌ Error in /chat endpoint:', error.message);

    // Distinguish between common failure types for a better
    // frontend error message.
    const status = error.status || error.code;

    if (status === 400 && /API key/i.test(error.message || '')) {
      return res.status(500).json({
        error: 'Server configuration error: invalid API key.',
      });
    }
    if (status === 429) {
      return res.status(429).json({
        error: 'The AI service is busy right now (rate limit). Please try again shortly.',
      });
    }

    // Generic fallback error
    res.status(500).json({
      error: 'Something went wrong while talking to the AI. Please try again.',
    });
  }
});

// ---- 8. Endpoint to reset conversation memory on the server -----
// Called when the user clicks "Clear Chat" on the frontend, so the
// server's conversation context is wiped too (not just the UI).
app.post('/clear', (req, res) => {
  conversationHistory = [];
  res.json({ status: 'cleared' });
});

// ---- 9. Fallback route ---------------------------------------------
// Any unmatched route just serves the main page (simple SPA behavior).
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- 10. Start the server -------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Chatbot server running at http://localhost:${PORT}`);
});
