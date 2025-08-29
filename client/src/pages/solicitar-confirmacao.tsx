import { ArrowLeft, Check, X, Clock, FileText, RefreshCw, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getSolicitationCache, processSolicitation } from "@/lib/solicitation-cache";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function SolicitarConfirmacao() {
  const [statusSolicitacao, setStatusSolicitacao] = useState<'processando' | 'concluida' | 'erro'>('processando');
  const [dadosSolicitacao, setDadosSolicitacao] = useState<any>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Mutation para processar solicitação
  const processSolicitationMutation = useMutation({
    mutationFn: processSolicitation,
    onSuccess: (data) => {
      setDadosSolicitacao(data);
      setStatusSolicitacao('concluida');
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
    },
    onError: (error) => {
      setStatusSolicitacao('erro');
    }
  });

  // Processar solicitação ao carregar
  useEffect(() => {
    const cached = getSolicitationCache();
    if (!cached || !cached.fundId || !cached.valor || !cached.motivo || !cached.planoRetribuicao) {
      // Se não há dados completos, redirecionar para seleção de fundo
      setLocation('/solicitar/select-fund');
      return;
    }

    // Processar solicitação automaticamente
    processSolicitationMutation.mutate();
  }, [setLocation, processSolicitationMutation]);

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
    switch (statusSolicitacao) {
      case 'processando':
        return {
          icone: Clock,
          titulo: 'Processando solicitação',
          mensagem: 'Sua solicitação está sendo processada',
          descricao: 'Aguarde alguns instantes. Você será notificado quando a solicitação for analisada.',
          mostrarComprovante: false,
          mostrarTentarNovamente: false
        };
      case 'erro':
        return {
          icone: X,
          titulo: 'Erro na solicitação',
          mensagem: 'Não foi possível processar sua solicitação',
          descricao: 'Verifique os dados informados ou tente novamente mais tarde.',
          mostrarComprovante: false,
          mostrarTentarNovamente: true
        };
      case 'concluida':
        return {
          icone: Check,
          titulo: 'Solicitação enviada!',
          mensagem: 'Sua solicitação foi enviada com sucesso',
          descricao: 'Aguarde a análise dos administradores do fundo. Você será notificado sobre o status.',
          mostrarComprovante: true,
          mostrarTentarNovamente: false
        };
      default:
        return {};
    }
  };

  const configStatus = obterConfigStatus();
  const IconeStatus = configStatus.icone!;

  const handleAbrirComprovante = () => {
    console.log('Abrindo comprovante da solicitação:', dadosSolicitacao?.idSolicitacao);
    // Aqui seria implementada a lógica para abrir/baixar o comprovante
  };

  const handleTentarNovamente = () => {
    setLocation('/solicitar/select-fund');
  };

  const handleVoltarInicio = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen pt-8 pb-32 bg-creme">
      <div className="px-4 max-w-md mx-auto">
        
        {/* Ícone de Status Central */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-bege-transparent">
            <IconeStatus className="w-8 h-8 text-dark" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-dark">
            {configStatus.titulo}
          </h2>
          <p className="text-base opacity-70 text-dark">
            {configStatus.descricao}
          </p>
        </div>

        {/* Detalhes da Solicitação */}
        {dadosSolicitacao && (
          <div className="rounded-2xl p-6 mb-8 bg-white border border-bege">
            <h3 className="text-lg font-semibold mb-4 text-dark">Detalhes da solicitação</h3>
            
            <div className="space-y-4">
              {/* Fundo */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">Fundo</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{dadosSolicitacao.fundEmoji}</span>
                  <span className="font-medium text-dark">{dadosSolicitacao.fundName}</span>
                </div>
              </div>
              
              {/* Valor */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">Valor solicitado</span>
                <span className="font-medium text-dark">
                  {formatarValor(dadosSolicitacao.valor)}
                </span>
              </div>
              
              {/* Data */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">Data da solicitação</span>
                <span className="text-sm text-dark opacity-80">
                  {formatarData(dadosSolicitacao.dataSolicitacao)}
                </span>
              </div>
              
              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">Status</span>
                <span className="text-sm font-medium px-2 py-1 rounded-lg bg-yellow-100 text-yellow-800">
                  Pendente de análise
                </span>
              </div>
              
              {/* ID da Solicitação */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark opacity-70">ID da Solicitação</span>
                <span className="font-mono text-xs text-dark opacity-60">
                  {dadosSolicitacao.idSolicitacao}
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
              className="w-full rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] gradient-primary"
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
              background: statusSolicitacao === 'concluida' 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)'
                : 'rgba(48, 48, 48, 0.1)'
            }}
            data-testid="button-home"
          >
            <div className="flex items-center justify-center gap-3">
              <Home className="w-5 h-5" style={{ 
                color: statusSolicitacao === 'concluida' ? '#fffdfa' : '#303030' 
              }} />
              <span 
                className="font-medium" 
                style={{ 
                  color: statusSolicitacao === 'concluida' ? '#fffdfa' : '#303030' 
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