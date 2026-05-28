import { useState } from "react";
import Layout from "../components/Layout";
import { FileText, Eye, Trash2, X } from "lucide-react";
import { useFlashcards } from "../contexts/FlashcardContext";

export default function MeusResumos() {
  const { resumos, removeResumo } = useFlashcards();
  const [selectedResumo, setSelectedResumo] = useState(null);

  return (
    <Layout>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">Meus Resumos</h2>
          <p className="text-muted-foreground mb-6">Resumos gerados pelo RevisAI</p>

          {resumos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-sm">Nenhum resumo salvo ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resumos.map((resumo) => (
                <div key={resumo.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-5 card-hover border-l-4 border-l-accent">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{resumo.topic}</h3>
                      <p className="text-xs text-muted-foreground">{resumo.date}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-4 line-clamp-3 prose prose-sm" dangerouslySetInnerHTML={{ __html: resumo.html }} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedResumo(resumo)}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 flex-1 gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver resumo
                    </button>
                    <button
                      onClick={() => removeResumo(resumo.id)}
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

      {selectedResumo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex flex-col space-y-1.5">
              <h2 className="text-lg font-semibold leading-none tracking-tight">{selectedResumo.topic}</h2>
            </div>
            <div
              className="prose prose-sm max-w-none
                [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3
                [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-primary
                [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: selectedResumo.html }}
            />
            <button
              type="button"
              onClick={() => setSelectedResumo(null)}
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
