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

  // Labels that float around — HR + psychology + data themed
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

    // Draw connections
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

    // Draw nodes + labels
    for (const n of nodes) {
      n.pulse += 0.018;
      const glow = Math.sin(n.pulse) * 0.5 + 0.5; // 0–1

      // Outer glow ring
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
      grad.addColorStop(0, `rgba(${n.color},${0.18 * glow})`);
      grad.addColorStop(1, `rgba(${n.color},0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.color},${0.55 + 0.45 * glow})`;
      ctx.fill();

      // Floating label
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = `rgba(${n.color},${0.28 + 0.18 * glow})`;
      ctx.fillText(n.label, n.x + n.r + 4, n.y + 4);

      // Move
      n.x += n.vx;
      n.y += n.vy;

      // Bounce off edges
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    resize();
    // Keep existing nodes roughly in bounds
    for (const n of nodes) {
      n.x = Math.min(n.x, W);
      n.y = Math.min(n.y, H);
    }
  });

  init();
  draw();
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

// ===== AI Orb click (placeholder — wire up your agent here) =====
document.getElementById("aiOrb")?.addEventListener("click", () => {
  // TODO: replace this with your AI agent open/close logic
  const tooltip = document.querySelector(".orb-tooltip");
  tooltip.textContent = "🚀 Coming soon!";
  setTimeout(() => {
    tooltip.innerHTML = "🤖 AI Assistant<br/><span>Coming Soon</span>";
  }, 2000);
});