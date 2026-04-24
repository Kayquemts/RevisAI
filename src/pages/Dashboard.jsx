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

export default function Dashboard() {
  const navigate = useNavigate();

  const [active, setActive] = useState("Gerar");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
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

    // Mock bot response
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: `Ótimo! Vou gerar flashcards sobre "${text}". Aqui estão alguns cards iniciais para você começar a revisar. Deseja ajustar o nível de dificuldade?`,
        },
      ]);
    }, 1800);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f5ec] overflow-hidden">

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
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.from === "user"
                    ? "bg-[#2d6a4f] text-white rounded-br-sm"
                    : "bg-white text-gray-700 border border-gray-100 rounded-bl-sm"
                  }`}
              >
                {msg.text}
              </div>
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
                ? "bg-[#2d6a4f] hover:bg-[#1b4332] shadow-md active:scale-95"
                : "bg-[#2d6a4f]/40 cursor-not-allowed"
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