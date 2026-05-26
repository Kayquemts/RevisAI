import { useState, useRef, useEffect } from "react";
import { useFlashcards } from "../contexts/FlashcardContext";
import Layout from "../components/Layout";
import {
  Send,
  Save,
  Check,
  X,
  Sparkles,
  Zap,
  Paperclip,
  FileText,
  BookOpen
} from "lucide-react";
import botIcon from "../assets/assistente-de-robo.svg";
import { useFlashcards as useFlashcardsApi } from "../hooks/useFlashcards";
import { marked } from "marked";

const MODES = [
  { id: "auto", label: "Automático", icon: <Sparkles className="w-4 h-4" /> },
  { id: "flashcards", label: "Flashcards", icon: <Zap className="w-4 h-4" /> },
  { id: "summary", label: "Resumo", icon: <FileText className="w-4 h-4" /> },
  { id: "glossary", label: "Glossário", icon: <BookOpen className="w-4 h-4" /> },
];

const WELCOME_MESSAGES = {
  auto: "Olá! 👋 Sou o RevisAI. Envie um tema, texto ou PDF e eu escolho o melhor artefato de estudo para você!",
  flashcards: "Modo Flashcards ativado! 📇 Envie o conteúdo e vou gerar cartões de pergunta e resposta.",
  summary: "Modo Resumo ativado! 📝 Envie o conteúdo e vou gerar um resumo estruturado.",
  glossary: "Modo Glossário ativado! 📚 Envie o conteúdo e vou identificar e definir os termos-chave.",
};

const makeInitialMessage = (mode) => ({
  id: 1,
  from: "bot",
  text: WELCOME_MESSAGES[mode] ?? WELCOME_MESSAGES.auto,
});

