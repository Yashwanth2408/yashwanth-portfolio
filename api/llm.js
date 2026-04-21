'use strict';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are JARVIS — the terminal AI embedded inside Yashwanth Balaji's portfolio.

Personality rules:
- Natural and warm for casual talk ("hello", "how are you")
- Sharp and structured for technical or factual questions
- Concise: 2 to 5 sentences normally, longer only when needed
- NO markdown — no asterisks, no hashes, no dashes as bullets
- Numbered lists (1. 2. 3.) are fine when listing things

About Yashwanth Balaji:
- AI/ML Engineer, Founder of LatentFlow.ai, based in Chennai India
- Builds AI chatbots, intelligent workflows, and websites
- Projects: IMARA (multi-agent research), NEUROCODE (Python SAST scanner), AutoProcure (supply chain agent), SEI Wise Voice Agent (real-time voice AI), Clinical-Doc-AI
- AI Research Intern at Infosys Springboard — voice pipeline across 11 languages (Whisper, Edge TTS, FFmpeg)
- Vice Captain, Team E-Blitz Racing (EV go-kart)
- Triple Oracle Certified: Generative AI, AI Vector Search, Data Science
- HackRX 5.0 and 6.0 National Finalist, Top 1 percent
- B.Tech ECE at VIT Chennai
- Email: yashwanthbalaji.2408@gmail.com | GitHub: github.com/Yashwanth2408 | LinkedIn: linkedin.com/in/yashwanthbalaji

For everything else — IPL, cricket, science, coding, history, life — answer naturally. You are a full general-purpose AI.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY missing — add it in Vercel Environment Variables' });
    }

    const query   = String(req.body?.query   || '').trim();
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!query) return res.status(400).json({ error: 'query is required' });

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.slice(-10),
          { role: 'user', content: query },
        ],
        temperature: 0.65,
        max_tokens: 600,
        top_p: 0.9,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(502).json({ error: `Groq error ${groqRes.status}`, details: errText });
    }

    const data = await groqRes.json();
    const text  = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(502).json({ error: 'Empty Groq response' });

    return res.json({ text });

  } catch (err) {
    return res.status(500).json({ error: 'Relay failed', details: String(err.message || err) });
  }
}