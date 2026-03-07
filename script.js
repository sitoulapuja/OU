// ===== Aurora + Mouse-Attract Particles Background =====
(function () {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, mouse = { x: -999, y: -999 };

  // ── Aurora blobs ──────────────────────────────────────────
  const blobs = [
    { x: 0.20, y: 0.15, r: 0.55, hue: 260, speed: 0.00018 },
    { x: 0.75, y: 0.25, r: 0.50, hue: 175, speed: 0.00022 },
    { x: 0.50, y: 0.70, r: 0.48, hue: 230, speed: 0.00015 },
    { x: 0.85, y: 0.80, r: 0.42, hue: 285, speed: 0.00020 },
    { x: 0.10, y: 0.85, r: 0.38, hue: 190, speed: 0.00017 },
  ];
  let tick = 0;

  function drawAurora() {
    // dark base
    ctx.fillStyle = "rgba(7,11,20,0.82)";
    ctx.fillRect(0, 0, W, H);

    blobs.forEach((b, i) => {
      const ox = Math.sin(tick * b.speed * 1000 + i * 1.7) * 0.12;
      const oy = Math.cos(tick * b.speed * 800  + i * 2.3) * 0.10;
      const cx = (b.x + ox) * W;
      const cy = (b.y + oy) * H;
      const rad = b.r * Math.max(W, H);

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0,   `hsla(${b.hue},90%,65%,0.13)`);
      g.addColorStop(0.4, `hsla(${b.hue},80%,55%,0.07)`);
      g.addColorStop(1,   `hsla(${b.hue},70%,40%,0.00)`);

      ctx.beginPath();
      ctx.ellipse(cx, cy, rad * 1.2, rad * 0.75, tick * b.speed * 200, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  // ── Particles ─────────────────────────────────────────────
  let particles = [];
  const ATTRACT_RADIUS = 160;
  const ATTRACT_FORCE  = 0.018;
  const FRICTION       = 0.92;
  const LINK_DIST      = 110;

  function makeParticle() {
    const hue = Math.random() < 0.5 ? 260 : 175;
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r:  Math.random() * 1.8 + 1.2,
      hue,
      base_vx: (Math.random() - 0.5) * 0.4,
      base_vy: (Math.random() - 0.5) * 0.4,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function initParticles() {
    const count = Math.min(Math.floor((W * H) / 14000), 65);
    particles = Array.from({ length: count }, makeParticle);
  }

  function drawParticles() {
    // connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `hsla(${a.hue},80%,65%,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // dots
    particles.forEach(p => {
      p.pulse += 0.02;
      const glow = Math.sin(p.pulse) * 0.5 + 0.5;

      // mouse attract
      const mdx = mouse.x - p.x;
      const mdy = mouse.y - p.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < ATTRACT_RADIUS && mdist > 1) {
        const force = (1 - mdist / ATTRACT_RADIUS) * ATTRACT_FORCE;
        p.vx += (mdx / mdist) * force;
        p.vy += (mdy / mdist) * force;
      }

      // friction + drift back to base speed
      p.vx = p.vx * FRICTION + p.base_vx * (1 - FRICTION);
      p.vy = p.vy * FRICTION + p.base_vy * (1 - FRICTION);

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) { p.vx *= -1; p.base_vx *= -1; }
      if (p.y < 0 || p.y > H) { p.vy *= -1; p.base_vy *= -1; }

      // glow halo
      const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      halo.addColorStop(0, `hsla(${p.hue},90%,70%,${0.15 * glow})`);
      halo.addColorStop(1, `hsla(${p.hue},90%,70%,0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},90%,75%,${0.6 + 0.4 * glow})`;
      ctx.fill();
    });
  }

  // ── Main loop ─────────────────────────────────────────────
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function loop(t) {
    tick = t;
    drawAurora();
    drawParticles();
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => { resize(); initParticles(); });
  window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseleave", () => { mouse.x = -999; mouse.y = -999; });

  resize();
  initParticles();
  requestAnimationFrame(loop);
})();

const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("show");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close nav after clicking a link (mobile)
siteNav?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    siteNav.classList.remove("show");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Scroll progress bar
const progress = document.getElementById("progress");
window.addEventListener("scroll", () => {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progress.style.width = `${pct}%`;
});

// Contact form: submits to Formspree
const form = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");
const submitBtn = form?.querySelector("button[type='submit']");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !message) {
    formMsg.style.color = "#f87171";
    formMsg.textContent = "Please fill in all fields.";
    return;
  }

  // Disable button while sending
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
  }

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
      const json = await response.json();
      const errMsg = json?.errors?.map(e => e.message).join(", ") || "Something went wrong.";
      formMsg.style.color = "#f87171";
      formMsg.textContent = `❌ Error: ${errMsg}`;
    }
  } catch (err) {
    formMsg.style.color = "#f87171";
    formMsg.textContent = "❌ Network error. Please try again.";
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send";
    }
  }
});
// ===== Phone Show / Hide =====
const showPhoneBtn = document.getElementById("showPhoneBtn");
const phoneNumber = document.getElementById("phoneNumber");

