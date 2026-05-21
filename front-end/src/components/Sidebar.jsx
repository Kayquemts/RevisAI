import { useNavigate, useLocation } from "react-router-dom";
import robotIcon from "../assets/assistente-de-robo.svg";
import { User, Calendar, CreditCard, Bot, Target } from "lucide-react";

const navItems = [
  {
    label: "Perfil",
    path: "/profile",
    icon: <User className="mr-2 h-5 w-5" />
  },
  {
    label: "Semanas",
    path: "/weeks",
    icon: <Calendar className="mr-2 h-5 w-5" />
  },
  {
    label: "Meus Cards",
    path: "/my-cards",
    icon: <CreditCard className="mr-2 h-5 w-5" />
  },
  {
    label: "Gerar",
    path: "/dashboard",
    icon: <Bot className="mr-2 h-5 w-5" />
  },
  {
    label: "Revisão Prioritária",
    path: "/priority-review",
    icon: <Target className="mr-2 h-5 w-5" />
  },
];

export default function Sidebar({ savedCardsCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar-background flex flex-col flex-shrink-0 text-sidebar-foreground">
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto pt-4">
        {/* Logo */}
        <div 
          className="flex justify-center mb-6 px-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={robotIcon} alt="RevisAI Logo" className="w-16 h-16 rounded-full" />
        </div>
        <p className="text-center text-sm font-bold text-sidebar-foreground mb-6 tracking-wide">REVISAI</p>

        {/* Nav */}
        <div className="relative flex w-full min-w-0 flex-col p-2">
          <div className="w-full text-sm">
            <ul className="flex w-full min-w-0 flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/dashboard");
                
                return (
                  <li key={item.label} className="relative">
                    <button
                      onClick={() => navigate(item.path)}
                      className={`flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 hover:text-sidebar-accent-foreground h-8 text-sm hover:bg-sidebar-accent/50 [&>svg]:shrink-0
                        ${isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : ""
                        }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.label === "Meus Cards" && savedCardsCount > 0 && (
                        <span className="ml-auto bg-white text-sidebar-background text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {savedCardsCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* User avatar bottom */}
      <div className="px-4 py-5 flex items-center gap-3">
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
