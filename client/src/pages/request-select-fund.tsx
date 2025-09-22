import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Search } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Fund } from "@shared/schema";
import { updateRequestCache } from "@/lib/request-cache";
import { useAuth } from "@/hooks/use-auth";

export default function RequestSelectFund() {
  const [searchTerm, setSearchTerm] = useState('');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Função para voltar de forma inteligente
  const handleGoBack = () => {
    const lastPath = sessionStorage.getItem('lastPath');
    if (lastPath) {
      sessionStorage.removeItem('lastPath'); // Limpar após usar
      setLocation(lastPath);
    } else {
      setLocation('/');
    }
  };

  // Buscar fundos disponíveis onde o usuário é membro
  const { data: funds = [] } = useQuery<Fund[]>({ 
    queryKey: ['/api/funds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/funds?accountId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch funds');
      return response.json();
    },
    enabled: !!user?.id,
  });

  const handleSelecionarFundo = (fund: Fund) => {
    // Salvar fundo selecionado no cache
    updateRequestCache({
      fundId: fund.id,
      fundName: fund.name,
      fundEmoji: fund.fundImageValue || "💰"
    });
    
    // Navegar para definir valor
    setLocation('/request/amount');
  };

  // Filtrar fundos baseado no termo de busca
  const fundsFiltrados = funds.filter(fund =>
    fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fund.objective && fund.objective.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-creme">
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
                onClick={handleGoBack}
              >
                <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
              </button>
              
              <span className="text-xl font-bold" style={{ color: '#fffdfa' }}>
                Solicitar capital
              </span>
            </div>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>Selecionar fundo</h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>
              Escolha o fundo do qual deseja solicitar capital
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32 bg-creme">
        <div className="px-6 max-w-md mx-auto">
          
          {/* Campo de Busca */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4 text-dark">
              Buscar fundos
            </label>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark opacity-50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do fundo..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-dark-light bg-creme text-dark placeholder-dark/50 focus:outline-none focus:border-dark"
              />
            </div>
          </div>

          {/* Lista de Fundos */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4 text-dark">
              Fundos disponíveis ({fundsFiltrados.length})
            </h2>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>
            
            {fundsFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-dark opacity-70">
                  {searchTerm ? 'Nenhum fundo encontrado para sua busca' : 'Nenhum fundo disponível'}
                </p>
              </div>
            ) : (
              fundsFiltrados.map((fund) => (
                <button
                  key={fund.id}
                  onClick={() => handleSelecionarFundo(fund)}
                  className="w-full rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-left bg-creme border-dark-light hover:border-dark"
                >
                  <div className="flex items-center gap-4">
                    {/* Ícone do Fundo */}
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(255, 194, 47, 0.3)' }}
                    >
                      <span className="text-2xl">{fund.fundImageValue || "💰"}</span>
                    </div>
                    
                    {/* Informações do Fundo */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold mb-1 text-dark">
                        {fund.name}
                      </h3>
                      <p className="text-sm text-dark opacity-70 line-clamp-2">
                        {fund.objective || "Fundo de investimento coletivo"}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-dark opacity-60" />
                          <span className="text-sm text-dark opacity-60">
                            Membros ativos
                          </span>
                        </div>
                        <div className="text-sm font-medium text-dark">
                          Fundo disponível
                        </div>
                      </div>
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