showPhoneBtn?.addEventListener("click", () => {
  if (phoneNumber.textContent === "") {
    phoneNumber.textContent = "(405) 318-2987";
    showPhoneBtn.textContent = "Hide Phone";
  } else {
    phoneNumber.textContent = "";
    showPhoneBtn.textContent = "Show Phone";
  }
});

// ===== reCAPTCHA Contact Reveal =====
const revealBtn    = document.getElementById("revealBtn");
const recaptchaBox = document.getElementById("recaptchaBox");
const contactLocked   = document.getElementById("contactLocked");
const contactRevealed = document.getElementById("contactRevealed");

revealBtn?.addEventListener("click", () => {
  contactLocked.style.display = "none";
  recaptchaBox.style.display  = "flex";
});

// Called by reCAPTCHA on success (data-callback="onCaptchaSuccess")
window.onCaptchaSuccess = function () {
  recaptchaBox.style.display    = "none";
  contactRevealed.style.display = "flex";
};

// ===== AI Chat Widget =====
// ⚠️ After deploying to Vercel, replace this URL with your real Vercel deployment URL:
// e.g. "https://puja-portfolio.vercel.app/api/chat"
const CHAT_API_URL = "https://ou-gamma.vercel.app/api/chat";

const aiOrb      = document.getElementById("aiOrb");
const chatWindow = document.getElementById("chatWindow");
const chatClose  = document.getElementById("chatClose");
const chatInput  = document.getElementById("chatInput");
const chatSend   = document.getElementById("chatSend");
const chatMessages = document.getElementById("chatMessages");

let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  chatWindow.classList.toggle("open", chatOpen);
  chatWindow.setAttribute("aria-hidden", String(!chatOpen));
  if (chatOpen) setTimeout(() => chatInput?.focus(), 300);
}

aiOrb?.addEventListener("click", toggleChat);
chatClose?.addEventListener("click", toggleChat);

// Close on Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && chatOpen) toggleChat();
});

function addMessage(text, role) {
  const wrap = document.createElement("div");
  wrap.className = `chat-msg ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.textContent = text;
  wrap.appendChild(bubble);
  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrap;
}

function showTyping() {
  const wrap = document.createElement("div");
  wrap.className = "chat-msg bot chat-typing";
  wrap.innerHTML = `<div class="chat-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
  chatMessages.appendChild(wrap);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return wrap;
}

async function sendMessage() {
  const text = chatInput?.value.trim();
  if (!text) return;

  chatInput.value = "";
  chatSend.disabled = true;
  addMessage(text, "user");

  const typingEl = showTyping();

  try {
    const res = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    typingEl.remove();
    addMessage(data.reply || "Sorry, I couldn't get a response.", "bot");
  } catch {
    typingEl.remove();
    addMessage("⚠️ Couldn't connect. Please try again.", "bot");
  } finally {
    chatSend.disabled = false;
    chatInput?.focus();
  }
}

chatSend?.addEventListener("click", sendMessage);
chatInput?.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});