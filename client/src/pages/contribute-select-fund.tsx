import { ArrowLeft, Settings, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { updateContributionCache } from "@/lib/contribution-cache";
import { Fund } from "@shared/schema";

export default function ContributeSelectFund() {
  const [, setLocation] = useLocation();

  // Buscar fundos disponíveis
  const { data: funds = [] } = useQuery<Fund[]>({ 
    queryKey: ['/api/funds']
  });

  const handleSelecionarFundo = (fund: Fund) => {
    // Salvar fundo selecionado no cache
    updateContributionCache({
      fundId: fund.id,
      fundName: fund.name,
      fundEmoji: fund.emoji
    });
    
    // Navegar para definir valor
    setLocation('/contribute/amount');
  };

  return (
    <div className="min-h-screen bg-creme">
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
        
        {/* Camadas adicionais de gradiente */}
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

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex justify-between items-center p-4 pt-12">
            <button 
              onClick={() => setLocation('/')}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Voltar"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-creme" />
            </button>
            
            <button 
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Configurações"
              data-testid="button-settings"
            >
              <Settings className="w-6 h-6 text-creme" />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme">Fazer contribuição</h1>
            <p className="text-lg opacity-90 text-creme">Selecione um fundo para contribuir</p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-6 pb-8 bg-creme">
        <div className="px-4">
          
          {/* Seção de Fundos Disponíveis */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-dark">Seus fundos coletivos</h2>
            <div className="w-16 h-1 rounded-full gradient-bar"></div>
          </div>

          {/* Lista de Fundos */}
          <div className="space-y-4" data-testid="funds-list">
            {funds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-dark mb-4">Nenhum fundo encontrado</p>
                <p className="text-sm text-dark opacity-60">Crie seu primeiro fundo coletivo para começar a contribuir!</p>
              </div>
            ) : (
              funds.map((fund: Fund) => (
                <button
                  key={fund.id}
                  onClick={() => handleSelecionarFundo(fund)}
                  className="w-full rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] bg-white border-bege"
                  data-testid={`fund-option-${fund.id}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Ícone do Fundo */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-bege-transparent">
                      <span className="text-2xl">{fund.emoji}</span>
                    </div>
                    
                    {/* Nome e Descrição */}
                    <div className="flex-1 text-left">
                      <h3 className="text-xl font-bold mb-1 text-dark">{fund.name}</h3>
                      <p className="text-sm text-dark opacity-70">{fund.description}</p>
                    </div>
                    
                    {/* Seta indicativa de navegação */}
                    <div className="flex-shrink-0">
                      <ChevronRight className="w-6 h-6 text-dark opacity-40" />
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}