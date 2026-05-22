
import type { GenerateFlashcardsPayload, GenerateFlashcardsResponse } from "../types/flashcard.types";

const API_BASE_URL = "http://localhost:5000";

// Erros customizados para facilitar o tratamento por camada
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor() {
    super("Falha de conexão. Verifique sua internet e tente novamente.");
    this.name = "NetworkError";
  }
}

/**
 * Gera flashcards a partir de um conteúdo textual.
 * Lança ApiError para respostas HTTP com erro, ou NetworkError para falhas de rede.
 */
export async function generateFlashcards(
  payload: GenerateFlashcardsPayload
): Promise<GenerateFlashcardsResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/generate-flashcards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorBody?.message ?? `Erro ${response.status}: ${response.statusText}`
    );
  }

  return response.json() as Promise<GenerateFlashcardsResponse>;
}