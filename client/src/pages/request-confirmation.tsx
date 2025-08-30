import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, AlertCircle, Calendar, CreditCard } from "lucide-react";
import { getRequestCache, processRequest } from "@/lib/request-cache";

export default function RequestConfirmation() {
  const [statusSolicitacao, setStatusSolicitacao] = useState<'processando' | 'concluida' | 'erro'>('processando');
  const [dadosSolicitacao, setDadosSolicitacao] = useState<any>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Mutation para processar solicitação
  const processRequestMutation = useMutation({
    mutationFn: processRequest,
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
    const cached = getRequestCache();
    if (!cached || !cached.fundId || !cached.valor || !cached.motivo || !cached.planoPagamento) {
      // Se não há dados, redirecionar para seleção de fundo
      setLocation('/request/select-fund');
      return;
    }

    // Processar solicitação automaticamente
    processRequestMutation.mutate();
  }, [setLocation, processRequestMutation]);

  const handleVoltarHome = () => {
    setLocation('/');
  };

  const handleVerDetalhes = () => {
    if (dadosSolicitacao?.fundId) {
      setLocation(`/fund/${dadosSolicitacao.fundId}`);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdfa' }}>
      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradientes múltiplos */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-70"
          style={{ 
            background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-60"
          style={{ 
            background: 'radial-gradient(circle at center, #ffc22f, #fa7653, #fd6b61, transparent)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-50"
          style={{ 
            background: 'linear-gradient(270deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-40"
          style={{ 
            background: 'linear-gradient(180deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-45"
          style={{ 
            background: 'radial-gradient(circle at top left, #ffe5bd, #ffc22f, #fa7653, transparent)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-35"
          style={{ 
            background: 'radial-gradient(circle at bottom right, #fd6b61, #fa7653, #ffc22f, transparent)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            background: 'linear-gradient(45deg, #fa7653, #fd6b61, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-25"
          style={{ 
            background: 'conic-gradient(from 0deg at center, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61, #fffdfa)' 
          }}
        />
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.1), rgba(255, 229, 189, 0.1), rgba(255, 194, 47, 0.1), rgba(250, 118, 83, 0.1), rgba(253, 107, 97, 0.1))',
            mixBlendMode: 'overlay'
          }}
        />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Header vazio para dar espaço */}
          <div className="h-16"></div>

          {/* Ícone de Status */}
          <div className="flex justify-center pt-8 pb-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: statusSolicitacao === 'processando' ? 'rgba(255, 229, 189, 0.3)' :
                               statusSolicitacao === 'concluida' ? 'rgba(34, 197, 94, 0.2)' :
                               'rgba(239, 68, 68, 0.2)'
              }}
            >
              {statusSolicitacao === 'processando' && (
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#fffdfa' }} />
              )}
              {statusSolicitacao === 'concluida' && (
                <Check className="w-10 h-10" style={{ color: '#fffdfa' }} />
              )}
              {statusSolicitacao === 'erro' && (
                <AlertCircle className="w-10 h-10" style={{ color: '#fffdfa' }} />
              )}
            </div>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8 text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>
              {statusSolicitacao === 'processando' && 'Processando solicitação...'}
              {statusSolicitacao === 'concluida' && 'Solicitação enviada!'}
              {statusSolicitacao === 'erro' && 'Erro na solicitação'}
            </h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>
              {statusSolicitacao === 'processando' && 'Aguarde enquanto processamos sua solicitação'}
              {statusSolicitacao === 'concluida' && 'Sua solicitação foi enviada com sucesso'}
              {statusSolicitacao === 'erro' && 'Ocorreu um erro ao processar sua solicitação'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6 max-w-md mx-auto">
          
          {/* Conteúdo baseado no status */}
          {statusSolicitacao === 'processando' && (
            <div className="text-center">
              <div className="mb-8">
                <div 
                  className="rounded-2xl p-6 border"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: 'rgba(48, 48, 48, 0.1)',
                    borderWidth: '1px'
                  }}
                >
                  <p className="text-lg" style={{ color: '#303030' }}>
                    Estamos processando sua solicitação de capital...
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                    Isso pode levar alguns segundos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {statusSolicitacao === 'concluida' && dadosSolicitacao && (
            <div>
              {/* Card de Sucesso */}
              <div className="mb-8">
                <div 
                  className="rounded-2xl p-6 border"
                  style={{ 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                    borderColor: 'rgba(34, 197, 94, 0.3)',
                    borderWidth: '2px'
                  }}
                >
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#303030' }}>
                      Solicitação #{dadosSolicitacao.idSolicitacao}
                    </h2>
                    <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                      Status: <span className="font-medium text-green-600">Pendente de aprovação</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalhes da Solicitação */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                  Detalhes da solicitação
                </h3>
                <div 
                  className="w-8 h-1 rounded-full mb-6"
                  style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                ></div>
                
                <div className="space-y-4">
                  {/* Fundo */}
                  <div 
                    className="rounded-xl p-4 border"
                    style={{ 
                      backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                      borderColor: 'rgba(48, 48, 48, 0.1)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{dadosSolicitacao.fundEmoji}</span>
                      <div>
                        <p className="font-medium" style={{ color: '#303030' }}>
                          {dadosSolicitacao.fundName}
                        </p>
                        <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                          Fundo selecionado
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Valor */}
                  <div 
                    className="rounded-xl p-4 border"
                    style={{ 
                      backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                      borderColor: 'rgba(48, 48, 48, 0.1)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6" style={{ color: 'rgba(48, 48, 48, 0.7)' }} />
                      <div>
                        <p className="font-bold text-lg" style={{ color: '#303030' }}>
                          {dadosSolicitacao.valor.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </p>
                        <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                          Valor solicitado
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Data */}
                  <div 
                    className="rounded-xl p-4 border"
                    style={{ 
                      backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                      borderColor: 'rgba(48, 48, 48, 0.1)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6" style={{ color: 'rgba(48, 48, 48, 0.7)' }} />
                      <div>
                        <p className="font-medium" style={{ color: '#303030' }}>
                          {new Date(dadosSolicitacao.dataSolicitacao).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                          Data da solicitação
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Próximos Passos */}
              <div className="mb-8">
                <div 
                  className="rounded-2xl p-4 border"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: 'rgba(48, 48, 48, 0.1)',
                    borderWidth: '1px'
                  }}
                >
                  <h4 className="font-semibold mb-2" style={{ color: '#303030' }}>
                    Próximos passos:
                  </h4>
                  <ul className="text-sm space-y-1" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                    <li>• Os administradores do fundo irão analisar sua solicitação</li>
                    <li>• Você receberá uma notificação sobre o resultado</li>
                    <li>• Se aprovada, o valor será disponibilizado conforme o plano de retribuição</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {statusSolicitacao === 'erro' && (
            <div>
              <div className="mb-8">
                <div 
                  className="rounded-2xl p-6 border"
                  style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    borderWidth: '2px'
                  }}
                >
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-2" style={{ color: '#303030' }}>
                      Erro no processamento
                    </h2>
                    <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                      Não foi possível processar sua solicitação. Tente novamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botões de Ação - Fixos na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-3" style={{ backgroundColor: '#fffdfa' }}>
        <div className="max-w-md mx-auto">
          {statusSolicitacao === 'concluida' && (
            <div className="space-y-3">
              <button 
                onClick={handleVerDetalhes}
                className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)'
                }}
              >
                Ver detalhes do fundo
              </button>
              <button 
                onClick={handleVoltarHome}
                className="w-full rounded-3xl p-4 font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border"
                style={{ 
                  backgroundColor: '#fffdfa',
                  borderColor: 'rgba(48, 48, 48, 0.1)',
                  color: '#303030'
                }}
              >
                Voltar ao início
              </button>
            </div>
          )}

          {statusSolicitacao === 'erro' && (
            <div className="space-y-3">
              <button 
                onClick={() => setLocation('/request/select-fund')}
                className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)'
                }}
              >
                Tentar novamente
              </button>
              <button 
                onClick={handleVoltarHome}
                className="w-full rounded-3xl p-4 font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border"
                style={{ 
                  backgroundColor: '#fffdfa',
                  borderColor: 'rgba(48, 48, 48, 0.1)',
                  color: '#303030'
                }}
              >
                Voltar ao início
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}