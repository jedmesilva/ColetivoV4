
import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react';
import { Fund } from '@shared/schema';
import ComplexGradientBackground from '@/components/ui/complex-gradient-background';
import DistributionOptionCard from '@/components/ui/distribution-option-card';
import InfoCard from '@/components/ui/info-card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const distributionOptions = [
  {
    id: 'proportional',
    title: 'Distribuição Proporcional',
    description: 'As retribuições são distribuídas de acordo com o percentual que cada membro contribuiu para o fundo',
    icon: 'TrendingUp'
  },
  {
    id: 'equal',
    title: 'Distribuição Igualitária', 
    description: 'As retribuições são distribuídas igualmente entre todos os membros do fundo',
    icon: 'Users'
  }
];

export default function FundDistributionSettings() {
  const [, params] = useRoute('/fund/:id/distribution-settings');
  const fundId = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedDistribution, setSelectedDistribution] = useState('proportional');

  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  const saveDistributionMutation = useMutation({
    mutationFn: async ({ distributionType, changeReason }: { distributionType: string; changeReason: string }) => {
      const response = await fetch(`/api/funds/${fundId}/distribution-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: user?.id,
          distributionType,
          changeReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar configuração de distribuição');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Configuração de distribuição salva com sucesso.",
      });
      setLocation(`/fund/${fundId}/settings`);
    },
    onError: (error: Error) => {
      console.error('Erro ao salvar configuração de distribuição:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar a configuração de distribuição.",
        variant: "destructive",
      });
    },
  });

  const handleSaveDistribution = () => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar as configurações.",
        variant: "destructive",
      });
      return;
    }

    const selectedOption = distributionOptions.find(opt => opt.id === selectedDistribution);
    const changeReason = `Atualizou tipo de distribuição para ${selectedOption?.title}`;

    saveDistributionMutation.mutate({
      distributionType: selectedDistribution,
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
    <div className="min-h-screen" style={{ backgroundColor: '#fffdfa' }}>
      {/* Header Section com Múltiplos Gradientes */}
      <ComplexGradientBackground className="relative overflow-hidden">
        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Botão de voltar */}
          <div className="px-6 pt-12 pb-4">
            <button 
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}
              onClick={() => setLocation(`/fund/${fundId}/settings`)}
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>Distribuição</h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>
              Defina como as retribuições são distribuídas
            </p>
          </div>
        </div>
      </ComplexGradientBackground>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pb-24" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6 max-w-lg mx-auto pt-8">
          
          {/* Seção de Configuração */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#303030' }}>Definição de distribuição</h2>
            <div 
              className="w-16 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>
          </div>

          {/* Cards de Opções de Distribuição */}
          <div className="space-y-4 mb-8">
            {distributionOptions.map((option) => (
              <DistributionOptionCard
                key={option.id}
                option={option}
                isSelected={selectedDistribution === option.id}
                onSelect={() => setSelectedDistribution(option.id)}
              />
            ))}
          </div>

          {/* Info Card sobre distribuição */}
          <InfoCard 
            title="O que é a distribuição?"
            message="A Distribuição define como as retribuições recebidas no fundo são contabilizadas para cada membro, impactando diretamente quanto cada um pode solicitar no futuro."
            className="mb-8"
          />

          {/* Exemplos práticos - componentes modulares */}
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#303030' }}>Como funciona na prática</h2>
            <div 
              className="w-16 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>
            
            <div className="space-y-6">
              {distributionOptions.map((option) => (
                <DistributionExampleCard key={option.id} option={option} />
              ))}
            </div>
          </div>

          {/* Card de impacto */}
          <div className="mt-16 mb-8">
            <InfoCard 
              title="Por que isso importa?"
              message="A definição de distribuição afeta diretamente quanto cada membro pode solicitar do fundo, pois determina como as retribuições recebidas no fundo são creditadas para cada membro, aumentando sua capacidade de solicitação futura."
              className="border-2"
            />
          </div>
        </div>
      </div>

      {/* Botão Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-3" style={{ backgroundColor: '#fffdfa' }}>
        <div className="max-w-lg mx-auto">
          <button 
            onClick={handleSaveDistribution}
            disabled={saveDistributionMutation.isPending}
            className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            style={{ 
              background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
            }}
            data-testid="button-save"
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              <span>
                {saveDistributionMutation.isPending ? 'Salvando...' : 'Salvar configuração'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente modular para exemplos de distribuição
function DistributionExampleCard({ option }: { option: typeof distributionOptions[0] }) {
  const isProportional = option.id === 'proportional';
  
  return (
    <div 
      className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01]"
      style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
      data-testid={`example-${option.id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-center sm:text-left flex-shrink-0"
          style={{ 
            background: isProportional ? 
              'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' : 
              'rgba(255, 229, 189, 0.3)' 
          }}
        >
          {option.icon === 'TrendingUp' ? (
            <svg className="w-8 h-8" style={{ color: isProportional ? '#fffdfa' : '#303030' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
          ) : (
            <svg className="w-8 h-8" style={{ color: '#303030' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.994 2.994 0 0 0 17.08 6H16c-.8 0-1.54.37-2.03.97L12 9.5l-5.07-5.07A2.994 2.994 0 0 0 4.84 3.5H3c-1.66 0-3 1.34-3 3v15h2V6.5h1.84L8 10.66V22h2v-9.34l2-2.34L14.5 18H12v4h8z"/>
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#303030' }}>
            {option.title}
          </h3>
          <p className="leading-relaxed mb-4" style={{ color: '#303030' }}>
            {isProportional ? 
              'Na distribuição proporcional, quando retribuições chegam ao fundo, elas aumentam a capacidade de solicitação de cada membro proporcionalmente às suas contribuições históricas.' :
              'Na distribuição igualitária, quando retribuições chegam ao fundo, elas aumentam igualmente a capacidade de solicitação de todos os membros, independentemente de quanto cada um contribuiu.'
            }
          </p>
          <div 
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'rgba(255, 229, 189, 0.2)' }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: '#303030' }}>
              Exemplo: João contribuiu R$600, Maria R$300 e Lucas R$100
            </p>
            <p className="text-sm mb-3" style={{ color: '#303030' }}>
              {isProportional ? (
                <>
                  • João: 60% das contribuições totais<br/>
                  • Maria: 30% das contribuições totais<br/>
                  • Lucas: 10% das contribuições totais
                </>
              ) : (
                <>
                  • 3 membros no fundo<br/>
                  • Cada um recebe 1/3 das retribuições<br/>
                  • Todos têm direito igual às distribuições
                </>
              )}
            </p>
            <p className="text-sm font-medium" style={{ color: '#303030' }}>
              Quando alguém retribuir R$200 ao fundo, isso aumenta a capacidade de solicitação:
            </p>
            <p className="text-sm" style={{ color: '#303030' }}>
              {isProportional ? (
                <>
                  • João pode solicitar +R$120 (60% de R$200)<br/>
                  • Maria pode solicitar +R$60 (30% de R$200)<br/>
                  • Lucas pode solicitar +R$20 (10% de R$200)
                </>
              ) : (
                <>
                  • João pode solicitar +R$66,67 (33,33% de R$200)<br/>
                  • Maria pode solicitar +R$66,67 (33,33% de R$200)<br/>
                  • Lucas pode solicitar +R$66,67 (33,33% de R$200)
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
