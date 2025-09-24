import { useState, useEffect } from 'react';
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Check, X, Info, ArrowLeft } from 'lucide-react';
import { Fund } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface RateComponentProps {
  title: string;
  initialValue?: number;
  onRateChange: (value: number) => void;
}

function RateComponent({ title, initialValue = 50, onRateChange }: RateComponentProps) {
  const [isInputMode, setIsInputMode] = useState(false);
  const [sliderValue, setSliderValue] = useState(initialValue);
  const [inputValue, setInputValue] = useState('');
  const [currentRate, setCurrentRate] = useState(initialValue);

  // Update initial values when prop changes
  useEffect(() => {
    setCurrentRate(initialValue);
    if (initialValue <= 100) {
      setSliderValue(initialValue);
    }
  }, [initialValue]);

  const handlePlusClick = () => {
    setInputValue(currentRate.toString());
    setIsInputMode(true);
  };

  const handleConfirm = () => {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0) {
      setCurrentRate(numValue);
      onRateChange(numValue);
      if (numValue <= 100) {
        setSliderValue(numValue);
      }
      setIsInputMode(false);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    setIsInputMode(false);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    setCurrentRate(value);
    onRateChange(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div 
      className="rounded-3xl border p-6 transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
      data-testid="contribution-rate-component"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
          {!isInputMode && (
            <div 
              className="text-4xl font-bold px-3 py-1 rounded-xl inline-block w-fit text-dark bg-bege-transparent"
              data-testid="contribution-rate-display"
            >
              {currentRate}%
            </div>
          )}
          <div className="font-medium text-dark">
            {title}
          </div>
        </div>
        
        {!isInputMode ? (
          <button
            onClick={handlePlusClick}
            className="w-10 h-10 text-creme rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 flex-shrink-0 gradient-primary"
            title="Inserir valor personalizado"
            data-testid="button-custom-contribution-rate"
          >
            <Plus size={16} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 text-dark"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.5)' }}
              title="Confirmar"
              data-testid="button-confirm-contribution-rate"
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancel}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 bg-bege-transparent text-dark"
              title="Cancelar"
              data-testid="button-cancel-contribution-rate"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        {!isInputMode ? (
          <div className="rounded-2xl p-4 bg-bege-light">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-3 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ffc22f 0%, #fa7653 ${sliderValue/2}%, #fd6b61 ${sliderValue}%, rgba(255, 229, 189, 0.3) ${sliderValue}%, rgba(255, 229, 189, 0.3) 100%)`
                }}
                data-testid="contribution-rate-slider"
              />
              <style dangerouslySetInnerHTML={{
                __html: `
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61);
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    border: 2px solid #fffdfa;
                    transition: transform 0.2s ease;
                  }
                  .slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                  }
                  .slider::-webkit-slider-thumb:active {
                    transform: scale(1.15);
                  }
                  .slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61);
                    border-radius: 8px;
                    cursor: pointer;
                    border: 2px solid #fffdfa;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: transform 0.2s ease;
                  }
                  .slider::-moz-range-thumb:hover {
                    transform: scale(1.1);
                  }
                  .slider::-moz-range-thumb:active {
                    transform: scale(1.15);
                  }
                `
              }} />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-4 bg-bege-light">
            <input
              type="number"
              min="0"
              step="0.1"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Digite a taxa..."
              className="w-full bg-transparent text-2xl font-bold focus:outline-none text-dark"
              autoFocus
              data-testid="contribution-rate-input"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function FundContributionRate() {
  const [, params] = useRoute("/fund/:id/contribution-rate");
  const fundId = params?.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [contributionRate, setContributionRate] = useState(50); // Default 50%

  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  // Load current contribution rates
  const { data: contributionRates, isLoading: isLoadingRates } = useQuery({
    queryKey: [`/api/funds/${fundId}/contribution-rates`],
    enabled: !!fundId,
  });

  // Mutation to save contribution rates
  const saveContributionMutation = useMutation({
    mutationFn: async (rateData: any) => {
      const response = await fetch(`/api/funds/${fundId}/contribution-rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save contribution rates');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/funds/${fundId}/contribution-rates`] });
      toast({
        title: "Configurações salvas!",
        description: "A taxa de contribuição foi atualizada com sucesso.",
        variant: "default",
      });
      setLocation(`/fund/${fundId}/settings`);
    },
    onError: () => {
      toast({
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar a taxa. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update state when loading contribution rates
  useEffect(() => {
    if (contributionRates && typeof contributionRates === 'object') {
      const rates = contributionRates as any;
      // Convert from decimal to percentage (0.5000 -> 50)
      const ratePercentage = parseFloat(rates.contributionRate || '0.5000') * 100;
      setContributionRate(ratePercentage);
    }
  }, [contributionRates]);

  // Handle rate changes from the component
  const handleRateChange = (value: number) => {
    setContributionRate(value);
  };

  // Save the contribution rate
  const handleSaveContributionRate = () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar as configurações.",
        variant: "destructive",
      });
      return;
    }

    // Convert from percentage to decimal (50 -> 0.5000)
    const rateDecimal = (contributionRate / 100).toFixed(4);
    
    const changeReason = `Atualizou taxa de contribuição para ${contributionRate}%`;

    saveContributionMutation.mutate({
      contributionRate: rateDecimal,
      changeReason: changeReason
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Carregando...</div>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Fundo não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme">
      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradiente Base */}
        <div className="absolute inset-0 gradient-base" />
        
        {/* Gradiente Invertido - Diagonal Oposta */}
        <div className="absolute inset-0 opacity-70 gradient-overlay-1" />
        
        {/* Gradiente Radial do Centro */}
        <div className="absolute inset-0 opacity-60 gradient-overlay-2" />
        
        {/* Gradiente Horizontal Invertido */}
        <div className="absolute inset-0 opacity-50 gradient-overlay-3" />
        
        {/* Gradiente Vertical */}
        <div className="absolute inset-0 opacity-40 gradient-overlay-4" />
        
        {/* Gradiente Radial Superior Esquerdo */}
        <div className="absolute inset-0 opacity-45 gradient-overlay-5" />
        
        {/* Gradiente Radial Inferior Direito */}
        <div className="absolute inset-0 opacity-35 gradient-overlay-6" />
        
        {/* Gradiente Diagonal 45 graus */}
        <div className="absolute inset-0 opacity-30 gradient-overlay-7" />
        
        {/* Gradiente Cônico */}
        <div className="absolute inset-0 opacity-25 gradient-overlay-8" />
        
        {/* Camada para suavizar o centro */}
        <div className="absolute inset-0 gradient-center-soften" />
        
        {/* Camada de mistura para suavizar */}
        <div className="absolute inset-0 gradient-blend-overlay" />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex justify-between items-center p-4 pt-12">
            <button 
              onClick={() => setLocation(`/fund/${fundId}/settings`)}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Voltar"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-creme" />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-4 pt-0 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme" data-testid="fund-contribution-title">Taxa de contribuição</h1>
            <p className="text-lg opacity-90 text-creme">
              Defina a taxa percentual de contribuição
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pb-24 bg-creme">
        <div className="px-4 max-w-lg mx-auto pt-8">
          
          {/* Seção de Configuração */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-dark">Configuração da taxa</h2>
            <div className="w-16 h-1 rounded-full mb-6 gradient-bar"></div>
          </div>

          <div className="space-y-6">
            <RateComponent title="Taxa de contribuição" initialValue={contributionRate} onRateChange={handleRateChange} />
          </div>

          {/* Explicação sobre a taxa de contribuição */}
          <div className="mt-12 mb-8">
            {/* O que é a taxa de contribuição */}
            <div className="mb-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-2xl bg-bege-transparent">
                  <Info className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-3 text-dark">
                    O que é a taxa de contribuição?
                  </h2>
                  <div className="w-8 h-1 rounded-full mb-4 gradient-bar"></div>
                  <p className="leading-relaxed text-dark">
                    A Taxa de Contribuição é o percentual que define a relação entre o valor que você já 
                    contribuiu para o fundo e o valor máximo que pode solicitar.
                  </p>
                </div>
              </div>
            </div>

            {/* Como funciona na prática */}
            <div className="mt-16 mb-8">
              <h2 className="text-2xl font-bold mb-2 text-dark">Como funciona na prática</h2>
              <div className="w-16 h-1 rounded-full mb-6 gradient-bar"></div>
              
              <div className="space-y-6">
                {/* Taxa 0% */}
                <div 
                  className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
                  data-testid="example-contribution-rate-0"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="text-7xl font-bold rounded-2xl px-4 py-2 text-center sm:text-left bg-bege-transparent text-dark">
                      0%
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-dark">
                        Taxa de contribuição 0%
                      </h3>
                      <p className="leading-relaxed text-dark">
                        Uma taxa de contribuição de 0% significa que você pode solicitar qualquer valor em um fundo 
                        coletivo mesmo sem ter contribuído com aportes anteriormente.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Taxa 100% */}
                <div 
                  className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
                  data-testid="example-contribution-rate-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="text-7xl font-bold rounded-2xl px-4 py-2 text-center sm:text-left bg-bege-transparent text-dark">
                      100%
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-dark">
                        Taxa de contribuição 100%
                      </h3>
                      <p className="leading-relaxed text-dark">
                        Uma taxa de contribuição de 100% significa que você pode solicitar um valor máximo igual ao 
                        que já contribuiu ao fundo coletivo até o momento. Por exemplo: você contribuiu com 
                        R$100, então pode solicitar no máximo R$100.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Taxa 200% */}
                <div 
                  className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
                  data-testid="example-contribution-rate-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="text-7xl font-bold rounded-2xl px-4 py-2 text-center sm:text-left gradient-primary text-creme">
                      200%
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-dark">
                        Taxa de contribuição 200%
                      </h3>
                      <p className="leading-relaxed text-dark">
                        Uma taxa de contribuição de 200% significa que você pode solicitar um valor máximo igual à 
                        metade do que já contribuiu ao fundo coletivo até o momento. Por exemplo: você contribuiu com 
                        R$100, então pode solicitar no máximo R$50.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-creme">
        <div className="max-w-lg mx-auto">
          <button 
            className="w-full rounded-3xl p-4 text-creme font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] gradient-primary"
            onClick={handleSaveContributionRate}
            disabled={saveContributionMutation.isPending}
            data-testid="button-save-contribution-rate"
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              <span>{saveContributionMutation.isPending ? 'Salvando...' : 'Salvar configuração'}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}