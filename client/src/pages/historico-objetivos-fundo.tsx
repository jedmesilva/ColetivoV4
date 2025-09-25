import { ArrowLeft, Target, Clock, Edit } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Fund, FundObjectiveHistory } from "@shared/schema";

// Interface para o objetivo processado para exibição
interface ProcessedObjective {
  id: string;
  description: string;
  icon?: string;
  type: 'standard' | 'custom';
  createdAt: string;
  changedByName?: string;
  isActive: boolean;
}

// Componente para card de objetivo
function ObjetivoCard({ 
  objective, 
  isActive = false, 
  isEditable = false, 
  onEdit 
}: {
  objective: ProcessedObjective;
  isActive?: boolean;
  isEditable?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div 
      className={`rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] ${
        isActive 
          ? 'border-2 border-opacity-80' 
          : 'border border-dark-light'
      }`}
      style={{ 
        backgroundColor: isActive ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa',
        borderColor: isActive ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)'
      }}
      data-testid={`card-objetivo-${objective.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ 
              backgroundColor: isActive ? 
                'rgba(255, 194, 47, 0.3)' : 
                'rgba(255, 229, 189, 0.3)',
              background: isActive ? 
                'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' :
                'rgba(255, 229, 189, 0.3)'
            }}
            data-testid={`icon-objetivo-${objective.id}`}
          >
            {/* Usar emoji se disponível, senão usar ícone Target */}
            {objective.icon && objective.icon.length <= 4 && !/^[a-zA-Z]/.test(objective.icon) ? (
              <span className="text-2xl">{objective.icon}</span>
            ) : (
              <Target className="w-6 h-6" style={{ color: isActive ? '#fffdfa' : '#303030' }} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-lg text-dark" data-testid={`title-objetivo-${objective.id}`}>
                {objective.description}
              </h4>
              {isActive && (
                <span 
                  className="text-xs px-2 py-1 rounded-full font-medium text-white"
                  style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                  data-testid="badge-atual"
                >
                  Atual
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-dark opacity-50" />
              <p className="text-sm text-dark opacity-70" data-testid={`date-objetivo-${objective.id}`}>
                Definido em {new Date(objective.createdAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long', 
                  year: 'numeric'
                })}
              </p>
            </div>
            {objective.changedByName && (
              <p className="text-xs mt-1 text-dark opacity-60" data-testid={`author-objetivo-${objective.id}`}>
                Definido por {objective.changedByName}
              </p>
            )}
          </div>
        </div>
        
        {isEditable && (
          <button 
            onClick={onEdit}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
            aria-label="Editar objetivo"
            data-testid="button-edit-objetivo"
          >
            <Edit className="w-5 h-5 text-dark" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function HistoricoObjetivosFundoScreen() {
  const [, params] = useRoute("/fund/:id/historico-objetivos");
  const fundId = params?.id;
  const [, setLocation] = useLocation();

  // Buscar dados do fundo
  const { data: fund, isLoading: fundLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  // Buscar histórico de objetivos
  const { data: objectiveHistory = [], isLoading: historyLoading } = useQuery<FundObjectiveHistory[]>({
    queryKey: ['/api/funds', fundId, 'objective-history'],
    enabled: !!fundId,
  });

  // Processar dados para exibição
  const processedObjectives = objectiveHistory.map((item: any) => {
    const isStandard = !!item.objective_option_id;
    const description = isStandard 
      ? item.fund_objective_options?.title || 'Objetivo padrão'
      : item.custom_objective || 'Objetivo personalizado';
    const icon = isStandard 
      ? item.fund_objective_options?.icon
      : item.custom_icon;
    
    return {
      id: item.id,
      description,
      icon,
      type: isStandard ? 'standard' : 'custom' as 'standard' | 'custom',
      createdAt: item.created_at,
      changedByName: item.changed_by_account?.full_name,
      isActive: item.is_active
    } as ProcessedObjective;
  });

  const currentObjective = processedObjectives.find(obj => obj.isActive);
  const previousObjectives = processedObjectives.filter(obj => !obj.isActive);

  const handleEditarObjetivo = () => {
    setLocation(`/fund/${fundId}/edit-objective`);
  };

  const handleVoltar = () => {
    setLocation(`/fund/${fundId}/settings`);
  };

  // Loading state
  if (fundLoading || historyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Carregando histórico de objetivos...</div>
      </div>
    );
  }

  // Error state - fund not found
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
        
        {/* Camada de mistura para suavizar */}
        <div className="absolute inset-0 gradient-blend-overlay" />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex justify-between items-center p-6 pt-12">
            <button 
              onClick={handleVoltar}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
              aria-label="Voltar"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme" data-testid="page-title">
              Objetivo do fundo
            </h1>
            <p className="text-lg opacity-90 text-creme" data-testid="page-subtitle">
              Histórico de objetivos do <span className="font-bold">{fund.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-24 bg-creme">
        <div className="px-6">
          
          {/* Seção Objetivo Atual */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-dark" data-testid="section-atual">
                  Objetivo atual
                </h2>
                <div className="w-16 h-1 rounded-full gradient-bar"></div>
              </div>
            </div>

            {currentObjective && (
              <ObjetivoCard
                objective={currentObjective}
                isActive={true}
                isEditable={false}
              />
            )}
            
            {!currentObjective && (
              <div 
                className="rounded-3xl p-6 border text-center"
                style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
                data-testid="no-current-objective"
              >
                <Target className="w-12 h-12 mx-auto mb-3 text-dark opacity-30" />
                <p className="text-dark opacity-70">Nenhum objetivo atual definido</p>
              </div>
            )}
          </div>

          {/* Seção Histórico de Objetivos */}
          {previousObjectives.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2 text-dark" data-testid="section-anteriores">
                  Objetivos anteriores ({previousObjectives.length})
                </h3>
                <div className="w-12 h-1 rounded-full mb-6 gradient-bar"></div>
              </div>

              {/* Lista de Objetivos Anteriores */}
              <div className="space-y-4" data-testid="list-objetivos-anteriores">
                {previousObjectives.map((objective) => (
                  <ObjetivoCard
                    key={objective.id}
                    objective={objective}
                    isActive={false}
                    isEditable={false}
                  />
                ))}
              </div>
            </div>
          )}
          
          {previousObjectives.length === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2 text-dark" data-testid="section-anteriores">
                  Objetivos anteriores
                </h3>
                <div className="w-12 h-1 rounded-full mb-6 gradient-bar"></div>
              </div>
              
              <div 
                className="rounded-3xl p-6 border text-center"
                style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
                data-testid="no-previous-objectives"
              >
                <Clock className="w-12 h-12 mx-auto mb-3 text-dark opacity-30" />
                <p className="text-dark opacity-70">Ainda não há objetivos anteriores para este fundo</p>
              </div>
            </div>
          )}

          {/* Informação sobre alteração de objetivos */}
          <div className="mt-8">
            <div 
              className="rounded-2xl p-4 text-center border"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)', borderColor: 'rgba(48, 48, 48, 0.05)' }}
              data-testid="info-alterar-objetivo"
            >
              <p className="text-sm text-dark opacity-70">
                O objetivo do fundo pode ser alterado a qualquer momento.{' '}
                <span className="font-medium text-dark">Use o botão abaixo para definir um novo objetivo.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Editar Objetivo - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-3 bg-creme">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleEditarObjetivo}
            className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] gradient-primary"
            data-testid="button-alterar-objetivo"
          >
            <div className="flex items-center justify-center gap-2">
              <Edit className="w-5 h-5" />
              <span>Alterar objetivo atual</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}