/* ============================================================
   J.A.R.V.I.S. PORTFOLIO — COMPLETE JAVASCRIPT
   Yash · AI Engineer · LatentFlow.ai
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   0. UTILITY HELPERS
───────────────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const lerp  = (a, b, t)   => a + (b - a) * t;
const rand  = (lo, hi)    => lo + Math.random() * (hi - lo);
const randInt = (lo, hi)  => Math.floor(rand(lo, hi + 1));

/* rAF throttle */
function rafThrottle(fn) {
  let ticking = false;
  return (...args) => {
    if (!ticking) {
      requestAnimationFrame(() => { fn(...args); ticking = false; });
      ticking = true;
    }
  };
}

/* ─────────────────────────────────────────────────────────────
   1. BOOT / LOADING SCREEN
───────────────────────────────────────────────────────────── */
(function initBoot() {
  const boot      = qs('#jv-boot');
  const arcFill   = qs('#jv-arc-fill');
  const linesEl   = qs('#jv-boot-lines');
  const canvas    = qs('#jv-boot-canvas');
  if (!boot) return;

  /* particle canvas on boot screen */
  if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const pts = Array.from({ length: 80 }, () => ({
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      r: rand(0.3, 1.2),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.15, 0.15),
    }));
    let bootRaf;
    function drawBootParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x = (p.x + p.vx + canvas.width)  % canvas.width;
        p.y = (p.y + p.vy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232,48,48,0.5)';
        ctx.fill();
      });
      bootRaf = requestAnimationFrame(drawBootParticles);
    }
    drawBootParticles();
    boot._stopParticles = () => cancelAnimationFrame(bootRaf);
  }

  /* circumference */
  const C = 2 * Math.PI * 118;
  arcFill.style.strokeDasharray  = C;
  arcFill.style.strokeDashoffset = C;

  const LINES = [
    { t: 0,    cls: 'jv-boot__line--prompt',  txt: '> INITIALIZING YASH INTERFACE v2.5...' },
    { t: 520,  cls: 'jv-boot__line--system',  txt: 'Loading neural core.............. [<span class="jv-red">OK</span>]' },
    { t: 960,  cls: 'jv-boot__line--system',  txt: 'Mounting AI knowledge base........ [<span class="jv-red">OK</span>]' },
    { t: 1380,  cls: 'jv-boot__line--system',  txt: 'Connecting mission database....... [<span class="jv-red">OK</span>]' },
    { t: 1780,  cls: 'jv-boot__line--system',  txt: 'Calibrating voice pipelines....... [<span class="jv-red">OK</span>]' },
    { t: 2160, cls: 'jv-boot__line--system',  txt: 'Warming LatentFlow.ai engines..... [<span class="jv-red">OK</span>]' },
    { t: 2520, cls: 'jv-boot__line--system',  txt: 'Security module verified.......... [<span class="jv-red">OK</span>]' },
    { t: 2880, cls: 'jv-boot__line--system',  txt: 'Mapping operator profile.......... [<span class="jv-red">OK</span>]' },
    { t: 3200, cls: 'jv-boot__line--success', txt: '&gt; SYSTEM READY — Welcome, Visitor. &nbsp; OPERATOR: <span class="jv-white">Yash</span>' },
  ];

  const totalDur = 5000;
  const startTime = performance.now();

  function animateArc(now) {
    const elapsed  = now - startTime;
    const progress = clamp(elapsed / totalDur, 0, 1);
    arcFill.style.strokeDashoffset = C * (1 - progress);
    if (progress < 1) requestAnimationFrame(animateArc);
  }
  requestAnimationFrame(animateArc);

  LINES.forEach(({ t, cls, txt }) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = `jv-boot__line ${cls}`;
      div.innerHTML = txt;
      linesEl.appendChild(div);
      requestAnimationFrame(() => div.classList.add('is-visible'));
      linesEl.scrollTop = linesEl.scrollHeight;
    }, t);
  });

  /* dismiss */
  setTimeout(() => {
    if (boot._stopParticles) boot._stopParticles();
    boot.classList.add('is-done');
    document.body.style.overflow = '';
  }, totalDur + 600);

  document.body.style.overflow = 'hidden';
})();

/* ─────────────────────────────────────────────────────────────
   2. CUSTOM CURSOR
───────────────────────────────────────────────────────────── */
(function initCursor() {
  const cursor = qs('#jv-cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  /* cross snaps instantly; ring lerps */
  const cross = qs('.jv-cursor__cross', cursor);
  const ring  = qs('.jv-cursor__ring',  cursor);

  function tickCursor() {
    cross.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    rx = lerp(rx, mx, 0.14);
    ry = lerp(ry, my, 0.14);
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(tickCursor);
  }
  tickCursor();

  /* hover state */
  const hoverSel = 'a, button, [role="button"], input, textarea, .jv-hex, .jv-chip, .jv-op-card, .jv-honor-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSel)) document.body.classList.remove('cursor-hover');
  });
})();

/* ─────────────────────────────────────────────────────────────
   3. SCROLL PROGRESS BAR
───────────────────────────────────────────────────────────── */
(function initProgress() {
  const fill = qs('#jv-progress-fill');
  if (!fill) return;

  const update = rafThrottle(() => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    fill.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
  });

  window.addEventListener('scroll', update, { passive: true });
})();

/* ─────────────────────────────────────────────────────────────
   4. STICKY HEADER
───────────────────────────────────────────────────────────── */
(function initHeader() {
  const header = qs('#jv-header');
  if (!header) return;

  const toggle = rafThrottle(() => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  });

  window.addEventListener('scroll', toggle, { passive: true });
})();

