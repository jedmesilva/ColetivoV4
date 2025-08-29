import { useState } from 'react';
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Check, Users, Shield, Vote, Info, ArrowLeft } from 'lucide-react';
import { Fund } from "@shared/schema";

interface QuorumSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function QuorumSlider({ value, onChange }: QuorumSliderProps) {
  const formatQuorumDescription = (quorumValue: number) => {
    if (quorumValue <= 50) {
      return `pelo menos ${quorumValue}% dos votantes votam a favor`;
    } else {
      return `a maioria dos votantes votam a favor (${quorumValue}% ou mais)`;
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-dark">
          Quórum mínimo
        </span>
        <span className="text-lg font-bold px-2 py-1 rounded-lg bg-bege-transparent text-dark">
          {value}%
        </span>
      </div>
      <div className="rounded-xl p-3 bg-bege-light">
        <input
          type="range"
          min="1"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #ffc22f 0%, #fa7653 ${value/2}%, #fd6b61 ${value}%, rgba(255, 229, 189, 0.3) ${value}%, rgba(255, 229, 189, 0.3) 100%)`
          }}
          data-testid="quorum-slider"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              background: linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61);
              border-radius: 6px;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              border: 2px solid #fffdfa;
              transition: transform 0.2s ease;
            }
            .slider::-webkit-slider-thumb:hover {
              transform: scale(1.1);
            }
            .slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              background: linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61);
              border-radius: 6px;
              cursor: pointer;
              border: 2px solid #fffdfa;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              transition: transform 0.2s ease;
            }
            .slider::-moz-range-thumb:hover {
              transform: scale(1.1);
            }
          `
        }} />
      </div>
      <p className="text-sm mt-2" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
        Decisões são aprovadas quando {formatQuorumDescription(value)}
      </p>
    </div>
  );
}

export default function FundGovernance() {
  const [, params] = useRoute("/fund/:id/governance");
  const fundId = params?.id;
  const [, setLocation] = useLocation();
  
  const [selectedGovernance, setSelectedGovernance] = useState('quorum');
  const [quorumValue, setQuorumValue] = useState(60);
  const [onlyAdminsVote, setOnlyAdminsVote] = useState(false);

  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  const governanceOptions = [
    {
      id: 'quorum',
      title: 'Quórum Mínimo',
      description: 'Decisões aprovadas quando um percentual específico dos votantes votam a favor',
      icon: Users,
      hasSlider: true
    },
    {
      id: 'unanimous',
      title: 'Aprovação Unânime',
      description: 'Todas as decisões precisam ser aprovadas por 100% dos votantes',
      icon: Vote,
      hasSlider: false
    }
  ];

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
            <h1 className="text-3xl font-bold mb-2 text-creme" data-testid="fund-governance-title">Definir governança</h1>
            <p className="text-lg opacity-90 text-creme">
              Configure as regras de votação e aprovação do fundo
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pb-24 bg-creme">
        <div className="px-4 max-w-lg mx-auto pt-8">
          
          {/* Seção de Tipo de Aprovação */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-dark">Tipo de aprovação</h2>
            <div className="w-16 h-1 rounded-full mb-6 gradient-bar"></div>
          </div>

          {/* Cards de Opções de Governança */}
          <div className="space-y-4 mb-8">
            {governanceOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = selectedGovernance === option.id;
              
              return (
                <div key={option.id}>
                  <button
                    onClick={() => setSelectedGovernance(option.id)}
                    className="w-full rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] text-left relative"
                    style={{ 
                      backgroundColor: isSelected ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa',
                      borderColor: isSelected ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                      borderWidth: isSelected ? '2px' : '1px'
                    }}
                    data-testid={`governance-option-${option.id}`}
                  >
                    {/* Check icon para selecionado */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center gradient-primary">
                        <Check className="w-4 h-4 text-creme" />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4 pr-8">
                      <div 
                        className="p-3 rounded-2xl flex-shrink-0"
                        style={{ 
                          backgroundColor: isSelected ? 
                            'rgba(255, 194, 47, 0.2)' : 
                            'rgba(255, 229, 189, 0.3)' 
                        }}
                      >
                        <IconComponent className="w-6 h-6 text-dark" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-dark">
                          {option.title}
                        </h3>
                        <p className="leading-relaxed text-dark">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Slider para Quórum Mínimo */}
                  {isSelected && option.hasSlider && (
                    <div 
                      className="mt-4 rounded-2xl p-4 border"
                      style={{ 
                        backgroundColor: 'rgba(255, 229, 189, 0.1)',
                        borderColor: 'rgba(255, 229, 189, 0.3)'
                      }}
                    >
                      <QuorumSlider value={quorumValue} onChange={setQuorumValue} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Seção de Restrição de Votantes */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-dark">Quem pode votar</h2>
            <div className="w-16 h-1 rounded-full mb-6 gradient-bar"></div>
            
            <div className="space-y-4">
              {/* Todos os membros */}
              <button
                onClick={() => setOnlyAdminsVote(false)}
                className="w-full rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] text-left relative"
                style={{ 
                  backgroundColor: !onlyAdminsVote ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa',
                  borderColor: !onlyAdminsVote ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                  borderWidth: !onlyAdminsVote ? '2px' : '1px'
                }}
                data-testid="voter-option-all-members"
              >
                {/* Check icon para selecionado */}
                {!onlyAdminsVote && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center gradient-primary">
                    <Check className="w-4 h-4 text-creme" />
                  </div>
                )}
                
                <div className="flex items-start gap-4 pr-8">
                  <div 
                    className="p-3 rounded-2xl flex-shrink-0"
                    style={{ 
                      backgroundColor: !onlyAdminsVote ? 
                        'rgba(255, 194, 47, 0.2)' : 
                        'rgba(255, 229, 189, 0.3)' 
                    }}
                  >
                    <Users className="w-6 h-6 text-dark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-dark">
                      Todos os membros
                    </h3>
                    <p className="leading-relaxed text-dark">
                      Todos os membros do fundo podem votar nas decisões
                    </p>
                  </div>
                </div>
              </button>

              {/* Apenas administradores */}
              <button
                onClick={() => setOnlyAdminsVote(true)}
                className="w-full rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] text-left relative"
                style={{ 
                  backgroundColor: onlyAdminsVote ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa',
                  borderColor: onlyAdminsVote ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
                  borderWidth: onlyAdminsVote ? '2px' : '1px'
                }}
                data-testid="voter-option-admins-only"
              >
                {/* Check icon para selecionado */}
                {onlyAdminsVote && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center gradient-primary">
                    <Check className="w-4 h-4 text-creme" />
                  </div>
                )}
                
                <div className="flex items-start gap-4 pr-8">
                  <div 
                    className="p-3 rounded-2xl flex-shrink-0"
                    style={{ 
                      backgroundColor: onlyAdminsVote ? 
                        'rgba(255, 194, 47, 0.2)' : 
                        'rgba(255, 229, 189, 0.3)' 
                    }}
                  >
                    <Shield className="w-6 h-6 text-dark" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-dark">
                      Apenas administradores
                    </h3>
                    <p className="leading-relaxed text-dark">
                      Apenas administradores podem votar nas decisões do fundo
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Seção Informativa */}
          <div className="mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl flex-shrink-0 bg-bege-transparent">
                <Info className="w-6 h-6 text-dark" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3 text-dark">
                  Como funciona a governança?
                </h2>
                <div className="w-8 h-1 rounded-full mb-4 gradient-bar"></div>
                <p className="leading-relaxed text-dark">
                  A governança define como as decisões importantes do fundo são tomadas, como alterações 
                  nas regras, aprovação de solicitações e mudanças na administração. Escolha o modelo 
                  que melhor se adequa ao seu grupo.
                </p>
              </div>
            </div>
          </div>

          {/* Resumo de Governança */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-dark">Resumo de governança</h2>
            
            <div 
              className="rounded-3xl p-6 border"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                borderColor: 'rgba(255, 229, 189, 0.3)' 
              }}
              data-testid="governance-summary"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-2xl flex-shrink-0" style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}>
                  <Info className="w-6 h-6 text-dark" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3 text-dark">
                    Como funcionará a governança do seu fundo:
                  </h3>
                  
                  {/* Descrição dinâmica baseada nas seleções */}
                  <div className="space-y-3">
                    {/* Quem pode votar */}
                    <p className="leading-relaxed text-dark">
                      <span className="font-semibold">Votantes:</span>{' '}
                      {onlyAdminsVote 
                        ? 'Apenas os administradores do fundo poderão votar nas decisões.'
                        : 'Todos os membros do fundo poderão votar nas decisões.'
                      }
                    </p>
                    
                    {/* Tipo de aprovação */}
                    <p className="leading-relaxed text-dark">
                      <span className="font-semibold">Aprovação:</span>{' '}
                      {selectedGovernance === 'quorum' 
                        ? `As decisões serão aprovadas quando pelo menos ${quorumValue}% dos ${onlyAdminsVote ? 'administradores' : 'membros'} votantes votarem a favor.`
                        : `Todas as decisões precisarão ser aprovadas por 100% dos ${onlyAdminsVote ? 'administradores' : 'membros'} votantes.`
                      }
                    </p>
                    
                    {/* Exemplo prático específico */}
                    <div className="mt-4 p-4 rounded-2xl" style={{ backgroundColor: 'rgba(255, 229, 189, 0.2)' }}>
                      <p className="text-sm font-medium mb-2 text-dark">
                        Exemplo prático:
                      </p>
                      <p className="text-sm leading-relaxed text-dark">
                        {selectedGovernance === 'quorum' 
                          ? onlyAdminsVote
                            ? (() => {
                                const scenario1Voters = 2;
                                const scenario1Needed = Math.ceil(scenario1Voters * quorumValue / 100);
                                const scenario2Voters = 3;
                                const scenario2Needed = Math.ceil(scenario2Voters * quorumValue / 100);
                                return `Fundo com 3 administradores: se ${scenario1Voters} votarem, ${scenario1Needed} ${scenario1Needed === 1 ? 'precisa votar' : 'precisam votar'} a favor. Se todos os ${scenario2Voters} votarem, ${scenario2Needed} ${scenario2Needed === 1 ? 'precisa votar' : 'precisam votar'} a favor.`;
                              })()
                            : (() => {
                                const scenario1Voters = 6;
                                const scenario1Needed = Math.ceil(scenario1Voters * quorumValue / 100);
                                const scenario2Voters = 10;
                                const scenario2Needed = Math.ceil(scenario2Voters * quorumValue / 100);
                                return `Fundo com 10 membros: se ${scenario1Voters} votarem, ${scenario1Needed} ${scenario1Needed === 1 ? 'precisa votar' : 'precisam votar'} a favor. Se todos os ${scenario2Voters} votarem, ${scenario2Needed} ${scenario2Needed === 1 ? 'precisa votar' : 'precisam votar'} a favor.`;
                              })()
                          : onlyAdminsVote
                            ? 'Fundo com 3 administradores: todos votantes precisam votar a favor. Se 2 votarem, ambos devem votar a favor.'
                            : 'Fundo com 10 membros: todos votantes precisam votar a favor. Se 7 votarem, todos os 7 devem votar a favor.'
                        }
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
            onClick={() => setLocation(`/fund/${fundId}/settings`)}
            data-testid="button-save-governance"
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              <span>Salvar configuração</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}