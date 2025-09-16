import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Bell, Eye, Menu, TrendingUp, Wallet, CreditCard, Plus, User } from "lucide-react";
import { Fund } from "@shared/schema";
import FundCard from "@/components/fund-card";
import BottomNavigation from "@/components/bottom-navigation";

export default function Home() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [, setLocation] = useLocation();

  const { data: funds = [], isLoading } = useQuery<Fund[]>({
    queryKey: ['/api/funds'],
  });

  // Hook para buscar dados dos fundos (saldo e número de membros)
  const { data: fundSummaries } = useQuery({
    queryKey: ['/api/funds/summaries'],
    queryFn: async () => {
      if (funds.length === 0) return { summaries: [] };

      const fundIds = funds.map(fund => fund.id).join(',');
      const response = await fetch(`/api/funds/summaries?fundIds=${fundIds}`);
      if (!response.ok) throw new Error('Failed to fetch fund summaries');
      return response.json();
    },
    enabled: funds.length > 0,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Hook para buscar dados do usuário logado
  const { data: currentUser } = useQuery({
    queryKey: ['/api/accounts/8a1d8a0f-04c4-405d-beeb-7aa75690b32e'],
    enabled: true,
  });

  // Hook para buscar saldo da conta do usuário (usando ID do usuário que existe no Supabase)
  const { data: accountBalance } = useQuery<{ balanceInFunds: number; freeBalance: number; totalBalance: number }>({
    queryKey: ['/api/accounts/8a1d8a0f-04c4-405d-beeb-7aa75690b32e/balance'],
    enabled: true,
  });

  // Hook para buscar saldo total em fundos calculado corretamente
  const { data: balanceInFunds } = useQuery({
    queryKey: ['/api/accounts/8a1d8a0f-04c4-405d-beeb-7aa75690b32e/balance-in-funds'],
    enabled: true,
  });

  const calculateTotalBalance = () => {
    return balanceInFunds?.totalBalanceInFunds || 0;
  };

  const calculateAverageGrowth = () => {
    // Por enquanto, retorna um valor fixo até implementarmos cálculo de crescimento real
    return "12.5";
  };

  // Criar mapa de dados dos fundos para fácil acesso
  const fundDataMap = new Map();
  if (fundSummaries?.summaries) {
    fundSummaries.summaries.forEach((summary: { fundId: string; memberCount: number; currentBalance: number }) => {
      fundDataMap.set(summary.fundId, {
        balance: summary.currentBalance,
        memberCount: summary.memberCount
      });
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme">
      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradiente Base */}
        <div className="absolute inset-0 gradient-base" />

        {/* Gradiente Invertido - Diagonal Oposta */}
        <div className="absolute inset-0 opacity-70 gradient-overlay-1" />

        {/* Gradiente Radial do Centro */}
        <div className="absolute inset-0 opacity-60 gradient-overlay-2" />

        {/* Gradiente Horizontal Invertido */}
        <div className="absolute inset-0 opacity-50 gradient-overlay-3" />

        {/* Gradiente Vertical */}
        <div className="absolute inset-0 opacity-40 gradient-overlay-4" />

        {/* Gradiente Radial Superior Esquerdo */}
        <div className="absolute inset-0 opacity-45 gradient-overlay-5" />

        {/* Gradiente Radial Inferior Direito */}
        <div className="absolute inset-0 opacity-35 gradient-overlay-6" />

        {/* Gradiente Diagonal 45 graus */}
        <div className="absolute inset-0 opacity-30 gradient-overlay-7" />

        {/* Gradiente Cônico */}
        <div className="absolute inset-0 opacity-25 gradient-overlay-8" />

        {/* Camada para suavizar o centro */}
        <div className="absolute inset-0 gradient-center-soften" />

        {/* Camada de mistura para suavizar */}
        <div className="absolute inset-0 gradient-blend-overlay" />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex justify-between items-center p-4 pt-12">
            <button 
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Menu"
              data-testid="button-menu"
            >
              <Menu className="w-6 h-6 text-creme" />
            </button>
            <button 
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Notificações"
              data-testid="button-notifications"
            >
              <Bell className="w-6 h-6 text-creme" />
            </button>
          </div>

          {/* Welcome Section */}
          <div className="px-4 mb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme" data-testid="text-greeting">
              Olá, {currentUser?.fullName || currentUser?.full_name || 'Usuário'}!
            </h1>
            <p className="text-lg text-creme">Bem vindo ao ColetivoBank</p>
          </div>

          {/* Balance Card - Dentro do Header */}
          <div className="mx-4 pb-8">
            <div className="backdrop-blur-custom rounded-3xl p-6 border bg-creme border-dark-light">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-medium text-dark">Saldo livre</h2>
                  </div>
                  <div className="w-12 h-1 rounded-full gradient-bar"></div>
                </div>
                <button 
                  className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                  aria-label="Mostrar/ocultar saldo"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  data-testid="button-toggle-main-balance"
                >
                  <Eye className="w-5 h-5 text-dark" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-4xl font-bold mb-1 text-dark" data-testid="text-free-balance">
                  {balanceVisible ? formatCurrency(accountBalance?.freeBalance || 0) : "••••••"}
                </h3>
                <p className="text-sm text-dark">Saldo livre disponível</p>
              </div>

              {/* Applied Balance Card */}
              <div className="rounded-2xl p-4 mb-6 transition-all duration-200 hover:scale-[1.01] bg-bege-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-2 bg-bege-transparent">
                      <TrendingUp className="w-5 h-5 text-dark" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-dark" data-testid="text-total-funds">
                        {balanceVisible ? formatCurrency(calculateTotalBalance()) : "••••••"}
                      </h4>
                      <p className="text-sm text-dark">SALDO EM FUNDOS</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full gradient-primary">
                    <TrendingUp className="w-3 h-3 text-creme" />
                    <span className="text-xs font-medium text-creme" data-testid="text-total-growth">
                      +{calculateAverageGrowth()}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Cards */}
              <div className="flex gap-4">
                <button className="rounded-2xl p-4 flex-1 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] bg-bege-transparent" data-testid="button-view-funds">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-2 bg-bege-transparent">
                      <Wallet className="w-5 h-5 text-dark" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-2xl font-bold text-dark" data-testid="text-fund-count">
                        {funds.length}
                      </h4>
                      <p className="text-xs text-dark">FUNDOS</p>
                    </div>
                  </div>
                </button>

                <button className="rounded-2xl p-4 flex-1 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] bg-bege-transparent" data-testid="button-view-pending">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-2 bg-bege-transparent">
                      <CreditCard className="w-5 h-5 text-dark" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-2xl font-bold text-dark" data-testid="text-pending-count">
                        2
                      </h4>
                      <p className="text-xs text-dark">À RETRIBUIR</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-6 pb-24 bg-creme">
        <div className="px-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-dark">Fundos coletivo</h2>
              <div className="w-16 h-1 rounded-full gradient-bar"></div>
            </div>
            <button 
              onClick={() => setLocation('/create-fund/name')}
              className="text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95 gradient-primary text-creme"
              data-testid="button-new-fund"
            >
              <Plus className="w-4 h-4 text-creme" />
              Novo fundo
            </button>
          </div>

          {/* Fund Cards */}
          <div className="space-y-6" data-testid="funds-list">
            {funds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-dark mb-4">Nenhum fundo encontrado</p>
                <p className="text-sm text-dark opacity-60">Crie seu primeiro fundo coletivo!</p>
              </div>
            ) : (
              funds.map((fund) => {
                const fundData = fundDataMap.get(fund.id) || { balance: 0, memberCount: 0 };
                return (
                  <FundCard 
                    key={fund.id} 
                    fund={fund}
                    balance={fundData.balance}
                    memberCount={fundData.memberCount}
                    onToggleBalance={() => {
                      // Implement individual fund balance toggle
                      console.log(`Toggle balance for fund ${fund.id}`);
                    }}
                    onClick={() => setLocation(`/fund/${fund.id}`)}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        onNavigateHome={() => setLocation('/')}
        onOpenContribution={() => {
          // Salvar a página atual antes de navegar
          sessionStorage.setItem('lastPath', '/');
          setLocation('/contribute/select-fund');
        }}
        onOpenProfile={() => setLocation('/account')}
      />
    </div>
  );
}