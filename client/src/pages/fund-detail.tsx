import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Eye, ArrowLeft, ArrowUp, ArrowDown, Users, CreditCard, Heart, Home, User, MessageCircle, ArrowUpRight } from "lucide-react";
import { Fund } from "@shared/schema";

export default function FundDetail() {
  const [, params] = useRoute("/fund/:id");
  const fundId = params?.id;
  const [, setLocation] = useLocation();
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // ID do usuário atual - hardcoded por enquanto
  const currentUserId = "8a1d8a0f-04c4-405d-beeb-7aa75690b32e";

  // Efeito de scroll para o header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
      const opacity = Math.min(scrollPosition / 100, 1);
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  // Hook para buscar saldo do fundo específico
  const { data: fundBalance } = useQuery({
    queryKey: ['/api/funds', fundId, 'balance'],
    queryFn: async () => {
      const response = await fetch(`/api/funds/${fundId}/balance`);
      if (!response.ok) throw new Error('Failed to fetch fund balance');
      return response.json();
    },
    enabled: !!fundId,
  });

  // Hook para buscar resumo do fundo (inclui número de membros)
  const { data: fundSummary } = useQuery({
    queryKey: ['/api/funds/summaries', fundId],
    queryFn: async () => {
      const response = await fetch(`/api/funds/summaries?fundIds=${fundId}`);
      if (!response.ok) throw new Error('Failed to fetch fund summary');
      const data = await response.json();
      return data.summaries && data.summaries.length > 0 ? data.summaries[0] : { memberCount: 0, currentBalance: 0 };
    },
    enabled: !!fundId,
  });

  // Hook para buscar total de contribuições do usuário atual para este fundo
  const { data: userContribution } = useQuery({
    queryKey: ['/api/funds', fundId, 'contributions/user', currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/funds/${fundId}/contributions/user/${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch user contribution total');
      return response.json();
    },
    enabled: !!fundId && !!currentUserId,
  });

  // Hook para buscar quantidade de retribuições pendentes do usuário para este fundo específico
  const { data: fundPendingRetributions } = useQuery<{ pendingCount: number }>({
    queryKey: ['/api/funds', fundId, 'pending-retributions', currentUserId],
    queryFn: async () => {
      const response = await fetch(`/api/funds/${fundId}/pending-retributions/${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch fund pending retributions');
      return response.json();
    },
    enabled: !!fundId && !!currentUserId,
  });

  // Hook para buscar resumo financeiro do fundo (para os cards de visão geral)
  const { data: financialSummary } = useQuery({
    queryKey: ['/api/funds', fundId, 'financial-summary'],
    queryFn: async () => {
      const response = await fetch(`/api/funds/${fundId}/financial-summary`);
      if (!response.ok) throw new Error('Failed to fetch financial summary');
      return response.json();
    },
    enabled: !!fundId,
  });

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffdfa' }}>
        <div className="text-xl" style={{ color: '#303030' }}>Carregando...</div>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffdfa' }}>
        <div className="text-xl" style={{ color: '#303030' }}>Fundo não encontrado</div>
      </div>
    );
  }

  // Calcular dados para os cards de visão geral
  const totalContributions = financialSummary?.totalContributions ? parseFloat(financialSummary.totalContributions) : 0;
  const totalRequests = financialSummary?.totalCapitalRequests ? parseFloat(financialSummary.totalCapitalRequests) : 0;
  const totalRetributions = financialSummary?.totalRetributions ? parseFloat(financialSummary.totalRetributions) : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdfa' }}>
      <div className="relative overflow-hidden pb-8">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' }} />
        <div className="absolute inset-0 opacity-70" style={{ background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' }} />
        <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(circle at center, #ffc22f, #fa7653, #fd6b61, transparent)' }} />
        <div className="absolute inset-0 opacity-50" style={{ background: 'linear-gradient(270deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' }} />
        <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(180deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' }} />
        <div className="absolute inset-0 opacity-45" style={{ background: 'radial-gradient(circle at top left, #ffe5bd, #ffc22f, #fa7653, transparent)' }} />
        <div className="absolute inset-0 opacity-35" style={{ background: 'radial-gradient(circle at bottom right, #fd6b61, #fa7653, #ffc22f, transparent)' }} />
        <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(45deg, #fa7653, #fd6b61, #ffc22f, #ffe5bd, #fffdfa)' }} />
        <div className="absolute inset-0 opacity-25" style={{ background: 'conic-gradient(from 0deg at center, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61, #fffdfa)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.1), rgba(255, 229, 189, 0.1), rgba(255, 194, 47, 0.1), rgba(250, 118, 83, 0.1), rgba(253, 107, 97, 0.1))', mixBlendMode: 'overlay' }} />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} />

        <div className="relative z-10">
          <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300" style={{ backgroundColor: `rgba(255, 253, 250, ${scrollOpacity})`, backdropFilter: scrollOpacity > 0 ? 'blur(10px)' : 'none' }}>
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <button 
                  className="rounded-xl py-3 transition-all duration-200 hover:scale-105 active:scale-95" 
                  aria-label="Voltar"
                  onClick={() => setLocation('/')}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-6 h-6" style={{ color: isScrolled ? '#303030' : '#fffdfa' }} />
                </button>
                <div className="transition-all duration-300 overflow-hidden" style={{ opacity: scrollOpacity, maxWidth: scrollOpacity > 0 ? '300px' : '0px' }}>
                  <h1 className="text-lg font-bold whitespace-nowrap" style={{ color: '#303030' }} data-testid="fund-name-header">{fund.name}</h1>
                </div>
              </div>
            </div>
          </div>

          <div className="h-24"></div>

          <div className="px-6 mb-6">
            <div className="mb-8 pb-6 border-b" style={{ borderColor: 'rgba(255, 253, 250, 0.2)' }}>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#fffdfa' }} data-testid="fund-name">{fund.name}</h2>
              <p className="text-sm opacity-70" style={{ color: '#fffdfa' }} data-testid="fund-objective">{fund.objective || 'Sem objetivo definido'}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider opacity-60 mb-2" style={{ color: '#fffdfa' }}>Saldo do fundo</p>
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-5xl font-bold" style={{ color: '#fffdfa' }} data-testid="fund-balance">
                  {balanceVisible ? formatCurrency(fundBalance?.currentBalance ?? 0) : '••••••'}
                </h2>
                <button 
                  className="transition-all duration-200 hover:scale-110 active:scale-95 opacity-60 hover:opacity-100 mt-2" 
                  aria-label="Mostrar/ocultar saldo"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  data-testid="button-toggle-balance"
                >
                  <Eye className="w-5 h-5" style={{ color: '#fffdfa' }} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm w-fit" style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}>
                <ArrowUp className="w-3.5 h-3.5" style={{ color: '#fffdfa' }} />
                <span className="text-sm" style={{ color: '#fffdfa' }} data-testid="user-contribution-badge">
                  Você contribuiu {formatCurrency(userContribution?.total ?? 0)}
                </span>
              </div>
              {fundPendingRetributions && fundPendingRetributions.pendingCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm w-fit" style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}>
                  <CreditCard className="w-3.5 h-3.5" style={{ color: '#fffdfa' }} />
                  <span className="text-sm" style={{ color: '#fffdfa' }} data-testid="pending-retributions-badge">
                    {fundPendingRetributions.pendingCount} retribuição{fundPendingRetributions.pendingCount !== 1 ? 'ões' : ''} pendente{fundPendingRetributions.pendingCount !== 1 ? 's' : ''} no fundo
                  </span>
                </div>
              )}
            </div>

            {fundPendingRetributions && fundPendingRetributions.pendingCount > 0 && (
              <div className="rounded-2xl p-4" style={{ backgroundColor: '#fffdfa' }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #fd6b61, #fa7653)' }}>
                      <Heart className="w-5 h-5" style={{ color: '#fffdfa' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm mb-0.5" style={{ color: '#303030' }}>
                        Você tem {fundPendingRetributions.pendingCount} retribuição{fundPendingRetributions.pendingCount !== 1 ? 'ões' : ''} pendente{fundPendingRetributions.pendingCount !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs" style={{ color: '#303030', opacity: 0.7 }}>Retribua para manter o fundo ativo</p>
                    </div>
                  </div>
                  <button 
                    className="px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap" 
                    style={{ background: 'linear-gradient(135deg, #fd6b61, #fa7653)', color: '#fffdfa' }}
                    data-testid="button-reciprocate-pending"
                  >
                    Retribuir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-t-3xl min-h-96 pt-6 pb-24" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#303030' }}>Ações</h2>
                <div className="w-16 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => setLocation(`/fund/${fund.id}/historico-contribuicoes`)}
                className="rounded-3xl p-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-white" 
                style={{ background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' }}
                data-testid="button-contribute"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}>
                    <ArrowUp className="w-6 h-6" style={{ color: '#fffdfa' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#fffdfa' }}>Contribuir</span>
                </div>
              </button>

              <button 
                onClick={() => setLocation(`/fund/${fund.id}/historico-solicitacoes`)}
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
                data-testid="button-request"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}>
                    <ArrowDown className="w-6 h-6" style={{ color: '#303030' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#303030' }}>Solicitar</span>
                </div>
              </button>

              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]" 
                style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
                data-testid="button-reciprocate"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}>
                    <Heart className="w-6 h-6" style={{ color: '#303030' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#303030' }}>Retribuir</span>
                </div>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#303030' }}>Visão geral</h2>
                <div className="w-16 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}></div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Card - Contribuições */}
              <button 
                onClick={() => setLocation(`/fund/${fund.id}/historico-contribuicoes`)}
                className="w-full rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left" 
                style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
                data-testid="card-contributions-overview"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-4xl font-bold" style={{ color: '#303030' }}>{formatCurrency(totalContributions)}</h3>
                  <ArrowUpRight className="w-6 h-6 flex-shrink-0 ml-4" style={{ color: '#303030', opacity: 0.4 }} />
                </div>
                <p className="text-base font-medium mb-3" style={{ color: '#303030', opacity: 0.7 }}>Contribuições no fundo</p>
                <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: 'rgba(48, 48, 48, 0.1)' }}>
                  <span className="text-sm" style={{ color: '#303030', opacity: 0.6 }} data-testid="total-contributions-count">Total recebido</span>
                </div>
              </button>

              {/* Card - Solicitações */}
              <button 
                onClick={() => setLocation(`/fund/${fund.id}/historico-solicitacoes`)}
                className="w-full rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left" 
                style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
                data-testid="card-requests-overview"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-4xl font-bold" style={{ color: '#303030' }}>{formatCurrency(totalRequests)}</h3>
                  <ArrowUpRight className="w-6 h-6 flex-shrink-0 ml-4" style={{ color: '#303030', opacity: 0.4 }} />
                </div>
                <p className="text-base font-medium mb-3" style={{ color: '#303030', opacity: 0.7 }}>Solicitações do fundo</p>
                <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: 'rgba(48, 48, 48, 0.1)' }}>
                  <span className="text-sm" style={{ color: '#303030', opacity: 0.6 }} data-testid="total-requests-count">Total aprovado</span>
                </div>
              </button>

              {/* Card - Retribuições */}
              <button 
                className="w-full rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left" 
                style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
                data-testid="card-retributions-overview"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-4xl font-bold" style={{ color: '#303030' }}>{formatCurrency(totalRetributions)}</h3>
                  <ArrowUpRight className="w-6 h-6 flex-shrink-0 ml-4" style={{ color: '#303030', opacity: 0.4 }} />
                </div>
                <p className="text-base font-medium mb-3" style={{ color: '#303030', opacity: 0.7 }}>Retribuições no fundo</p>
                <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: 'rgba(48, 48, 48, 0.1)' }}>
                  <span className="text-sm" style={{ color: '#303030', opacity: 0.6 }} data-testid="total-retributions-count">Total retribuído</span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#303030' }}>Atividades do fundo</h3>
              <div className="w-12 h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}></div>
            </div>

            <div className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01]" style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }} data-testid="activity-contribution-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}>
                    <ArrowUp className="w-6 h-6" style={{ color: '#303030' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#303030' }}>Contribuição recebida</h4>
                    <p className="text-sm" style={{ color: '#303030', opacity: 0.7 }}>Carlos Mendes • Hoje, 16:45</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: '#303030' }}>+R$ 200,00</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01]" style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }} data-testid="activity-payment-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}>
                    <ArrowDown className="w-6 h-6" style={{ color: '#303030' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#303030' }}>Pagamento realizado</h4>
                    <p className="text-sm" style={{ color: '#303030', opacity: 0.7 }}>Material esportivo • Ontem, 10:30</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: '#303030' }}>-R$ 450,00</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01]" style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }} data-testid="activity-contribution-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}>
                    <ArrowUp className="w-6 h-6" style={{ color: '#303030' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#303030' }}>Contribuição recebida</h4>
                    <p className="text-sm" style={{ color: '#303030', opacity: 0.7 }}>Ana Silva • 2 dias atrás, 14:20</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: '#303030' }}>+R$ 150,00</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01]" style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }} data-testid="activity-member-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}>
                    <Users className="w-6 h-6" style={{ color: '#303030' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#303030' }}>Novo membro adicionado</h4>
                    <p className="text-sm" style={{ color: '#303030', opacity: 0.7 }}>Pedro Santos • 3 dias atrás, 11:15</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}>
                    <span className="text-xs font-medium" style={{ color: '#fffdfa' }}>+1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01]" style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }} data-testid="activity-withdrawal-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}>
                    <ArrowDown className="w-6 h-6" style={{ color: '#303030' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#303030' }}>Retirada autorizada</h4>
                    <p className="text-sm" style={{ color: '#303030', opacity: 0.7 }}>João Oliveira • 5 dias atrás, 09:45</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: '#303030' }}>-R$ 300,00</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                className="w-full rounded-3xl p-4 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]" 
                style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
                data-testid="button-view-all-activities"
              >
                <span className="text-sm font-medium" style={{ color: '#303030' }}>Ver todas as atividades</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="px-6 py-4 backdrop-blur-sm border-t" style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-4 justify-around">
            <button 
              className="rounded-2xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2" 
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }} 
              aria-label="Início" 
              onClick={() => {
                setActiveNav(activeNav === 'home' ? null : 'home');
                setLocation('/');
              }}
              data-testid="button-home-nav"
            >
              <Home className="w-6 h-6" style={{ color: '#303030' }} />
              {activeNav === 'home' && <span className="text-sm font-medium whitespace-nowrap" style={{ color: '#303030' }}>Início</span>}
            </button>

            <button 
              className="rounded-2xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2" 
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }} 
              aria-label="Chat" 
              onClick={() => {
                setActiveNav(activeNav === 'chat' ? null : 'chat');
                setLocation(`/fund/${fundId}/chat`);
              }}
              data-testid="button-chat-nav"
            >
              <MessageCircle className="w-6 h-6" style={{ color: '#303030' }} />
              {activeNav === 'chat' && <span className="text-sm font-medium whitespace-nowrap" style={{ color: '#303030' }}>Chat</span>}
            </button>

            <button 
              className="rounded-2xl p-1 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2" 
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }} 
              aria-label="Perfil do usuário" 
              onClick={() => setActiveNav(activeNav === 'profile' ? null : 'profile')}
              data-testid="button-profile-nav"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fffdfa' }}>
                <User className="w-5 h-5" style={{ color: '#303030' }} />
              </div>
              {activeNav === 'profile' && <span className="text-sm font-medium whitespace-nowrap pr-2" style={{ color: '#fffdfa' }}>Definições</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
