import { ArrowLeft, Settings, Search, Plus, Users, Clock, Check, X, AlertCircle, ChevronRight, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { updateRequestCache } from "@/lib/request-cache";

export default function HistoricoSolicitacoesFundoScreen() {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos, pendentes, aprovadas, rejeitadas
  const [, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  
  // Extrair o ID do fundo da URL
  const currentPath = window.location.pathname;
  const fundId = currentPath.split('/')[2]; // /fund/:id/historico-solicitacoes

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

  // Informações do fundo (viriam da tela anterior)
  const fundoSelecionado = {
    id: 'futebol',
    nome: 'Fundo do futebol',
    descricao: 'Pagar os custos do time',
    emoji: '⚽️',
    saldoDisponivel: 5000.00,
    totalMembros: 25
  };

  // Histórico de solicitações do fundo
  const solicitacoes = [
    {
      id: 1,
      solicitante: 'Carlos Mendes',
      avatarSolicitante: '👤',
      valor: 450.00,
      motivo: 'Compra de novos uniformes para o time',
      status: 'pendente', // pendente, aprovada, rejeitada
      datasolicitacao: '2025-09-20T16:45:00',
      datasolicitacaoFormatada: 'Hoje, 16:45',
      valorRetribuicao: 112.50, // 25% de taxa
      taxaRetribuicao: 25,
      planoRetribuicao: {
        parcelas: 3,
        intervalo: 'mensal'
      }
    },
    {
      id: 2,
      solicitante: 'Ana Silva',
      avatarSolicitante: '👤',
      valor: 200.00,
      motivo: 'Material de treino e equipamentos',
      status: 'aprovada',
      datasolicitacao: '2025-09-19T10:30:00',
      datasolicitacaoFormatada: 'Ontem, 10:30',
      dataAprovacao: '2025-09-19T14:20:00',
      valorRetribuicao: 50.00,
      taxaRetribuicao: 25,
      planoRetribuicao: {
        parcelas: 2,
        intervalo: 'mensal'
      }
    },
    {
      id: 3,
      solicitante: 'João Oliveira',
      avatarSolicitante: '👤',
      valor: 300.00,
      motivo: 'Aluguel do campo para treinos',
      status: 'aprovada',
      datasolicitacao: '2025-09-17T14:20:00',
      datasolicitacaoFormatada: '3 dias atrás, 14:20',
      dataAprovacao: '2025-09-17T16:15:00',
      valorRetribuicao: 75.00,
      taxaRetribuicao: 25,
      planoRetribuicao: {
        parcelas: 3,
        intervalo: 'mensal'
      }
    },
    {
      id: 4,
      solicitante: 'Maria Santos',
      avatarSolicitante: '👤',
      valor: 150.00,
      motivo: 'Lanche para confraternização',
      status: 'rejeitada',
      datasolicitacao: '2025-09-15T11:15:00',
      datasolicitacaoFormatada: '5 dias atrás, 11:15',
      motivoRejeicao: 'Não se enquadra no objetivo do fundo',
      valorRetribuicao: 37.50,
      taxaRetribuicao: 25,
      planoRetribuicao: {
        parcelas: 1,
        intervalo: 'mensal'
      }
    },
    {
      id: 5,
      solicitante: 'Pedro Santos',
      avatarSolicitante: '👤',
      valor: 600.00,
      motivo: 'Contratação de técnico especializado',
      status: 'aprovada',
      datasolicitacao: '2025-09-10T09:45:00',
      datasolicitacaoFormatada: '10 dias atrás, 09:45',
      dataAprovacao: '2025-09-11T08:30:00',
      valorRetribuicao: 150.00,
      taxaRetribuicao: 25,
      planoRetribuicao: {
        parcelas: 4,
        intervalo: 'mensal'
      }
    }
  ];

  // Filtrar solicitações baseado na busca e status
  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    const matchBusca = termoBusca === '' || 
      solicitacao.solicitante.toLowerCase().includes(termoBusca.toLowerCase()) ||
      solicitacao.motivo.toLowerCase().includes(termoBusca.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || solicitacao.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  // Estatísticas rápidas
  const estatisticas = {
    totalSolicitacoes: solicitacoes.length,
    pendentes: solicitacoes.filter(s => s.status === 'pendente').length,
    aprovadas: solicitacoes.filter(s => s.status === 'aprovada').length,
    rejeitadas: solicitacoes.filter(s => s.status === 'rejeitada').length,
    valorTotalAprovado: solicitacoes
      .filter(s => s.status === 'aprovada')
      .reduce((sum, s) => sum + s.valor, 0)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="w-4 h-4" style={{ color: '#ffc22f' }} />;
      case 'aprovada':
        return <Check className="w-4 h-4" style={{ color: '#4ade80' }} />;
      case 'rejeitada':
        return <X className="w-4 h-4" style={{ color: '#fd6b61' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return '#ffc22f';
      case 'aprovada':
        return '#4ade80';
      case 'rejeitada':
        return '#fd6b61';
      default:
        return '#303030';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'aprovada':
        return 'Aprovada';
      case 'rejeitada':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  const handleNovaSolicitacao = () => {
    console.log('Iniciando nova solicitação para o fundo:', fundoSelecionado);
    // Salvar a página atual antes de navegar
    sessionStorage.setItem('lastPath', `/fund/${fundId}/historico-solicitacoes`);
    // Pré-selecionar o fundo atual para solicitação
    updateRequestCache({
      fundId: fundId,
      fundName: fundoSelecionado.nome,
      fundEmoji: fundoSelecionado.emoji
    });
    setLocation('/request/amount');
  };

  const handleVerDetalhes = (solicitacao: any) => {
    console.log('Ver detalhes da solicitação:', solicitacao);
    // Navegar para tela de detalhes da solicitação
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
                  <h1 className="text-lg font-bold whitespace-nowrap" style={{ color: '#303030' }} data-testid="fund-name-header">Solicitações</h1>
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
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#fffdfa' }}>Solicitações</h2>
              <p className="text-sm opacity-70" style={{ color: '#fffdfa' }}>{fundoSelecionado.nome}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider opacity-60 mb-2" style={{ color: '#fffdfa' }}>Total de solicitações</p>
              <h2 className="text-5xl font-bold mb-1" style={{ color: '#fffdfa' }} data-testid="total-solicitacoes">
                {estatisticas.totalSolicitacoes}
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm w-fit" style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}>
                <Check className="w-3.5 h-3.5" style={{ color: '#fffdfa' }} />
                <span className="text-sm" style={{ color: '#fffdfa' }} data-testid="badge-aprovadas">
                  {estatisticas.aprovadas} solicitações aprovadas
                </span>
              </div>
              {estatisticas.pendentes > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm w-fit" style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}>
                  <Clock className="w-3.5 h-3.5" style={{ color: '#fffdfa' }} />
                  <span className="text-sm" style={{ color: '#fffdfa' }} data-testid="badge-pendentes">
                    {estatisticas.pendentes} solicitações pendentes
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6">
          
          {/* Botão Nova Solicitação */}
          <div className="mb-10">
            <button 
              onClick={handleNovaSolicitacao}
              className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' }}
              data-testid="button-nova-solicitacao"
            >
              <div className="flex items-center justify-center gap-3">
                <Plus className="w-6 h-6" />
                <span>Nova solicitação</span>
              </div>
            </button>
          </div>

          {/* Lista de Solicitações */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#303030' }}>
              Histórico de solicitações
            </h3>

            {/* Campo de Busca */}
            <div className="mb-6">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'rgba(48, 48, 48, 0.5)' }} />
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  placeholder="Buscar solicitações..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all duration-200 focus:border-opacity-80"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: 'rgba(48, 48, 48, 0.1)',
                    color: '#303030'
                  }}
                  data-testid="input-buscar-solicitacoes"
                />
              </div>
            </div>

            {/* Filtros - Abaixo do título */}
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
                  Todas ({estatisticas.totalSolicitacoes})
                </button>
                <button
                  onClick={() => setFiltroStatus('pendentes')}
                  className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex-shrink-0"
                  style={{ 
                    backgroundColor: filtroStatus === 'pendentes' ? 'rgba(255, 229, 189, 0.3)' : 'rgba(255, 229, 189, 0.1)',
                    color: '#303030',
                    border: filtroStatus === 'pendentes' ? '2px solid rgba(255, 229, 189, 0.8)' : '1px solid rgba(48, 48, 48, 0.1)'
                  }}
                  data-testid="filter-pendentes"
                >
                  Pendentes ({estatisticas.pendentes})
                </button>
                <button
                  onClick={() => setFiltroStatus('aprovadas')}
                  className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex-shrink-0"
                  style={{ 
                    backgroundColor: filtroStatus === 'aprovadas' ? 'rgba(255, 229, 189, 0.3)' : 'rgba(255, 229, 189, 0.1)',
                    color: '#303030',
                    border: filtroStatus === 'aprovadas' ? '2px solid rgba(255, 229, 189, 0.8)' : '1px solid rgba(48, 48, 48, 0.1)'
                  }}
                  data-testid="filter-aprovadas"
                >
                  Aprovadas ({estatisticas.aprovadas})
                </button>
                <button
                  onClick={() => setFiltroStatus('rejeitadas')}
                  className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex-shrink-0"
                  style={{ 
                    backgroundColor: filtroStatus === 'rejeitadas' ? 'rgba(255, 229, 189, 0.3)' : 'rgba(255, 229, 189, 0.1)',
                    color: '#303030',
                    border: filtroStatus === 'rejeitadas' ? '2px solid rgba(255, 229, 189, 0.8)' : '1px solid rgba(48, 48, 48, 0.1)'
                  }}
                  data-testid="filter-rejeitadas"
                >
                  Rejeitadas ({estatisticas.rejeitadas})
                </button>
              </div>
            </div>

            {solicitacoesFiltradas.length === 0 ? (
              <div 
                className="rounded-3xl p-8 text-center"
                style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)' }}
              >
                <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(48, 48, 48, 0.4)' }} />
                <p className="text-lg font-semibold mb-2" style={{ color: '#303030' }}>
                  Nenhuma solicitação encontrada
                </p>
                <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                  {termoBusca ? 'Tente alterar o termo de busca' : 'Seja o primeiro a fazer uma solicitação!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitacoesFiltradas.map((solicitacao) => (
                  <button
                    key={solicitacao.id}
                    onClick={() => handleVerDetalhes(solicitacao)}
                    className="w-full rounded-2xl p-4 border transition-all duration-200 hover:shadow-sm active:scale-[0.99] text-left"
                    style={{ 
                      backgroundColor: '#fffdfa', 
                      borderColor: 'rgba(48, 48, 48, 0.08)'
                    }}
                    data-testid={`card-solicitacao-${solicitacao.id}`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-2xl font-bold mb-0.5" style={{ color: '#303030' }}>
                          {solicitacao.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'rgba(48, 48, 48, 0.5)' }}>
                          {solicitacao.solicitante}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {getStatusIcon(solicitacao.status)}
                        <span className="text-xs font-medium" style={{ color: getStatusColor(solicitacao.status) }}>
                          {getStatusLabel(solicitacao.status)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-xs line-clamp-2" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                        {solicitacao.motivo}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs" style={{ color: 'rgba(48, 48, 48, 0.5)' }}>
                      <span className="truncate">
                        {solicitacao.datasolicitacaoFormatada}
                      </span>
                      <span className="flex-shrink-0">
                        Retribuição: {solicitacao.valorRetribuicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>

                    {solicitacao.status === 'rejeitada' && solicitacao.motivoRejeicao && (
                      <div className="pt-2.5 mt-2.5 border-t" style={{ borderColor: 'rgba(48, 48, 48, 0.06)' }}>
                        <p className="text-xs" style={{ color: '#fd6b61' }}>
                          Motivo: {solicitacao.motivoRejeicao}
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