/* ─────────────────────────────────────────────────────────────
   5. MOBILE NAV
───────────────────────────────────────────────────────────── */
(function initMobileNav() {
  const hamburger = qs('#jv-hamburger');
  const mobileNav = qs('#jv-mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('is-open');
    mobileNav.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', open);
    mobileNav.setAttribute('aria-hidden', !open);
  });

  /* close on link click */
  qsa('.jv-mobile-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   6. ACTIVE NAV HIGHLIGHTING
───────────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = qsa('section[id]');
  const links    = qsa('.jv-nav__link[data-nav]');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('is-active'));
        const active = links.find(l => l.getAttribute('href') === `#${entry.target.id}`);
        if (active) active.classList.add('is-active');
      }
    });
  }, { rootMargin: `-${64}px 0px -55% 0px` });

  sections.forEach(s => obs.observe(s));
})();

/* ─────────────────────────────────────────────────────────────
   7. SCROLL REVEAL
───────────────────────────────────────────────────────────── */
(function initReveal() {
  const items = qsa('.jv-reveal');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  items.forEach(el => obs.observe(el));
})();

/* ─────────────────────────────────────────────────────────────
   8. HERO — PARTICLE CANVAS
───────────────────────────────────────────────────────────── */
(function initHeroCanvas() {
  const canvas = qs('#jv-particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animId;

  const PARTICLE_COUNT = 110;
  const MAX_DIST = 140;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeParticle() {
    return {
      x: rand(0, W),
      y: rand(0, H),
      r: rand(0.4, 1.6),
      vx: rand(-0.22, 0.22),
      vy: rand(-0.22, 0.22),
      alpha: rand(0.2, 0.7),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* connections */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(232,48,48,${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }

    /* dots */
    particles.forEach(p => {
      p.x = (p.x + p.vx + W) % W;
      p.y = (p.y + p.vy + H) % H;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,48,48,${p.alpha})`;
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', rafThrottle(() => { init(); }));
})();

/* ─────────────────────────────────────────────────────────────
   9. HERO — LIVE BRIEFING FEED
───────────────────────────────────────────────────────────── */
(function initHeroBriefing() {
  const el = qs('#jv-hero-brief');
  if (!el) return;

  const lines = [
    'OPERATOR  : Yash',
    'STATUS    : ACTIVE — BUILDING',
    'BASE      : CHENNAI / INDIA',
    'COMPANY   : LATENTFLOW.AI — FOUNDER',
    'MISSION   : AI PRODUCTS · CHATBOTS · WORKFLOWS · WEBSITES',
    `LOCAL TIME: ${new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' })} IST`,
  ];

  el.textContent = lines.join('\n');

  /* tick the clock every second */
  setInterval(() => {
    lines[5] = `LOCAL TIME: ${new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' })} IST`;
    el.textContent = lines.join('\n');
  }, 1000);
})();

/* ─────────────────────────────────────────────────────────────
   10. HERO — NAME DROP ANIMATION
───────────────────────────────────────────────────────────── */
(function initHeroName() {
  const container = qs('#jv-hero-name .jv-hero__name-inner');
  if (!container) return;

  const NAME = 'YASHWANTH';
  container.innerHTML = NAME.split('').map((ch, i) =>
    `<span class="jv-hero__letter" style="transition-delay:${2000 + i * 60}ms">${ch === ' ' ? '&nbsp;' : ch}</span>`
  ).join('');

  setTimeout(() => {
    qsa('.jv-hero__letter').forEach(s => s.classList.add('is-landed'));
  }, 600);
})();

/* ─────────────────────────────────────────────────────────────
   11. HERO — ROLE TYPEWRITER
───────────────────────────────────────────────────────────── */
(function initTypewriter() {
  const el = qs('#jv-role-text');
  if (!el) return;

  const ROLES = [
    'AI ENGINEER',
    'FOUNDER · LATENTFLOW.AI',
    'VOICE AI BUILDER',
    'AGENTIC SYSTEMS DEVELOPER',
    'MULTI-AGENT ORCHESTRATOR',
    'WORKFLOW AUTOMATION ENGINEER',
    'FULL-STACK AI PRODUCT BUILDER',
    'RAG & GRAPHRAG SPECIALIST',
    'AI SECURITY TOOLING DEVELOPER',
  ];

  let rIdx = 0, cIdx = 0, deleting = false;
  el.style.fontFamily = 'var(--ff-mono)';
  el.style.fontSize   = 'var(--fs-md)';
  el.style.color      = 'var(--clr-red)';

  function tick() {
    const current = ROLES[rIdx];
    if (!deleting) {
      cIdx++;
      el.textContent = current.slice(0, cIdx);
      if (cIdx === current.length) {
        setTimeout(() => { deleting = true; tick(); }, 2600);
        return;
      }
      setTimeout(tick, 52);
    } else {
      cIdx--;
      el.textContent = current.slice(0, cIdx);
      if (cIdx === 0) {
        deleting = false;
        rIdx = (rIdx + 1) % ROLES.length;
        setTimeout(tick, 320);
        return;
      }
      setTimeout(tick, 28);
    }
  }

  setTimeout(tick, 2800);
})();

/* ─────────────────────────────────────────────────────────────
   12. HERO — HUD MOUSE TILT
───────────────────────────────────────────────────────────── */
(function initHeroTilt() {
  const hero    = qs('.jv-hero');
  const content = qs('.jv-hero__content');
  if (!hero || !content) return;
  if (window.matchMedia('(hover: none)').matches) return;

  hero.addEventListener('mousemove', rafThrottle(e => {
    const rect = hero.getBoundingClientRect();
    const nx   = (e.clientX - rect.left)  / rect.width  - 0.5;
    const ny   = (e.clientY - rect.top)   / rect.height - 0.5;
    const rx   = ny * -6;
    const ry   = nx *  6;
    content.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  }));

  hero.addEventListener('mouseleave', () => {
    content.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    content.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  });

  hero.addEventListener('mouseenter', () => {
    content.style.transition = 'transform 0.1s linear';
  });
})();

/* ─────────────────────────────────────────────────────────────
   13. COUNTER ANIMATION (STATS)
───────────────────────────────────────────────────────────── */
(function initCounters() {
  const nums = qsa('[data-count]');
  if (!nums.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur    = 1400;
      const start  = performance.now();

      function step(now) {
        const t = clamp((now - start) / dur, 0, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => obs.observe(n));
})();

/* ─────────────────────────────────────────────────────────────
   14. ORBIT BADGE POSITIONING
───────────────────────────────────────────────────────────── */
(function initOrbit() {
  const badges = qsa('.jv-orbit__badge');
  const count  = badges.length;
  badges.forEach((b, i) => {
    const angle = (360 / count) * i;
    b.style.setProperty('--angle', `${angle}deg`);
    b.style.transform = `rotate(${angle}deg) translateX(108px) rotate(-${angle}deg)`;
  });
})();

/* ─────────────────────────────────────────────────────────────
   15. "LOAD MORE PROJECTS" TOGGLE
───────────────────────────────────────────────────────────── */
(function initProjectsToggle() {
  const btn    = qs('#jv-projects-toggle');
  const extras = qsa('[data-project-extra]');
  if (!btn || !extras.length) return;

  btn.addEventListener('click', () => {
    const expanded = btn.dataset.expanded === 'true';

    if (!expanded) {
      extras.forEach(card => {
        card.classList.add('is-visible-extra');
        card.style.display = 'flex';
        /* trigger reveal animation */
        card.classList.remove('jv-reveal');
        card.style.opacity   = '0';
        card.style.transform = 'translateY(24px)';
        requestAnimationFrame(() => {
          card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          card.style.opacity    = '1';
          card.style.transform  = 'translateY(0)';
        });
      });
      btn.dataset.expanded = 'true';
      btn.innerHTML = `<span class="jv-btn__bracket">[</span>${btn.dataset.closeLabel}<span class="jv-btn__bracket">]</span>`;
    } else {
      extras.forEach(card => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(24px)';
        setTimeout(() => {
          card.style.display = 'none';
          card.classList.remove('is-visible-extra');
        }, 400);
      });
      btn.dataset.expanded = 'false';
      btn.innerHTML = `<span class="jv-btn__bracket">[</span>${btn.dataset.openLabel}<span class="jv-btn__bracket">]</span>`;
    }
  });
})();

/* ─────────────────────────────────────────────────────────────
   16. JARVIS TERMINAL — CHATBOT ENGINE
───────────────────────────────────────────────────────────── */
(function initTerminal() {
  const body      = qs('#jv-terminal-body');
  const input     = qs('#jv-terminal-input');
  const chips     = qsa('.jv-chip');
  const fastToggle = qs('#jv-fast-reply-toggle');
  if (!body || !input) return;

  /* ── Fast reply toggle state ── */
  let fastReply = false;
  let llmMode = true;
  const LLM_API = {
    endpoint: '/api/llm',
  };

  if (fastToggle) {
    fastToggle.addEventListener('change', () => {
      fastReply = fastToggle.checked;
    });
  }

  /* ── Response database ── */
  const DB = {
    skills: {
      lines: [
        { t: 'h', v: 'TECHNICAL ARSENAL' },
        { t: 'o', v: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { t: 'o', v: 'AI / ML / DEEP LEARNING' },
        { t: 'o', v: '  PyTorch · Scikit-learn · CNN · LSTM · GNN · Model Eval · Streamlit' },
        { t: 'o', v: '' },
        { t: 'o', v: 'LLMs / AGENTS / RAG' },
        { t: 'o', v: '  LangChain · LangGraph · GPT-4o · Llama 3.2 · Groq · RAG · GraphRAG' },
        { t: 'o', v: '  Prompt Engineering · Quality Scoring · Tool Use · Agentic Orchestration' },
        { t: 'o', v: '' },
        { t: 'o', v: 'VOICE / MULTIMODAL' },
        { t: 'o', v: '  Whisper · Edge TTS · Deepgram · Cartesia · Pipecat · Silero VAD · WebRTC · FFmpeg' },
        { t: 'o', v: '' },
        { t: 'o', v: 'BACKEND / INFRA / DATA' },
        { t: 'o', v: '  Python · FastAPI · Node.js · Express · MongoDB · PostgreSQL · SQLite' },
        { t: 'o', v: '  Pinecone · Docker · AWS · Railway · WebSockets · JWT · HMAC-SHA256' },
        { t: 'o', v: '' },
        { t: 'o', v: 'FRONTEND / PRODUCT / AUTOMATION' },
        { t: 'o', v: '  HTML · CSS · JavaScript · React · Redux Toolkit · Tailwind' },
        { t: 'o', v: '  n8n · Google Sheets API · Gmail API · CI/CD · Semgrep · Bandit' },
        { t: 's', v: '19 domain clusters · 60+ tools across the stack.' },
      ]
    },

    projects: {
      lines: [
        { t: 'h', v: 'DEPLOYED OPERATIONS — FULL LIST' },
        { t: 'o', v: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { t: 'o', v: 'OP-01 · IMARA' },
        { t: 'o', v: '  Intelligent Multi-Agent Research Assistant · React · FastAPI · LangGraph · Llama 3.2' },
        { t: 'o', v: '' },
        { t: 'o', v: 'OP-02 · NEUROCODE (LIVE)' },
        { t: 'o', v: '  Python SAST Security Scanner · FastAPI · Semgrep · Bandit · Docker · Railway' },
        { t: 'o', v: '  → https://web-production-15a1.up.railway.app/' },
        { t: 'o', v: '' },
        { t: 'o', v: 'OP-03 · AUTOPROCURE' },
        { t: 'o', v: '  Autonomous Supply Chain Agent · LangGraph · Pinecone · Gmail API' },
        { t: 'o', v: '' },
        { t: 'o', v: 'OP-04 · SEI WISE VOICE AGENT' },
        { t: 'o', v: '  Real-Time Voice Support · Pipecat · WebRTC · Deepgram · Groq · Cartesia' },
        { t: 'o', v: '' },
        { t: 'o', v: 'OP-05 · SPEECH-TO-SPEECH VIDEO CONVERTER' },
        { t: 'o', v: '  Whisper → Translate → Edge TTS → FFmpeg · 11 languages supported' },
        { t: 'o', v: '' },
        { t: 'o', v: 'OP-06 · INSURESYNC' },
        { t: 'o', v: '  Insurance Claims Workflow Engine · React · Node.js · OpenAI' },
        { t: 'o', v: '' },
        { t: 'o', v: 'OP-07 · SKIN CANCER DETECTION' },
        { t: 'o', v: '  CNN + Groq AI · 90%+ accuracy · HAM10000 dataset' },
        { t: 'o', v: '' },
        { t: 'o', v: 'OP-08 · CHANGE DOCUMENTATION AGENT' },
        { t: 'o', v: '  n8n workflow · Google Sheets API · AEC scope-change automation' },
        { t: 'o', v: '' },
        { t: 'o', v: 'OP-09 · TORTRACE-AI' },
        { t: 'o', v: '  Tor Attribution · CNN-LSTM · GNN · NetworkX · Timing Correlation' },
        { t: 's', v: '9 operations. Each one deployed or demo-ready.' },
      ]
    },

    experience: {
      lines: [
        { t: 'h', v: 'MISSION LOG' },
        { t: 'o', v: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { t: 'o', v: '▸ CURRENT — Founder / Builder · LatentFlow.ai' },
        { t: 'o', v: '  Building AI chatbots, workflows, and websites · Chennai → Global' },
        { t: 'o', v: '' },
        { t: 'o', v: '▸ FEB–APR 2025 — AI Research Intern · Infosys Springboard (Remote)' },
        { t: 'o', v: '  Voice pipelines · Whisper · Edge TTS · FFmpeg · Multimodal delivery' },
        { t: 'o', v: '' },
        { t: 'o', v: '▸ LEADERSHIP — Vice Captain · Team E-Blitz Racing' },
        { t: 'o', v: '  EV go-kart design team · systems execution · speed under pressure' },
        { t: 'o', v: '' },
        { t: 'o', v: '▸ ACADEMIC — B.Tech ECE · VIT Chennai' },
        { t: 'o', v: '  Electronics & Communication Engineering · Applied AI focus' },
        { t: 's', v: 'Currently operating as founder-builder at LatentFlow.ai.' },
      ]
    },

    communities: {
      lines: [
        { t: 'h', v: 'COMMUNITY MEMBERSHIPS' },
        { t: 'o', v: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { t: 'o', v: '▸ Microsoft Azure Developer Community — Member' },
        { t: 'o', v: '  Cloud, AI, developer tools, and ecosystem access' },
        { t: 'o', v: '' },
        { t: 'o', v: '▸ GitHub Copilot Community India — Member' },
        { t: 'o', v: '  AI-assisted development, modern engineering workflows' },
        { t: 'o', v: '' },
        { t: 'o', v: 'CERTIFICATIONS' },
        { t: 'o', v: '  Oracle Certified — Generative AI Foundations' },
        { t: 'o', v: '  Oracle Certified — AI Vector Search' },
        { t: 'o', v: '  Oracle Certified — Data Science' },
        { t: 's', v: 'Two active global communities + triple Oracle certification.' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Postman API Fundamentals Student Expert' },
        { t: 'o', v: 'Certified — API design, testing, scripting ' },
      ]
    },

    resume: {
      lines: [
        { t: 'h', v: 'RESUME / CV' },
        { t: 'o', v: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { t: 'o', v: 'Resume is available as a PDF download.' },
        { t: 'o', v: 'Click the DOWNLOAD RESUME button in the hero section' },
        { t: 'o', v: 'or in the contact section below.' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Filename: YashwanthBalaji_AIMl_Engineer.pdf' },
        { t: 's', v: 'Use the download buttons on the page to grab the PDF.' },
      ]
    },

    'fun fact': {
      lines: [
        { t: 'h', v: 'OPERATOR — NON-TECH PROFILE' },
        { t: 'o', v: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { t: 'o', v: '▸ Skated for 10 years — won medals at state and national levels.' },
        { t: 'o', v: '▸ Bought a guitar and is actively learning songs.' },
        { t: 'o', v: '▸ Vice Captain of an EV go-kart racing team at college.' },
        { t: 'o', v: '▸ Tries to make every project feel novel — not just functional.' },
        { t: 'o', v: '▸ Believes good engineering is also good storytelling.' },
        { t: 's', v: 'Moves at speed — on skates, on tracks, and in code.' },
      ]
    },

    'ask anything': {
      lines: [
        { t: 'h', v: 'ASK ANYTHING — MODE ACTIVE' },
        { t: 'o', v: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { t: 'o', v: 'Global LLM relay is now active through Groq.' },
        { t: 'o', v: 'You can ask about any topic: tech, sports, IPL, markets, science,' },
        { t: 'o', v: 'history, travel, writing, debugging, strategy, or general knowledge.' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Examples:' },
        { t: 'o', v: '  · "Who will likely win IPL this season based on current form?"' },
        { t: 'o', v: '  · "Explain RAG vs fine-tuning in production."' },
        { t: 'o', v: '  · "Give me a 5-day plan to learn FastAPI."' },
        { t: 'o', v: '  · "Summarize today\'s AI trends in 5 bullets."' },
        { t: 's', v: 'LLM mode ON. Type any question.' },
      ]
    },
  };

  /* ── Freeform Q&A knowledge base ── */
  const QA = [
    {
      keys: ['latentflow', 'latent flow', 'company', 'startup', 'founder'],
      lines: [
        { t: 'h', v: 'LATENTFLOW.AI' },
        { t: 'o', v: 'LatentFlow.ai is Yash\'s own company — founded and built by him.' },
        { t: 'o', v: 'The mission: make technology less complicated through AI.' },
        { t: 'o', v: '' },
        { t: 'o', v: 'What they build:' },
        { t: 'o', v: '  · AI chatbots — smart, scoped, production-ready' },
        { t: 'o', v: '  · Intelligent workflows — automation that actually works' },
        { t: 'o', v: '  · Websites — with AI embedded natively, not bolted on' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Based in Chennai. Working globally.' },
        { t: 's', v: 'LatentFlow.ai: AI products with clarity and speed.' },
      ]
    },
    {
      keys: ['imara', 'research assistant', 'multi-agent', 'langgraph', 'arxiv'],
      lines: [
        { t: 'h', v: 'OP-01 · IMARA' },
        { t: 'o', v: 'Intelligent Multi-Agent Research Assistant.' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Stack: React · FastAPI · LangGraph · Llama 3.2 · WebSockets · ArXiv' },
        { t: 'o', v: '' },
        { t: 'o', v: 'What it does:' },
        { t: 'o', v: '  · Adaptive routing between specialized research agents' },
        { t: 'o', v: '  · Real-time agent collaboration via WebSockets' },
        { t: 'o', v: '  · Research-to-code generation from academic papers' },
        { t: 'o', v: '  · Custom 4D quality scoring framework' },
        { t: 'o', v: '  · ArXiv integration for live paper discovery' },
        { t: 's', v: 'IMARA: the most architecturally complex system in the arsenal.' },
      ]
    },
    {
      keys: ['neurocode', 'security', 'sast', 'scanner', 'semgrep', 'bandit'],
      lines: [
        { t: 'h', v: 'OP-02 · NEUROCODE' },
        { t: 'o', v: 'Python Static Application Security Testing platform.' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Stack: FastAPI · Semgrep · Bandit · Docker · Railway · Webhooks' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Key facts:' },
        { t: 'o', v: '  · Sub-3-second analysis on standard code payloads' },
        { t: 'o', v: '  · CWE / CVE issue mapping' },
        { t: 'o', v: '  · Webhook security with HMAC-SHA256 signature validation' },
        { t: 'o', v: '  · REST API — integrates into any CI/CD pipeline' },
        { t: 'o', v: '  · Live at: https://web-production-15a1.up.railway.app/' },
        { t: 's', v: 'NEUROCODE: the only project with a live production URL.' },
      ]
    },
    {
      keys: ['voice', 'pipecat', 'whisper', 'tts', 'deepgram', 'webrtc', 'sei'],
      lines: [
        { t: 'h', v: 'OP-04 · SEI WISE VOICE AGENT' },
        { t: 'o', v: 'Real-time voice support system built with Pipecat + WebRTC.' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Stack: Pipecat · WebRTC · Deepgram STT · Groq LLM · Cartesia TTS · FastAPI' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Design decisions:' },
        { t: 'o', v: '  · Strict intent routing — never goes off-topic' },
        { t: 'o', v: '  · Grounded FAQ answering, no hallucination risk' },
        { t: 'o', v: '  · Call telemetry and structured fallback handling' },
        { t: 'o', v: '  · Product-style frontend — not a raw API demo' },
        { t: 's', v: 'Real-time voice AI: latency-optimized end-to-end.' },
      ]
    },
    {
      keys: ['graphrag', 'rag', 'retrieval', 'knowledge graph', 'vector'],
      lines: [
        { t: 'h', v: 'GraphRAG vs RAG — YASH\'S TAKE' },
        { t: 'o', v: 'Standard RAG: chunk text → embed → similarity search → generate.' },
        { t: 'o', v: 'Works well for factual Q&A over documents.' },
        { t: 'o', v: '' },
        { t: 'o', v: 'GraphRAG adds a knowledge graph layer:' },
        { t: 'o', v: '  · Entities and relationships are explicitly stored' },
        { t: 'o', v: '  · Queries can traverse multi-hop connections' },
        { t: 'o', v: '  · Better for reasoning across interconnected data' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Yash uses GraphRAG in IMARA for research paper relationship mapping.' },
        { t: 's', v: 'Use RAG for lookup. Use GraphRAG for reasoning chains.' },
      ]
    },
    {
      keys: ['agentic', 'agent', 'autonomous', 'orchestrat'],
      lines: [
        { t: 'h', v: 'AGENTIC AI — YASH\'S APPROACH' },
        { t: 'o', v: 'Yash designs multi-agent systems with:' },
        { t: 'o', v: '' },
        { t: 'o', v: '  · LangGraph for stateful, cyclical agent workflows' },
        { t: 'o', v: '  · Adaptive routing — right agent for right task' },
        { t: 'o', v: '  · Human-in-the-loop gates for high-stakes actions' },
        { t: 'o', v: '  · Memory layers — short-term (context), long-term (RAG/vector)' },
        { t: 'o', v: '  · Tool use — agents that call APIs, search, and execute code' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Used in: IMARA (research), AutoProcure (supply chain)' },
        { t: 's', v: 'Agentic AI that actually ships to production.' },
      ]
    },
    {
      keys: ['different', 'unique', 'stand out', 'special', 'why yash', 'hire'],
      lines: [
        { t: 'h', v: 'WHY YASH IS DIFFERENT' },
        { t: 'o', v: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
        { t: 'o', v: '1. He builds for deployment — not for demos or slides.' },
        { t: 'o', v: '2. Full-stack depth — voice, agents, frontend, security, infra.' },
        { t: 'o', v: '3. Product instinct — every build has UX thinking behind it.' },
        { t: 'o', v: '4. Novel mindset — each project has something new in it.' },
        { t: 'o', v: '5. Speed — he moves fast without cutting corners on quality.' },
        { t: 'o', v: '6. Founder track — he has already started building for real.' },
        { t: 's', v: 'Builder. Thinker. Founder. All three, simultaneously.' },
      ]
    },
    {
      keys: ['hackrx', 'hackathon', 'competition', 'bajaj'],
      lines: [
        { t: 'h', v: 'HACKATHON RECORD' },
        { t: 'o', v: 'HackRX 5.0 — National Finalist · Top 1% · Bajaj Finserv' },
        { t: 'o', v: 'HackRX 6.0 — National Finalist · Top 1% · Bajaj Finserv' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Two consecutive national finals with the same organizer.' },
        { t: 'o', v: 'Proof of consistent delivery under time-boxed pressure.' },
        { t: 's', v: 'Top 1% twice. Not luck — repeatability.' },
      ]
    },
    {
      keys: ['oracle', 'certification', 'certified'],
      lines: [
        { t: 'h', v: 'ORACLE CERTIFICATIONS' },
        { t: 'o', v: '  ✓ Oracle Certified — Generative AI Foundations' },
        { t: 'o', v: '  ✓ Oracle Certified — AI Vector Search' },
        { t: 'o', v: '  ✓ Oracle Certified — Data Science' },
        { t: 's', v: 'Triple Oracle certified across the modern AI stack.' },
      ]
    },
    {
      keys: ['contact', 'email', 'reach', 'hire', 'collab', 'work together'],
      lines: [
        { t: 'h', v: 'GET IN TOUCH' },
        { t: 'o', v: 'Email    : yashwanthbalaji.2408@gmail.com' },
        { t: 'o', v: 'LinkedIn : linkedin.com/in/yashwanthbalaji' },
        { t: 'o', v: 'GitHub   : github.com/Yashwanth2408' },
        { t: 'o', v: '' },
        { t: 'o', v: 'Or use the contact form at the bottom of this page.' },
        { t: 's', v: 'Always open to interesting work and collaborations.' },
      ]
    },
    {
      keys: ['skate', 'skating', 'guitar', 'music', 'sport', 'racing', 'kart', 'e-blitz'],
      lines: [
        { t: 'h', v: 'YASH OUTSIDE THE CODE' },
        { t: 'o', v: '▸ Skated competitively for 10 years.' },
        { t: 'o', v: '  Won medals at state and national level competitions.' },
        { t: 'o', v: '' },
        { t: 'o', v: '▸ Vice Captain — Team E-Blitz Racing (EV go-kart design team).' },
        { t: 'o', v: '  Systems thinking + speed + team execution.' },
        { t: 'o', v: '' },
        { t: 'o', v: '▸ Recently picked up the guitar.' },
        { t: 'o', v: '  Still learning, but already trying actual songs.' },
        { t: 's', v: 'Fast on skates, on the track, and in the editor.' },
      ]
    },
    {
      keys: ['python', 'fastapi', 'react', 'langchain', 'docker', 'aws', 'pinecone'],
      lines: [
        { t: 'h', v: 'CORE TOOLING — DEEP DIVE' },
        { t: 'o', v: 'Primary language: Python — FastAPI for all backend services.' },
        { t: 'o', v: 'Frontend: React + Redux Toolkit + Tailwind — full product delivery.' },
        { t: 'o', v: 'Agents: LangChain + LangGraph — stateful multi-step orchestration.' },
        { t: 'o', v: 'Vector DB: Pinecone — semantic search at scale.' },
        { t: 'o', v: 'Infra: Docker + Railway + AWS — containerized, cloud-deployed.' },
        { t: 's', v: 'Full-stack from model to UI to cloud.' },
      ]
    },
  ];

  /* ── Fallback responses ── */
  const FALLBACKS = [
    [
      { t: 'h', v: 'OPERATOR RESPONSE' },
      { t: 'o', v: 'I don\'t have a specific data record for that query.' },
      { t: 'o', v: 'Try: skills · projects · experience · communities · resume · fun fact' },
      { t: 'o', v: 'Or ask something specific about Yash, his work, or his projects.' },
      { t: 's', v: 'The operator profile is comprehensive — try a more specific term.' },
    ],
    [
      { t: 'h', v: 'QUERY UNMATCHED' },
      { t: 'o', v: 'That topic isn\'t in the indexed knowledge base.' },
      { t: 'o', v: 'Ask about: voice AI, agents, RAG, security tools, LatentFlow.ai,' },
      { t: 'o', v: 'specific projects, his background, skills, or contact details.' },
      { t: 's', v: 'Try rephrasing with a keyword.' },
    ],
  ];
  let fallbackIdx = 0;

  function nextFallback() {
    const fb = FALLBACKS[fallbackIdx % FALLBACKS.length];
    fallbackIdx++;
    return fb;
  }

  /* ── Render a line set ── */
  function appendLine(type, text) {
    if (type === 'd') {
      const div = document.createElement('div');
      div.className = 'jv-t-divider';
      body.appendChild(div);
      return;
    }
    const row = document.createElement('div');
    row.className = 'jv-t-line';
    const cls = { h: 'jv-t-header', o: 'jv-t-out', s: 'jv-t-success', e: 'jv-t-err', a: 'jv-t-ai' }[type] || 'jv-t-out';
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    row.appendChild(span);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  function appendPromptLine(cmd) {
    const row = document.createElement('div');
    row.className = 'jv-t-line';
    const prompt = document.createElement('span');
    prompt.className = 'jv-t-prompt';
    prompt.textContent = '>';

    const space = document.createTextNode(' ');

    const command = document.createElement('span');
    command.className = 'jv-t-cmd';
    command.textContent = cmd;

    row.appendChild(prompt);
    row.appendChild(space);
    row.appendChild(command);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
  }

  async function renderLines(lines) {
    for (const { t, v } of lines) {
      if (fastReply) {
        appendLine(t, v);
      } else {
        await new Promise(r => setTimeout(r, t === 'h' ? 80 : 30));
        appendLine(t, v);
      }
    }
    appendLine('d', '');
  }

  function matchQuery(q) {
    const lower = q.toLowerCase().trim();

    /* exact command match */
    if (DB[lower]) return DB[lower].lines;

    /* keyword match in QA */
    for (const qa of QA) {
      if (qa.keys.some(k => lower.includes(k))) return qa.lines;
    }

    return null;
  }

  async function fetchGroqText(userQuery) {
    const response = await fetch(LLM_API.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userQuery }),
    });

    if (!response.ok) {
      let detail = '';
      try {
        const errJson = await response.json();
        detail = errJson?.error || errJson?.details || JSON.stringify(errJson);
      } catch {
        detail = await response.text();
      }
      throw new Error(`LLM HTTP ${response.status}: ${detail}`);
    }

    const data = await response.json();
    const text = (data?.text || '').trim();
    if (!text) {
      throw new Error('LLM endpoint returned an empty response');
    }
    return text;
  }

  function toAiLines(text) {
    const cleaned = text.replace(/\r/g, '').trim();
    const split = cleaned.split('\n').map(l => l.trimEnd());
    const lines = [{ t: 'h', v: 'JARVIS GLOBAL INTEL — GROQ LINK' }];

    split.forEach(line => {
      lines.push({ t: 'a', v: line });
    });

    lines.push({ t: 's', v: 'LLM relay complete.' });
    return lines;
  }

  async function processCommand(cmd) {
    if (!cmd.trim()) return;
    appendPromptLine(cmd);

    const lower = cmd.toLowerCase().trim();
    if (lower === 'llm off' || lower === 'exit llm') {
      llmMode = false;
      await renderLines([
        { t: 'h', v: 'LLM MODE DISABLED' },
        { t: 'o', v: 'Groq relay is paused. Local knowledge mode restored.' },
        { t: 's', v: 'Use "ask anything" to enable it again.' },
      ]);
      return;
    }

    const matched = matchQuery(cmd);
    if (matched) {
      if (lower === 'ask anything') llmMode = true;
      await renderLines(matched);
      return;
    }

    if (!llmMode) {
      await renderLines(nextFallback());
      return;
    }

    appendLine('o', '[LLM LINK] Querying Groq knowledge core...');
    try {
      const aiText = await fetchGroqText(cmd);
      await renderLines(toAiLines(aiText));
    } catch (err) {
      console.error('Groq relay failed:', err);
      const msg = String(err?.message || err || 'Unknown relay error');
      const isQuota = /429|quota|billing|rate[- ]?limit/i.test(msg);
      await renderLines([
        { t: 'e', v: 'LLM relay unavailable at this moment.' },
        { t: 'o', v: isQuota
          ? 'Groq API connection failed. Check your API key in .env and ensure Groq service is accessible.'
          : 'Check backend relay status, API key setup, quota, or network access.' },
        { t: 'o', v: `DETAIL: ${msg.slice(0, 180)}` },
        ...nextFallback(),
      ]);
    }
  }

  /* ── Boot message ── */
  async function bootTerminal() {
    await renderLines([
      { t: 'h', v: 'YASH INTERFACE — INTERACTIVE MODE v2.5' },
      { t: 'o', v: 'Hello, visitor. I\'m the interface for Yash.' },
      { t: 'o', v: 'Use local commands for profile data, or enable secure global LLM mode.' },
      { t: 'o', v: 'Use the quick-access chips above, or type your own question.' },
      { t: 'o', v: 'Type "ask anything" to route any topic through the secure LLM relay.' },
      { t: 'o', v: '' },
      { t: 'o', v: 'Toggle FAST REPLY in the toolbar to skip typing animations.' },
      { t: 's', v: 'Ready. What do you want to know?' },
    ]);
  }

  bootTerminal();

  /* ── Input handler ── */
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      input.value = '';
      if (val) processCommand(val);
    }
  });

  /* ── Chips ── */
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd;
      processCommand(cmd);
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   17. WAVEFORM BARS (for terminal section ambient)
───────────────────────────────────────────────────────────── */
(function initWaveform() {
  const containers = qsa('.jv-waveform__bars');
  containers.forEach(c => {
    const count = parseInt(c.dataset.bars || '24', 10);
    c.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const bar = document.createElement('div');
      bar.className = 'jv-waveform__bar';
      bar.style.animationDelay  = `${rand(0, 0.9)}s`;
      bar.style.animationDuration = `${rand(0.5, 1.1)}s`;
      bar.style.height = `${rand(12, 40)}px`;
      c.appendChild(bar);
    }
  });
})();

/* ─────────────────────────────────────────────────────────────
   18. HONOR CARD PARTICLE BURST ON HOVER
───────────────────────────────────────────────────────────── */
(function initHonorParticles() {
  const cards = qsa('.jv-honor-card');
  cards.forEach(card => {
    const container = qs('.jv-honor-card__particles', card);
    if (!container) return;

    card.addEventListener('mouseenter', () => {
      container.innerHTML = '';
      for (let i = 0; i < 10; i++) {
        const dot = document.createElement('div');
        const px  = `${rand(-60, 60)}px`;
        const py  = `${rand(-60, 20)}px`;
        dot.style.cssText = `
          position: absolute;
          width: ${rand(2, 4)}px;
          height: ${rand(2, 4)}px;
          border-radius: 50%;
          background: var(--clr-red);
          top: 50%; left: 50%;
          --px: ${px}; --py: ${py};
          animation: honor-particle 0.7s ease-out forwards;
          animation-delay: ${rand(0, 0.15)}s;
          opacity: 0;
        `;
        container.appendChild(dot);
      }
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   19. KONAMI CODE EASTER EGG
───────────────────────────────────────────────────────────── */
(function initKonami() {
  const KONAMI = [38,38,40,40,37,39,37,39,66,65];
  let pos = 0;

  document.addEventListener('keydown', e => {
    if (e.keyCode === KONAMI[pos]) {
      pos++;
      if (pos === KONAMI.length) {
        pos = 0;
        triggerBarrelRoll();
      }
    } else {
      pos = 0;
    }
  });

  function triggerBarrelRoll() {
    const main = qs('#main');
    if (!main) return;
    main.style.transition = 'transform 1.4s cubic-bezier(0.68,-0.55,0.27,1.55)';
    main.style.transform  = 'rotate(360deg)';
    setTimeout(() => {
      main.style.transform  = '';
      main.style.transition = '';
    }, 1600);

    /* flash message */
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; inset: 0; z-index: 9000;
      display: flex; align-items: center; justify-content: center;
      background: rgba(232,48,48,0.12);
      font-family: var(--ff-display);
      font-size: clamp(2rem, 6vw, 5rem);
      color: var(--clr-red);
      letter-spacing: 0.1em;
      pointer-events: none;
      text-shadow: 0 0 60px var(--clr-red-glow);
      animation: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    flash.textContent = '⚡ BARREL ROLL ENGAGED ⚡';
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '1'; });
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 400);
    }, 1200);
  }
})();

/* ─────────────────────────────────────────────────────────────
   20. CONTACT FORM — VALIDATION + SUBMISSION
───────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form     = qs('#jv-comm-form');
  const status   = qs('#jv-form-status');
  if (!form) return;

  const EMAILJS_CONFIG = {
    serviceId: 'service_kyjodf9',
    templateId: 'template_8olow4m',
    publicKey: 'YcWbP9LEjxjQvl-wp',
    toEmail: 'yashwanthbalaji.2408@gmail.com',
  };

  const nameInput  = qs('#jv-name');
  const emailInput = qs('#jv-email');
  const msgInput   = qs('#jv-message');
  const errName    = qs('#jv-err-name');
  const errEmail   = qs('#jv-err-email');
  const errMsg     = qs('#jv-err-msg');

  if (window.emailjs && typeof window.emailjs.init === 'function') {
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  }

  function setError(el, msg) {
    el.textContent = msg;
  }

  function clearErrors() {
    [errName, errEmail, errMsg].forEach(e => e.textContent = '');
    [nameInput, emailInput, msgInput].forEach(i => i.classList.remove('is-error'));
  }

  function validate() {
    let ok = true;
    clearErrors();

    if (!nameInput.value.trim()) {
      setError(errName, 'NAME IS REQUIRED');
      nameInput.classList.add('is-error');
      ok = false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      setError(errEmail, 'EMAIL IS REQUIRED');
      emailInput.classList.add('is-error');
      ok = false;
    } else if (!emailRe.test(emailInput.value.trim())) {
      setError(errEmail, 'ENTER A VALID EMAIL');
      emailInput.classList.add('is-error');
      ok = false;
    }

    if (!msgInput.value.trim() || msgInput.value.trim().length < 10) {
      setError(errMsg, 'MESSAGE MUST BE AT LEAST 10 CHARACTERS');
      msgInput.classList.add('is-error');
      ok = false;
    }

    return ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = `<span class="jv-btn__bracket">[</span>TRANSMITTING...<span class="jv-btn__bracket">]</span>`;
    btn.disabled    = true;
    status.style.color = 'var(--clr-text-muted)';
    status.textContent = '[ LINKING TO MAIL RELAY ] — Sending transmission...';

    try {
      if (!window.emailjs || typeof window.emailjs.send !== 'function') {
        throw new Error('EmailJS SDK unavailable');
      }

      const templateParams = {
        from_name: nameInput.value.trim(),
        from_email: emailInput.value.trim(),
        message: msgInput.value.trim(),
        to_email: EMAILJS_CONFIG.toEmail,
      };

      await window.emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        { publicKey: EMAILJS_CONFIG.publicKey },
      );

      status.style.color = 'var(--clr-red)';
      status.textContent = '[ SIGNAL ACQUIRED ] — Message received. Yash will respond.';

      form.reset();
      clearErrors();
      setTimeout(() => { status.textContent = ''; }, 7000);
    } catch (err) {
      status.style.color = 'var(--clr-red)';
      status.textContent = '[ TRANSMISSION FAILED ] — Please retry in a few seconds.';
      console.error('EmailJS send failed:', err);
    } finally {
      btn.innerHTML = `<span class="jv-btn__bracket">[</span>SEND TRANSMISSION<span class="jv-btn__bracket">]</span>`;
      btn.disabled  = false;
    }
  });
})();

/* ─────────────────────────────────────────────────────────────
   21. SMOOTH ANCHOR SCROLLING FOR NAV
───────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = qs(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   22. GLOBAL INIT LOG
───────────────────────────────────────────────────────────── */
console.log(
  '%c YASH INTERFACE LOADED ',
  'background:#e83030;color:#fff;font-family:monospace;font-size:13px;padding:4px 12px;border-radius:2px;',
);
console.log(
  '%c LatentFlow.ai | AI Engineer | Chennai',
  'color:#888;font-family:monospace;font-size:11px;',
);