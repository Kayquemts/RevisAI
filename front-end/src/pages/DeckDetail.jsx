import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useFlashcards } from "../contexts/FlashcardContext";
import Layout from "../components/Layout";

function Flashcard({ card, onEdit }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  useEffect(() => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationY: isFlipped ? 180 : 0,
        duration: 0.6,
        ease: "back.out(1.2)",
      });
    }
  }, [isFlipped]);

  return (
    <div className="relative group">
      {/* Edit Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(card); }}
        className="absolute top-4 left-4 z-10 h-8 w-8 bg-card/80 backdrop-blur-sm border border-border rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-card hover:shadow-lg text-muted-foreground hover:text-primary"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      <div 
        className="perspective-1000 w-full h-64 cursor-pointer"
        onClick={handleFlip}
      >
        <div 
          ref={cardRef}
          className="relative w-full h-full transition-transform duration-500 preserve-3d rounded-lg"
        >
          {/* Front Face (Question) */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm absolute inset-0 p-6 flex flex-col items-center justify-center text-center backface-hidden">
            <div className="inline-flex items-center rounded-full border border-gray-100 px-2.5 py-0.5 font-semibold text-gray-400 absolute top-3 right-3 text-[10px] uppercase tracking-wider">
              Pergunta
            </div>
            <p className="text-sm font-semibold text-gray-800">{card.question}</p>
            <p className="text-xs text-muted-foreground mt-3">Clique para virar</p>
          </div>

          {/* Back Face (Answer) */}
          <div className="rounded-lg border bg-primary/5 border-primary/20 text-card-foreground shadow-sm absolute inset-0 p-6 flex flex-col items-center justify-center text-center rotate-y-180 backface-hidden">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-semibold text-primary absolute top-3 right-3 text-[10px] uppercase tracking-wider">
              Resposta
            </div>
            <p className="text-sm font-medium text-gray-700 leading-relaxed">
              {card.answer}
            </p>
            <p className="text-xs text-primary/60 mt-3 font-semibold">Clique para voltar</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function DeckDetail() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { themes, updateCard } = useFlashcards();
  
  const [editingCard, setEditingCard] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const deck = themes.find(t => t.id === deckId);

  const openEdit = (card) => {
    setEditingCard(card);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
  };

  const handleSave = () => {
    if (editingCard) {
      updateCard(editingCard.id, editQuestion, editAnswer);
      setEditingCard(null);
    }
  };

  if (!deck) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h2 className="text-xl font-bold text-gray-800">Deck não encontrado</h2>
          <button onClick={() => navigate("/my-cards")} className="mt-4 text-[#2d6a4f] font-bold">Voltar para meus cards</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full animate-fade-in overflow-y-auto">
        <button 
          onClick={() => navigate("/my-cards")}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-9 rounded-md px-3 mb-4 bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Voltar
        </button>

        <h2 className="text-2xl font-bold mb-1 text-foreground">{deck.name}</h2>
        <p className="text-sm text-muted-foreground mb-6">{deck.cards.length} cards — clique para virar</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {deck.cards.map((card) => (
            <Flashcard key={card.id} card={card} onEdit={openEdit} />
          ))}
        </div>
      </div>


      {/* Basic Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingCard(null)} />
          <div className="bg-card rounded-3xl p-8 w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Editar Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Pergunta</label>
                <textarea 
                  value={editQuestion} 
                  onChange={e => setEditQuestion(e.target.value)} 
                  rows={3}
                  className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Resposta</label>
                <textarea 
                  value={editAnswer} 
                  onChange={e => setEditAnswer(e.target.value)} 
                  rows={3}
                  className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setEditingCard(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}


