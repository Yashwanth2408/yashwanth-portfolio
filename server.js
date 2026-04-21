'use strict';

const path   = require('path');
const express = require('express');
const dotenv  = require('dotenv');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

dotenv.config();

const app          = express();
const PORT         = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/* ── In-memory conversation history per session ───────────────────────────
   Simple approach: one shared history for the server instance.
   Good enough for a portfolio — no auth needed.                          */
let conversationHistory = [];
const MAX_HISTORY_TURNS = 10; // keep last 10 turns (20 messages) to avoid token bloat

/* ── The JARVIS system persona ────────────────────────────────────────────
   Split into system role so the LLM properly separates identity from query */
const SYSTEM_PROMPT = `You are JARVIS — the terminal AI embedded inside Yashwanth Balaji's portfolio.

Your personality:
- Intelligent, sharp, and confident — like a well-trained AI assistant with character
- Conversational and natural for casual questions ("hello", "how are you", "what's up")
- Precise and structured for technical or factual questions
- Never robotic or overly formal for simple greetings
- Concise — 2 to 5 sentences for most answers. Longer only when depth is genuinely needed
- No markdown formatting — no asterisks, no hashes, no bullet dashes. Plain terminal text only
- You can use numbered lists (1. 2. 3.) when listing things, but keep them tight

About Yashwanth Balaji (answer these accurately):
- AI/ML Engineer and Founder of LatentFlow.ai — based in Chennai, India
- Builds AI chatbots, intelligent workflows, and websites
- Key projects: IMARA (multi-agent research assistant), NEUROCODE (Python SAST scanner), Clinical-Doc-AI (doctor-patient audio to structured clinical notes), AutoProcure (supply chain agent), SEI Wise Voice Agent (real-time voice AI)
- AI Research Intern at Infosys Springboard — built voice pipeline across 11 languages (Whisper ASR, Edge TTS, FFmpeg)
- Vice Captain of Team E-Blitz Racing (EV go-kart design team)
- Triple Oracle Certified (Generative AI, AI Vector Search, Data Science)
- TN Police Hackathon 2025 Winner, HackRX 5.0 and 6.0 Top 1% nationally
- B.Tech ECE at VIT Chennai
- Skills: Python, LangChain, LangGraph, FastAPI, Neo4j, React, Docker, AWS, Whisper, Ollama, Gemini
- Postman API Fundamentals Student Expert
- Email: yashwanthbalaji.2408@gmail.com | GitHub: github.com/Yashwanth2408 | LinkedIn: linkedin.com/in/yashwanthbalaji
- Interests: aircraft, computers, sports, racing, music, skating

For all other topics (cricket, IPL, science, tech, life, coding, news, history, etc.) — answer helpfully and naturally. You are a full general-purpose AI, not restricted to Yash's profile.`;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

/* ── Health check ─────────────────────────────────────────────────────── */
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'jarvis-llm-relay', model: GROQ_MODEL });
});

/* ── Clear conversation history ──────────────────────────────────────────
   Frontend can call this to reset context (e.g., on "clear" command)    */
app.post('/api/llm/reset', (_req, res) => {
  conversationHistory = [];
  res.json({ ok: true, message: 'Conversation history cleared.' });
});

/* ── Main LLM relay ──────────────────────────────────────────────────── */
app.post('/api/llm', async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY in .env file' });
    }

    const query = String(req.body?.query || '').trim();
    if (!query) {
      return res.status(400).json({ error: 'query field is required' });
    }

    // Add user message to history
    conversationHistory.push({ role: 'user', content: query });

    // Trim history to prevent token overflow
    if (conversationHistory.length > MAX_HISTORY_TURNS * 2) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY_TURNS * 2);
    }

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    const llmResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT }, // ← system role properly separated
          ...conversationHistory,                       // ← full conversation context
        ],
        temperature: 0.65,   // slightly warmer for natural conversation
        max_tokens: 600,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error('Groq upstream error:', llmResponse.status, errText);
      return res.status(502).json({
        error: `Groq upstream failure: ${llmResponse.status}`,
        details: errText,
      });
    }

    const data = await llmResponse.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return res.status(502).json({ error: 'Groq returned empty content' });
    }

    // Add assistant reply to history
    conversationHistory.push({ role: 'assistant', content: text });

    return res.json({ text });

  } catch (error) {
    console.error('Relay error:', error);
    return res.status(500).json({
      error: 'Relay execution failed',
      details: String(error.message || error),
    });
  }
});

/* ── Serve portfolio ─────────────────────────────────────────────────── */
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'jarvis-portfolio.html'));
});

/* ── Graceful error handling ─────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`JARVIS relay running → http://localhost:${PORT}`);
  console.log(`Model: ${GROQ_MODEL}`);
  console.log(`API key: ${GROQ_API_KEY ? '✓ loaded' : '✗ MISSING — check .env'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} busy — kill it: taskkill /F /PID $(netstat -ano | findstr :${PORT})`);
    process.exit(1);
  }
});