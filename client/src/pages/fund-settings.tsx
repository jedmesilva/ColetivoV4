import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Users, Cog, Percent, Target, ChevronRight, Settings, Edit } from "lucide-react";
import { Fund } from "@shared/schema";

export default function FundSettings() {
  const [, params] = useRoute("/fund/:id/settings");
  const fundId = params?.id;
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  
  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(dateObj);
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
          {/* Settings Header Section */}
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center gap-3">
              {/* Ícone das definições */}
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 253, 250, 0.9)' }}
                data-testid="settings-icon"
              >
                <Settings className="w-7 h-7 text-dark" />
              </div>
              
              {/* Título e descrição */}
              <div>
                <h1 className="text-2xl font-bold mb-0.5 text-creme" data-testid="fund-name-settings">
                  {fund.name}
                </h1>
                <p className="text-base opacity-90 text-creme">Definições do fundo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-24 bg-creme">
        <div className="px-4">
          {/* Seção de Configurações */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-dark">Configurações do fundo</h2>
                <div className="w-16 h-1 rounded-full gradient-bar"></div>
              </div>
            </div>

            {/* Grid de Cards de Configuração */}
            <div className="grid grid-cols-1 gap-4">
              
              {/* Card 1: Membros */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] w-full bg-creme border-dark-light"
                data-testid="button-members"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-bege-transparent">
                      <Users className="w-7 h-7 text-dark" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1 text-dark">Membros</h3>
                      <p className="text-sm text-dark opacity-70">Gerir membros do fundo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-dark" />
                </div>
              </button>

              {/* Card 2: Governança */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] w-full bg-creme border-dark-light"
                data-testid="button-governance"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-bege-transparent">
                      <Cog className="w-7 h-7 text-dark" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1 text-dark">Governança</h3>
                      <p className="text-sm text-dark opacity-70">Regras e permissões</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-dark" />
                </div>
              </button>

              {/* Card 3: % de contribuição */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] w-full bg-creme border-dark-light"
                data-testid="button-contribution-percentage"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-bege-transparent">
                      <Percent className="w-7 h-7 text-dark" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1 text-dark">% de contribuição</h3>
                      <p className="text-sm text-dark opacity-70">Definir regra de contribuição</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-dark" />
                </div>
              </button>

              {/* Card 4: % de retribuição */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] w-full bg-creme border-dark-light"
                data-testid="button-reciprocation-percentage"
                onClick={() => setLocation(`/fund/${fundId}/reciprocation-rate`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center gradient-primary">
                      <Percent className="w-7 h-7 text-creme" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1 text-dark">% de retribuição</h3>
                      <p className="text-sm text-dark opacity-70">Definir regra de retribuição</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-dark" />
                </div>
              </button>

              {/* Card 5: % de distribuição */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] w-full bg-creme border-dark-light"
                data-testid="button-distribution-percentage"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-bege-transparent">
                      <Percent className="w-7 h-7 text-dark" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1 text-dark">% de distribuição</h3>
                      <p className="text-sm text-dark opacity-70">Definir regra de distribuição</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-dark" />
                </div>
              </button>

              {/* Card 6: Dados do fundo */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] w-full bg-creme border-dark-light"
                data-testid="button-fund-data"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-bege-transparent">
                      <Edit className="w-7 h-7 text-dark" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1 text-dark">Dados do fundo</h3>
                      <p className="text-sm text-dark opacity-70">Alterar nome e imagem</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-dark" />
                </div>
              </button>

              {/* Card 7: Objetivo do fundo */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] w-full bg-creme border-dark-light"
                data-testid="button-fund-objective"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-bege-transparent">
                      <Target className="w-7 h-7 text-dark" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1 text-dark">Objetivo do fundo</h3>
                      <p className="text-sm text-dark opacity-70">Definir propósito do fundo</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-dark" />
                </div>
              </button>

            </div>
          </div>

          {/* Seção de Informações Rápidas */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2 text-dark">Resumo atual</h3>
              <div className="w-12 h-1 rounded-full mb-6 gradient-bar"></div>
            </div>

            {/* Card de Resumo */}
            <div 
              className="rounded-3xl p-6 border bg-creme border-dark-light"
              data-testid="summary-card"
            >
              <div className="grid grid-cols-2 gap-6">
                {/* Coluna Esquerda */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-1 text-dark opacity-70">Contribuições</p>
                    <p className="text-2xl font-bold text-dark">R$ 15.000</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1 text-dark opacity-70">Retribuições</p>
                    <p className="text-2xl font-bold text-dark">R$ 3.200</p>
                  </div>
                </div>
                
                {/* Coluna Direita */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-1 text-dark opacity-70">Concessões</p>
                    <p className="text-2xl font-bold text-dark">R$ 8.500</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1 text-dark opacity-70">Crescimento</p>
                    <p 
                      className="text-2xl font-bold" 
                      style={{ 
                        background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >+{fund.growthPercentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Data de Criação */}
          <div className="mt-6">
            <div 
              className="rounded-2xl p-4 text-center border"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)', borderColor: 'rgba(48, 48, 48, 0.05)' }}
              data-testid="creation-info"
            >
              <p className="text-sm text-dark opacity-70">
                Criado em <span className="font-medium text-dark">{formatDate(fund.createdAt)}</span> • por <span className="font-medium text-dark">Lucas Junior</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}