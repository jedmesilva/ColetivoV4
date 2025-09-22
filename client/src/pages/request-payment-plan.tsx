import { ArrowLeft, Check, Calendar, CreditCard, Edit3, Plus, X, ChevronRight, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getRequestCache, updateRequestCache } from "@/lib/request-cache";
import CustomSelect from "@/components/ui/custom-select";

interface PaymentPlan {
  tipo: 'automatico' | 'personalizado';
  dataInicio?: string;
  numeroParcelas?: number;
  intervaloParcelas?: string;
  parcelas?: Array<{
    id: number;
    numero: number;
    valor: number;
    data: string;
    dataFormatada: string;
  }>;
}

export default function RequestPaymentPlan() {
  const [modoPersonalizado, setModoPersonalizado] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [numeroParcelas, setNumeroParcelas] = useState('2');
  const [intervaloParcelas, setIntervaloParcelas] = useState('mensal');
  const [parcelasPersonalizadas, setParcelasPersonalizadas] = useState<any[]>([]);
  const [editandoParcela, setEditandoParcela] = useState<number | null>(null);
  const [valorParcela, setValorParcela] = useState('');
  const [dataParcela, setDataParcela] = useState('');
  const [, setLocation] = useLocation();

  // Dados vindos da tela anterior
  const [valorSolicitado, setValorSolicitado] = useState(0);
  const [fundoSelecionado, setFundoSelecionado] = useState<{nome: string, emoji: string} | null>(null);
  const taxaRetribuicao = 25; // 25% - taxa de retribuição
  const valorTotal = valorSolicitado * (taxaRetribuicao / 100); // 25% do valor solicitado
  
  // Opções de parcelas
  const opcoesParcelas = [
    { value: '1', label: '1x' },
    { value: '2', label: '2x' },
    { value: '3', label: '3x' },
    { value: '4', label: '4x' },
    { value: '6', label: '6x' },
    { value: '12', label: '12x' }
  ];
  const opcoesIntervalo = [
    { value: 'diario', label: 'Diário' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'bimestral', label: 'Bimestral' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ];

  useEffect(() => {
    const cached = getRequestCache();
    if (cached && cached.fundId && cached.valor && cached.motivo) {
      setValorSolicitado(cached.valor);
      setFundoSelecionado({
        nome: cached.fundName || '',
        emoji: cached.fundEmoji || ''
      });
      
      if (cached.planoPagamento) {
        const plano = cached.planoPagamento;
        setModoPersonalizado(plano.tipo === 'personalizado');
        if (plano.dataInicio) setDataInicio(plano.dataInicio);
        if (plano.numeroParcelas) setNumeroParcelas(plano.numeroParcelas.toString());
        if (plano.intervaloParcelas) setIntervaloParcelas(plano.intervaloParcelas);
        if (plano.parcelas) setParcelasPersonalizadas(plano.parcelas);
      }
    } else {
      // Se não há dados, redirecionar para seleção
      setLocation('/request/select-fund');
    }
  }, [setLocation]);

  // Calcular parcelas automáticas
  const calcularParcelas = () => {
    if (!dataInicio || !numeroParcelas) return [];
    
    const parcelas = [];
    const valorParcela = valorTotal / parseInt(numeroParcelas);
    const dataBase = new Date(dataInicio);
    
    // Validar se cada parcela é pelo menos R$ 0,01
    if (valorParcela < 0.01) {
      return [];
    }
    
    for (let i = 0; i < parseInt(numeroParcelas); i++) {
      const dataParcela = new Date(dataBase);
      
      if (intervaloParcelas === 'diario') {
        dataParcela.setDate(dataBase.getDate() + i);
      } else if (intervaloParcelas === 'semanal') {
        dataParcela.setDate(dataBase.getDate() + (i * 7));
      } else if (intervaloParcelas === 'mensal') {
        dataParcela.setMonth(dataBase.getMonth() + i);
      } else if (intervaloParcelas === 'bimestral') {
        dataParcela.setMonth(dataBase.getMonth() + (i * 2));
      } else if (intervaloParcelas === 'trimestral') {
        dataParcela.setMonth(dataBase.getMonth() + (i * 3));
      } else if (intervaloParcelas === 'semestral') {
        dataParcela.setMonth(dataBase.getMonth() + (i * 6));
      } else if (intervaloParcelas === 'anual') {
        dataParcela.setFullYear(dataBase.getFullYear() + i);
      }
      
      parcelas.push({
        numero: i + 1,
        valor: valorParcela,
        data: dataParcela.toISOString().split('T')[0],
        dataFormatada: dataParcela.toLocaleDateString('pt-BR')
      });
    }
    
    return parcelas;
  };

  const parcelasCalculadas = calcularParcelas();

  // Calcular total restante nas parcelas personalizadas
  const totalParcelasPersonalizadas = parcelasPersonalizadas.reduce((sum, p) => sum + p.valor, 0);
  const valorRestante = valorTotal - totalParcelasPersonalizadas;

  const formatarValor = (valorInput: string) => {
    const apenasNumeros = valorInput.replace(/\D/g, '');
    const valorEmCentavos = parseInt(apenasNumeros) || 0;
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

  const handleAdicionarParcela = () => {
    if (!valorParcela || !dataParcela) return;
    
    const valor = obterValorNumerico(valorParcela);
    if (valor <= 0 || valor > valorRestante) return;

    const novaParcela = {
      id: Date.now(),
      numero: parcelasPersonalizadas.length + 1,
      valor: valor,
      data: dataParcela,
      dataFormatada: new Date(dataParcela).toLocaleDateString('pt-BR')
    };

    setParcelasPersonalizadas([...parcelasPersonalizadas, novaParcela]);
    setValorParcela('');
    setDataParcela('');
  };

  const handleRemoverParcela = (id: number) => {
    setParcelasPersonalizadas(parcelasPersonalizadas.filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    const planoPagamento: PaymentPlan = {
      tipo: modoPersonalizado ? 'personalizado' : 'automatico',
      dataInicio: modoPersonalizado ? undefined : dataInicio,
      numeroParcelas: modoPersonalizado ? undefined : parseInt(numeroParcelas),
      intervaloParcelas: modoPersonalizado ? undefined : intervaloParcelas,
      parcelas: modoPersonalizado ? parcelasPersonalizadas : parcelasCalculadas
    };

    // Salvar plano no cache
    updateRequestCache({
      planoPagamento
    });
    
    // Navegar para confirmação
    setLocation('/request/confirmation');
  };

  // Validar se pode avançar - verificar se parcelas não são muito pequenas
  const temErroParcelaMinima = !modoPersonalizado && dataInicio && numeroParcelas && (valorTotal / parseInt(numeroParcelas) < 0.01);
  const podeAvancar = modoPersonalizado 
    ? Math.abs(valorRestante) < 0.01 && parcelasPersonalizadas.length > 0
    : dataInicio && numeroParcelas && parcelasCalculadas.length > 0 && !temErroParcelaMinima;

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
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(48, 48, 48, 0.1);
          background-color: rgba(255, 229, 189, 0.1);
          color: #303030;
          outline: none;
          box-shadow: none;
        }

        .input-limpo:focus {
          outline: none;
          box-shadow: none;
          border-color: rgba(255, 229, 189, 0.8);
        }

        .select-limpo {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(48, 48, 48, 0.1);
          background-color: rgba(255, 229, 189, 0.1);
          color: #303030;
          outline: none;
          box-shadow: none;
          appearance: none;
          border-color: rgba(255, 229, 189, 0.8);
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
                onClick={() => setLocation('/request/reason')}
              >
                <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
              </button>
              
              <span className="text-xl font-bold" style={{ color: '#fffdfa' }}>
                {fundoSelecionado.nome}
              </span>
            </div>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>Plano de retribuição</h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>
              Como você pretende retribuir os <strong>{valorTotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}</strong>?
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6 max-w-md mx-auto">
          
          {/* Card de Resumo */}
          <div className="mb-8">
            <div 
              className="rounded-2xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                borderColor: 'rgba(48, 48, 48, 0.1)',
                borderWidth: '1px'
              }}
            >
              <div className="text-center">
                <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                  Valor solicitado: <strong>{valorSolicitado.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}</strong>
                </p>
                <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                  Taxa de retribuição: <strong>{taxaRetribuicao}%</strong>
                </p>
                <p className="text-lg font-bold mt-2" style={{ color: '#303030' }}>
                  Total a retribuir: {valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Seleção do Tipo de Plano */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#303030' }}>
              Tipo de plano
            </h2>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModoPersonalizado(false)}
                className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative"
                style={{ 
                  backgroundColor: !modoPersonalizado ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
                  borderColor: !modoPersonalizado ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                  borderWidth: !modoPersonalizado ? '2px' : '1px'
                }}
              >
                {!modoPersonalizado && (
                  <div 
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                  >
                    <Check className="w-4 h-4" style={{ color: '#fffdfa' }} />
                  </div>
                )}
                <div className="text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2" style={{ color: '#303030' }} />
                  <span className="text-sm font-bold" style={{ color: '#303030' }}>
                    Automático
                  </span>
                </div>
              </button>

              <button
                onClick={() => setModoPersonalizado(true)}
                className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative"
                style={{ 
                  backgroundColor: modoPersonalizado ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
                  borderColor: modoPersonalizado ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                  borderWidth: modoPersonalizado ? '2px' : '1px'
                }}
              >
                {modoPersonalizado && (
                  <div 
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                  >
                    <Check className="w-4 h-4" style={{ color: '#fffdfa' }} />
                  </div>
                )}
                <div className="text-center">
                  <Edit3 className="w-6 h-6 mx-auto mb-2" style={{ color: '#303030' }} />
                  <span className="text-sm font-bold" style={{ color: '#303030' }}>
                    Personalizado
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Configuração Automática */}
          {!modoPersonalizado && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Configuração automática
              </h3>
              <div 
                className="w-8 h-1 rounded-full mb-6"
                style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
              ></div>
              
              <div className="space-y-4">
                {/* Data de Início */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#303030' }}>
                    Data de início
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="input-limpo"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Número de Parcelas */}
                <CustomSelect
                  label="Número de parcelas"
                  options={opcoesParcelas}
                  value={numeroParcelas}
                  onChange={setNumeroParcelas}
                  placeholder="Selecione o número de parcelas"
                />

                {/* Intervalo das Parcelas */}
                <CustomSelect
                  label="Intervalo das parcelas"
                  options={opcoesIntervalo}
                  value={intervaloParcelas}
                  onChange={setIntervaloParcelas}
                  placeholder="Selecione o intervalo"
                />

                {/* Erro de parcela muito pequena */}
                {dataInicio && numeroParcelas && valorTotal / parseInt(numeroParcelas) < 0.01 && (
                  <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5" style={{ color: '#d32f2f' }} />
                      <span className="text-sm font-semibold" style={{ color: '#d32f2f' }}>
                        Valor muito baixo para dividir em parcelas
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#d32f2f' }}>
                      Cada parcela resultaria em {(valorTotal / parseInt(numeroParcelas)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, 
                      mas o mínimo permitido é R$ 0,01. Reduza o número de parcelas ou aumente o valor solicitado.
                    </p>
                  </div>
                )}

                {/* Preview das Parcelas */}
                {parcelasCalculadas.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3" style={{ color: '#303030' }}>
                      Parcelas calculadas:
                    </h4>
                    <div className="space-y-2">
                      {parcelasCalculadas.map((parcela, index) => (
                        <div 
                          key={index}
                          className="flex justify-between items-center p-3 rounded-lg"
                          style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)' }}
                        >
                          <span className="text-sm" style={{ color: '#303030' }}>
                            {parcela.numero}ª parcela - {parcela.dataFormatada}
                          </span>
                          <span className="text-sm font-bold" style={{ color: '#303030' }}>
                            {parcela.valor.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Configuração Personalizada */}
          {modoPersonalizado && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Parcelas personalizadas
              </h3>
              <div 
                className="w-8 h-1 rounded-full mb-6"
                style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
              ></div>
              
              {/* Adicionar Nova Parcela */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#303030' }}>
                      Valor
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={valorParcela}
                      onChange={(e) => setValorParcela(formatarValor(e.target.value))}
                      placeholder="R$ 0,00"
                      className="input-limpo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#303030' }}>
                      Data
                    </label>
                    <input
                      type="date"
                      value={dataParcela}
                      onChange={(e) => setDataParcela(e.target.value)}
                      className="input-limpo"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleAdicionarParcela}
                  disabled={!valorParcela || !dataParcela || obterValorNumerico(valorParcela) > valorRestante}
                  className="w-full rounded-xl p-3 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: 'rgba(48, 48, 48, 0.1)'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" style={{ color: '#303030' }} />
                    <span style={{ color: '#303030' }}>Adicionar parcela</span>
                  </div>
                </button>
              </div>

              {/* Valor Restante */}
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)' }}>
                <p className="text-sm text-center" style={{ color: '#303030' }}>
                  Valor restante: <strong>{valorRestante.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}</strong>
                </p>
              </div>

              {/* Lista de Parcelas Personalizadas */}
              {parcelasPersonalizadas.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {parcelasPersonalizadas.map((parcela) => (
                    <div 
                      key={parcela.id}
                      className="flex justify-between items-center p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)' }}
                    >
                      <div>
                        <span className="text-sm" style={{ color: '#303030' }}>
                          {parcela.numero}ª parcela - {parcela.dataFormatada}
                        </span>
                        <div className="text-sm font-bold" style={{ color: '#303030' }}>
                          {parcela.valor.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoverParcela(parcela.id)}
                        className="p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{ backgroundColor: 'rgba(253, 107, 97, 0.1)' }}
                      >
                        <X className="w-4 h-4" style={{ color: '#fd6b61' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
            <span>Finalizar solicitação</span>
          </button>
        </div>
      </div>
    </div>
  );
}