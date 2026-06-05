import Layout from "../components/Layout";
import { BookOpen, RotateCcw, Pencil, X, ArrowLeft, Play, Plus, CheckCircle2, XCircle } from "lucide-react";
import { useFlashcards } from "../contexts/FlashcardContext";
import { useState, useEffect, useRef } from "react";
import { fetchFlashcards } from "../services/flashcard.service";

// ─── Modal: Sábado / Domingo ──────────────────────────────────────────────────
function DayReviewModal({
  day,
  weekNumber,
  linkedCount,
  onClose,
  onStartReview,
  onManageCards,
}) {
  const modalRef = useRef(null);
  const dayLabel = day === "SAB" ? "Sábado" : "Domingo";

  useEffect(() => {
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 border bg-background p-6 shadow-lg rounded-lg animate-fade-in"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>

        <div className="flex items-center gap-2 mb-1">
          <RotateCcw className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {dayLabel} — Semana {weekNumber}
          </h2>
        </div>

        <p className="text-sm text-muted-foreground mt-2 mb-6">
          {linkedCount === 0
            ? "0 cards vinculados a esta semana."
            : `${linkedCount} card${linkedCount !== 1 ? "s" : ""} vinculado${linkedCount !== 1 ? "s" : ""} a esta semana.`}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onStartReview}
            disabled={linkedCount === 0}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-md px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            <Play className="h-4 w-4" />
            Iniciar Revisão ({linkedCount} cards)
          </button>

          <button
            onClick={onManageCards}
            className="inline-flex items-center justify-center gap-2 h-10 rounded-md px-4 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors w-full"
          >
            <Plus className="h-4 w-4" />
            Adicionar / Gerenciar Cards
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Gerenciar Cards ───────────────────────────────────────────────────
function ManageCardsModal({
  weekNumber,
  allCards,
  linkedCardIds,
  onBack,
  onClose,
  onToggleCard,
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 border bg-background shadow-lg rounded-lg animate-fade-in flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            Vincular Cards — Semana {weekNumber}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </button>
        </div>

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-5 py-3 border-b transition-colors shrink-0 text-left"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        {/* Cards list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {allCards.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum card disponível. Crie cards em "Meus Cards".
            </p>
          ) : (
            allCards.map((card) => {
              const isLinked = linkedCardIds.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => onToggleCard(card.id)}
                  className={`w-full text-left rounded-md border p-4 transition-colors flex items-start gap-3 ${
                    isLinked
                      ? "border-primary/40 bg-primary/5"
                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <div
                    className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isLinked ? "border-primary bg-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {isLinked && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug truncate">
                      {card.front || card.question || "Sem título"}
                    </p>
                    {card.theme && (
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {card.theme}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            {linkedCardIds.length} card{linkedCardIds.length !== 1 ? "s" : ""} selecionado
            {linkedCardIds.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Revisão ───────────────────────────────────────────────────────────
function ReviewModal({
  day,
  weekNumber,
  cards,
  onClose,
}) {
  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const currentCard = cards[currentIndex];
  const total = cards.length;

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer("");
      setFeedback(null);
      setTimeout(() => textareaRef.current?.focus(), 50);
    } else {
      setShowFinishConfirm(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      if (feedback) handleNext();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div
          ref={modalRef}
          className="relative w-full max-w-lg mx-4 border bg-background shadow-lg rounded-lg animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-lg font-semibold leading-none tracking-tight">
              Revisão — Semana {weekNumber}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground tabular-nums">
                {currentIndex + 1}/{total}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Question */}
            <div className="rounded-md border bg-muted/40 min-h-[110px] flex items-center justify-center p-5">
              <p className="text-base font-medium text-center leading-relaxed">
                {currentCard.front || currentCard.question}
              </p>
            </div>

            {/* Answer */}
            <div>
              <p className="text-sm font-medium mb-1.5">Sua resposta:</p>
              <textarea
                ref={textareaRef}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!!feedback || loading}
                placeholder="Digite sua resposta..."
                rows={3}
                className="w-full text-sm border border-input rounded-md px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`rounded-md border p-3 flex items-start gap-2 text-sm ${
                  feedback.correct
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {feedback.correct ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                )}
                <span className="leading-snug">{feedback.explanation}</span>
              </div>
            )}

            {/* Action button */}
            {!feedback ? (
              <button
                disabled={!userAnswer.trim() || loading}
                className="inline-flex items-center justify-center w-full h-10 rounded-md px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verificando..." : "Verificar Resposta"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center w-full h-10 rounded-md px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {currentIndex < total - 1 ? "Próximo Card →" : "Finalizar Revisão"}
              </button>
            )}

            {/* Score */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center">
                <p className="text-xs text-green-700 font-medium mb-1">Acertos</p>
                <p className="text-2xl font-bold text-green-600">{hits}</p>
              </div>
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center">
                <p className="text-xs text-red-700 font-medium mb-1">Erros</p>
                <p className="text-2xl font-bold text-red-600">{errors}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm finish — same pattern as MeusResumos delete confirm */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-base font-semibold mb-2">Revisão concluída!</h3>
            <p className="text-sm text-muted-foreground mb-1">
              Você acertou <span className="font-semibold text-green-600">{hits}</span> de{" "}
              <span className="font-semibold">{total}</span> cards.
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Erros: <span className="font-semibold text-red-600">{errors}</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowFinishConfirm(false);
                  setCurrentIndex(0);
                  setUserAnswer("");
                  setFeedback(null);
                  setHits(0);
                  setErrors(0);
                }}
                className="inline-flex items-center justify-center h-9 rounded-md px-4 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Revisar novamente
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center h-9 rounded-md px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Weeks() {
  const { themes } = useFlashcards();
  const totalSavedCards = themes ? themes.reduce((acc, t) => acc + t.cards.length, 0) : 0;

  const [topics, setTopics] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const [editValue, setEditValue] = useState("");

  const [allCards, setAllCards] = useState([]);
  const [weekLinks, setWeekLinks] = useState({});
  const [activeWeek, setActiveWeek] = useState(1);

  const [openDay, setOpenDay] = useState(null);
  const [modalView, setModalView] = useState("day-review");

  useEffect(() => {
    fetchFlashcards()
      .then(setAllCards)
      .catch(() => setAllCards([]));
  }, []);

  const linkKey = (day) => `${activeWeek}-${day}`;
  const getLinkedIds = (day) => weekLinks[linkKey(day)] ?? [];
  const getLinkedCards = (day) => {
    const ids = getLinkedIds(day);
    return allCards.filter((c) => ids.includes(c.id));
  };

  const toggleCard = (day, cardId) => {
    const key = linkKey(day);
    setWeekLinks((prev) => {
      const current = prev[key] ?? [];
      const updated = current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId];
      return { ...prev, [key]: updated };
    });
  };

  const handleEditClick = (day) => {
    setEditingDay(day);
    setEditValue(topics[day] || "");
  };

  const handleSave = (day) => {
    setTopics((prev) => ({ ...prev, [day]: editValue }));
    setEditingDay(null);
  };

  const handleKeyDown = (e, day) => {
    if (e.key === "Enter") handleSave(day);
    if (e.key === "Escape") setEditingDay(null);
  };

  const definedTopicsCount = Object.values(topics).filter((t) => t.trim() !== "").length;
  const totalLinkedCards = getLinkedIds("SAB").length + getLinkedIds("DOM").length;

  const weekdays = ["SEG", "TER", "QUA", "QUI", "SEX"];
  const weekend = ["SAB", "DOM"];

  const closeModal = () => {
    setOpenDay(null);
    setModalView("day-review");
  };

  return (
    <Layout savedCardsCount={totalSavedCards}>
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">Semanas de Estudo</h2>
          <p className="text-muted-foreground mb-6">Planeje seus estudos e revisões semanais</p>

          {/* Week tabs */}
          <div className="flex gap-3 mb-8">
            {[1, 2, 3, 4].map((w) => (
              <button
                key={w}
                onClick={() => setActiveWeek(w)}
                className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  activeWeek === w
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-foreground border hover:bg-muted"
                }`}
              >
                Semana {w}
              </button>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-3 mb-8">
            {weekdays.map((day) => {
              const hasTopic = !!topics[day] && topics[day].trim() !== "";
              return (
                <div key={day} className="text-center">
                  <p className="text-xs font-bold text-muted-foreground mb-2">{day}</p>
                  <div
                    className="rounded-lg border text-card-foreground shadow-sm p-3 min-h-[120px] flex flex-col items-center justify-center gap-2 transition-all bg-card card-hover cursor-pointer group"
                    onClick={() => { if (editingDay !== day) handleEditClick(day); }}
                  >
                    <BookOpen
                      className={`h-5 w-5 transition-colors ${
                        hasTopic ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary/70"
                      }`}
                    />
                    <div className="flex flex-col items-center gap-1 w-full mt-1">
                      {editingDay === day ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, day)}
                          onBlur={() => handleSave(day)}
                          className="w-full text-xs text-center border rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                          placeholder="Tema..."
                        />
                      ) : (
                        <>
                          <span className="text-xs font-medium text-center leading-tight min-h-[2rem] flex items-center justify-center w-full break-words px-1">
                            {hasTopic ? (
                              <span className="text-primary line-clamp-3">{topics[day]}</span>
                            ) : (
                              <span className="text-muted-foreground italic">Clique</span>
                            )}
                          </span>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                            onClick={(e) => { e.stopPropagation(); handleEditClick(day); }}
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {weekend.map((day) => {
              const count = getLinkedIds(day).length;
              return (
                <div key={day} className="text-center">
                  <p className="text-xs font-bold text-muted-foreground mb-2">{day}</p>
                  <div
                    onClick={() => { setOpenDay(day); setModalView("day-review"); }}
                    className="rounded-lg text-card-foreground shadow-sm p-3 min-h-[120px] flex flex-col items-center justify-center gap-2 transition-all border-accent border-2 bg-accent/10 cursor-pointer hover:bg-accent/20 hover:shadow-md"
                  >
                    <RotateCcw className="h-6 w-6 text-accent" />
                    <span className="text-xs font-medium text-center leading-tight">Revisão</span>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors text-[10px] border-accent text-accent">
                      {count > 0 ? `${count} card${count !== 1 ? "s" : ""}` : "Revisão"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border text-card-foreground shadow-sm p-5 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm">Temas da Semana</span>
              </div>
              <p className="text-2xl font-bold text-primary">{definedTopicsCount}</p>
              <p className="text-xs text-muted-foreground">dias com temas definidos</p>
            </div>

            <div className="rounded-lg border text-card-foreground shadow-sm p-5 bg-accent/5 border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                <RotateCcw className="h-5 w-5 text-accent" />
                <span className="font-bold text-sm">Cards para Revisão</span>
              </div>
              <p className="text-2xl font-bold text-accent">{totalLinkedCards}</p>
              <p className="text-xs text-muted-foreground">
                {totalLinkedCards === 0
                  ? "clique no sábado ou domingo para revisar"
                  : `vinculados à Semana ${activeWeek}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {openDay && modalView === "day-review" && (
        <DayReviewModal
          day={openDay}
          weekNumber={activeWeek}
          linkedCount={getLinkedIds(openDay).length}
          onClose={closeModal}
          onStartReview={() => setModalView("reviewing")}
          onManageCards={() => setModalView("manage-cards")}
        />
      )}

      {openDay && modalView === "manage-cards" && (
        <ManageCardsModal
          weekNumber={activeWeek}
          allCards={allCards}
          linkedCardIds={getLinkedIds(openDay)}
          onBack={() => setModalView("day-review")}
          onClose={closeModal}
          onToggleCard={(id) => toggleCard(openDay, id)}
        />
      )}

      {openDay && modalView === "reviewing" && getLinkedCards(openDay).length > 0 && (
        <ReviewModal
          day={openDay}
          weekNumber={activeWeek}
          cards={getLinkedCards(openDay)}
          onClose={closeModal}
        />
      )}
    </Layout>
  );
}