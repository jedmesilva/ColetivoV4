import { Home, ArrowUp, User } from "lucide-react";

interface BottomNavigationProps {
  onNavigateHome?: () => void;
  onOpenContribution?: () => void;
  onOpenProfile?: () => void;
}

export default function BottomNavigation({ 
  onNavigateHome, 
  onOpenContribution, 
  onOpenProfile 
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div 
        className="mx-4 mb-4 rounded-3xl px-6 py-4 backdrop-blur-strong border shadow-xl border-dark-light"
        style={{ backgroundColor: 'rgba(255, 253, 250, 0.95)' }}
        data-testid="bottom-navigation"
      >
        <div className="flex items-center justify-between">
          {/* Home Button */}
          <button 
            className="rounded-2xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent" 
            aria-label="Início"
            onClick={onNavigateHome}
            data-testid="button-home"
          >
            <Home className="w-6 h-6 text-dark" />
          </button>

          {/* Contribute Button */}
          <button 
            className="px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg gradient-primary text-creme"
            onClick={onOpenContribution}
            data-testid="button-contribute"
          >
            <ArrowUp className="w-5 h-5" />
            Contribuir
          </button>

          {/* Profile Button */}
          <button 
            className="rounded-2xl p-1 transition-all duration-200 hover:scale-105 active:scale-95 gradient-primary" 
            aria-label="Perfil do usuário"
            onClick={onOpenProfile}
            data-testid="button-profile"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-creme">
              <User className="w-5 h-5 text-dark" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}