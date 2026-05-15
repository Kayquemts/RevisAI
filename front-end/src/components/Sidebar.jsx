import { useNavigate, useLocation } from "react-router-dom";
import robotIcon from "../assets/assistente-de-robo.svg";

const navItems = [
  {
    label: "Perfil",
    path: "/profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    label: "Semanas",
    path: "/weeks",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: "Meus Cards",
    path: "/my-cards",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="2" y="6" width="20" height="14" rx="2" /><path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      </svg>
    ),
  },
  {
    label: "Gerar",
    path: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="9" cy="9" r="1.2" fill="currentColor" />
        <circle cx="15" cy="9" r="1.2" fill="currentColor" />
        <path d="M8 15s1.5 2 4 2 4-2 4-2" />
      </svg>
    ),
  },
  {
    label: "Revisão Prioritária",
    path: "/priority-review",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="6" />
      </svg>
    ),
  },
];

export default function Sidebar({ savedCardsCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar-background flex flex-col flex-shrink-0">
      {/* Logo */}
      <div 
        className="flex flex-col items-center py-7 border-b border-white/10 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src={robotIcon} alt="RevisAI Logo" className="w-12 h-12 mb-2" />
        <span className="text-white font-extrabold text-sm tracking-widest">REVISAI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/dashboard");
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
            >
              {item.icon}
              {item.label}
              {item.label === "Meus Cards" && savedCardsCount > 0 && (
                <span className="ml-auto bg-white text-sidebar-background text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {savedCardsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User avatar bottom */}
      <div className="px-4 py-5 border-t border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
          U
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Usuário</p>
          <p className="text-white/40 text-[11px]">Plano grátis</p>
        </div>
      </div>
    </aside>
  );
}
