export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface GenerateFlashcardsPayload {
  content: string;
  file_base64?: string;
  file_type?: string;
  file_name?: string;
  mode?: string;
}

// Para flashcards: server.js já parseia o Markdown e envia Flashcard[]
// Para summary/glossary: artifact chega como string Markdown
export interface GenerateFlashcardsResponse {
  artifact: Flashcard[] | string;
  artifact_type: string;
  mode: string;
  model?: string;
  router_decision?: string;
}

export type RequestStatus = "idle" | "loading" | "success" | "error";
