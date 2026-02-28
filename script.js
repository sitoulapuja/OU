// Mobile nav toggle
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

// Contact form: opens email client (no backend needed)
const form = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !message) {
    formMsg.textContent = "Please fill in all fields.";
    return;
  }

  const subject = encodeURIComponent(`Website contact from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`
  );

  // Change to your email if needed
  const to = "sitoulapuja@gmail.com";
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

  formMsg.textContent = "Opening your email app…";
  form.reset();
});