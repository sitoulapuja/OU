// ===== Animated Background: People & Data Network =====
(function () {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const COLORS = {
    accent:  "124,92,255",
    teal:    "48,213,200",
    soft:    "180,194,230",
  };

  const LABELS = [
    "Recruitment", "Onboarding", "HRIS", "Compliance",
    "Psychology", "Data", "Research", "UKG", "Paycom",
    "Excel", "Tableau", "Power BI", "SQL", "SPSS",
    "HR Ops", "Engagement", "Taleo", "SAP",
  ];

  let nodes = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomColor() {
    const keys = Object.keys(COLORS);
    return COLORS[keys[Math.floor(Math.random() * keys.length)]];
  }

  function makeNode(i) {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.5 + 1.5,
      color: randomColor(),
      label: LABELS[i % LABELS.length],
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 18000), 55);
    nodes = Array.from({ length: count }, (_, i) => makeNode(i));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const LINK_DIST = 160;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${a.color},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      n.pulse += 0.018;
      const glow = Math.sin(n.pulse) * 0.5 + 0.5;

      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
      grad.addColorStop(0, `rgba(${n.color},${0.18 * glow})`);
      grad.addColorStop(1, `rgba(${n.color},0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.color},${0.55 + 0.45 * glow})`;
      ctx.fill();

      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = `rgba(${n.color},${0.28 + 0.18 * glow})`;
      ctx.fillText(n.label, n.x + n.r + 4, n.y + 4);

      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    resize();
    for (const n of nodes) {
      n.x = Math.min(n.x, W);
      n.y = Math.min(n.y, H);
    }
  });

  init();
  draw();
})();

// ===== Nav Toggle =====
const navToggle = document.getElementById("navToggle");
const siteNav   = document.getElementById("siteNav");

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("show");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    siteNav.classList.remove("show");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ===== Footer year =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== Scroll progress bar =====
const progress = document.getElementById("progress");
window.addEventListener("scroll", () => {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progress.style.width = `${pct}%`;
});

// ===== Contact Form (Formspree) =====
const form      = document.getElementById("contactForm");
const formMsg   = document.getElementById("formMsg");
const submitBtn = form?.querySelector("button[type='submit']");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data    = new FormData(form);
  const name    = String(data.get("name")    || "").trim();
  const email   = String(data.get("email")   || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !message) {
    formMsg.style.color = "#f87171";
    formMsg.textContent = "Please fill in all fields.";
    return;
  }

  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

  try {
    const response = await fetch("https://formspree.io/f/xqedovoo", {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    });

    if (response.ok) {
      formMsg.style.color = "#30d5c8";
      formMsg.textContent = "✅ Message sent! I'll get back to you soon.";
      form.reset();
    } else {
      const json  = await response.json();
      const errMsg = json?.errors?.map(e => e.message).join(", ") || "Something went wrong.";
      formMsg.style.color = "#f87171";
      formMsg.textContent = `❌ Error: ${errMsg}`;
    }
  } catch {
    formMsg.style.color = "#f87171";
    formMsg.textContent = "❌ Network error. Please try again.";
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send"; }
  }
});

// ===== reCAPTCHA Contact Reveal =====
const revealBtn       = document.getElementById("revealBtn");
const recaptchaBox    = document.getElementById("recaptchaBox");
const contactLocked   = document.getElementById("contactLocked");
const contactRevealed = document.getElementById("contactRevealed");

revealBtn?.addEventListener("click", () => {
  contactLocked.style.display = "none";
  recaptchaBox.style.display  = "flex";
});

window.onCaptchaSuccess = function () {
  recaptchaBox.style.display    = "none";
  contactRevealed.style.display = "flex";
};

// ===== AI Chat Orb =====
// ⚠️  Set this to your deployed Vercel URL (no trailing slash)
const CHAT_API_URL = "https://ou-one.vercel.app/api/chat";

const aiOrb      = document.getElementById("aiOrb");
const chatWindow = document.getElementById("chatWindow");
const chatClose  = document.getElementById("chatClose");
const chatInput  = document.getElementById("chatInput");
const chatSend   = document.getElementById("chatSend");
const chatMsgs   = document.getElementById("chatMessages");

