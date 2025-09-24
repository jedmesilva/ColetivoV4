import { ArrowLeft, Target, Clock, Edit } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";

// Componente para card de objetivo
function ObjetivoCard({ 
  objetivo, 
  isCurrent = false, 
  isEditable = false, 
  onEdit 
}: {
  objetivo: {
    id: number;
    descricao: string;
    data: string;
    dataFim?: string | null;
    definidoPor?: string;
    isCurrent: boolean;
  };
  isCurrent?: boolean;
  isEditable?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div 
      className={`rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] ${
        isCurrent 
          ? 'border-2 border-opacity-80' 
          : 'border border-dark-light'
      }`}
      style={{ 
        backgroundColor: isCurrent ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa',
        borderColor: isCurrent ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)'
      }}
      data-testid={`card-objetivo-${objetivo.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ 
              backgroundColor: isCurrent ? 
                'rgba(255, 194, 47, 0.3)' : 
                'rgba(255, 229, 189, 0.3)',
              background: isCurrent ? 
                'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' :
                'rgba(255, 229, 189, 0.3)'
            }}
            data-testid={`icon-objetivo-${objetivo.id}`}
          >
            <Target className="w-6 h-6" style={{ color: isCurrent ? '#fffdfa' : '#303030' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-lg text-dark" data-testid={`title-objetivo-${objetivo.id}`}>
                {objetivo.descricao}
              </h4>
              {isCurrent && (
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
              <p className="text-sm text-dark opacity-70" data-testid={`date-objetivo-${objetivo.id}`}>
                {isCurrent ? `Definido em ${objetivo.data}` : `${objetivo.data} - ${objetivo.dataFim}`}
              </p>
            </div>
            {objetivo.definidoPor && (
              <p className="text-xs mt-1 text-dark opacity-60" data-testid={`author-objetivo-${objetivo.id}`}>
                Definido por {objetivo.definidoPor}
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

  // Dados simulados do histórico de objetivos
  const [objetivos] = useState([
    {
      id: 1,
      descricao: "Pagar os custos do time",
      data: "15 de dezembro de 2024",
      dataFim: null, // null indica que é o objetivo atual
      definidoPor: "Lucas Junior",
      isCurrent: true
    },
    {
      id: 2,
      descricao: "Comprar uniformes novos",
      data: "22 de novembro de 2024",
      dataFim: "14 de dezembro de 2024",
      definidoPor: "Maria Silva",
      isCurrent: false
    },
    {
      id: 3,
      descricao: "Equipamentos esportivos",
      data: "10 de outubro de 2024",
      dataFim: "21 de novembro de 2024",
      definidoPor: "João Santos",
      isCurrent: false
    },
    {
      id: 4,
      descricao: "Material de treinamento",
      data: "03 de setembro de 2024",
      dataFim: "09 de outubro de 2024",
      definidoPor: "Carlos Mendes",
      isCurrent: false
    },
    {
      id: 5,
      descricao: "Taxas de inscrição",
      data: "15 de agosto de 2024",
      dataFim: "02 de setembro de 2024",
      definidoPor: "Ana Oliveira",
      isCurrent: false
    }
  ]);

  const nomeFundo = 'Fundo do futebol';
  const objetivoAtual = objetivos.find(obj => obj.isCurrent);
  const objetivosAnteriores = objetivos.filter(obj => !obj.isCurrent);

  const handleEditarObjetivo = () => {
    console.log('Editar objetivo atual');
    // Aqui seria a navegação para tela de edição de objetivo
  };

  const handleVoltar = () => {
    setLocation(`/fund/${fundId}/settings`);
  };

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
              Histórico de objetivos do <span className="font-bold">{nomeFundo}</span>
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

            {objetivoAtual && (
              <ObjetivoCard
                objetivo={objetivoAtual}
                isCurrent={true}
                isEditable={false}
              />
            )}
          </div>

          {/* Seção Histórico de Objetivos */}
          {objetivosAnteriores.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2 text-dark" data-testid="section-anteriores">
                  Objetivos anteriores ({objetivosAnteriores.length})
                </h3>
                <div className="w-12 h-1 rounded-full mb-6 gradient-bar"></div>
              </div>

              {/* Lista de Objetivos Anteriores */}
              <div className="space-y-4" data-testid="list-objetivos-anteriores">
                {objetivosAnteriores.map((objetivo) => (
                  <ObjetivoCard
                    key={objetivo.id}
                    objetivo={objetivo}
                    isCurrent={false}
                    isEditable={false}
                  />
                ))}
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