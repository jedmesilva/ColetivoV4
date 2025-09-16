import { ArrowLeft, Check, Calendar, CreditCard, AlertCircle, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getRequestCache, clearRequestCache } from "@/lib/request-cache";

export default function RequestConfirmation() {
  const [processando, setProcessando] = useState(false);
  const [, setLocation] = useLocation();

  // Dados vindos das telas anteriores
  const [dadosCache, setDadosCache] = useState<any>(null);

  useEffect(() => {
    const cached = getRequestCache();
    if (!cached || !cached.fundId || !cached.valor || !cached.motivo || !cached.planoPagamento) {
      // Se não há dados, redirecionar para seleção de fundo
      setLocation('/request/select-fund');
      return;
    }
    setDadosCache(cached);
  }, [setLocation]);

  if (!dadosCache) {
    return null; // Carregando ou redirecionando
  }

  // Simular dados baseados no cache
  const fundoSelecionado = {
    id: dadosCache.fundId,
    nome: dadosCache.fundName || 'Fundo selecionado',
    descricao: 'Descrição do fundo',
    emoji: dadosCache.fundEmoji || '💰'
  };

  const solicitacao = {
    valorSolicitado: dadosCache.valor,
    taxaRetribuicao: 25, // 25% - taxa de retribuição do fundo
    dataLimite: '2025-12-31', // Data limite para retribuição
    motivoSolicitacao: dadosCache.motivo
  };

  // Calcular valor total a retribuir
  const valorTotalRetribuicao = solicitacao.valorSolicitado * (solicitacao.taxaRetribuicao / 100);

  // Dados do plano de pagamento
  const planoPagamento = dadosCache.planoPagamento || {
    tipo: 'padrao',
    numeroParcelas: 3,
    intervaloParcelas: 'mensal',
    dataInicio: '2025-09-01',
    parcelas: [
      {
        numero: 1,
        valor: 66.67,
        data: '2025-09-01',
        dataFormatada: '01/09/2025'
      },
      {
        numero: 2,
        valor: 66.67,
        data: '2025-10-01',
        dataFormatada: '01/10/2025'
      },
      {
        numero: 3,
        valor: 66.66,
        data: '2025-11-01',
        dataFormatada: '01/11/2025'
      }
    ]
  };

  const handleVoltar = () => {
    setLocation('/request/payment-plan');
  };

  const handleSolicitarCapital = async () => {
    setProcessando(true);
    
    try {
      // Mapear intervalos do frontend para frequências do backend
      const frequencyMap: { [key: string]: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom' } = {
        'diario': 'daily',
        'semanal': 'weekly',
        'mensal': 'monthly',
        'bimestral': 'custom', // Bimestral não tem equivalente direto, usar custom
        'trimestral': 'quarterly', 
        'semestral': 'semiannual',
        'anual': 'annual'
      };

      // Preparar dados para o backend
      let installments: number;
      let frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';
      let firstDueDate: string;

      if (planoPagamento.tipo === 'automatico') {
        // Para plano automático, usar os dados configurados
        installments = planoPagamento.numeroParcelas || 1;
        frequency = frequencyMap[planoPagamento.intervaloParcelas || 'mensal'] || 'monthly';
        firstDueDate = planoPagamento.dataInicio || new Date().toISOString().split('T')[0];
      } else {
        // Para plano personalizado, inferir dados das parcelas
        installments = planoPagamento.parcelas?.length || 1;
        frequency = 'monthly'; // Padrão para personalizado
        firstDueDate = planoPagamento.parcelas?.[0]?.data || new Date().toISOString().split('T')[0];
      }

      const requestData = {
        fundId: dadosCache.fundId,
        amount: dadosCache.valor.toString(),
        reason: dadosCache.motivo,
        urgencyLevel: 'medium' as const,
        installments: installments,
        frequency: frequency,
        firstDueDate: firstDueDate
      };

      // Obter accountId do usuário logado (por enquanto usando um ID fixo)
      // TODO: Implementar autenticação real
      const accountId = '8a1d8a0f-04c4-405d-beeb-7aa75690b32e'; // ID de exemplo dos logs

      console.log('Enviando solicitação de capital:', { accountId, ...requestData });

      // Fazer a chamada real para a API
      const response = await fetch('/api/capital-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ accountId, ...requestData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao processar solicitação');
      }

      const result = await response.json();
      console.log('Solicitação criada com sucesso:', result);
      
      setProcessando(false);
      clearRequestCache(); // Limpar cache após sucesso
      alert('Solicitação enviada com sucesso! Você receberá uma notificação quando for aprovada.');
      
      // Navegar de volta para onde o usuário estava
      const lastPath = sessionStorage.getItem('lastPath');
      if (lastPath && lastPath.includes('/fund/')) {
        setLocation(lastPath);
      } else {
        setLocation('/');
      }
      
      // Limpar a rota anterior do sessionStorage
      sessionStorage.removeItem('lastPath');
      
    } catch (error) {
      console.error('Erro ao solicitar capital:', error);
      setProcessando(false);
      alert('Erro ao processar solicitação: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  const formatarDataLimite = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdfa' }}>
      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradiente Base */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' }} />
        {/* Gradiente Invertido - Diagonal Oposta */}
        <div className="absolute inset-0 opacity-70" style={{ background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' }} />
        {/* Gradiente Radial do Centro */}
        <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(circle at center, #ffc22f, #fa7653, #fd6b61, transparent)' }} />
        {/* Gradiente Horizontal Invertido */}
        <div className="absolute inset-0 opacity-50" style={{ background: 'linear-gradient(270deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' }} />
        {/* Gradiente Vertical */}
        <div className="absolute inset-0 opacity-40" style={{ background: 'linear-gradient(180deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' }} />
        {/* Gradiente Radial Superior Esquerdo */}
        <div className="absolute inset-0 opacity-45" style={{ background: 'radial-gradient(circle at top left, #ffe5bd, #ffc22f, #fa7653, transparent)' }} />
        {/* Gradiente Radial Inferior Direito */}
        <div className="absolute inset-0 opacity-35" style={{ background: 'radial-gradient(circle at bottom right, #fd6b61, #fa7653, #ffc22f, transparent)' }} />
        {/* Gradiente Diagonal 45 graus */}
        <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(45deg, #fa7653, #fd6b61, #ffc22f, #ffe5bd, #fffdfa)' }} />
        {/* Gradiente Cônico */}
        <div className="absolute inset-0 opacity-25" style={{ background: 'conic-gradient(from 0deg at center, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61, #fffdfa)' }} />
        {/* Camada de mistura para suavizar */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.1), rgba(255, 229, 189, 0.1), rgba(255, 194, 47, 0.1), rgba(250, 118, 83, 0.1), rgba(253, 107, 97, 0.1))', mixBlendMode: 'overlay' }} />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex items-center p-6 pt-12">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleVoltar}
                className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95" 
                style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
                aria-label="Voltar"
              >
                <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
              </button>
              {/* Nome do Fundo */}
              <span className="text-xl font-bold" style={{ color: '#fffdfa' }}>
                {fundoSelecionado.nome}
              </span>
            </div>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>Confirmar solicitação</h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>
              Revise os detalhes da sua solicitação de capital
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6 max-w-md mx-auto space-y-8">

          {/* Resumo da Solicitação */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#303030' }}>
              Detalhes da solicitação
            </h2>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            />
            
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.1)'
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>Fundo:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{fundoSelecionado.emoji}</span>
                  <span className="font-semibold" style={{ color: '#303030' }}>
                    {fundoSelecionado.nome}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>Valor solicitado:</span>
                <span className="font-bold text-xl" style={{ color: '#303030' }}>
                  {solicitacao.valorSolicitado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>Taxa de retribuição:</span>
                <span className="font-semibold text-lg" style={{ color: '#303030' }}>
                  {solicitacao.taxaRetribuicao}%
                </span>
              </div>
              
              <div 
                className="w-full h-px"
                style={{ backgroundColor: 'rgba(48, 48, 48, 0.1)' }}
              />
              
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: '#303030' }}>Total a retribuir:</span>
                <span className="font-bold text-xl" style={{ color: '#fd6b61' }}>
                  {valorTotalRetribuicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {solicitacao.dataLimite && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>Data limite:</span>
                  <span className="font-semibold" style={{ color: '#303030' }}>
                    {formatarDataLimite(solicitacao.dataLimite)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Motivo da Solicitação */}
          {solicitacao.motivoSolicitacao && (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Motivo da solicitação
              </h2>
              <div 
                className="w-8 h-1 rounded-full mb-6"
                style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
              />
              
              <div
                className="rounded-2xl p-4"
                style={{ 
                  backgroundColor: 'rgba(255, 229, 189, 0.1)'
                }}
              >
                <p style={{ color: '#303030', lineHeight: '1.5' }}>
                  {solicitacao.motivoSolicitacao}
                </p>
              </div>
            </div>
          )}

          {/* Plano de Retribuição */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#303030' }}>
              Plano de retribuição
            </h2>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            />
            
            <div className="space-y-3">
              {planoPagamento.parcelas.map((parcela: any) => (
                <div
                  key={parcela.numero}
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                    >
                      <span className="text-sm font-bold" style={{ color: '#303030' }}>
                        {parcela.numero}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#303030' }}>
                        {parcela.numero}ª parcela
                      </p>
                      <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                        {parcela.dataFormatada}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: '#303030' }}>
                      {parcela.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aviso Importante */}
          <div
            className="rounded-2xl p-4"
            style={{ 
              backgroundColor: 'rgba(255, 194, 47, 0.1)'
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#ffc22f' }} />
              <div>
                <p className="font-semibold mb-1" style={{ color: '#303030' }}>
                  Compromisso de retribuição
                </p>
                <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.8)', lineHeight: '1.4' }}>
                  Ao confirmar esta solicitação, você se compromete a retribuir o valor de{' '}
                  <span className="font-semibold">
                    {valorTotalRetribuicao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  {' '}conforme o plano estabelecido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Solicitar - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4" style={{ backgroundColor: '#fffdfa' }}>
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSolicitarCapital}
            disabled={processando}
            className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ 
              background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              {processando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Solicitar capital</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}