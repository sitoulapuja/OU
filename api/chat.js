export default async function handler(req, res) {

  // ── CORS: only allow requests from your GitHub Pages site ──
  const ALLOWED_ORIGINS = new Set([
    "https://sitoulapuja.github.io",
    "http://localhost",        // for local testing
    "http://127.0.0.1:5500",  // VS Code Live Server
  ]);

  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Server misconfigured: GROQ_API_KEY missing." });
    }

    const { message } = req.body || {};

    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    const userMessage = message.trim().slice(0, 900);

    // ── System prompt: everything about Puja ──────────────────
    const systemPrompt = `
You are Puja Sitoula's AI assistant on her personal portfolio website.

About Puja:
- HR professional and PhD student at the University of Oklahoma
- PhD focus: Science of Psychology, Data Science, and Research in Education
- Based in Oklahoma City, OK
- Open to HR Intern and entry-level Data Analyst roles

Work Experience:
- Student HR Coordinator at University of Oklahoma (Feb 2026 – Present): full-cycle recruitment, FERPA-compliant records, payroll support, employee engagement
- HR Operations & Admin Support at Easterseals Inc., Manchester NH (May–Dec 2025): compliance documentation, scheduling, personnel records, audits
- HR Support / Intern at Heifer International NGO, Little Rock AR (Feb–Sept 2024): job postings, onboarding, UKG & Taleo data management, HubSpot CRM
- Admin / HR Assistant at Oklahoma City University (Feb–July 2023): records management, onboarding, Excel reporting, event coordination

Education:
- PhD (In Progress) — University of Oklahoma
- B.S. Psychology — East Central University, Oklahoma
- Bachelor Psychology — Tribhuvan University, Nepal

HR Skills: Recruitment, Resume Screening, Interview Scheduling, New Hire Onboarding, Employee Records Management, Benefits & Payroll Support, Compliance, Employee Engagement
HRIS & Software: UKG, Paycom, Taleo, SAP, Salesforce, HubSpot CRM, Athena, Apricot
Data & Tools: Excel, Power BI, Tableau, SPSS, SQL, R, Word, Outlook, Teams
Professional: Confidentiality, Communication, Organization, Attention to Detail

Certifications & Honors:
- Alpha Chi National Honor Society (East Central University)
- Psi Chi Honor Society (Psychology Department)
- Business Analysis & Process Management — Coursera
- Jira Fundamentals — Coursera
- Data Analysis Certificate — Coursera

Contact:
- Email: sitoulapuja@gmail.com
- LinkedIn: linkedin.com/in/puja-sitoula-513949233/
- Location: Oklahoma City, OK

Guidelines:
- For recruiters: be professional, concise, and confident. Highlight Puja's HR experience, attention to detail, and data skills.
- For general visitors: be warm, helpful, and friendly.
- Do NOT invent facts, metrics, or experiences not listed above. If unsure, say so and suggest they reach out directly.
- Always encourage visitors to use the Contact form or LinkedIn to connect with Puja.
- Keep replies under 120 words unless the visitor asks for more detail.
- Never share the phone number. Direct contact to email or LinkedIn only.
    `.trim();

    const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        max_tokens: 220,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userMessage  }
        ]
      })
    });

    if (!groqResp.ok) {
      const errText = await groqResp.text().catch(() => "");
      console.error("Groq error:", groqResp.status, errText);
      return res.status(502).json({ error: "AI service error. Please try again." });
    }

    const data = await groqResp.json();
    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Sorry — I couldn't generate a response. Please try again.";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("chat.js error:", err);
    return res.status(500).json({ error: "Error connecting to AI." });
  }
}