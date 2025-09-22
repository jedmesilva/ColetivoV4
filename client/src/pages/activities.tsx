
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Users, Heart, Search } from "lucide-react";

export default function Activities() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const handleBack = () => {
    // Verificar se há uma página salva no sessionStorage, caso contrário vai para conta
    const lastPath = sessionStorage.getItem('lastPath') || '/account';
    setLocation(lastPath);
  };

  return (
    <div className="min-h-screen bg-creme">
      {/* Header */}
      <div className="bg-creme pt-12 pb-6">
        <div className="flex items-center justify-between px-4">
          <button 
            onClick={handleBack}
            className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
            aria-label="Voltar"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6 text-dark" />
          </button>
          <h1 className="text-2xl font-bold text-dark">Atividades</h1>
          <div className="w-12" /> {/* Spacer para centralizar o título */}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pb-6">
        {/* Campo de Busca */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-dark" data-testid="search-title">
            Buscar atividades
          </h2>
          <div 
            className="w-8 h-1 rounded-full mb-6"
            style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
          ></div>
          
          <div className="relative">
            <style>
              {`
                .input-limpo {
                  width: 100%;
                  padding: 1rem 1.5rem;
                  padding-left: 3rem;
                  border-radius: 1rem;
                  border: 1px solid rgba(48, 48, 48, 0.1);
                  font-size: 1.125rem;
                  background-color: rgba(255, 229, 189, 0.1);
                  color: #303030;
                  outline: none;
                  box-shadow: none;
                }

                .input-limpo:focus {
                  outline: none;
                  box-shadow: none;
                  border-color: rgba(48, 48, 48, 0.1);
                }

                .input-limpo::placeholder {
                  color: rgba(48, 48, 48, 0.5);
                }

                .input-limpo:focus-visible {
                  outline: none;
                  box-shadow: none;
                }

                .input-limpo:active,
                .input-limpo:hover {
                  outline: none;
                  box-shadow: none;
                }
              `}
            </style>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o tipo de atividade ou pessoa"
              className="input-limpo"
              data-testid="input-search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#303030', opacity: 0.5 }} />
          </div>
        </div>

        {/* Seção de Atividades */}
        <div className="space-y-4"></div>
          {/* Card de Atividade - Pagamento Recebido */}
          <div 
            className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
            data-testid="activity-received-payment"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                  <ArrowDownToLine className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-dark">Pagamento recebido</h4>
                  <p className="text-sm text-dark opacity-70">Ana Silva • Hoje, 14:32</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-dark">+R$ 150,00</p>
              </div>
            </div>
          </div>

          {/* Card de Atividade - Contribuição */}
          <div 
            className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
            data-testid="activity-contribution"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                  <ArrowUpFromLine className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-dark">Contribuição enviada</h4>
                  <p className="text-sm text-dark opacity-70">Projeto Água Limpa • Ontem, 09:15</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-dark">R$ 50,00</p>
              </div>
            </div>
          </div>

          {/* Card de Atividade - Pagamento Coletivo */}
          <div 
            className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
            data-testid="activity-collective-payment"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                  <Users className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-dark">Pagamento coletivo</h4>
                  <p className="text-sm text-dark opacity-70">Jantar com amigos • 2 dias atrás</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-dark">R$ 75,00</p>
              </div>
            </div>
          </div>

          {/* Card de Atividade - Retribuição */}
          <div 
            className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
            data-testid="activity-reciprocation"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                  <Heart className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-dark">Retribuição enviada</h4>
                  <p className="text-sm text-dark opacity-70">João Santos • 3 dias atrás</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-dark">R$ 25,00</p>
              </div>
            </div>
          </div>

          {/* Card de Atividade - Pagamento Enviado */}
          <div 
            className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
            data-testid="activity-payment-sent"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                  <ArrowUpFromLine className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-dark">Pagamento enviado</h4>
                  <p className="text-sm text-dark opacity-70">Maria Costa • 4 dias atrás, 16:20</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-dark">R$ 100,00</p>
              </div>
            </div>
          </div>

          {/* Card de Atividade - Contribuição Anterior */}
          <div 
            className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
            data-testid="activity-contribution-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                  <ArrowUpFromLine className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-dark">Contribuição enviada</h4>
                  <p className="text-sm text-dark opacity-70">Fundo Comunitário • 1 semana atrás</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-dark">R$ 80,00</p>
              </div>
            </div>
          </div>

          {/* Card de Atividade - Pagamento Coletivo Anterior */}
          <div 
            className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
            data-testid="activity-collective-payment-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                  <Users className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-dark">Pagamento coletivo</h4>
                  <p className="text-sm text-dark opacity-70">Cinema com a turma • 1 semana atrás</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-dark">R$ 45,00</p>
              </div>
            </div>
          </div>

          {/* Card de Atividade - Retribuição Anterior */}
          <div 
            className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
            data-testid="activity-reciprocation-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                  <Heart className="w-6 h-6 text-dark" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-dark">Retribuição recebida</h4>
                  <p className="text-sm text-dark opacity-70">Pedro Lima • 2 semanas atrás</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-dark">+R$ 35,00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
