import Sidebar from "./Sidebar";

export default function Layout({ children, savedCardsCount }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar savedCardsCount={savedCardsCount} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center border-b px-4 bg-card">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-panel-left">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M9 3v18"></path>
            </svg>
            <span className="sr-only">Toggle Sidebar</span>
          </button>
          <h1 className="text-lg font-bold text-foreground">RevisAI</h1>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
