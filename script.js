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
  chatInput.focus();
}

function closeChat() {
  chatOpen = false;
  chatWindow.classList.remove("chat-visible");
  chatWindow.setAttribute("aria-hidden", "true");
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