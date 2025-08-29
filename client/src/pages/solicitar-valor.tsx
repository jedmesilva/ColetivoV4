import { ArrowLeft, Check, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getSolicitationCache, updateSolicitationCache } from "@/lib/solicitation-cache";

export default function SolicitarValor() {
  const [valor, setValor] = useState('');
  const [valorSelecionado, setValorSelecionado] = useState('');
  const [, setLocation] = useLocation();
  
  // Informações do fundo selecionado
  const [fundoSelecionado, setFundoSelecionado] = useState({
    nome: '',
    emoji: '',
    saldoDisponivel: 0
  });

  useEffect(() => {
    const cached = getSolicitationCache();
    if (!cached || !cached.fundId) {
      // Se não há fundo selecionado, redirecionar para seleção
      setLocation('/solicitar/select-fund');
      return;
    }

    setFundoSelecionado({
      nome: cached.fundName || '',
      emoji: cached.fundEmoji || '',
      saldoDisponivel: 1500.00 // Simulado - viria da API
    });
  }, [setLocation]);

  // Valores de seleção rápida
  const valoresRapidos = [
    { id: '100', valor: 100, display: 'R$ 100' },
    { id: '250', valor: 250, display: 'R$ 250' },
    { id: '500', valor: 500, display: 'R$ 500' }
  ];

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
    if (valorNumerico > 0 && valorNumerico <= fundoSelecionado.saldoDisponivel) {
      // Salvar valor no cache
      updateSolicitationCache({
        valor: valorNumerico
      });
      
      // Avançar para próxima tela
      setLocation('/solicitar/motivo');
    }
  };

  const handleVoltar = () => {
    // Voltar para seleção de fundo
    setLocation('/solicitar/select-fund');
  };

  const valorNumerico = obterValorNumerico(valor);
  const podeAvancar = valorNumerico > 0 && valorNumerico <= fundoSelecionado.saldoDisponivel;

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
      `}</style>
      
      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradientes múltiplos */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 opacity-70" style={{ 
          background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
        }} />
        <div className="absolute inset-0 opacity-60" style={{ 
          background: 'radial-gradient(circle at center, #ffc22f, #fa7653, #fd6b61, transparent)' 
        }} />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex items-center p-4 pt-12">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleVoltar}
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
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme">Solicitar capital</h1>
            <p className="text-lg opacity-90 text-creme">
              Quanto você precisa solicitar do <span className="font-bold">{fundoSelecionado.nome}</span>?
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32 bg-creme">
        <div className="px-4 max-w-md mx-auto">
          
          {/* Input de Valor */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4 text-dark">
              Valor da solicitação
            </label>
            <div className="w-8 h-1 rounded-full mb-6 gradient-primary"></div>
            
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
            
            {/* Valores Rápidos */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {valoresRapidos.map((valorRapido) => (
                <button
                  key={valorRapido.id}
                  onClick={() => handleValorRapido(valorRapido.id)}
                  className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative bg-white border-bege"
                  style={{ 
                    backgroundColor: valorSelecionado === valorRapido.id ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
                    borderColor: valorSelecionado === valorRapido.id ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                    borderWidth: valorSelecionado === valorRapido.id ? '2px' : '1px'
                  }}
                  data-testid={`button-quick-amount-${valorRapido.valor}`}
                >
                  {/* Check icon para selecionado */}
                  {valorSelecionado === valorRapido.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center gradient-primary">
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

          {/* Card do Fundo Selecionado */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-dark">
              Fundo selecionado
            </h2>
            <div className="w-8 h-1 rounded-full mb-6 gradient-primary"></div>
            
            <div className="rounded-2xl p-4 border-2 bg-white border-bege">
              <div className="flex items-center gap-4">
                {/* Ícone do Fundo */}
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-bege-transparent">
                  <span className="text-2xl">{fundoSelecionado.emoji}</span>
                </div>
                
                {/* Informações do Fundo */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1 text-dark">
                    {fundoSelecionado.nome}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-dark opacity-70" />
                    <p className="text-sm text-dark opacity-70">
                      Disponível: {fundoSelecionado.saldoDisponivel.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mensagem de limite quando necessário */}
            {valorNumerico > fundoSelecionado.saldoDisponivel && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-center text-red-600">
                  O valor solicitado não pode ser maior que o saldo disponível no fundo
                </p>
              </div>
            )}
          </div>

          {/* Card Informativo */}
          <div className="mb-8">
            <div className="rounded-2xl p-4 border bg-white border-bege opacity-60">
              <p className="text-sm text-center text-dark opacity-70">
                💡 O valor disponível para solicitação é definido pelas regras e configurações estabelecidas no fundo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Continuar - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-6 bg-creme">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={!podeAvancar}
            className="w-full rounded-3xl p-4 text-creme font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ 
              background: podeAvancar 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
                : 'rgba(48, 48, 48, 0.2)'
            }}
            data-testid="button-continue"
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