let chatOpen = false;

// ── Open / Close ──────────────────────────────────────────────
function openChat() {
  chatOpen = true;
  chatWindow.classList.add("chat-visible");
  chatWindow.setAttribute("aria-hidden", "false");
  aiOrb.classList.add("orb-hidden");
  chatInput.focus();
}

function closeChat() {
  chatOpen = false;
  chatWindow.classList.remove("chat-visible");
  chatWindow.setAttribute("aria-hidden", "true");
  aiOrb.classList.remove("orb-hidden");
}

aiOrb.addEventListener("click", () => {
  chatOpen ? closeChat() : openChat();
});

chatClose.addEventListener("click", closeChat);

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && chatOpen) closeChat();
});

// ── Render a message bubble ───────────────────────────────────
function appendMessage(role, text) {
  const wrap = document.createElement("div");
  wrap.className = `chat-msg ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.textContent = text;

  wrap.appendChild(bubble);
  chatMsgs.appendChild(wrap);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return bubble;
}

// ── Typing indicator ─────────────────────────────────────────
function showTyping() {
  const wrap = document.createElement("div");
  wrap.className = "chat-msg bot";
  wrap.id = "typingIndicator";

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble chat-typing";
  bubble.innerHTML = `<span></span><span></span><span></span>`;

  wrap.appendChild(bubble);
  chatMsgs.appendChild(wrap);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
}

function hideTyping() {
  document.getElementById("typingIndicator")?.remove();
}

// ── Send message ─────────────────────────────────────────────
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = "";
  chatInput.disabled = true;
  chatSend.disabled  = true;

  appendMessage("user", text);
  showTyping();

  try {
    const res = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    hideTyping();

    if (res.ok && data.reply) {
      appendMessage("bot", data.reply);
    } else {
      appendMessage("bot", data.error || "Sorry, something went wrong. Please try again.");
    }
  } catch {
    hideTyping();
    appendMessage("bot", "❌ Network error — please check your connection and try again.");
  } finally {
    chatInput.disabled = false;
    chatSend.disabled  = false;
    chatInput.focus();
  }
}

chatSend.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
// ===================================================
// COGNITIVE BIAS QUIZ — add to script.js
// ===================================================

const quizQuestions = [
  {
    q: "Your team just launched a project. It's not going well. What's your first instinct?",
    options: [
      { text: "Keep pushing — we've already invested so much time and money.", bias: "sunk" },
      { text: "Look for data that confirms the approach was right all along.", bias: "confirm" },
      { text: "Assume the people on the team aren't skilled enough.", bias: "attribution" },
      { text: "Decide it will probably work out fine — it usually does.", bias: "optimism" },
    ]
  },
  {
    q: "You're reviewing two job candidates. One went to a well-known university. How do you approach it?",
    options: [
      { text: "The prestigious university signals higher quality — it's a reliable indicator.", bias: "halo" },
      { text: "I focus purely on skills, but I'll admit the name catches my eye first.", bias: "halo" },
      { text: "I weight their actual work samples and references much more heavily.", bias: "confirm" },
      { text: "I assume the lesser-known candidate had to work harder to get here.", bias: "attribution" },
    ]
  },
  {
    q: "A colleague presents a new HR policy idea in a meeting. Your gut reaction?",
    options: [
      { text: "If it sounds familiar to what worked before, I'm immediately supportive.", bias: "confirm" },
      { text: "I wait to see which way the room leans before sharing my view.", bias: "bandwagon" },
      { text: "I mentally note who proposed it — that influences how I hear it.", bias: "halo" },
      { text: "I think about all the ways it could go wrong first.", bias: "negativity" },
    ]
  },
  {
    q: "You predicted a hiring decision would work out — but it didn't. Looking back, you think:",
    options: [
      { text: "I saw the warning signs — I just didn't act on them strongly enough.", bias: "hindsight" },
      { text: "Honestly, I knew it wouldn't work. The signs were obvious in retrospect.", bias: "hindsight" },
      { text: "It was bad luck — my reasoning was still sound.", bias: "optimism" },
      { text: "The candidate misled us. It wasn't our fault.", bias: "attribution" },
    ]
  },
  {
    q: "Your organization is considering a major change. Most people seem excited about it. You:",
    options: [
      { text: "Feel more positive about it because of the general enthusiasm around you.", bias: "bandwagon" },
      { text: "Get more cautious — everyone agreeing makes me look for what's being missed.", bias: "negativity" },
      { text: "Assume it will succeed because big changes usually do in your experience.", bias: "optimism" },
      { text: "Research it yourself — but find mostly sources that support the change.", bias: "confirm" },
    ]
  },
];

const quizBiases = {
  confirm: {
    icon: "🔍",
    name: "Confirmation Bias",
    tagline: "You see what you already believe.",
    desc: "You tend to seek out information that confirms your existing views and unconsciously filter out what contradicts them. In HR contexts, this can affect how you evaluate candidates or interpret performance data.",
    fact: "In a landmark study by Wason (1960), participants consistently sought confirming evidence over disconfirming evidence — even when the disconfirming approach would solve the problem faster.",
  },
  sunk: {
    icon: "⚓",
    name: "Sunk Cost Fallacy",
    tagline: "Past investment shapes your future decisions.",
    desc: "You factor in past investments (time, money, effort) when deciding whether to continue something — even when the rational choice would be to stop. This is extremely common in organizational decision-making.",
    fact: "Research by Arkes & Blumer (1985) showed people would continue a failing project simply because they had already invested resources, a pattern found in hiring, project management, and policy decisions.",
  },
  halo: {
    icon: "✨",
    name: "Halo Effect",
    tagline: "One great trait colors everything else.",
    desc: "A single positive quality (like attending a prestigious university, or being charismatic) unconsciously influences how you perceive all of someone's other traits. This is one of the most well-documented biases in hiring and performance reviews.",
    fact: "Thorndike (1920) first identified the halo effect in military officer evaluations — officers rated highly on one trait were rated highly across all traits, regardless of actual performance.",
  },
  hindsight: {
    icon: "🔮",
    name: "Hindsight Bias",
    tagline: "It was obvious — but only after the fact.",
    desc: "After an event occurs, you believe you 'knew it all along.' This makes it hard to learn from mistakes and can lead to overconfidence in future predictions. It's a major challenge in performance reviews and post-project analysis.",
    fact: "Fischhoff (1975) coined this as the 'I-knew-it-all-along' effect. Studies show it distorts memory of past predictions and makes us systematically overestimate how predictable events were.",
  },
  bandwagon: {
    icon: "🌊",
    name: "Bandwagon Effect",
    tagline: "The crowd's energy shapes your thinking.",
    desc: "You're influenced by what others around you think or do, sometimes more than the actual facts. In team settings this can suppress honest disagreement and lead to groupthink — a key risk in HR decisions and organizational culture.",
    fact: "Asch's (1951) conformity experiments showed that 75% of people agreed with an obviously wrong answer at least once when surrounded by others who gave that wrong answer.",
  },
  attribution: {
    icon: "🎭",
    name: "Fundamental Attribution Error",
    tagline: "You explain others by character, yourself by context.",
    desc: "When others fail, you attribute it to who they are. When you fail, you blame the situation. This asymmetry profoundly affects how we give feedback, conduct performance reviews, and make personnel decisions.",
    fact: "Ross (1977) named this the 'fundamental attribution error' — it's been replicated across cultures, though research shows it's more pronounced in individualistic Western societies.",
  },
  optimism: {
    icon: "🌅",
    name: "Optimism Bias",
    tagline: "You believe things will work out for you.",
    desc: "You overestimate the likelihood of positive outcomes and underestimate risks — especially for your own projects and decisions. While this drives ambition, it can lead to underestimating implementation challenges in HR and organizational change.",
    fact: "Weinstein (1980) found that 90% of people believe they are less likely than average to experience negative life events — a statistical impossibility that reveals how universal this bias is.",
  },
  negativity: {
    icon: "⚡",
    name: "Negativity Bias",
    tagline: "Bad news weighs heavier than good.",
    desc: "Negative information has a disproportionately stronger impact on your thinking than equivalent positive information. This affects employee feedback, risk assessment, and how you remember people's performance over time.",
    fact: "Baumeister et al. (2001) showed across multiple domains that bad events have stronger, longer-lasting effects on psychology than equally good events — 'bad is stronger than good.'",
  },
};

(function initQuiz() {
  const shell       = document.getElementById("quizShell");
  const card        = document.getElementById("quizCard");
  const resultEl    = document.getElementById("quizResult");
  const progressBar = document.getElementById("quizProgressBar");
  const progressLbl = document.getElementById("quizProgressLabel");
  const qNum        = document.getElementById("quizQNum");
  const qText       = document.getElementById("quizQuestion");
  const qOpts       = document.getElementById("quizOptions");
  const restartBtn  = document.getElementById("quizRestart");

  if (!shell) return; // section not in page yet

  let current = 0;
  const scores = {};

  function setProgress(idx) {
    const pct = (idx / quizQuestions.length) * 100;
    progressBar.style.setProperty("--qpct", pct + "%");
    progressLbl.textContent = idx < quizQuestions.length
      ? `Question ${idx + 1} of ${quizQuestions.length}`
      : "Complete!";
  }

  function renderQuestion(idx) {
    const q = quizQuestions[idx];
    qNum.textContent  = `Q${idx + 1}`;
    qText.textContent = q.q;
    qOpts.innerHTML   = "";

    const letters = ["A", "B", "C", "D"];
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.innerHTML = `
        <span class="quiz-option-letter">${letters[i]}</span>
        <span>${opt.text}</span>
      `;
      btn.addEventListener("click", () => handleAnswer(opt.bias));
      qOpts.appendChild(btn);
    });

    // Re-trigger animation
    card.style.animation = "none";
    card.offsetHeight; // reflow
    card.style.animation = "";
    setProgress(idx);
  }

  function handleAnswer(bias) {
    scores[bias] = (scores[bias] || 0) + 1;
    current++;

    if (current < quizQuestions.length) {
      renderQuestion(current);
    } else {
      showResult();
    }
  }

  function showResult() {
    setProgress(quizQuestions.length);

    // Find top bias
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    const r   = quizBiases[top];

    document.getElementById("quizResultIcon").textContent    = r.icon;
    document.getElementById("quizResultBias").textContent    = r.name;
    document.getElementById("quizResultTagline").textContent = r.tagline;
    document.getElementById("quizResultDesc").textContent    = r.desc;
    document.getElementById("quizResultFact").textContent    = r.fact;

    card.style.display     = "none";
    resultEl.style.display = "block";
  }

  restartBtn?.addEventListener("click", () => {
    current = 0;
    Object.keys(scores).forEach(k => delete scores[k]);
    card.style.display     = "block";
    resultEl.style.display = "none";
    renderQuestion(0);
  });

  renderQuestion(0);
})();


// ===================================================
// RESEARCH VISUALIZER — add to script.js
// ===================================================

(function initResearchViz() {
  const canvas = document.getElementById("researchCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W, H, animId;
  let nodes = [], edges = [];
  let hoveredNode = null;

  const THEME = {
    center:  { color: "124,92,255",  glow: "rgba(124,92,255,.45)" },
    psych:   { color: "48,213,200",  glow: "rgba(48,213,200,.4)"  },
    data:    { color: "99,179,255",  glow: "rgba(99,179,255,.4)"  },
    hr:      { color: "255,160,100", glow: "rgba(255,160,100,.4)" },
    edu:     { color: "180,130,255", glow: "rgba(180,130,255,.4)" },
  };

  const NODE_DATA = [
    // Center
    { id: "puja",      label: "Puja Sitoula",          type: "center", r: 28, desc: "PhD Researcher · HR Professional" },
    // Psychology
    { id: "psych",     label: "Psychology",             type: "psych",  r: 20, desc: "Science of mind & behavior" },
    { id: "cog",       label: "Cognitive Biases",       type: "psych",  r: 14, desc: "Decision-making research" },
    { id: "org",       label: "Org Behavior",           type: "psych",  r: 14, desc: "Workplace psychology" },
    { id: "social",    label: "Social Psychology",      type: "psych",  r: 13, desc: "Group dynamics & influence" },
    // Data
    { id: "data",      label: "Data Science",           type: "data",   r: 20, desc: "Quantitative research methods" },
    { id: "stats",     label: "Statistics",             type: "data",   r: 14, desc: "R · SPSS · SQL" },
    { id: "viz",       label: "Data Visualization",     type: "data",   r: 13, desc: "Tableau · Power BI" },
    { id: "ml",        label: "Research Methods",       type: "data",   r: 14, desc: "Experimental design" },
    // HR
    { id: "hr",        label: "Human Resources",        type: "hr",     r: 20, desc: "People operations" },
    { id: "recruit",   label: "Talent Acquisition",     type: "hr",     r: 13, desc: "Recruitment · Onboarding" },
    { id: "hris",      label: "HRIS",                   type: "hr",     r: 13, desc: "UKG · Taleo · Paycom" },
    { id: "engage",    label: "Employee Engagement",    type: "hr",     r: 13, desc: "Culture · Retention" },
    // Education
    { id: "edu",       label: "Education Research",     type: "edu",    r: 20, desc: "PhD at University of Oklahoma" },
    { id: "ou",        label: "Univ. of Oklahoma",      type: "edu",    r: 14, desc: "SPDRE PhD Program" },
    { id: "measure",   label: "Psychometrics",          type: "edu",    r: 13, desc: "Assessment & measurement" },
  ];

  const EDGE_DATA = [
    ["puja","psych"], ["puja","data"], ["puja","hr"], ["puja","edu"],
    ["psych","cog"], ["psych","org"], ["psych","social"],
    ["data","stats"], ["data","viz"], ["data","ml"],
    ["hr","recruit"], ["hr","hris"], ["hr","engage"],
    ["edu","ou"], ["edu","measure"],
    // Cross-domain connections (the interesting ones)
    ["cog","hr"], ["org","engage"], ["stats","measure"],
    ["social","recruit"], ["ml","hris"], ["edu","psych"],
  ];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = Math.min(500, Math.max(340, rect.width * 0.52));
    canvas.style.height = H + "px";
    layoutNodes();
  }

  function layoutNodes() {
    const cx = W / 2, cy = H / 2;

    // Center node
    const center = nodes.find(n => n.id === "puja");
    if (center) { center.x = cx; center.y = cy; center.fx = cx; center.fy = cy; }

    // Four clusters
    const clusters = {
      psych:  { angle: Math.PI * 1.25, ids: ["psych","cog","org","social"] },
      data:   { angle: Math.PI * 1.75, ids: ["data","stats","viz","ml"] },
      hr:     { angle: Math.PI * 0.25, ids: ["hr","recruit","hris","engage"] },
      edu:    { angle: Math.PI * 0.75, ids: ["edu","ou","measure"] },
    };

    Object.entries(clusters).forEach(([key, cluster]) => {
      const hubDist  = Math.min(W, H) * 0.28;
      const leafDist = Math.min(W, H) * 0.14;
      const hub = nodes.find(n => n.id === key);
      if (hub) {
        hub.tx = cx + Math.cos(cluster.angle) * hubDist;
        hub.ty = cy + Math.sin(cluster.angle) * hubDist;
      }
      cluster.ids.slice(1).forEach((id, i) => {
        const leaf = nodes.find(n => n.id === id);
        if (!leaf) return;
        const spread = (i - (cluster.ids.length - 2) / 2) * 0.55;
        const leafAngle = cluster.angle + spread;
        const hx = cx + Math.cos(cluster.angle) * hubDist;
        const hy = cy + Math.sin(cluster.angle) * hubDist;
        leaf.tx = hx + Math.cos(leafAngle) * leafDist * 1.8;
        leaf.ty = hy + Math.sin(leafAngle) * leafDist * 1.8;
      });
    });
  }

  function initNodes() {
    const cx = W / 2, cy = H / 2;
    nodes = NODE_DATA.map(d => ({
      ...d,
      x: cx + (Math.random() - .5) * 60,
      y: cy + (Math.random() - .5) * 60,
      vx: 0, vy: 0,
      tx: cx, ty: cy,
      pulse: Math.random() * Math.PI * 2,
    }));
    edges = EDGE_DATA.map(([a, b]) => ({
      a: nodes.find(n => n.id === a),
      b: nodes.find(n => n.id === b),
    })).filter(e => e.a && e.b);
    layoutNodes();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Move nodes toward targets (spring)
    nodes.forEach(n => {
      if (n.fx !== undefined) { n.x = n.fx; n.y = n.fy; return; }
      const dx = (n.tx - n.x) * 0.04;
      const dy = (n.ty - n.y) * 0.04;
      n.x += dx + n.vx;
      n.y += dy + n.vy;
      n.vx *= 0.85; n.vy *= 0.85;
      n.pulse += 0.016;
    });

    // Draw edges
    edges.forEach(e => {
      const isHighlighted = hoveredNode &&
        (e.a.id === hoveredNode.id || e.b.id === hoveredNode.id);
      const alpha = isHighlighted ? 0.55 : 0.12;
      const lw    = isHighlighted ? 1.5  : 0.8;

      ctx.beginPath();
      ctx.moveTo(e.a.x, e.a.y);

      // Slight curve for aesthetics
      const mx = (e.a.x + e.b.x) / 2 + (e.b.y - e.a.y) * 0.08;
      const my = (e.a.y + e.b.y) / 2 - (e.b.x - e.a.x) * 0.08;
      ctx.quadraticCurveTo(mx, my, e.b.x, e.b.y);

      const c = THEME[e.a.type]?.color || "255,255,255";
      ctx.strokeStyle = `rgba(${c},${alpha})`;
      ctx.lineWidth   = lw;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(n => {
      const t     = THEME[n.type];
      const glow  = Math.sin(n.pulse) * 0.4 + 0.6;
      const isHov = hoveredNode?.id === n.id;
      const r     = isHov ? n.r * 1.18 : n.r;

      // Glow halo
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3.5);
      grad.addColorStop(0, `rgba(${t.color},${0.22 * glow})`);
      grad.addColorStop(1, `rgba(${t.color},0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${t.color},${0.18})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${t.color},${0.55 + 0.3 * glow})`;
      ctx.lineWidth   = isHov ? 2 : 1.2;
      ctx.stroke();

      // Label
      const fontSize = n.type === "center" ? 13 : 11;
      ctx.font      = `${n.type === "center" ? 700 : 600} ${fontSize}px ui-sans-serif,system-ui,sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(${t.color},${isHov ? 1 : 0.75 + 0.2 * glow})`;
      ctx.fillText(n.label, n.x, n.y + r + 11);

      // Hover tooltip
      if (isHov && n.desc) {
        const pad = 10, tw = ctx.measureText(n.desc).width + pad * 2;
        const tx  = Math.min(Math.max(n.x - tw / 2, 6), W - tw - 6);
        const ty  = n.y - r - 36;
        ctx.fillStyle = "rgba(10,16,32,.92)";
        roundRect(ctx, tx, ty, tw, 26, 8);
        ctx.fill();
        ctx.strokeStyle = `rgba(${t.color},.35)`;
        ctx.lineWidth   = 1;
        ctx.stroke();
        ctx.font      = "11px ui-sans-serif,system-ui,sans-serif";
        ctx.fillStyle = `rgba(${t.color},1)`;
        ctx.fillText(n.desc, tx + tw / 2, ty + 13);
      }
    });

    animId = requestAnimationFrame(draw);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function getNode(mx, my) {
    return nodes.find(n => Math.hypot(n.x - mx, n.y - my) < n.r + 14) || null;
  }

  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    hoveredNode = getNode(e.clientX - rect.left, e.clientY - rect.top);
    canvas.style.cursor = hoveredNode ? "pointer" : "default";
  });
  canvas.addEventListener("mouseleave", () => { hoveredNode = null; });

  // Touch support
  canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    const rect  = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    hoveredNode = getNode(touch.clientX - rect.left, touch.clientY - rect.top);
  }, { passive: false });

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animId);
    resize();
    draw();
  });

  resize();
  initNodes();
  draw();
})();