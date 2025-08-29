import { Eye, TrendingUp, Users, Calendar } from "lucide-react";
import { Fund } from "@shared/schema";

interface FundCardProps {
  fund: Fund;
  onToggleBalance?: () => void;
}

export default function FundCard({ fund, onToggleBalance }: FundCardProps) {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: 'numeric'
    }).format(dateObj);
  };

  return (
    <div 
      className="w-full rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
      data-testid={`fund-card-${fund.id}`}
    >
      <div className="flex items-start mb-6">
        <div className="w-12 h-12 rounded-xl mr-4 flex items-center justify-center gradient-primary">
          <span className="text-2xl" data-testid={`fund-emoji-${fund.id}`}>
            {fund.emoji}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-1 text-dark" data-testid={`fund-name-${fund.id}`}>
            {fund.name}
          </h2>
          <p className="text-sm text-dark" data-testid={`fund-description-${fund.id}`}>
            {fund.description}
          </p>
        </div>
        <button 
          className="rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent" 
          aria-label="Mostrar/ocultar saldo"
          onClick={onToggleBalance}
          data-testid={`button-toggle-balance-${fund.id}`}
        >
          <Eye className="w-5 h-5 text-dark" />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium text-dark">Saldo</h3>
        </div>
        <div className="w-12 h-1 rounded-full mb-4 gradient-bar"></div>
        
        <div className="flex items-center gap-3">
          <h4 className="text-4xl font-bold text-dark" data-testid={`fund-balance-${fund.id}`}>
            {formatCurrency(fund.balance)}
          </h4>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full gradient-primary">
            <TrendingUp className="w-3 h-3 text-creme" />
            <span className="text-xs font-medium text-creme" data-testid={`fund-growth-${fund.id}`}>
              +{fund.growthPercentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] bg-bege-transparent">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-dark" />
            <span className="text-sm text-dark opacity-80" data-testid={`fund-members-${fund.id}`}>
              {fund.memberCount} membros
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-dark" />
            <span className="text-sm text-dark opacity-80" data-testid={`fund-date-${fund.id}`}>
              {formatDate(fund.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
