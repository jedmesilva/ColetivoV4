import { ArrowLeft, Check, X, Clock, FileText, RefreshCw, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getContributionCache, processContribution } from "@/lib/contribution-cache";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ContributeConfirmation() {
  const [statusContribuicao, setStatusContribuicao] = useState<'processando' | 'concluida' | 'erro'>('processando');
  const [dadosContribuicao, setDadosContribuicao] = useState<any>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Mutation para processar contribuição
  const processContributionMutation = useMutation({
    mutationFn: processContribution,
    onSuccess: (data) => {
      console.log('Contribuição processada com sucesso:', data);
      setDadosContribuicao(data);
      setStatusContribuicao('concluida');
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
    },
    onError: (error) => {
      console.error('Erro ao processar contribuição:', error);
      setStatusContribuicao('erro');
    }
  });

  // Processar contribuição ao carregar
  useEffect(() => {
    const cached = getContributionCache();
    if (!cached || !cached.fundId || !cached.valor) {
      // Se não há dados, redirecionar para seleção de fundo
      setLocation('/contribute/select-fund');
      return;
    }

    // Processar contribuição automaticamente
    processContributionMutation.mutate();
  }, [setLocation, processContributionMutation]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Configurações visuais baseadas no status
  const obterConfigStatus = () => {
    switch (statusContribuicao) {
      case 'processando':
        return {
          icone: Clock,
          titulo: 'Processando contribuição',
          mensagem: 'Sua contribuição está sendo processada',
          descricao: 'Aguarde alguns instantes. Você será notificado quando a transação for confirmada.',
          mostrarComprovante: false,
          mostrarTentarNovamente: false
        };
      case 'erro':
        return {
          icone: X,
          titulo: 'Erro na contribuição',
          mensagem: 'Não foi possível processar sua contribuição',
          descricao: 'Verifique se há saldo suficiente em sua conta ou tente novamente com outro método de pagamento.',
          mostrarComprovante: false,
          mostrarTentarNovamente: true
        };
      case 'concluida':
        return {
          icone: Check,
          titulo: 'Contribuição realizada!',
          mensagem: 'Sua contribuição foi processada com sucesso',
          descricao: 'O valor foi adicionado ao fundo e você pode acompanhar o progresso na tela inicial.',
          mostrarComprovante: true,
          mostrarTentarNovamente: false
        };
      default:
        return {};
    }
  };

  const configStatus = obterConfigStatus();
  const IconeStatus = configStatus.icone!;
  
  console.log('Status atual:', statusContribuicao);
  console.log('Config status:', configStatus);
  console.log('Dados contribuição:', dadosContribuicao);

  const handleAbrirComprovante = () => {
    console.log('Abrindo comprovante da transação:', dadosContribuicao?.idTransacao);
    // Aqui seria implementada a lógica para abrir/baixar o comprovante
  };

  const handleTentarNovamente = () => {
    setLocation('/contribute/amount');
  };

  const handleVoltarInicio = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen pt-8 pb-32 bg-creme">
      <div className="px-4 max-w-md mx-auto">
        
        {/* Ícone de Status Central */}
        <div className="text-center mb-8">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-bege-transparent"
          >
            <IconeStatus className="w-8 h-8 text-dark" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-dark">
            {configStatus.titulo}
          </h2>
          <p className="text-base opacity-70 text-dark">
            {configStatus.descricao}
          </p>
        </div>

        {/* Detalhes da Contribuição */}
        {dadosContribuicao && (
          <div className="rounded-2xl p-6 mb-8 bg-white border border-bege">
            <h3 className="text-lg font-semibold mb-4 text-dark">Detalhes da contribuição</h3>
            
            <div className="space-y-4">
              {/* Fundo */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">Fundo</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{dadosContribuicao.fundEmoji}</span>
                  <span className="font-medium text-dark">{dadosContribuicao.fundName}</span>
                </div>
              </div>
              
              {/* Valor */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">Valor</span>
                <span className="font-bold text-lg text-dark">
                  {formatarValor(dadosContribuicao.valor)}
                </span>
              </div>
              
              {/* Método de Pagamento */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">Método</span>
                <span className="font-medium text-dark">
                  {dadosContribuicao.metodoPagamento === 'conta' ? 'Minha conta' : 'PIX'}
                </span>
              </div>
              
              {/* Data */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">Data</span>
                <span className="font-medium text-dark">
                  {formatarData(dadosContribuicao.dataContribuicao)}
                </span>
              </div>
              
              {/* ID da Transação */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">ID da Transação</span>
                <span className="font-mono text-xs text-dark opacity-60">
                  {dadosContribuicao.idTransacao}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-3">
          {/* Botão Comprovante */}
          {configStatus.mostrarComprovante && (
            <button
              onClick={handleAbrirComprovante}
              className="w-full rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] bg-white border-bege"
              data-testid="button-receipt"
            >
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-5 h-5 text-dark" />
                <span className="font-medium text-dark">Ver comprovante</span>
              </div>
            </button>
          )}
          
          {/* Botão Tentar Novamente */}
          {configStatus.mostrarTentarNovamente && (
            <button
              onClick={handleTentarNovamente}
              className="w-full rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{ 
                background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)'
              }}
              data-testid="button-try-again"
            >
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 text-creme" />
                <span className="font-medium text-creme">Tentar novamente</span>
              </div>
            </button>
          )}
          
          {/* Botão Voltar ao Início */}
          <button
            onClick={handleVoltarInicio}
            className="w-full rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{ 
              background: statusContribuicao === 'concluida' 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)'
                : 'rgba(48, 48, 48, 0.1)'
            }}
            data-testid="button-home"
          >
            <div className="flex items-center justify-center gap-3">
              <Home className="w-5 h-5" style={{ 
                color: statusContribuicao === 'concluida' ? '#fffdfa' : '#303030' 
              }} />
              <span 
                className="font-medium" 
                style={{ 
                  color: statusContribuicao === 'concluida' ? '#fffdfa' : '#303030' 
                }}
              >
                Voltar ao início
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}