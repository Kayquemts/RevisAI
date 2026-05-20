import { useState, useCallback } from "react";
import { generateFlashcards, ApiError, NetworkError } from "../services/flashcard.service";
import type { Flashcard, RequestStatus } from "../types/flashcard.types";

interface UseFlashcardsReturn {
  flashcards: Flashcard[];
  status: RequestStatus;
  errorMessage: string | null;
  generate: (content: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook central da feature. Gerencia o ciclo completo:
 * chamada à API → estados de loading/erro/sucesso → dados resultantes.
 * Componentes só precisam consumir este hook, sem conhecer detalhes de rede.
 */
export function useFlashcards(): UseFlashcardsReturn {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generate = useCallback(async (content: string) => {
    if (!content.trim()) {
      setErrorMessage("O conteúdo não pode estar vazio.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const data = await generateFlashcards({ content });
      setFlashcards(data.flashcards);
      setStatus("success");
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof NetworkError
          ? err.message
          : "Ocorreu um erro inesperado. Tente novamente.";

      setErrorMessage(message);
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setFlashcards([]);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  return { flashcards, status, errorMessage, generate, reset };
}