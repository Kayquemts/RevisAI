import { useState, useRef, useEffect } from "react";
import { useFlashcards } from "../contexts/FlashcardContext";
import Layout from "../components/Layout";
import {
  Send,
  Bot,
  Save,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Zap
} from "lucide-react";
import botIcon from "../assets/assistente-de-robo.svg";

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
        id: Math.random().toString(36).substr(2, 9),
        question: questionMatch[1].trim(),
        answer: answerMatch[1].trim()
      });
    }
  });

  return flashcards;
};

export default function GerarFlashcards() {
  const { themes, addGeneratedCards, removeCard } = useFlashcards();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const bottomRef = useRef(null);
  const chatRef = useRef(null);
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

    setTimeout(() => {
      const rawMarkdown = mockAIResponse(text);
      const cards = parseFlashcards(rawMarkdown);

      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: `Gerei 3 flashcards sobre "${text}":`,
          flashcards: cards,
          topic: text
        },
      ]);
    }, 1800);
  };

  const handleSaveAll = (topic, cards) => {
    addGeneratedCards(topic, cards);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const totalSavedCards = themes.reduce((acc, t) => acc + t.cards.length, 0);

  return (
    <Layout savedCardsCount={totalSavedCards}>
      {/* ── Pop-up Notification (Toast) ── */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[100] animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl flex items-center gap-3 min-w-[240px]">
            <div>
              <p className="text-gray-800 font-bold text-sm">Sucesso!</p>
              <p className="text-gray-500 text-xs font-medium">Cards adicionados à sua coleção</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-auto text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container from Snippet */}
      <div className="max-w-3xl mx-auto animate-fade-in flex flex-col flex-1 min-h-0">
        
        {/* Header from Snippet */}
        <div className="flex items-center gap-3 mb-4">
          <img src={botIcon} alt="Bot Icon" className="w-12 h-12" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Gerar Flashcards</h2>
            <p className="text-sm text-muted-foreground">Converse com o RevisAI para criar seus cards</p>
          </div>
        </div>

        {/* Chat container from Snippet */}
        <div 
          ref={chatRef}
          className="rounded-lg border bg-card text-card-foreground shadow flex-1 overflow-auto p-4 mb-4 space-y-4 custom-scrollbar"
        >
          {messages.map((msg) => (
            <div key={msg.id} className="w-full">
              {/* Message Bubble */}
              <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap animate-fade-in
                    ${msg.from === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                    }`}
                >
                  {msg.text}
                </div>
              </div>

              {/* Render Flashcards if they exist */}
              {msg.flashcards && (
                <div className="mt-4 ml-2 space-y-3">
                  {msg.flashcards.map((card, i) => {
                    const savedCard = themes.flatMap(t => t.cards).find(c => c.id === card.id || c.question === card.question);
                    const isSaved = !!savedCard;
                    
                    const handleToggle = () => {
                      if (isSaved) {
                        removeCard(savedCard.id);
                      } else {
                        handleSaveAll(msg.topic, [card]);
                      }
                    };

                    return (
                      <div 
                        key={card.id || i}
                        onClick={handleToggle}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group relative animate-fade-in
                          ${isSaved 
                            ? "bg-[#d8e3db]/50 border-primary/20" 
                            : "bg-card border-border hover:border-primary/20"
                          }`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {isSaved && (
                          <div className="absolute top-3 right-3 text-primary">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <p className={`text-sm font-semibold mb-1 flex items-center gap-2 ${isSaved ? "text-primary" : "text-gray-800"}`}>
                          <Zap className={`w-3.5 h-3.5 ${isSaved ? "fill-primary" : "text-gray-400"}`} />
                          Card {i + 1}: {card.question}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">{card.answer}</p>
                      </div>
                    );
                  })}
                  
                  {!themes.some(t => t.cards.some(sc => sc.theme === msg.topic)) && (
                    <button 
                      onClick={() => handleSaveAll(msg.topic, msg.flashcards)}
                      className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95 animate-fade-in"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar Cards
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 text-sm flex items-center gap-1.5 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-primary/40 rounded-full inline-block animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area from Snippet */}
        <div className="flex gap-2 pb-4">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Informe o tema e conteúdo..."
            className="flex-1 border rounded-xl px-4 py-3 text-sm bg-card focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className={`inline-flex items-center justify-center gap-2 rounded-xl h-12 w-12 transition-all active:scale-95
              ${input.trim() && !typing
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </Layout>
  );
}
