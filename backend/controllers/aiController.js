const FAQ = require("../models/FAQ");

const PORTAL_INFO = `FAQHub Portal Guide:
- Home (/): Platform overview
- FAQs (/faq): Browse all frequently asked questions by category
- Ask (/raise-query): Raise a new question (check FAQs first!)
- Community (/community-qa): View and answer community questions
- Profile (/profile): View your raised queries, answers, and notifications
- Admin (/admin): Platform management (admin only)

How to use:
1. Browse FAQs first — your answer might already exist
2. If not found, go to Ask to raise a question
3. Community members can answer your questions
4. Admin approves answers and publishes them as FAQs`;

const STOP_WORDS = new Set(["what", "how", "when", "where", "does", "the", "and", "for", "are", "can", "you", "your", "this", "that", "with", "from", "have", "will", "about", "some", "tell", "give", "show", "know", "its", "it", "is", "do", "i", "my", "me", "we", "us", "our", "to", "of", "in", "on", "at", "by", "or", "an", "a"]);

const GREETINGS = /^(hi|hello|hey|howdy|greetings|good\s*(morning|afternoon|evening)|namaste|yo|hola|sup|what'?s\s*up|how\s*are\s*you|hru|heya|hiya|hej|hallo|bonjour|ciao|salut|gm|gn|nvm|ok|thanks|thank you|bye|tata|see you|good night)$/i;

const searchFAQs = async (query) => {
  try {
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    if (words.length === 0) return [];

    const allFAQs = await FAQ.find().select("question answer category tags faqNumber").lean();
    const scored = allFAQs.map((faq) => {
      const text = `${faq.question} ${faq.answer} ${faq.tags?.join(" ") || ""}`.toLowerCase();
      const qLower = faq.question.toLowerCase();
      let score = 0;
      words.forEach((w) => {
        if (text.includes(w)) score += 1;
        if (qLower.includes(w)) score += 3;
        if (faq.tags?.some((t) => t.toLowerCase().includes(w))) score += 1;
      });
      const wordsInQ = words.filter((w) => qLower.includes(w)).length;
      if (words.length > 0 && wordsInQ === words.length) score += 5;
      return { ...faq, score };
    });

    return scored.filter((f) => f.score > 0).sort((a, b) => b.score - a.score);
  } catch {
    return [];
  }
};

const lookupFAQByNumber = async (query) => {
  const match = query.match(/#(\d+)/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const faq = await FAQ.findOne({ faqNumber: num }).select("question answer category tags faqNumber").lean();
  return faq || null;
};

const aiChat = async (req, res, next) => {
  try {
    const { message, language, history } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const lang = language || "English";
    const trimmed = message.trim();

    // Handle greetings and short casual messages
    if (GREETINGS.test(trimmed)) {
      const greetings = {
        en: "Hey there! I'm your FAQ Friend. Ask me anything about the portal or VINS internship!",
        hi: "नमस्ते! मैं आपका FAQ Friend हूँ। पोर्टल या VINS इंटर्नशिप के बारे में कुछ भी पूछें!",
        te: "హాయ్! నేను మీ FAQ Friend. పోర్టల్ గురించి ఏదైనా అడగండి!",
        ta: "வணக்கம்! நான் உங்கள் FAQ Friend. போர்ட்டல் அல்லது VINS இன்டர்ன்ஷிப் பற்றி எதையும் கேளுங்கள்!",
        bn: "হ্যালো! আমি আপনার FAQ Friend। পোর্টাল বা VINS ইন্টার্নশিপ সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন!",
      };
      const reply = greetings[lang] || greetings.en;
      return res.json({ reply, language: lang, faqMatch: false });
    }

    // Check for FAQ number lookup (e.g., "#5 explain", "what is #12")
    const numberedFAQ = await lookupFAQByNumber(trimmed);
    if (numberedFAQ) {
      let reply = `**FAQ #${numberedFAQ.faqNumber}: ${numberedFAQ.question}**\n\n${numberedFAQ.answer}`;
      reply += `\n\n_(Category: ${numberedFAQ.category})_`;
      return res.json({ reply, language: lang, faqMatch: true });
    }

    const matchedFAQs = await searchFAQs(trimmed);

    // Try AI API — if unavailable or key invalid, fall back to FAQ-only mode
    const apiKey = process.env.X_API_KEY;
    const apiURL = process.env.AI_API_URL || "https://api.minimax.io/v1/chat/completions";
    const modelName = process.env.AI_MODEL || "MiniMax-M2.7";

    if (apiKey) {
      try {
        const faqContext = matchedFAQs.length > 0
          ? matchedFAQs.map((f, i) => `FAQ ${i + 1}:\nQ: ${f.question}\nA: ${f.answer}\nCategory: ${f.category}`).join("\n\n")
          : "No matching FAQ found.";

        const systemPrompt = `You are a helpful FAQ support bot for FAQHub. Respond in ${lang}.

CRITICAL RULES:
1. PRIORITY: Check the FAQs below FIRST. If a FAQ matches the user's question, provide that FAQ answer DIRECTLY. Do NOT give generic advice when a FAQ exists.
2. When a FAQ matches, answer with the FAQ content. Do NOT say "based on the FAQ" — just give the answer.
3. If NO FAQ matches, then help the user by explaining how to use the portal or how to raise a question.
4. Keep answers SHORT — 1-3 sentences for FAQ answers.
5. If the user asks about the portal, use the PORTAL GUIDE below.

FAQs (USE THESE if they match):
${faqContext}

PORTAL GUIDE:
${PORTAL_INFO}`;

        const response = await fetch(apiURL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: systemPrompt },
              ...(history || []),
              { role: "user", content: message },
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (response.ok) {
          const data = await response.json();
          let reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
          // Strip all <think>...</think> blocks (including nested)
          reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
          return res.json({ reply, language: lang, faqMatch: matchedFAQs.length > 0 });
        }
      } catch {
        // Fall through to FAQ-only mode
      }
    }

    // FAQ-only fallback — no AI API needed
    // Only show result if top match has strong question-level relevance
    const best = matchedFAQs[0];
    if (best) {
      const queryWords = message.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
      const wordsInQuestion = queryWords.filter((w) => best.question.toLowerCase().includes(w)).length;
      const questionCoverage = queryWords.length > 0 ? wordsInQuestion / queryWords.length : 0;

      // Show FAQ if: most query words appear in the question, OR score is high enough
      if (questionCoverage >= 0.5 || best.score >= 6) {
        let reply = `**FAQ #${best.faqNumber || "—"}: ${best.question}**\n\n${best.answer}`;
        reply += `\n\n_(Category: ${best.category})_`;
        return res.json({ reply, language: lang, faqMatch: true });
      }
    }

    // No FAQs matched, no AI available
    const portalGuide = `I couldn't find a matching FAQ for your question. Here's how I can help:

1. **Browse FAQs** — Visit the FAQ page to search all categories
2. **Raise a Query** — Go to the Ask page to submit your question
3. **Community** — Other members can answer your question in the Community Hub

${PORTAL_INFO}`;
    res.json({ reply: portalGuide, language: lang, faqMatch: false });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return res.status(504).json({ message: "AI service timeout" });
    }
    next(error);
  }
};

const suggestFAQs = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query is required" });
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    if (words.length === 0) return res.json([]);
    const allFAQs = await FAQ.find().select("question answer category tags faqNumber").lean();
    const scored = allFAQs.map((faq) => {
      const text = `${faq.question} ${faq.answer} ${faq.tags?.join(" ") || ""}`.toLowerCase();
      const qLower = faq.question.toLowerCase();
      let score = 0;
      words.forEach((w) => {
        if (text.includes(w)) score += 1;
        if (qLower.includes(w)) score += 3;
      });
      const wordsInQ = words.filter((w) => qLower.includes(w)).length;
      if (words.length > 0 && wordsInQ === words.length) score += 5;
      return { ...faq, score };
    });
    const results = scored.filter((f) => f.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

module.exports = { aiChat, suggestFAQs };
