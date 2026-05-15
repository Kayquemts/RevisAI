import Sidebar from "./Sidebar";

export default function Layout({ children, savedCardsCount }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar savedCardsCount={savedCardsCount} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border h-14 px-4 flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <span className="text-gray-700 font-semibold text-base">RevisAI</span>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
