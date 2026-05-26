import { useState } from "react";
import Layout from "../components/Layout";
import { BookOpen, Eye, Trash2, X } from "lucide-react";
import { useFlashcards } from "../contexts/FlashcardContext";

export default function MeusDicionarios() {
  const { dicionarios, removeDicionario } = useFlashcards();
  const [selectedDicionario, setSelectedDicionario] = useState(null);

  return (
    <Layout>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">Meus Dicionários</h2>
          <p className="text-muted-foreground mb-6">Glossários gerados pelo RevisAI</p>

          {dicionarios.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-sm">Nenhum dicionário salvo ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dicionarios.map((dicionario) => (
                <div key={dicionario.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-5 card-hover border-l-4 border-l-primary">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{dicionario.topic}</h3>
                      <p className="text-xs text-muted-foreground">{dicionario.date}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{(dicionario.html.match(/<tr>/g) || []).length - 1 || dicionario.termsCount || 0} termos definidos</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDicionario(dicionario)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 flex-1 gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver glossário
                    </button>
                    <button
                      onClick={() => removeDicionario(dicionario.id)}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedDicionario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex flex-col space-y-1.5">
              <h2 className="text-lg font-semibold leading-none tracking-tight">{selectedDicionario.topic}</h2>
            </div>
            <div
              className="prose prose-sm max-w-none
                [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
                [&_thead_th]:p-2 [&_thead_th]:text-left [&_thead_th]:font-semibold
                [&_tbody_td]:p-2 [&_tbody_td]:border-t [&_tbody_td]:border-border"
              dangerouslySetInnerHTML={{ __html: selectedDicionario.html }}
            />
            <button
              type="button"
              onClick={() => setSelectedDicionario(null)}
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
