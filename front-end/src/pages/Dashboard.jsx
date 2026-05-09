import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Perfil",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: "Semanas",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Meus Cards",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="2" y="6" width="20" height="14" rx="2" /><path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      </svg>
    ),
  },
  {
    label: "Gerar",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="9" cy="9" r="1.2" fill="currentColor" />
        <circle cx="15" cy="9" r="1.2" fill="currentColor" />
        <path d="M8 15s1.5 2 4 2 4-2 4-2" />
      </svg>
    ),
  },
];

const INITIAL_MESSAGE = {
  id: 1,
  from: "bot",
  text: "Olá! 👋 Sou o RevisAI, seu assistente de estudos. Informe o tema que deseja estudar e eu vou gerar flashcards personalizados para você!",
};

// ── Mock AI Response Generator ──
const mockAIResponse = (topic) => {
  return `---

## Flashcard 1

*Pergunta:* O que é ${topic}?

*Resposta:* ${topic} é um conceito fundamental que envolve o entendimento teórico e prático do assunto, abrangendo definições, princípios e aplicações.

---

## Flashcard 2

*Pergunta:* Quais são os principais conceitos de ${topic}?

*Resposta:* Os principais conceitos incluem fundamentos teóricos, aplicações práticas, metodologias de análise e frameworks de referência utilizados na área.

---

## Flashcard 3

*Pergunta:* Como aplicar ${topic} em situações práticas?

*Resposta:* A aplicação prática envolve identificar o contexto, selecionar a abordagem adequada, executar com base nos princípios aprendidos e avaliar os resultados obtidos.

---`;
};

// ── Markdown Parser for Flashcards ──
const parseFlashcards = (markdown) => {
  const flashcards = [];
  const sections = markdown.split(/---/).filter(s => s.trim() !== "");

  sections.forEach(section => {
    const questionMatch = section.match(/\*Pergunta:\*\s*(.*)/);
    const answerMatch = section.match(/\*Resposta:\*\s*(.*)/);

    if (questionMatch && answerMatch) {
      flashcards.push({
        question: questionMatch[1].trim(),
        answer: answerMatch[1].trim()
      });
    }
  });

  return flashcards;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [active, setActive] = useState("Gerar");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [savedCards, setSavedCards] = useState([]); // Estado para armazenar cards salvos
  const [showToast, setShowToast] = useState(false); // Estado para o popup

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Mock bot response logic
    setTimeout(() => {
      const rawMarkdown = mockAIResponse(text);
      const cards = parseFlashcards(rawMarkdown).map(card => ({
        ...card,
        id: Math.random().toString(36).substr(2, 9) // Gerar ID único para o card
      }));

      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: `Gerei 3 flashcards sobre "${text}":`,
          flashcards: cards,
        },
      ]);
    }, 1800);
  };

  const toggleSaveCard = (card) => {
    const wasSaved = savedCards.find((c) => c.id === card.id);

    setSavedCards((prev) => {
      if (wasSaved) {
        return prev.filter((c) => c.id !== card.id);
      } else {
        return [...prev, card];
      }
    });

    if (!wasSaved) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5ec] overflow-hidden relative">

      {/* ── Pop-up Notification (Toast) ── */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-2xl flex items-center gap-3 min-w-[240px]">
            <div>
              <p className="text-gray-800 font-bold text-sm">Sucesso!</p>
              <p className="text-gray-500 text-xs">Salvo em meus cards</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-auto text-gray-300 hover:text-gray-500 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-[#2d6a4f] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex flex-col items-center py-7 border-b border-white/10">
          <div className="text-4xl mb-2">🤖</div>
          <span className="text-white font-extrabold text-sm tracking-widest">REVISAI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${active === item.label
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
            >
              {item.icon}
              {item.label}
              {item.label === "Meus Cards" && savedCards.length > 0 && (
                <span className="ml-auto bg-white text-[#2d6a4f] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {savedCards.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User avatar bottom */}
        <div className="px-4 py-5 border-t border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <div>
            <p className="text-white text-xs font-semibold">Usuário</p>
            <p className="text-white/40 text-[11px]">Plano grátis</p>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-[#f5f5ec] border-b border-gray-200 px-6 py-4 flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <span className="text-gray-700 font-semibold text-base">RevisAI</span>
        </header>

        {/* Page header */}
        <div className="px-8 pt-7 pb-5 flex items-center gap-4">
          <div className="text-3xl">🤖</div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">Gerar Flashcards</h1>
            <p className="text-sm text-gray-400">Converse com o RevisAI para criar seus cards</p>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm mb-2
                  ${msg.from === "user"
                    ? "bg-[#2d6a4f] text-white rounded-br-sm"
                    : "bg-[#ecece1] text-gray-700 rounded-bl-sm"
                  }`}
              >
                {msg.text}
              </div>

              {/* Render Flashcards if they exist in the message */}
              {msg.flashcards && (
                <div className="w-full max-w-[85%] space-y-3">
                  {msg.flashcards.map((card, index) => {
                    const isSaved = savedCards.find((c) => c.id === card.id);
                    return (
                      <div
                        key={card.id || index}
                        onClick={() => toggleSaveCard(card)}
                        className={`cursor-pointer border transition-all duration-200 rounded-2xl p-5 shadow-sm hover:shadow-md relative group
                          ${isSaved
                            ? "bg-[#d8e3db] border-[#2d6a4f] ring-2 ring-[#2d6a4f]/10"
                            : "bg-[#ecece1] border-gray-100 hover:border-[#2d6a4f]/30"
                          }`}
                      >
                        {isSaved && (
                          <div className="absolute top-4 right-4 text-[#2d6a4f]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-5 h-5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                        <h3 className={`font-bold mb-2 flex items-center gap-2 transition-colors ${isSaved ? "text-[#2d6a4f]" : "text-gray-800"}`}>
                          📝 Card {index + 1}: {card.question}
                        </h3>
                        <p className={`text-sm leading-relaxed transition-colors ${isSaved ? "text-gray-700" : "text-gray-500"}`}>
                          {card.answer}
                        </p>


                      </div>
                    );
                  })}

                  <button
                    onClick={() => {
                      // Salvar todos que ainda não foram salvos
                      const newCards = msg.flashcards.filter(c => !savedCards.find(sc => sc.id === c.id));
                      setSavedCards(prev => [...prev, ...newCards]);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    Salvar Todos
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-5 py-3.5 shadow-sm flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-[#2d6a4f] rounded-full inline-block animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-6 py-4 bg-[#f5f5ec] border-t border-gray-200 flex items-center gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Informe o tema e conteúdo..."
            className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
              ${input.trim() && !typing
                ? "bg-[#b7d5c4] hover:bg-[#a6c8b5] shadow-md active:scale-95"
                : "bg-[#b7d5c4]/60 cursor-not-allowed"
              }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-5 h-5 translate-x-0.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}