export default function GerarFlashcards() {
  const { themes, addGeneratedCards, removeCard, addResumo, addDicionario, resumos, dicionarios } = useFlashcards();
  const { generate, artifact, artifact_type, router_decision, status: apiStatus, errorMessage } = useFlashcardsApi();

  const [activeMode, setActiveMode] = useState("auto");
  const [messages, setMessages] = useState([makeInitialMessage("auto")]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [typing, setTyping] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);

  const fileInputRef = useRef(null);
  const modeMenuRef = useRef(null);
  const bottomRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  const handleModeChange = (modeId) => {
    setActiveMode(modeId);
    setShowModeMenu(false);
  };

  useEffect(() => {
    if (!showModeMenu) return;
    const handleClickOutside = (e) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) {
        setShowModeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModeMenu]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && !selectedFile) return;

    const userMsgText = selectedFile
      ? text ? `${text} (Anexo: ${selectedFile.name})` : `[Anexo: ${selectedFile.name}]`
      : text;
    const topicName = text || selectedFile?.name || "Novo Tema";

    const userMsg = { id: Date.now(), from: "user", text: userMsgText, topic: topicName };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const fileToUpload = selectedFile;
    setSelectedFile(null);
    setTyping(true);

    try {
      await generate({ content: text, file: fileToUpload, mode: activeMode });
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error);
      setTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        from: "bot",
        text: "Ocorreu um erro ao processar o conteúdo. Tente novamente.",
      }]);
    }
  };

  useEffect(() => {
    if (apiStatus !== "success") return;
    setTyping(false);

    const lastUserMessage = [...messages].reverse().find(m => m.from === "user");
    const topic = lastUserMessage?.topic ?? "Novo Tema";

    if (artifact_type === "unknown") {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        from: "bot",
        text: artifact ? String(artifact) : "Ocorreu um erro ao processar o conteúdo. Tente novamente.",
      }]);
      return;
    }

    if (!artifact) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        from: "bot",
        text: "Ocorreu um erro ao processar o conteúdo. Tente novamente.",
      }]);
      return;
    }

    if (artifact_type === "flashcards") {
      if (Array.isArray(artifact) && artifact.length > 0) {
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          from: "bot",
          text: `Gerei ${artifact.length} flashcards sobre "${topic}":`,
          flashcards: artifact,
          topic,
          routerDecision: router_decision,
        }]);
      } else {
        setMessages((prev) => [...prev, {
          id: Date.now() + 1,
          from: "bot",
          text: "Não consegui gerar os flashcards corretamente. Tente novamente com um conteúdo mais detalhado.",
        }]);
      }
      return;
    }

    const parsedHtml = marked.parse(String(artifact));
    const type =
      artifact_type === "summary" ? "resumo" :
        artifact_type === "glossary" ? "glossario" :
          null;

    if (!type) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        from: "bot",
        text: "Ocorreu um erro ao processar o conteúdo. Tente novamente.",
      }]);
      return;
    }

    const botText =
      type === "resumo" ? `Aqui está o resumo sobre "${topic}":` :
        `Identifiquei os termos sobre "${topic}":`;

    setMessages((prev) => [...prev, {
      id: Date.now() + 1,
      from: "bot",
      text: botText,
      type,
      html: parsedHtml,
      topic,
      routerDecision: router_decision,
    }]);
  }, [apiStatus, artifact, artifact_type, errorMessage]);

  useEffect(() => {
    if (apiStatus !== "error") return;
    setTyping(false);
    setMessages((prev) => [...prev, {
      id: Date.now() + 1,
      from: "bot",
      text: errorMessage || "Desculpe, ocorreu um erro ao gerar o conteúdo. Tente novamente.",
    }]);
  }, [apiStatus, errorMessage]);

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
      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[100] animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl flex items-center gap-3 min-w-[240px]">
            <div>
              <p className="text-gray-800 font-bold text-sm">Sucesso!</p>
              <p className="text-gray-500 text-xs font-medium">Cards adicionados à sua coleção</p>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-auto text-gray-300 hover:text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto animate-fade-in flex flex-col flex-1 min-h-0">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img src={botIcon} alt="Bot Icon" style={{ width: 48, height: 48 }} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Gerar</h2>
            <p className="text-sm text-muted-foreground">Converse com o RevisAI para criar seus artefatos de estudo</p>
          </div>
        </div>

        {/* Chat */}
        <div
          ref={chatRef}
          className="rounded-lg border bg-card text-card-foreground shadow flex-1 overflow-auto p-4 mb-4 space-y-4 custom-scrollbar"
        >
          {messages.map((msg) => (
            <div key={msg.id} className="w-full">

              {/* Bubble */}
              {msg.text && (
                <div className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap animate-fade-in
                    ${msg.from === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              )}

              {/* Router decision badge */}
              {msg.routerDecision && msg.from === "bot" && (
                <div className="flex justify-start ml-2 mt-1 mb-2 animate-fade-in">
                  <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                    router: {msg.routerDecision}
                  </span>
                </div>
              )}

              {/* Flashcards */}
              {msg.flashcards && (
                <div className="mt-4 ml-2 space-y-3">
                  {msg.flashcards.map((card, i) => {
                    const savedCard = themes.flatMap(t => t.cards).find(c => c.id === card.id || c.question === card.question);
                    const isSaved = !!savedCard;

                    const handleToggle = () => {
                      if (isSaved) removeCard(savedCard.id);
                      else handleSaveAll(msg.topic, [card]);
                    };

                    return (
                      <div
                        key={card.id || i}
                        onClick={handleToggle}
                        className={`rounded-lg border text-card-foreground shadow-sm p-3 cursor-pointer transition-all group relative animate-fade-in
                          ${isSaved
                            ? "bg-[#d8e3db]/50 border-primary/20"
                            : "bg-muted/40 border-muted hover:border-primary/20"
                          }`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {isSaved && (
                          <div className="absolute top-3 right-3 text-primary">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <p className={`text-sm font-semibold mb-1 ${isSaved ? "text-primary" : ""}`}>
                          📝 Card {i + 1}: {card.question}
                        </p>
                        <p className="text-xs text-muted-foreground">{card.answer}</p>
                      </div>
                    );
                  })}

                  {!msg.flashcards.every((card) =>
                    themes.flatMap(t => t.cards).some(c => c.id === card.id || c.question === card.question)
                  ) && (
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

              {/* Resumo */}
              {msg.type === "resumo" && (
                <div className="mt-3 ml-2 animate-fade-in">
                  <div className="rounded-lg text-card-foreground shadow-sm p-5 bg-card border">
                    <div
                      className="prose prose-sm max-w-none
                        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-foreground
                        [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-primary
                        [&_p]:text-sm [&_p]:text-foreground [&_p]:my-2
                        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_li]:text-sm [&_li]:my-1
                        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
                        [&_strong]:text-foreground [&_strong]:font-bold
                        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3"
                      dangerouslySetInnerHTML={{ __html: msg.html }}
                    />
                  </div>
                  {!resumos.some(r => r.topic === msg.topic) && (
                    <button
                      onClick={() => addResumo(msg.topic, msg.html)}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm active:scale-95 animate-fade-in"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar Resumo
                    </button>
                  )}
                </div>
              )}

              {/* Glossário */}
              {msg.type === "glossario" && (
                <div className="mt-3 ml-2 animate-fade-in">
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-0 overflow-hidden">
                    <div
                      className="prose prose-sm max-w-none
                        [&_h1]:text-base [&_h1]:font-bold [&_h1]:p-3 [&_h1]:m-0 [&_h1]:bg-muted [&_h1]:text-foreground
                        [&_h2]:text-base [&_h2]:font-bold [&_h2]:p-3 [&_h2]:m-0 [&_h2]:bg-muted [&_h2]:text-foreground
                        [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
                        [&_thead]:bg-muted
                        [&_thead_th]:text-foreground [&_thead_th]:p-2 [&_thead_th]:text-left [&_thead_th]:font-semibold
                        [&_tbody_tr:nth-child(odd)]:bg-secondary/40
                        [&_tbody_tr:nth-child(even)]:bg-card
                        [&_tbody_td]:p-2.5 [&_tbody_td]:border-t [&_tbody_td]:border-border [&_tbody_td]:text-sm"
                      dangerouslySetInnerHTML={{ __html: msg.html }}
                    />
                  </div>
                  {!dicionarios.some(d => d.topic === msg.topic) && (
                    <button
                      onClick={() => addDicionario(msg.topic, msg.html, (msg.html.match(/<tr>/g) || []).length - 1)}
                      className="mt-2 inline-flex items-center justify-center border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 gap-1.5 text-sm font-medium transition-colors animate-fade-in"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Salvar Glossário
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

        {/* Input */}
        <div ref={modeMenuRef} className="pb-4 relative">

          {/* File pill */}
          {selectedFile && (
            <div className="mb-2 flex items-center gap-2 animate-fade-in">
              <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 flex items-center gap-1.5">
                <Paperclip className="w-3 h-3" />
                {selectedFile.name}
                <button onClick={() => setSelectedFile(null)} className="ml-1 hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* Mode dropdown */}
          {showModeMenu && (
            <div className="absolute bottom-full mb-2 left-0 z-50 bg-card border border-border rounded-xl shadow-xl p-2 min-w-[180px] animate-fade-in">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 pt-1 pb-2">Modo de geração</p>
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeMode === mode.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                    }`}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 border border-border rounded-2xl bg-card px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all">
            {/* Attach */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
              }}
              accept=".pdf,.docx,.doc,.txt,.md,.html,.csv,.png,.jpeg,.jpg,.webp"
              className="hidden"
            />
            <button
              type="button"
              title="Anexar arquivo"
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-md transition-colors
                ${selectedFile
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Mode toggle */}
            <button
              type="button"
              title="Trocar modo"
              onClick={() => setShowModeMenu(v => !v)}
              className={`inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-md transition-colors
                ${showModeMenu
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
            >
              <Zap className="w-4 h-4" />
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Informe o tema, texto ou anexe um arquivo..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground px-2 py-1.5"
            />

            {/* Send */}
            <button
              onClick={sendMessage}
              disabled={(!input.trim() && !selectedFile) || typing}
              className={`inline-flex items-center justify-center rounded-xl h-9 w-9 shrink-0 transition-all active:scale-95
                ${(input.trim() || selectedFile) && !typing
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "text-muted-foreground opacity-40 cursor-not-allowed"
                }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
