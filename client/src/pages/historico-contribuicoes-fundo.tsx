import { ArrowLeft, Settings, Search, Plus, Users, ArrowUp, Check, X, AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { updateContributionCache } from "@/lib/contribution-cache";
import { Fund } from "@shared/schema";

export default function HistoricoContribuicoesFundoScreen() {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/fund/:id/historico-contribuicoes");
  const fundId = params?.id;
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);

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

  const { data: fund } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  const { data: contributions = [] } = useQuery({
    queryKey: ['/api/funds', fundId, 'contributions'],
    queryFn: async () => {
      const response = await fetch(`/api/funds/${fundId}/contributions`);
      if (!response.ok) throw new Error('Failed to fetch contributions');
      return response.json();
    },
    enabled: !!fundId,
  });

  const { data: financialSummary } = useQuery({
    queryKey: ['/api/funds', fundId, 'financial-summary'],
    queryFn: async () => {
      const response = await fetch(`/api/funds/${fundId}/financial-summary`);
      if (!response.ok) throw new Error('Failed to fetch financial summary');
      return response.json();
    },
    enabled: !!fundId,
  });

  const contribuicoesFiltradas = contributions.filter((contribuicao: any) => {
    const matchBusca = termoBusca === '' || 
      contribuicao.contributorName?.toLowerCase().includes(termoBusca.toLowerCase()) ||
      contribuicao.paymentMethod?.toLowerCase().includes(termoBusca.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || contribuicao.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  const estatisticas = {
    totalContribuicoes: contributions.length,
    concluidas: contributions.filter((c: any) => c.status === 'completed').length,
    pendentes: contributions.filter((c: any) => c.status === 'pending').length,
    canceladas: contributions.filter((c: any) => c.status === 'cancelled').length,
    valorTotalContribuido: financialSummary?.totalContributions ? parseFloat(financialSummary.totalContributions) : 0,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ArrowUp className="w-5 h-5" style={{ color: '#ffc22f' }} />;
      case 'completed':
        return <Check className="w-5 h-5" style={{ color: '#4ade80' }} />;
      case 'cancelled':
        return <X className="w-5 h-5" style={{ color: '#fd6b61' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ffc22f';
      case 'completed':
        return '#4ade80';
      case 'cancelled':
        return '#fd6b61';
      default:
        return '#303030';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handleNovaContribuicao = () => {
    sessionStorage.setItem('lastPath', `/fund/${fundId}/historico-contribuicoes`);
    updateContributionCache({
      fundId: fundId,
      fundName: fund?.name || '',
      fundEmoji: '💰'
    });
    setLocation('/contribute/amount');
  };

  const handleVerDetalhes = (contribuicao: any) => {
    console.log('Ver detalhes da contribuição:', contribuicao);
  };

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    if (diffDays === 0) return `Hoje, ${timeStr}`;
    if (diffDays === 1) return `Ontem, ${timeStr}`;
    if (diffDays <= 7) return `${diffDays} dias atrás, ${timeStr}`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + `, ${timeStr}`;
  };

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
                  onClick={() => setLocation(`/fund/${fundId}`)}
                  className="rounded-xl py-3 transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Voltar"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-6 h-6" style={{ color: isScrolled ? '#303030' : '#fffdfa' }} />
                </button>
                <div className="transition-all duration-300 overflow-hidden" style={{ opacity: scrollOpacity, maxWidth: scrollOpacity > 0 ? '300px' : '0px' }}>
                  <h1 className="text-lg font-bold whitespace-nowrap" style={{ color: '#303030' }} data-testid="fund-name-header">Contribuições</h1>
                </div>
              </div>
              <button 
                className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 opacity-0"
                style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
                aria-label="Configurações"
              >
                <Settings className="w-6 h-6" style={{ color: isScrolled ? '#303030' : '#fffdfa' }} />
              </button>
            </div>
          </div>

          <div className="h-24"></div>

          <div className="px-6 mb-6">
            <div className="mb-8 pb-6 border-b" style={{ borderColor: 'rgba(255, 253, 250, 0.2)' }}>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#fffdfa' }}>Contribuições</h2>
              <p className="text-sm opacity-70" style={{ color: '#fffdfa' }}>{fund?.name || 'Carregando...'}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider opacity-60 mb-2" style={{ color: '#fffdfa' }}>Contribuições totais</p>
              <h2 className="text-5xl font-bold mb-1" style={{ color: '#fffdfa' }} data-testid="total-contribuicoes">
                {formatCurrency(estatisticas.valorTotalContribuido)}
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm w-fit" style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}>
                <Check className="w-3.5 h-3.5" style={{ color: '#fffdfa' }} />
                <span className="text-sm" style={{ color: '#fffdfa' }} data-testid="badge-concluidas">
                  {estatisticas.concluidas} contribuições concluídas
                </span>
              </div>
              {estatisticas.pendentes > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm w-fit" style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}>
                  <ArrowUp className="w-3.5 h-3.5" style={{ color: '#fffdfa' }} />
                  <span className="text-sm" style={{ color: '#fffdfa' }} data-testid="badge-pendentes">
                    {estatisticas.pendentes} contribuições pendentes
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6">
          
          <div className="mb-6">
            <button 
              onClick={handleNovaContribuicao}
              className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' }}
              data-testid="button-nova-contribuicao"
            >
              <div className="flex items-center justify-center gap-3">
                <Plus className="w-6 h-6" />
                <span>Nova contribuição</span>
              </div>
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'rgba(48, 48, 48, 0.5)' }} />
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar contribuições..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all duration-200 focus:border-opacity-80"
                style={{ 
                  backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                  borderColor: 'rgba(48, 48, 48, 0.1)',
                  color: '#303030'
                }}
                data-testid="input-buscar-contribuicoes"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#303030' }}>Histórico de contribuições</h3>
              <span className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }} data-testid="results-count">
                {contribuicoesFiltradas.length} resultado(s)
              </span>
            </div>
            <div className="w-12 h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }} />

            <div className="mb-6 -mx-6">
              <div className="flex gap-2 overflow-x-auto pb-2 px-6">
                <button
                  onClick={() => setFiltroStatus('todos')}
                  className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex-shrink-0"
                  style={{ 
                    backgroundColor: filtroStatus === 'todos' ? 'rgba(255, 229, 189, 0.3)' : 'rgba(255, 229, 189, 0.1)',
                    color: '#303030',
                    border: filtroStatus === 'todos' ? '2px solid rgba(255, 229, 189, 0.8)' : '1px solid rgba(48, 48, 48, 0.1)'
                  }}
                  data-testid="filter-todos"
                >
                  Todas ({estatisticas.totalContribuicoes})
                </button>
                <button
                  onClick={() => setFiltroStatus('completed')}
                  className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex-shrink-0"
                  style={{ 
                    backgroundColor: filtroStatus === 'completed' ? 'rgba(255, 229, 189, 0.3)' : 'rgba(255, 229, 189, 0.1)',
                    color: '#303030',
                    border: filtroStatus === 'completed' ? '2px solid rgba(255, 229, 189, 0.8)' : '1px solid rgba(48, 48, 48, 0.1)'
                  }}
                  data-testid="filter-concluidas"
                >
                  Concluídas ({estatisticas.concluidas})
                </button>
                <button
                  onClick={() => setFiltroStatus('pending')}
                  className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex-shrink-0"
                  style={{ 
                    backgroundColor: filtroStatus === 'pending' ? 'rgba(255, 229, 189, 0.3)' : 'rgba(255, 229, 189, 0.1)',
                    color: '#303030',
                    border: filtroStatus === 'pending' ? '2px solid rgba(255, 229, 189, 0.8)' : '1px solid rgba(48, 48, 48, 0.1)'
                  }}
                  data-testid="filter-pendentes"
                >
                  Pendentes ({estatisticas.pendentes})
                </button>
                <button
                  onClick={() => setFiltroStatus('cancelled')}
                  className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex-shrink-0"
                  style={{ 
                    backgroundColor: filtroStatus === 'cancelled' ? 'rgba(255, 229, 189, 0.3)' : 'rgba(255, 229, 189, 0.1)',
                    color: '#303030',
                    border: filtroStatus === 'cancelled' ? '2px solid rgba(255, 229, 189, 0.8)' : '1px solid rgba(48, 48, 48, 0.1)'
                  }}
                  data-testid="filter-canceladas"
                >
                  Canceladas ({estatisticas.canceladas})
                </button>
              </div>
            </div>

            {contribuicoesFiltradas.length === 0 ? (
              <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)' }}>
                <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(48, 48, 48, 0.4)' }} />
                <p className="text-lg font-semibold mb-2" style={{ color: '#303030' }}>
                  Nenhuma contribuição encontrada
                </p>
                <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                  {termoBusca ? 'Tente alterar o termo de busca' : 'Seja o primeiro a contribuir!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {contribuicoesFiltradas.map((contribuicao: any) => (
                  <button
                    key={contribuicao.id}
                    onClick={() => handleVerDetalhes(contribuicao)}
                    className="w-full rounded-3xl p-5 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left"
                    style={{ 
                      backgroundColor: '#fffdfa', 
                      borderColor: 'rgba(48, 48, 48, 0.1)'
                    }}
                    data-testid={`card-contribuicao-${contribuicao.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}>
                          <TrendingUp className="w-6 h-6" style={{ color: '#303030' }} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg" style={{ color: '#303030' }}>
                            {contribuicao.contributorName || 'Anônimo'}
                          </h4>
                          <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                            {contribuicao.contributedAt ? formatDate(contribuicao.contributedAt) : 'Data não disponível'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(contribuicao.status)}
                          <span className="text-sm font-semibold" style={{ color: getStatusColor(contribuicao.status) }}>
                            {getStatusLabel(contribuicao.status)}
                          </span>
                        </div>
                        <ArrowUpRight className="w-5 h-5" style={{ color: 'rgba(48, 48, 48, 0.4)' }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#303030' }}>
                          {formatCurrency(contribuicao.amount || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                          {contribuicao.paymentMethod || 'Não especificado'}
                        </p>
                      </div>
                    </div>

                    {contribuicao.status === 'cancelled' && contribuicao.cancellationReason && (
                      <div className="pt-3 border-t" style={{ borderColor: 'rgba(48, 48, 48, 0.1)' }}>
                        <p className="text-sm" style={{ color: '#fd6b61' }}>
                          Motivo: {contribuicao.cancellationReason}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
