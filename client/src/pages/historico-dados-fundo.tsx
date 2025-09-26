import { ArrowLeft, Edit, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";

// Função para buscar histórico de dados do fundo
async function fetchFundDataHistory(fundId: string) {
  const response = await fetch(`/api/funds/${fundId}/data/history`);
  if (!response.ok) {
    throw new Error('Failed to fetch fund data history');
  }
  return response.json();
}

// Função para buscar dados do fundo
async function fetchFund(fundId: string) {
  const response = await fetch(`/api/funds/${fundId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch fund');
  }
  return response.json();
}

// Componente para card de dados do fundo
function DadosFundoCard({ dados, isCurrent = false, isEditable = false, onEdit }: {
  dados: any;
  isCurrent?: boolean;
  isEditable?: boolean;
  onEdit?: () => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div 
      className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01]"
      style={{ 
        backgroundColor: isCurrent ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa',
        borderColor: isCurrent ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
        borderWidth: isCurrent ? '2px' : '1px'
      }}
      data-testid={`card-fund-data-${dados.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Imagem/Ícone do fundo */}
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ 
              backgroundColor: isCurrent ? '#fffdfa' : 'rgba(255, 229, 189, 0.3)'
            }}
            data-testid={`img-fund-${dados.id}`}
          >
            {dados.imageType === 'emoji' ? (
              <span className="text-3xl">{dados.imageValue}</span>
            ) : (
              <img 
                src={dados.imageValue} 
                alt="Imagem do fundo"
                className="w-full h-full rounded-2xl object-cover"
              />
            )}
          </div>
          
          {/* Informações do fundo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 
                className="font-semibold text-lg truncate" 
                style={{ color: '#303030' }}
                data-testid={`text-fund-name-${dados.id}`}
              >
                {dados.name}
              </h4>
              {isCurrent && (
                <span 
                  className="text-xs px-2 py-1 rounded-full font-medium text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                  data-testid="text-current-label"
                >
                  Atual
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#303030', opacity: 0.5 }} />
              <p 
                className="text-sm truncate" 
                style={{ color: '#303030', opacity: 0.7 }}
                data-testid={`text-date-${dados.id}`}
              >
                {formatDate(dados.createdAt)}
              </p>
            </div>
            {dados.changedByName && (
              <p 
                className="text-xs truncate" 
                style={{ color: '#303030', opacity: 0.6 }}
                data-testid={`text-changed-by-${dados.id}`}
              >
                Alterado por {dados.changedByName}
              </p>
            )}
          </div>
        </div>
        
        {isEditable && (
          <button 
            onClick={onEdit}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 ml-2"
            style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
            aria-label="Editar dados"
            data-testid="button-edit-fund-data"
          >
            <Edit className="w-5 h-5" style={{ color: '#303030' }} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function HistoricoDadosFundo() {
  const { id: fundId } = useParams();
  const [, setLocation] = useLocation();

  // Buscar dados do fundo
  const { data: fund } = useQuery({
    queryKey: ['fund', fundId],
    queryFn: () => fetchFund(fundId!),
    enabled: !!fundId,
  });

  // Buscar histórico de dados do fundo
  const { 
    data: dadosHistorico = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['fund-data-history', fundId],
    queryFn: () => fetchFundDataHistory(fundId!),
    enabled: !!fundId,
  });

  const nomeFundo = fund?.name || 'Fundo';
  const dadosAtuais = dadosHistorico.find((dados: any) => dados.isActive);
  const dadosAnteriores = dadosHistorico.filter((dados: any) => !dados.isActive);

  const handleVoltar = () => {
    setLocation(`/fund/${fundId}/settings`);
  };

  const handleEditarDados = () => {
    setLocation(`/fund/${fundId}/edit-data`);
  };

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#fffdfa' }}>
        <div className="p-6 pt-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#303030' }}>
              Erro ao carregar histórico
            </h1>
            <p className="text-lg mb-4" style={{ color: '#303030', opacity: 0.7 }}>
              Não foi possível carregar o histórico de dados do fundo.
            </p>
            <button 
              onClick={handleVoltar}
              className="px-6 py-3 rounded-2xl font-medium transition-colors"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.3)',
                color: '#303030'
              }}
              data-testid="button-back-error"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdfa' }}>
      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradiente Base */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
          }}
        />
        
        {/* Gradiente Invertido - Diagonal Oposta */}
        <div 
          className="absolute inset-0 opacity-70"
          style={{ 
            background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        
        {/* Gradiente Radial do Centro */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{ 
            background: 'radial-gradient(circle at center, #ffc22f, #fa7653, #fd6b61, transparent)' 
          }}
        />
        
        {/* Gradiente Horizontal Invertido */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{ 
            background: 'linear-gradient(270deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
          }}
        />
        
        {/* Gradiente Vertical */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{ 
            background: 'linear-gradient(180deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        
        {/* Gradiente Radial Superior Esquerdo */}
        <div 
          className="absolute inset-0 opacity-45"
          style={{ 
            background: 'radial-gradient(circle at top left, #ffe5bd, #ffc22f, #fa7653, transparent)' 
          }}
        />
        
        {/* Gradiente Radial Inferior Direito */}
        <div 
          className="absolute inset-0 opacity-35"
          style={{ 
            background: 'radial-gradient(circle at bottom right, #fd6b61, #fa7653, #ffc22f, transparent)' 
          }}
        />
        
        {/* Gradiente Diagonal 45 graus */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            background: 'linear-gradient(45deg, #fa7653, #fd6b61, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        
        {/* Gradiente Cônico */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{ 
            background: 'conic-gradient(from 0deg at center, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61, #fffdfa)' 
          }}
        />
        
        {/* Camada de mistura para suavizar */}
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
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>
              Dados do fundo
            </h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>
              Histórico de alterações do <span className="font-bold">{nomeFundo}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-24" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6">
          
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <p className="text-lg" style={{ color: '#303030', opacity: 0.7 }}>
                Carregando histórico...
              </p>
            </div>
          )}

          {/* Seção Dados Atuais */}
          {!isLoading && (
            <div className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#303030' }}>Dados atuais</h2>
                  <div 
                    className="w-16 h-1 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                  ></div>
                </div>
              </div>

              {dadosAtuais && (
                <DadosFundoCard
                  dados={dadosAtuais}
                  isCurrent={true}
                  isEditable={false}
                />
              )}

              {/* Caso não tenha dados atuais */}
              {!dadosAtuais && !isLoading && (
                <div 
                  className="rounded-3xl p-6 border text-center"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)',
                    borderColor: 'rgba(48, 48, 48, 0.1)'
                  }}
                >
                  <p className="text-lg mb-2" style={{ color: '#303030' }}>
                    Nenhum histórico encontrado
                  </p>
                  <p className="text-sm" style={{ color: '#303030', opacity: 0.7 }}>
                    O histórico de dados do fundo ainda não foi criado.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Seção Histórico de Dados */}
          {!isLoading && dadosAnteriores.length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#303030' }}>
                  Alterações anteriores ({dadosAnteriores.length})
                </h3>
                <div 
                  className="w-12 h-1 rounded-full mb-6"
                  style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                ></div>
              </div>

              {/* Lista de Dados Anteriores */}
              <div className="space-y-4">
                {dadosAnteriores.map((dados: any) => (
                  <DadosFundoCard
                    key={dados.id}
                    dados={dados}
                    isCurrent={false}
                    isEditable={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Informação sobre alteração de dados */}
          {!isLoading && (
            <div className="mt-8">
              <div 
                className="rounded-2xl p-4 text-center border"
                style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)', borderColor: 'rgba(48, 48, 48, 0.05)' }}
              >
                <p className="text-sm" style={{ color: '#303030', opacity: 0.7 }}>
                  O nome e imagem do fundo podem ser alterados a qualquer momento.{' '}
                  <span className="font-medium" style={{ color: '#303030' }}>Use o botão abaixo para fazer alterações.</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão de Editar Dados - Fixo na Parte Inferior */}
      {!isLoading && (
        <div className="fixed bottom-0 left-0 right-0 px-6 py-3" style={{ backgroundColor: '#fffdfa' }}>
          <div className="max-w-md mx-auto">
            <button 
              onClick={handleEditarDados}
              className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ 
                background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)'
              }}
              data-testid="button-edit-current-data"
            >
              <div className="flex items-center justify-center gap-2">
                <Edit className="w-5 h-5" />
                <span>Alterar dados atuais</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}