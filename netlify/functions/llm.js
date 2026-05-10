const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';

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

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  try {
    // Check API key
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'GROQ_API_KEY missing',
          details: 'Add GROQ_API_KEY in Netlify environment variables',
        }),
      };
    }

    // Parse request body
    let requestData;
    try {
      requestData = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    const query = String(requestData?.query || '').trim();
    const history = Array.isArray(requestData?.history) ? requestData.history : [];

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'query parameter is required' }),
      };
    }

    // Call Groq API
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    // Handle Groq API errors
    if (!groqRes.ok) {
      let errText = '';
      try {
        // Clone the response to read body without consuming the original
        const clonedRes = groqRes.clone();
        errText = await clonedRes.text();
      } catch (e) {
        errText = `HTTP ${groqRes.status} from Groq API`;
      }

      console.error(`Groq API error ${groqRes.status}:`, errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: `Groq API error ${groqRes.status}`,
          details: errText.substring(0, 200), // Truncate for safety
        }),
      };
    }

    // Parse Groq response
    const data = await groqRes.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (!text) {
      console.error('Empty response from Groq API');
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Empty response from Groq API' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text }),
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: String(err.message || err).substring(0, 200),
      }),
    };
  }
};
