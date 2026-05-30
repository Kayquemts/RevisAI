import Layout from "../components/Layout";
import { BookOpen, RotateCcw, Pencil } from "lucide-react";
import { useFlashcards } from "../contexts/FlashcardContext";
import { useState } from "react";

export default function Weeks() {
  const { themes } = useFlashcards();
  const totalSavedCards = themes ? themes.reduce((acc, t) => acc + t.cards.length, 0) : 0;

  const [topics, setTopics] = useState({});
  const [editingDay, setEditingDay] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEditClick = (day) => {
    setEditingDay(day);
    setEditValue(topics[day] || "");
  };

  const handleSave = (day) => {
    setTopics(prev => ({ ...prev, [day]: editValue }));
    setEditingDay(null);
  };

  const handleKeyDown = (e, day) => {
    if (e.key === "Enter") {
      handleSave(day);
    }
    if (e.key === "Escape") {
      setEditingDay(null);
    }
  };

  const definedTopicsCount = Object.values(topics).filter(t => t.trim() !== "").length;

  const weekdays = ["SEG", "TER", "QUA", "QUI", "SEX"];
  const weekend = ["SAB", "DOM"];

  return (
    <Layout savedCardsCount={totalSavedCards}>
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">Semanas de Estudo</h2>
          <p className="text-muted-foreground mb-6">Planeje seus estudos e revisões semanais</p>
          
          <div className="flex gap-3 mb-8">
            <button className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all bg-primary text-primary-foreground shadow-md">Semana 1</button>
            <button className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all bg-card text-foreground border hover:bg-muted">Semana 2</button>
            <button className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all bg-card text-foreground border hover:bg-muted">Semana 3</button>
            <button className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all bg-card text-foreground border hover:bg-muted">Semana 4</button>
          </div>
          
          <div className="grid grid-cols-7 gap-3 mb-8">
            {weekdays.map(day => {
              const hasTopic = !!topics[day] && topics[day].trim() !== "";
              
              return (
                <div key={day} className="text-center">
                  <p className="text-xs font-bold text-muted-foreground mb-2">{day}</p>
                  <div 
                    className="rounded-lg border text-card-foreground shadow-sm p-3 min-h-[120px] flex flex-col items-center justify-center gap-2 transition-all bg-card card-hover cursor-pointer group"
                    onClick={() => { if (editingDay !== day) handleEditClick(day); }}
                  >
                    <BookOpen className={`h-5 w-5 transition-colors ${hasTopic ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary/70"}`} />
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(day);
                            }}
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
            
            {weekend.map(day => (
              <div key={day} className="text-center">
                <p className="text-xs font-bold text-muted-foreground mb-2">{day}</p>
                <div className="rounded-lg text-card-foreground shadow-sm p-3 min-h-[120px] flex flex-col items-center justify-center gap-2 transition-all border-accent border-2 bg-accent/10 cursor-pointer hover:bg-accent/20 hover:shadow-md">
                  <RotateCcw className="h-6 w-6 text-accent" />
                  <span className="text-xs font-medium text-center leading-tight">Revisão</span>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-[10px] border-accent text-accent">
                    Revisão
                  </div>
                </div>
              </div>
            ))}
          </div>
          
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
              <p className="text-2xl font-bold text-accent">0</p>
              <p className="text-xs text-muted-foreground">clique no sábado ou domingo para revisar</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
