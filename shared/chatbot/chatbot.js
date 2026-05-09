/**
 * Encore Performers AI Chatbot Widget
 * Powered by Google Gemini API (gemini-2.5-flash-lite)
 * Rate limited to 50 questions/day per visitor via localStorage
 */
(function () {
  'use strict';

  const GEMINI_API_KEY = 'AIzaSyCHQwnmVe_JfEe63FwvkLwtiLZVUqCQexk';
  const GEMINI_MODEL = 'gemini-2.5-flash-lite';
  const DAILY_LIMIT = 50;
  const LS_KEY = 'encore_chatbot';

  const SYSTEM_PROMPT = `You are the friendly AI assistant for Encore Performers, the premier dance studio in Northern Virginia. You answer questions about the studio in a warm, helpful, and concise way. Use 2-3 sentences max unless the question requires more detail.

STUDIO INFO:
- Name: Encore Performers
- Tagline: "The Place To Dance"
- Address: 4299 Henninger Ct, Chantilly, VA 20151
- Phone: 703-222-5511
- Email: encoreperformers@gmail.com
- Website: www.encoreperformers.com

PROGRAMS & AGE GROUPS:
- Munchkin & Minis: Ages 3-6 (introductory dance classes)
- Juniors: Ages 7-11
- Tweens: Ages 10-12
- Teens: Ages 12-18
- ITP (Intermediate Training Program) & ETAP (Encore Training for Advanced Performers): Advanced/competitive programs

DANCE STYLES OFFERED:
Jazz, Tap, Hip Hop, Ballet/Pointe, Contemporary, Musical Theatre, Ballroom, and more.

SUMMER PROGRAMS:
- Mini Camps (Ages 4-6)
- Dance Camps (Ages 6-13): Broadway, KPOP, Movie Magic, Disney, TikTok Trends themes
- Intensives for ITP & ETAP students
- Summer evening dance classes (July-August, Mon-Thu)

PERFORMANCE OPPORTUNITIES:
- Annual Spring Recital (professional theatre, full-scale production)
- Performance teams (competitive)
- Musical theatre company (pre-professional)

FREE TRIAL CLASS:
New students can book a FREE trial class at: https://encoreperformers1.dncestudios.com/get-started-new

REGISTRATION / PARENT PORTAL:
https://app.gostudiopro.com/online/classes.php?account_id=27537

SOCIAL MEDIA:
- Instagram: @encoreperformers
- Facebook: EncorePerformersDance
- YouTube: @encoreperformers5558
- TikTok: @encoreperformers96

PRICING:
For current pricing and tuition information, please call us at 703-222-5511 or email encoreperformers@gmail.com. Do NOT make up or guess any prices.

RULES:
- Always be enthusiastic about dance and welcoming.
- If you don't know something specific, direct them to call 703-222-5511 or email.
- Never make up information. Stick to what's provided above.
- When someone asks about registration, always include the free trial link.
- Keep answers concise and parent-friendly.`;

  // --- Rate Limiting ---
  function getUsage() {
    try {
      const data = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      const today = new Date().toISOString().slice(0, 10);
      if (data.date !== today) return { date: today, count: 0 };
      return data;
    } catch { return { date: new Date().toISOString().slice(0, 10), count: 0 }; }
  }

  function incrementUsage() {
    const usage = getUsage();
    usage.count++;
    localStorage.setItem(LS_KEY, JSON.stringify(usage));
    return usage.count;
  }

  function remainingQuestions() {
    return Math.max(0, DAILY_LIMIT - getUsage().count);
  }

  // --- Gemini API ---
  async function askGemini(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    // Filter out "thought" parts from Gemma-style models
    const textParts = parts.filter(p => !p.thought);
    return textParts.map(p => p.text).join('') || 'Sorry, I couldn\'t generate a response. Please call us at 703-222-5511!';
  }

  // --- Hardcoded FAQ Fallback ---
  const FAQ = {
    'classes': 'We offer Jazz, Tap, Hip Hop, Ballet/Pointe, Contemporary, Musical Theatre, Ballroom, and more for ages 3 through teen! Visit our class schedule or book a free trial at encoreperformers1.dncestudios.com/get-started-new',
    'register': 'You can register through our Parent Portal or book a FREE trial class here: encoreperformers1.dncestudios.com/get-started-new',
    'trial': 'Yes! We offer a FREE trial class for new students. Book yours here: encoreperformers1.dncestudios.com/get-started-new',
    'location': 'We\'re located at 4299 Henninger Ct, Chantilly, VA 20151. Come visit us!',
    'address': 'We\'re located at 4299 Henninger Ct, Chantilly, VA 20151.',
    'phone': 'You can reach us at 703-222-5511 or email encoreperformers@gmail.com.',
    'contact': 'Call us at 703-222-5511, email encoreperformers@gmail.com, or visit us at 4299 Henninger Ct, Chantilly, VA 20151.',
    'price': 'For current pricing and tuition info, please call us at 703-222-5511 or email encoreperformers@gmail.com.',
    'cost': 'For current pricing and tuition info, please call us at 703-222-5511 or email encoreperformers@gmail.com.',
    'tuition': 'For current pricing and tuition info, please call us at 703-222-5511 or email encoreperformers@gmail.com.',
    'summer': 'We have amazing summer programs! Mini Camps (ages 4-6), Dance Camps (ages 6-13) with themes like Broadway, KPOP, and Disney, plus Intensives for advanced dancers. Summer classes run July-August.',
    'age': 'We welcome dancers starting at age 3! Munchkins & Minis (3-6), Juniors (7-11), Tweens (10-12), Teens (12-18), plus advanced ITP & ETAP programs.',
    'recital': 'Our annual Spring Recital is a full-scale show at a professional theatre with lighting, stage crew, and a sold-out audience. All students participate!'
  };

  function fallbackAnswer(msg) {
    const lower = msg.toLowerCase();
    for (const [key, answer] of Object.entries(FAQ)) {
      if (lower.includes(key)) return answer;
    }
    return 'Great question! For the most accurate answer, please call us at 703-222-5511 or email encoreperformers@gmail.com. You can also book a free trial class at encoreperformers1.dncestudios.com/get-started-new!';
  }

  // --- UI ---
  function createWidget() {
    // Container
    const container = document.createElement('div');
    container.id = 'encore-chatbot';
    container.innerHTML = `
      <button id="encore-chat-toggle" aria-label="Chat with us">
        <svg width="36" height="36" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <!-- head -->
          <circle cx="32" cy="14" r="8" fill="currentColor"/>
          <!-- body -->
          <line x1="32" y1="22" x2="32" y2="38" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          <!-- arms -->
          <line x1="32" y1="28" x2="20" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="32" y1="28" x2="44" y2="22" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <!-- tutu skirt -->
          <ellipse cx="32" cy="38" rx="14" ry="5" fill="currentColor" opacity="0.85"/>
          <path d="M18 38 Q22 48 26 38" fill="currentColor" opacity="0.6"/>
          <path d="M24 38 Q28 50 32 38" fill="currentColor" opacity="0.6"/>
          <path d="M30 38 Q34 50 38 38" fill="currentColor" opacity="0.6"/>
          <path d="M36 38 Q40 48 44 38" fill="currentColor" opacity="0.6"/>
          <!-- legs -->
          <line x1="30" y1="43" x2="26" y2="56" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="34" y1="43" x2="38" y2="56" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <!-- feet (pointe) -->
          <circle cx="26" cy="57" r="2" fill="currentColor"/>
          <circle cx="38" cy="57" r="2" fill="currentColor"/>
        </svg>
      </button>
      <div id="encore-chat-window" class="encore-chat-hidden">
        <div id="encore-chat-header">
          <span>Ask Encore AI</span>
          <button id="encore-chat-close" aria-label="Close chat">&times;</button>
        </div>
        <div id="encore-chat-messages">
          <div class="encore-msg encore-bot">Hi! I'm the Encore Performers AI assistant. Ask me anything about our dance classes, programs, registration, or schedule! 💃</div>
        </div>
        <div id="encore-chat-remaining">${remainingQuestions()} questions remaining today</div>
        <form id="encore-chat-form">
          <input type="text" id="encore-chat-input" placeholder="Ask a question..." autocomplete="off" maxlength="300" />
          <button type="submit" aria-label="Send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(container);

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      #encore-chatbot {
        --chat-primary: var(--chatbot-primary, #e6b422);
        --chat-bg: var(--chatbot-bg, #1a1a2e);
        --chat-text: var(--chatbot-text, #ffffff);
        --chat-bubble-bot: var(--chatbot-bubble-bot, #2a2a4e);
        --chat-bubble-user: var(--chatbot-bubble-user, #e6b422);
        --chat-user-text: var(--chatbot-user-text, #1a1a2e);
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        font-family: 'Montserrat', Arial, sans-serif;
      }
      #encore-chat-toggle {
        width: 60px; height: 60px;
        border-radius: 50%;
        background: var(--chat-primary);
        color: var(--chat-user-text);
        border: none; cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      #encore-chat-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 28px rgba(0,0,0,0.4);
      }
      #encore-chat-window {
        position: absolute;
        bottom: 72px; right: 0;
        width: 370px; max-height: 520px;
        background: var(--chat-bg);
        border-radius: 16px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        display: flex; flex-direction: column;
        overflow: hidden;
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      #encore-chat-window.encore-chat-hidden {
        opacity: 0; transform: translateY(20px) scale(0.95);
        pointer-events: none;
      }
      #encore-chat-header {
        background: var(--chat-primary);
        color: var(--chat-user-text);
        padding: 14px 18px;
        font-weight: 700;
        font-size: 15px;
        display: flex; justify-content: space-between; align-items: center;
      }
      #encore-chat-close {
        background: none; border: none; color: var(--chat-user-text);
        font-size: 22px; cursor: pointer; line-height: 1;
      }
      #encore-chat-messages {
        flex: 1; overflow-y: auto;
        padding: 16px;
        display: flex; flex-direction: column; gap: 10px;
        max-height: 340px;
        scrollbar-width: thin;
      }
      .encore-msg {
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 13.5px;
        line-height: 1.5;
        max-width: 85%;
        word-wrap: break-word;
        animation: encore-fade-in 0.3s ease;
      }
      .encore-bot {
        background: var(--chat-bubble-bot);
        color: var(--chat-text);
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      .encore-user {
        background: var(--chat-bubble-user);
        color: var(--chat-user-text);
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
      .encore-typing {
        align-self: flex-start;
        background: var(--chat-bubble-bot);
        color: var(--chat-text);
        padding: 10px 18px;
        border-radius: 14px;
        font-size: 13.5px;
      }
      .encore-typing span {
        display: inline-block;
        width: 6px; height: 6px;
        background: var(--chat-text);
        border-radius: 50%;
        margin: 0 2px;
        animation: encore-bounce 1.4s infinite ease-in-out;
        opacity: 0.5;
      }
      .encore-typing span:nth-child(2) { animation-delay: 0.2s; }
      .encore-typing span:nth-child(3) { animation-delay: 0.4s; }
      #encore-chat-remaining {
        text-align: center;
        font-size: 11px;
        color: var(--chat-text);
        opacity: 0.5;
        padding: 4px;
      }
      #encore-chat-form {
        display: flex;
        padding: 10px;
        gap: 8px;
        border-top: 1px solid rgba(255,255,255,0.1);
      }
      #encore-chat-input {
        flex: 1;
        padding: 10px 14px;
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.08);
        color: var(--chat-text);
        font-size: 13.5px;
        outline: none;
        font-family: inherit;
      }
      #encore-chat-input::placeholder { color: rgba(255,255,255,0.4); }
      #encore-chat-input:focus { border-color: var(--chat-primary); }
      #encore-chat-form button[type="submit"] {
        width: 40px; height: 40px;
        border-radius: 50%;
        background: var(--chat-primary);
        color: var(--chat-user-text);
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: opacity 0.2s;
      }
      #encore-chat-form button[type="submit"]:hover { opacity: 0.85; }
      @keyframes encore-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes encore-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
      @media (max-width: 480px) {
        #encore-chat-window {
          width: calc(100vw - 32px);
          right: -8px;
          bottom: 68px;
          max-height: 70vh;
        }
      }
    `;
    document.head.appendChild(style);

    // Event handlers
    const toggle = document.getElementById('encore-chat-toggle');
    const win = document.getElementById('encore-chat-window');
    const closeBtn = document.getElementById('encore-chat-close');
    const form = document.getElementById('encore-chat-form');
    const input = document.getElementById('encore-chat-input');
    const messages = document.getElementById('encore-chat-messages');
    const remaining = document.getElementById('encore-chat-remaining');

    toggle.addEventListener('click', () => {
      win.classList.toggle('encore-chat-hidden');
      if (!win.classList.contains('encore-chat-hidden')) input.focus();
    });

    closeBtn.addEventListener('click', () => win.classList.add('encore-chat-hidden'));

    function addMessage(text, sender) {
      const div = document.createElement('div');
      div.className = `encore-msg encore-${sender}`;
      // Simple link detection for bot messages
      if (sender === 'bot') {
        div.innerHTML = text.replace(
          /(https?:\/\/[^\s<]+)/g,
          '<a href="$1" target="_blank" rel="noopener" style="color:var(--chat-primary);text-decoration:underline">$1</a>'
        );
      } else {
        div.textContent = text;
      }
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
      const div = document.createElement('div');
      div.className = 'encore-typing';
      div.id = 'encore-typing';
      div.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function hideTyping() {
      const el = document.getElementById('encore-typing');
      if (el) el.remove();
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      if (remainingQuestions() <= 0) {
        addMessage('You\'ve reached today\'s question limit. Please call us at 703-222-5511 or email encoreperformers@gmail.com for help!', 'bot');
        return;
      }

      addMessage(text, 'user');
      input.value = '';
      showTyping();

      let answer;
      try {
        answer = await askGemini(text);
      } catch {
        answer = fallbackAnswer(text);
      }

      hideTyping();
      addMessage(answer, 'bot');
      const count = incrementUsage();
      remaining.textContent = `${Math.max(0, DAILY_LIMIT - count)} questions remaining today`;
    });
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
