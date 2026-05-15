import { useNavigate } from "react-router-dom";
import { useFlashcards } from "../contexts/FlashcardContext";
import Layout from "../components/Layout";

export default function MyCards() {
  const navigate = useNavigate();
  const { themes } = useFlashcards();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-fade-in w-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-1 text-foreground">Meus Cards</h2>
        <p className="text-sm text-muted-foreground mb-6">{themes.length} temas disponíveis</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {themes.map(theme => (
            <div
              key={theme.id}
              className="bg-card p-5 cursor-pointer border border-l-4 border-l-primary rounded-[var(--radius)] shadow-sm card-hover text-card-foreground"
              onClick={() => navigate(`/my-cards/${theme.id}`)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-primary">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{theme.name}</h3>
                  <p className="text-xs text-muted-foreground">{theme.cards.length} cards</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3 line-clamp-1 leading-relaxed">
                {theme.description}
              </p>

              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-bold text-foreground">{theme.progress}%</span>
              </div>

              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${theme.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
