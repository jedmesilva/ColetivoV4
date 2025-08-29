import { ArrowLeft, Check, Calendar, CreditCard, Edit3, Plus, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getSolicitationCache, updateSolicitationCache } from "@/lib/solicitation-cache";

export default function SolicitarPlano() {
  const [modoPersonalizado, setModoPersonalizado] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [numeroParcelas, setNumeroParcelas] = useState('2');
  const [intervaloParcelas, setIntervaloParcelas] = useState('mensal');
  const [parcelasPersonalizadas, setParcelasPersonalizadas] = useState<Array<{
    id: number;
    numero: number;
    valor: number;
    data: string;
    dataFormatada: string;
  }>>([]);
  const [editandoParcela, setEditandoParcela] = useState<number | null>(null);
  const [valorParcela, setValorParcela] = useState('');
  const [dataParcela, setDataParcela] = useState('');
  const [, setLocation] = useLocation();

  // Dados vindos das telas anteriores
  const [dadosSolicitacao, setDadosSolicitacao] = useState({
    fundo: { nome: '', emoji: '' },
    valorSolicitado: 0,
    motivo: ''
  });

  const taxaRetribuicao = 25; // 25% - taxa de retribuição
  const valorTotal = dadosSolicitacao.valorSolicitado * (taxaRetribuicao / 100);

  useEffect(() => {
    const cached = getSolicitationCache();
    if (!cached || !cached.fundId || !cached.valor || !cached.motivo) {
      setLocation('/solicitar/select-fund');
      return;
    }

    setDadosSolicitacao({
      fundo: {
        nome: cached.fundName || '',
        emoji: cached.fundEmoji || ''
      },
      valorSolicitado: cached.valor,
      motivo: cached.motivo
    });

    // Definir data padrão para próximo mês
    const proximoMes = new Date();
    proximoMes.setMonth(proximoMes.getMonth() + 1);
    setDataInicio(proximoMes.toISOString().split('T')[0]);
  }, [setLocation]);

  // Opções de parcelas e intervalos
  const opcoesParcelas = ['1', '2', '3', '4', '6', '12'];
  const opcoesIntervalo = [
    { value: 'semanal', label: 'Semanal' },
    { value: 'mensal', label: 'Mensal' },
    { value: 'bimestral', label: 'Bimestral' },
    { value: 'trimestral', label: 'Trimestral' }
  ];

  // Calcular parcelas automáticas
  const calcularParcelas = () => {
    if (!dataInicio || !numeroParcelas) return [];
    
    const parcelas = [];
    const valorParcela = valorTotal / parseInt(numeroParcelas);
    const dataBase = new Date(dataInicio);
    
    for (let i = 0; i < parseInt(numeroParcelas); i++) {
      const dataParcela = new Date(dataBase);
      
      if (intervaloParcelas === 'semanal') {
        dataParcela.setDate(dataBase.getDate() + (i * 7));
      } else if (intervaloParcelas === 'mensal') {
        dataParcela.setMonth(dataBase.getMonth() + i);
      } else if (intervaloParcelas === 'bimestral') {
        dataParcela.setMonth(dataBase.getMonth() + (i * 2));
      } else if (intervaloParcelas === 'trimestral') {
        dataParcela.setMonth(dataBase.getMonth() + (i * 3));
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
    const planoRetribuicao = {
      tipo: modoPersonalizado ? 'personalizado' as const : 'automatico' as const,
      dataInicio: modoPersonalizado ? undefined : dataInicio,
      numeroParcelas: modoPersonalizado ? undefined : parseInt(numeroParcelas),
      intervaloParcelas: modoPersonalizado ? undefined : intervaloParcelas,
      parcelas: modoPersonalizado ? parcelasPersonalizadas.map(p => ({
        numero: p.numero,
        valor: p.valor,
        data: p.data
      })) : parcelasCalculadas.map(p => ({
        numero: p.numero,
        valor: p.valor,
        data: p.data
      }))
    };

    // Salvar plano no cache
    updateSolicitationCache({
      planoRetribuicao
    });

    // Avançar para confirmação
    setLocation('/solicitar/confirmacao');
  };

  const handleVoltar = () => {
    setLocation('/solicitar/motivo');
  };

  const podeAvancar = modoPersonalizado 
    ? parcelasPersonalizadas.length > 0 && Math.abs(valorRestante) < 0.01
    : dataInicio && numeroParcelas;

  return (
    <div className="min-h-screen bg-creme">
      <style>{`
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

      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Gradientes múltiplos */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 opacity-70" style={{ 
          background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
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
              
              <span className="text-xl font-bold text-creme">
                {dadosSolicitacao.fundo.nome}
              </span>
            </div>
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme">Plano de retribuição</h1>
            <p className="text-lg opacity-90 text-creme">
              Como você planeja retribuir <strong>{valorTotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}</strong> ao fundo?
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32 bg-creme">
        <div className="px-4 max-w-md mx-auto">
          
          {/* Resumo da Solicitação */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-dark">Resumo da solicitação</h2>
            <div className="w-8 h-1 rounded-full mb-6 gradient-primary"></div>
            
            <div className="rounded-2xl p-4 border bg-white border-bege">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-dark opacity-70">Valor solicitado</span>
                  <span className="font-medium text-dark">{dadosSolicitacao.valorSolicitado.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-dark opacity-70">Taxa de retribuição ({taxaRetribuicao}%)</span>
                  <span className="font-medium text-dark">{valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seletor de Modo */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-dark">Tipo de plano</h2>
            <div className="w-8 h-1 rounded-full mb-6 gradient-primary"></div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModoPersonalizado(false)}
                className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: !modoPersonalizado ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa',
                  borderColor: !modoPersonalizado ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                  borderWidth: !modoPersonalizado ? '2px' : '1px'
                }}
                data-testid="button-automatic-plan"
              >
                <Calendar className="w-6 h-6 mx-auto mb-2 text-dark" />
                <p className="text-sm font-medium text-dark">Automático</p>
              </button>
              
              <button
                onClick={() => setModoPersonalizado(true)}
                className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: modoPersonalizado ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa',
                  borderColor: modoPersonalizado ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                  borderWidth: modoPersonalizado ? '2px' : '1px'
                }}
                data-testid="button-custom-plan"
              >
                <Edit3 className="w-6 h-6 mx-auto mb-2 text-dark" />
                <p className="text-sm font-medium text-dark">Personalizado</p>
              </button>
            </div>
          </div>

          {/* Configuração Automática */}
          {!modoPersonalizado && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-dark">Configuração automática</h3>
              
              <div className="space-y-4">
                {/* Data de Início */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-dark">Data de início</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="select-limpo"
                    data-testid="input-start-date"
                  />
                </div>

                {/* Número de Parcelas */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-dark">Número de parcelas</label>
                  <select
                    value={numeroParcelas}
                    onChange={(e) => setNumeroParcelas(e.target.value)}
                    className="select-limpo"
                    data-testid="select-installments"
                  >
                    {opcoesParcelas.map(opcao => (
                      <option key={opcao} value={opcao}>{opcao} parcela{opcao !== '1' ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Intervalo */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-dark">Intervalo</label>
                  <select
                    value={intervaloParcelas}
                    onChange={(e) => setIntervaloParcelas(e.target.value)}
                    className="select-limpo"
                    data-testid="select-interval"
                  >
                    {opcoesIntervalo.map(opcao => (
                      <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview das Parcelas */}
              {parcelasCalculadas.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3 text-dark">Parcelas calculadas</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {parcelasCalculadas.map((parcela) => (
                      <div key={parcela.numero} className="flex justify-between items-center p-2 rounded-lg bg-white border border-bege">
                        <span className="text-sm text-dark">Parcela {parcela.numero}</span>
                        <div className="text-right">
                          <p className="text-sm font-medium text-dark">{parcela.valor.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}</p>
                          <p className="text-xs text-dark opacity-60">{parcela.dataFormatada}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Configuração Personalizada */}
          {modoPersonalizado && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-dark">Parcelas personalizadas</h3>
              
              {/* Adicionar Nova Parcela */}
              <div className="rounded-2xl p-4 border bg-white border-bege mb-4">
                <h4 className="text-sm font-medium mb-3 text-dark">Adicionar parcela</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={valorParcela}
                      onChange={(e) => setValorParcela(formatarValor(e.target.value))}
                      placeholder="R$ 0,00"
                      className="select-limpo text-center"
                      data-testid="input-installment-amount"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={dataParcela}
                      onChange={(e) => setDataParcela(e.target.value)}
                      className="select-limpo"
                      data-testid="input-installment-date"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleAdicionarParcela}
                  disabled={!valorParcela || !dataParcela || obterValorNumerico(valorParcela) > valorRestante}
                  className="w-full rounded-xl p-3 border border-dashed border-dark opacity-60 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  data-testid="button-add-installment"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4 text-dark" />
                    <span className="text-sm font-medium text-dark">Adicionar parcela</span>
                  </div>
                </button>

                {/* Saldo Restante */}
                <div className="mt-3 p-2 rounded-lg bg-creme">
                  <p className="text-xs text-center text-dark opacity-70">
                    Restante: {valorRestante.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>
              </div>

              {/* Lista de Parcelas */}
              {parcelasPersonalizadas.length > 0 && (
                <div className="space-y-2">
                  {parcelasPersonalizadas.map((parcela) => (
                    <div key={parcela.id} className="flex justify-between items-center p-3 rounded-xl bg-white border border-bege">
                      <div>
                        <p className="text-sm font-medium text-dark">Parcela {parcela.numero}</p>
                        <p className="text-xs text-dark opacity-60">{parcela.dataFormatada}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-dark">{parcela.valor.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}</span>
                        <button
                          onClick={() => handleRemoverParcela(parcela.id)}
                          className="w-6 h-6 rounded-full bg-red-100 border border-red-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
                          data-testid={`button-remove-installment-${parcela.id}`}
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botão de Finalizar - Fixo na Parte Inferior */}
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
            <span>Finalizar solicitação</span>
          </button>
        </div>
      </div>
    </div>
  );
}