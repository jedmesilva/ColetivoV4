import { ArrowLeft, Settings, Search, Plus, Users, ArrowUp, Check, X, AlertCircle, ChevronRight, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { updateContributionCache } from "@/lib/contribution-cache";

export default function HistoricoContribuicoesFundoScreen() {
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos'); // todos, concluidas, pendentes, canceladas
  const [, setLocation] = useLocation();
  
  // Extrair o ID do fundo da URL
  const currentPath = window.location.pathname;
  const fundId = currentPath.split('/')[2]; // /fund/:id/historico-contribuicoes

  // Informações do fundo (viriam da tela anterior)
  const fundoSelecionado = {
    id: 'futebol',
    nome: 'Fundo do futebol',
    descricao: 'Pagar os custos do time',
    emoji: '⚽️',
    saldoAtual: 5000.00,
    totalMembros: 25,
    metaMensal: 2000.00
  };

  // Carregar contribuições reais do banco
  const [contribuicoes, setContribuicoes] = useState([]);
  const [carregandoContribuicoes, setCarregandoContribuicoes] = useState(true);

  useEffect(() => {
    const carregarContribuicoes = async () => {
      try {
        setCarregandoContribuicoes(true);
        const response = await fetch(`/api/funds/${fundId}/contributions/history`);
        if (response.ok) {
          const data = await response.json();
          setContribuicoes(data);
        } else {
          console.error('Erro ao carregar contribuições');
        }
      } catch (error) {
        console.error('Erro ao carregar contribuições:', error);
      } finally {
        setCarregandoContribuicoes(false);
      }
    };

    carregarContribuicoes();
  }, [fundId]);

  // Filtrar contribuições baseado na busca e status
  const contribuicoesFiltradas = contribuicoes.filter(contribuicao => {
    const matchBusca = termoBusca === '' || 
      contribuicao.contribuinte.toLowerCase().includes(termoBusca.toLowerCase()) ||
      contribuicao.metodoPagamento.toLowerCase().includes(termoBusca.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || contribuicao.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  // Estatísticas rápidas
  const estatisticas = {
    totalContribuicoes: contribuicoes.length,
    concluidas: contribuicoes.filter(c => c.status === 'concluida').length,
    pendentes: contribuicoes.filter(c => c.status === 'pendente').length,
    canceladas: contribuicoes.filter(c => c.status === 'cancelada').length,
    valorTotalContribuido: contribuicoes
      .filter(c => c.status === 'concluida')
      .reduce((sum, c) => sum + c.valor, 0),
    contributesUnicos: [...new Set(contribuicoes.map(c => c.contribuinte))].length
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente':
        return <ArrowUp className="w-5 h-5" style={{ color: '#ffc22f' }} />;
      case 'concluida':
        return <Check className="w-5 h-5" style={{ color: '#4ade80' }} />;
      case 'cancelada':
        return <X className="w-5 h-5" style={{ color: '#fd6b61' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return '#ffc22f';
      case 'concluida':
        return '#4ade80';
      case 'cancelada':
        return '#fd6b61';
      default:
        return '#303030';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handleNovaContribuicao = () => {
    console.log('Iniciando nova contribuição para o fundo:', fundoSelecionado);
    // Salvar a página atual antes de navegar
    sessionStorage.setItem('lastPath', `/fund/${fundId}/historico-contribuicoes`);
    // Pré-selecionar o fundo atual para contribuição
    updateContributionCache({
      fundId: fundId,
      fundName: fundoSelecionado.nome,
      fundEmoji: fundoSelecionado.emoji
    });
    setLocation('/contribute/amount');
  };

  const handleVerDetalhes = (contribuicao) => {
    console.log('Ver detalhes da contribuição:', contribuicao);
    // Navegar para tela de detalhes/comprovante da contribuição
  };

  // Calcular progresso da meta mensal
  const contribuicoesMesAtual = contribuicoes.filter(c => {
    const dataContrib = new Date(c.dataContribuicao);
    const agora = new Date();
    return c.status === 'concluida' && 
           dataContrib.getMonth() === agora.getMonth() && 
           dataContrib.getFullYear() === agora.getFullYear();
  });
  
  const valorContribuidoMes = contribuicoesMesAtual.reduce((sum, c) => sum + c.valor, 0);
  const progressoMeta = Math.min((valorContribuidoMes / fundoSelecionado.metaMensal) * 100, 100);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdfa' }}>
      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradiente Base */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
          }}
        />
        
        {/* Gradiente Invertido - Diagonal Oposta */}
        <div 
          className="absolute inset-0 opacity-70"
          style={{ 
            background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        
        {/* Gradiente Radial do Centro */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{ 
            background: 'radial-gradient(circle at center, #ffc22f, #fa7653, #fd6b61, transparent)' 
          }}
        />
        
        {/* Gradiente Horizontal Invertido */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{ 
            background: 'linear-gradient(270deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
          }}
        />
        
        {/* Gradiente Vertical */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{ 
            background: 'linear-gradient(180deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        
        {/* Gradiente Radial Superior Esquerdo */}
        <div 
          className="absolute inset-0 opacity-45"
          style={{ 
            background: 'radial-gradient(circle at top left, #ffe5bd, #ffc22f, #fa7653, transparent)' 
          }}
        />
        
        {/* Gradiente Radial Inferior Direito */}
        <div 
          className="absolute inset-0 opacity-35"
          style={{ 
            background: 'radial-gradient(circle at bottom right, #fd6b61, #fa7653, #ffc22f, transparent)' 
          }}
        />
        
        {/* Gradiente Diagonal 45 graus */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            background: 'linear-gradient(45deg, #fa7653, #fd6b61, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        
        {/* Gradiente Cônico */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{ 
            background: 'conic-gradient(from 0deg at center, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61, #fffdfa)' 
          }}
        />
        
        {/* Camada de mistura para suavizar */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.1), rgba(255, 229, 189, 0.1), rgba(255, 194, 47, 0.1), rgba(250, 118, 83, 0.1), rgba(253, 107, 97, 0.1))',
            mixBlendMode: 'overlay'
          }}
        />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex justify-between items-center p-6 pt-12">
            <button 
              onClick={() => setLocation(`/fund/${fundId}`)}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
            
            <button 
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
              aria-label="Configurações"
            >
              <Settings className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
          </div>

          {/* Info do Fundo e Título */}
          <div className="px-6 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 253, 250, 0.9)' }}
              >
                <span className="text-2xl">{fundoSelecionado.emoji}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#fffdfa' }}>Contribuições</h1>
                <p className="text-sm opacity-90" style={{ color: '#fffdfa' }}>
                  {fundoSelecionado.nome}
                </p>
              </div>
            </div>
            
            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div 
                className="rounded-2xl p-3 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}
              >
                <p className="text-2xl font-bold" style={{ color: '#fffdfa' }}>
                  {estatisticas.concluidas}
                </p>
                <p className="text-xs opacity-90" style={{ color: '#fffdfa' }}>
                  CONCLUÍDAS
                </p>
              </div>
              
              <div 
                className="rounded-2xl p-3 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}
              >
                <p className="text-2xl font-bold" style={{ color: '#fffdfa' }}>
                  {estatisticas.pendentes}
                </p>
                <p className="text-xs opacity-90" style={{ color: '#fffdfa' }}>
                  PENDENTES
                </p>
              </div>
              
              <div 
                className="rounded-2xl p-3 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}
              >
                <p className="text-2xl font-bold" style={{ color: '#fffdfa' }}>
                  {estatisticas.totalContribuicoes}
                </p>
                <p className="text-xs opacity-90" style={{ color: '#fffdfa' }}>
                  TOTAL
                </p>
              </div>
            </div>

            {/* Meta Mensal */}
            <div 
              className="rounded-2xl p-4 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: '#fffdfa' }}>
                  Meta do mês
                </span>
                <span className="text-sm font-bold" style={{ color: '#fffdfa' }}>
                  {progressoMeta.toFixed(1)}%
                </span>
              </div>
              <div 
                className="w-full h-2 rounded-full mb-2"
                style={{ backgroundColor: 'rgba(255, 253, 250, 0.3)' }}
              >
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progressoMeta}%`,
                    background: 'linear-gradient(90deg, #4ade80, #22c55e)'
                  }}
                />
              </div>
              <p className="text-xs" style={{ color: '#fffdfa' }}>
                {valorContribuidoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de{' '}
                {fundoSelecionado.metaMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6">
          
          {/* Botão Nova Contribuição */}
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

          {/* Campo de Busca */}
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

        </div>

        {/* Filtros - Fora do container para ocupar toda largura */}
        <div className="mb-6">
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
              onClick={() => setFiltroStatus('concluidas')}
              className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex-shrink-0"
              style={{ 
                backgroundColor: filtroStatus === 'concluidas' ? 'rgba(255, 229, 189, 0.3)' : 'rgba(255, 229, 189, 0.1)',
                color: '#303030',
                border: filtroStatus === 'concluidas' ? '2px solid rgba(255, 229, 189, 0.8)' : '1px solid rgba(48, 48, 48, 0.1)'
              }}
              data-testid="filter-concluidas"
            >
              Concluídas ({estatisticas.concluidas})
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
              onClick={() => setFiltroStatus('canceladas')}
              className="whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 flex-shrink-0"
              style={{ 
                backgroundColor: filtroStatus === 'canceladas' ? 'rgba(255, 229, 189, 0.3)' : 'rgba(255, 229, 189, 0.1)',
                color: '#303030',
                border: filtroStatus === 'canceladas' ? '2px solid rgba(255, 229, 189, 0.8)' : '1px solid rgba(48, 48, 48, 0.1)'
              }}
              data-testid="filter-canceladas"
            >
              Canceladas ({estatisticas.canceladas})
            </button>
          </div>
        </div>

        <div className="px-6">

          {/* Lista de Contribuições */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#303030' }}>
                Histórico de contribuições
              </h3>
              <span className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                {contribuicoesFiltradas.length} resultado(s)
              </span>
            </div>
            <div 
              className="w-12 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            />

            {carregandoContribuicoes ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-lg text-dark">Carregando contribuições...</p>
              </div>
            ) : contribuicoesFiltradas.length === 0 ? (
              <div 
                className="rounded-3xl p-8 text-center"
                style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)' }}
              >
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
                {contribuicoesFiltradas.map((contribuicao) => (
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
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
                        >
                          <TrendingUp className="w-6 h-6" style={{ color: '#303030' }} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg" style={{ color: '#303030' }}>
                            {contribuicao.contribuinte}
                          </h4>
                          <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                            {contribuicao.dataContribuicaoFormatada}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(contribuicao.status)}
                          <span 
                            className="text-sm font-semibold"
                            style={{ color: getStatusColor(contribuicao.status) }}
                          >
                            {getStatusLabel(contribuicao.status)}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5" style={{ color: 'rgba(48, 48, 48, 0.4)' }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#303030' }}>
                          {contribuicao.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.6)' }}>
                          {contribuicao.metodoPagamento}
                        </p>
                      </div>
                      
                      {contribuicao.idTransacao && (
                        <div className="text-right">
                          <div 
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: 'rgba(255, 229, 189, 0.2)' }}
                          >
                            <span className="text-xs font-medium" style={{ color: '#303030' }}>
                              ID: {contribuicao.idTransacao.slice(-6)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {contribuicao.status === 'cancelada' && contribuicao.motivoCancelamento && (
                      <div 
                        className="mt-3 p-3 rounded-xl"
                        style={{ backgroundColor: 'rgba(253, 107, 97, 0.1)' }}
                      >
                        <p className="text-sm" style={{ color: '#fd6b61' }}>
                          <strong>Motivo do cancelamento:</strong> {contribuicao.motivoCancelamento}
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