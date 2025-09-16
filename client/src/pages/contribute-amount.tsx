import { ArrowLeft, Settings, Check, Wallet, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getContributionCache, updateContributionCache } from "@/lib/contribution-cache";

export default function ContributeAmount() {
  const [valor, setValor] = useState('');
  const [valorSelecionado, setValorSelecionado] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('conta');
  const [fundoSelecionado, setFundoSelecionado] = useState<any>(null);
  const [, setLocation] = useLocation();
  
  // Buscar saldo disponível da conta via API
  const { data: accountBalance } = useQuery({
    queryKey: ['/api/accounts/8a1d8a0f-04c4-405d-beeb-7aa75690b32e/balance'],
    enabled: true,
  });
  
  const saldoDisponivel = (accountBalance as any)?.freeBalance || 0;

  // Valores de seleção rápida
  const valoresRapidos = [
    { id: '10', valor: 10, display: 'R$ 10' },
    { id: '50', valor: 50, display: 'R$ 50' },
    { id: '100', valor: 100, display: 'R$ 100' }
  ];

  // Carregar dados do cache
  useEffect(() => {
    const cached = getContributionCache();
    if (cached && cached.fundId) {
      setFundoSelecionado({
        id: cached.fundId,
        nome: cached.fundName,
        emoji: cached.fundEmoji
      });
      
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
      
      if (cached.metodoPagamento) {
        setMetodoPagamento(cached.metodoPagamento);
      }
    } else {
      // Se não há fundo selecionado, redirecionar para seleção
      setLocation('/contribute/select-fund');
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
      // Salvar no cache
      updateContributionCache({
        valor: valorNumerico,
        metodoPagamento: metodoPagamento as 'conta' | 'pix'
      });
      
      // Navegar para confirmação
      setLocation('/contribute/confirmation');
    }
  };

  const valorNumerico = obterValorNumerico(valor);
  const podeAvancar = valorNumerico > 0;

  if (!fundoSelecionado) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-creme">
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

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex justify-between items-center p-4 pt-12">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  // Se o fundo já estava pré-selecionado, voltar para página anterior
                  const cached = getContributionCache();
                  const lastPath = sessionStorage.getItem('lastPath');
                  
                  if (cached?.fundId && lastPath && lastPath !== '/') {
                    // Veio direto da tela de detalhes do fundo
                    setLocation(lastPath);
                  } else {
                    // Veio da seleção de fundo
                    setLocation('/contribute/select-fund');
                  }
                }}
                className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                aria-label="Voltar"
                data-testid="button-back"
              >
                <ArrowLeft className="w-6 h-6 text-creme" />
              </button>
              
              {/* Info do Fundo */}
              <span className="text-xl font-bold text-creme">
                {fundoSelecionado.nome}
              </span>
            </div>
            
            <button 
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Configurações"
              data-testid="button-settings"
            >
              <Settings className="w-6 h-6 text-creme" />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme">Valor da contribuição</h1>
            <p className="text-lg opacity-90 text-creme">
              Quanto você quer contribuir para o <span className="font-bold">{fundoSelecionado.nome}</span>?
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-6 pb-32 bg-creme">
        <div className="px-4 max-w-md mx-auto">
          
          {/* Input de Valor */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4 text-dark">
              Valor da contribuição
            </label>
            <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>
            
            <div className="relative">
              <input
                type="tel"
                inputMode="numeric"
                value={valor}
                onChange={handleInputChange}
                placeholder="R$ 0,00"
                className="input-limpo font-bold text-center"
                autoFocus
                data-testid="input-amount"
              />
            </div>
            
            {/* Valores Rápidos - 3 valores em linha */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {valoresRapidos.map((valorRapido) => (
                <button
                  key={valorRapido.id}
                  onClick={() => handleValorRapido(valorRapido.id)}
                  className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative"
                  style={{ 
                    backgroundColor: valorSelecionado === valorRapido.id ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
                    borderColor: valorSelecionado === valorRapido.id ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                    borderWidth: valorSelecionado === valorRapido.id ? '2px' : '1px'
                  }}
                  data-testid={`quick-amount-${valorRapido.id}`}
                >
                  {/* Check icon para selecionado */}
                  {valorSelecionado === valorRapido.id && (
                    <div 
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                    >
                      <Check className="w-4 h-4 text-creme" />
                    </div>
                  )}
                  
                  <div className="text-center">
                    <span className="text-lg font-bold text-dark">
                      {valorRapido.display}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Método de Pagamento */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-dark">
              Como deseja contribuir?
            </h2>
            <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Card Minha Conta */}
              <button
                onClick={() => setMetodoPagamento('conta')}
                className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative"
                style={{ 
                  backgroundColor: metodoPagamento === 'conta' ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
                  borderColor: metodoPagamento === 'conta' ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                  borderWidth: metodoPagamento === 'conta' ? '2px' : '1px'
                }}
                data-testid="payment-method-conta"
              >
                {/* Check icon para selecionado */}
                {metodoPagamento === 'conta' && (
                  <div 
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                  >
                    <Check className="w-4 h-4 text-creme" />
                  </div>
                )}
                
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ 
                      backgroundColor: metodoPagamento === 'conta' ? 
                        'rgba(255, 194, 47, 0.2)' : 
                        'rgba(255, 229, 189, 0.3)' 
                    }}
                  >
                    <Wallet className="w-6 h-6 text-dark" />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-dark">
                    Minha conta
                  </h3>
                  <p className="text-sm text-dark opacity-70">
                    Disponível: {saldoDisponivel.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>
              </button>

              {/* Card Código PIX */}
              <button
                onClick={() => setMetodoPagamento('pix')}
                className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative"
                style={{ 
                  backgroundColor: metodoPagamento === 'pix' ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
                  borderColor: metodoPagamento === 'pix' ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                  borderWidth: metodoPagamento === 'pix' ? '2px' : '1px'
                }}
                data-testid="payment-method-pix"
              >
                {/* Check icon para selecionado */}
                {metodoPagamento === 'pix' && (
                  <div 
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                  >
                    <Check className="w-4 h-4 text-creme" />
                  </div>
                )}
                
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ 
                      backgroundColor: metodoPagamento === 'pix' ? 
                        'rgba(255, 194, 47, 0.2)' : 
                        'rgba(255, 229, 189, 0.3)' 
                    }}
                  >
                    <Zap className="w-6 h-6 text-dark" />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-dark">
                    Código PIX
                  </h3>
                  <p className="text-sm text-dark opacity-70">
                    Contribua via PIX de qualquer banco
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Continuar - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-creme">
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
            data-testid="button-confirm-contribution"
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              <span>Confirmar contribuição</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}