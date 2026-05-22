import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-[#f5f5ec] border-b border-gray-200">
      <Link to="/" className="flex items-center gap-2 font-bold text-gray-800 text-lg">
        🤖 REVISAI
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
          Entrar
        </Link>
        <Link
          to="/login"
          className="bg-[#2d6a4f] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#1b4332] transition"
        >
          Começar grátis
        </Link>
      </div>
    </nav>
  );
}