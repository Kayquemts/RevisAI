// Representa um único flashcard retornado pela API
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

// Payload enviado para a API
export interface GenerateFlashcardsPayload {
  content: string;
}

// Resposta esperada da API
export interface GenerateFlashcardsResponse {
  flashcards: Flashcard[];
}

// Estados possíveis da requisição
export type RequestStatus = "idle" | "loading" | "success" | "error";