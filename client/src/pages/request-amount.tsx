import { ArrowLeft, Settings, Check, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getRequestCache, updateRequestCache } from "@/lib/request-cache";

interface Fund {
  id: string;
  nome: string;
  emoji: string;
  saldoDisponivel: number;
}

export default function RequestAmount() {
  const [valor, setValor] = useState('');
  const [valorSelecionado, setValorSelecionado] = useState('');
  const [fundoSelecionado, setFundoSelecionado] = useState<Fund | null>(null);
  const [carregandoSaldo, setCarregandoSaldo] = useState(false);
  const [, setLocation] = useLocation();
  
  // Valores de seleção rápida
  const valoresRapidos = [
    { id: '10', valor: 10, display: 'R$ 10' },
    { id: '50', valor: 50, display: 'R$ 50' },
    { id: '100', valor: 100, display: 'R$ 100' }
  ];

  useEffect(() => {
    const cached = getRequestCache();
    if (cached && cached.fundId) {
      // Criar objeto inicial sem o saldo
      const fundoInicial = {
        id: cached.fundId,
        nome: cached.fundName || '',
        emoji: cached.fundEmoji || '',
        saldoDisponivel: 0
      };
      setFundoSelecionado(fundoInicial);
      
      // Buscar o saldo real do fundo
      const buscarSaldoFundo = async () => {
        try {
          setCarregandoSaldo(true);
          const response = await fetch(`/api/funds/${cached.fundId}/balance`);
          if (response.ok) {
            const data = await response.json();
            const saldo = data.currentBalance ?? data.balance ?? 0;
            if (saldo === 0 && !data.currentBalance && !data.balance) {
              console.warn('Resposta da API não contém saldo esperado:', data);
            }
            setFundoSelecionado(prev => prev ? {
              ...prev,
              saldoDisponivel: saldo
            } : null);
          } else {
            console.error('Erro ao buscar saldo do fundo:', response.status);
            // Em caso de erro, exibir alerta para o usuário
            alert('Erro ao carregar saldo do fundo. Tente novamente.');
          }
        } catch (error) {
          console.error('Erro ao buscar saldo do fundo:', error);
          // Em caso de erro, exibir alerta para o usuário
          alert('Erro ao carregar saldo do fundo. Tente novamente.');
        } finally {
          setCarregandoSaldo(false);
        }
      };
      
      buscarSaldoFundo();
      
      if (cached.valor) {
        const valorFormatado = cached.valor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
        setValor(valorFormatado);
        
        const valorRapidoCorrespondente = valoresRapidos.find(v => v.valor === cached.valor);
        if (valorRapidoCorrespondente) {
          setValorSelecionado(valorRapidoCorrespondente.id);
        }
      }
    } else {
      // Se não há fundo selecionado, redirecionar para seleção
      setLocation('/request/select-fund');
    }
  }, [setLocation]);

  const formatarValor = (valorInput: string) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valorInput.replace(/\D/g, '');
    
    // Converte para centavos
    const valorEmCentavos = parseInt(apenasNumeros) || 0;
    
    // Converte para reais e formata
    const valorEmReais = valorEmCentavos / 100;
    
    return valorEmReais.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const obterValorNumerico = (valorFormatado: string) => {
    if (!valorFormatado || valorFormatado === 'R$ 0,00') return 0;
    return parseFloat(valorFormatado.replace(/[R$\s.]/g, '').replace(',', '.'));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarValor(e.target.value);
    setValor(valorFormatado);
    
    // Se o usuário digitar, limpar seleção dos valores rápidos
    const valorNumerico = obterValorNumerico(valorFormatado);
    const valorRapidoCorrespondente = valoresRapidos.find(v => v.valor === valorNumerico);
    
    if (valorRapidoCorrespondente) {
      setValorSelecionado(valorRapidoCorrespondente.id);
    } else {
      setValorSelecionado('');
    }
  };

  const handleValorRapido = (valorRapidoId: string) => {
    const valorObj = valoresRapidos.find(v => v.id === valorRapidoId);
    if (valorObj) {
      // Formatar o valor com vírgula e centavos, igual ao input
      const valorFormatado = valorObj.valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      setValor(valorFormatado);
      setValorSelecionado(valorRapidoId);
    }
  };

  const handleSubmit = () => {
    const valorNumerico = obterValorNumerico(valor);
    if (valorNumerico > 0 && fundoSelecionado) {
      // Salvar valor no cache
      updateRequestCache({
        valor: valorNumerico
      });
      
      // Navegar para tela de motivo
      setLocation('/request/reason');
    }
  };

  const valorNumerico = obterValorNumerico(valor);
  const podeAvancar = valorNumerico > 0 && fundoSelecionado && valorNumerico <= fundoSelecionado.saldoDisponivel && !carregandoSaldo;

  if (!fundoSelecionado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdfa' }}>
      <style>{`
        .input-limpo {
          width: 100%;
          padding: 2rem 1.5rem;
          border-radius: 1rem;
          border: 1px solid rgba(48, 48, 48, 0.1);
          font-size: 2.25rem;
          background-color: rgba(255, 229, 189, 0.1);
          color: #303030;
          outline: none;
          box-shadow: none;
          min-height: 80px;
        }

        .input-limpo:focus {
          outline: none;
          box-shadow: none;
          border-color: rgba(48, 48, 48, 0.1);
        }

        .input-limpo::placeholder {
          color: rgba(48, 48, 48, 0.5);
        }

        .input-limpo:focus-visible {
          outline: none;
          box-shadow: none;
        }

        .input-limpo:active,
        .input-limpo:hover {
          outline: none;
          box-shadow: none;
        }
      `}</style>
      
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
          {/* Navigation Header */}
          <div className="flex items-center p-6 pt-12">
            <div className="flex items-center gap-4">
              <button 
                className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
                aria-label="Voltar"
                onClick={() => {
                  const lastPath = sessionStorage.getItem('lastPath');
                  if (lastPath) {
                    setLocation(lastPath);
                  } else {
                    setLocation('/request/select-fund');
                  }
                }}
              >
                <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
              </button>
              
              {/* Info do Fundo - Apenas texto */}
              <span className="text-xl font-bold" style={{ color: '#fffdfa' }}>
                {fundoSelecionado.nome}
              </span>
            </div>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>Solicitar capital</h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>
              Quanto você precisa solicitar do <span className="font-bold">{fundoSelecionado.nome}</span>?
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6 max-w-md mx-auto">
          
          {/* Input de Valor */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
              Valor da solicitação
            </label>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>
            
            <div className="relative">
              <input
                type="tel"
                inputMode="numeric"
                value={valor}
                onChange={handleInputChange}
                placeholder="R$ 0,00"
                className="input-limpo font-bold text-center"
                autoFocus
              />
            </div>
            
            {/* Valores Rápidos - 3 valores em linha */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {valoresRapidos.slice(0, 3).map((valorRapido) => (
                <button
                  key={valorRapido.id}
                  onClick={() => handleValorRapido(valorRapido.id)}
                  className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative"
                  style={{ 
                    backgroundColor: valorSelecionado === valorRapido.id ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
                    borderColor: valorSelecionado === valorRapido.id ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                    borderWidth: valorSelecionado === valorRapido.id ? '2px' : '1px'
                  }}
                >
                  {/* Check icon para selecionado */}
                  {valorSelecionado === valorRapido.id && (
                    <div 
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                    >
                      <Check className="w-4 h-4" style={{ color: '#fffdfa' }} />
                    </div>
                  )}
                  
                  <div className="text-center">
                    <span 
                      className="text-lg font-bold" 
                      style={{ color: '#303030' }}
                    >
                      {valorRapido.display}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card do Fundo Selecionado */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#303030' }}>
              Fundo selecionado
            </h2>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>
            
            <div
              className="rounded-2xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.2)', 
                borderColor: 'rgba(255, 229, 189, 0.8)',
                borderWidth: '2px'
              }}
            >
              <div className="flex items-center gap-4">
                {/* Ícone do Fundo */}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.3)' }}
                >
                  <span className="text-2xl">{fundoSelecionado.emoji}</span>
                </div>
                
                {/* Informações do Fundo */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#303030' }}>
                    {fundoSelecionado.nome}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" style={{ color: 'rgba(48, 48, 48, 0.7)' }} />
                    <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                      Disponível: {carregandoSaldo ? (
                        <span className="inline-flex items-center gap-1">
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                          Carregando...
                        </span>
                      ) : (
                        fundoSelecionado.saldoDisponivel.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mensagem de limite quando necessário */}
            {valorNumerico > fundoSelecionado.saldoDisponivel && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(253, 107, 97, 0.1)' }}>
                <p className="text-sm text-center" style={{ color: '#fd6b61' }}>
                  O valor solicitado não pode ser maior que o saldo disponível no fundo
                </p>
              </div>
            )}
          </div>

          {/* Card Informativo */}
          <div className="mb-8">
            <div 
              className="rounded-2xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                borderColor: 'rgba(48, 48, 48, 0.1)',
                borderWidth: '1px'
              }}
            >
              <p className="text-sm text-center" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                💡 O valor disponível para solicitação é definido pelas regras e configurações estabelecidas no fundo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Continuar - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-3" style={{ backgroundColor: '#fffdfa' }}>
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={!podeAvancar}
            className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ 
              background: podeAvancar 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
                : 'rgba(48, 48, 48, 0.2)'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              <span>Continuar</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}