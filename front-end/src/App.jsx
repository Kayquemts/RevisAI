import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import GerarFlashcards from "./pages/GerarFlashcards";
import MyCards from "./pages/MyCards";
import DeckDetail from "./pages/DeckDetail";
import Weeks from "./pages/Weeks";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<GerarFlashcards />} />
      <Route path="/weeks" element={<Weeks />} />

      <Route path="/my-cards" element={<MyCards />} />
      <Route path="/my-cards/:deckId" element={<DeckDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}