import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Bell, Menu, Eye, ArrowLeft, ArrowUp, ArrowDown, Users, CreditCard, Calendar, Heart, Home, User, MessageCircle } from "lucide-react";
import { Fund } from "@shared/schema";
import { updateContributionCache } from "@/lib/contribution-cache";
import { updateRequestCache } from "@/lib/request-cache";

export default function FundDetail() {
  const [, params] = useRoute("/fund/:id");
  const fundId = params?.id;
  const [, setLocation] = useLocation();
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  
  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) {
      return 'Data não informada';
    }
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      return new Intl.DateTimeFormat('pt-BR', {
        month: 'short',
        year: 'numeric'
      }).format(dateObj);
    } catch (error) {
      return 'Data inválida';
    }
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
            <div className="flex items-center gap-3">
              <button 
                className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                aria-label="Voltar"
                onClick={() => setLocation('/')}
                data-testid="button-back"
              >
                <ArrowLeft className="w-6 h-6 text-creme" />
              </button>
              <button 
                className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                aria-label="Menu"
                data-testid="button-menu"
              >
                <Menu className="w-6 h-6 text-creme" />
              </button>
            </div>
            <button 
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Notificações"
              data-testid="button-notifications"
            >
              <Bell className="w-6 h-6 text-creme" />
            </button>
          </div>

          {/* Fund Header Section */}
          <div className="px-4 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {/* Imagem do fundo */}
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 253, 250, 0.9)' }}
                data-testid="fund-emoji-large"
              >
                <span className="text-4xl">{fund.fundImageValue}</span>
              </div>
              
              {/* Nome e descrição do fundo */}
              <div>
                <h1 className="text-3xl font-bold mb-1 text-creme" data-testid="fund-name">
                  {fund.name}
                </h1>
                <p className="text-lg opacity-90 text-creme" data-testid="fund-description">
                  {fund.objective}
                </p>
              </div>
            </div>
          </div>

          {/* Fund Stats Card - Dentro do Header */}
          <div className="mx-4 pb-8">
            <div className="backdrop-blur-custom rounded-3xl p-6 border bg-creme border-dark-light">
              {/* Saldo do Fundo */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-medium text-dark">Saldo do fundo</h2>
                  </div>
                  <div className="w-12 h-1 rounded-full gradient-bar"></div>
                </div>
                <button 
                  className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                  aria-label="Mostrar/ocultar saldo"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  data-testid="button-toggle-balance"
                >
                  <Eye className="w-5 h-5 text-dark" />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-4xl font-bold text-dark" data-testid="fund-balance">
                  {balanceVisible ? formatCurrency("0.00") : "••••••"}
                </h3>
              </div>

              {/* Statistics Grid - Layout Responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {/* Dívidas do Fundo */}
                <button 
                  className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex-1 min-h-[80px] w-full bg-bege-transparent"
                  data-testid="button-debts"
                >
                  <div className="flex items-center gap-3 h-full w-full">
                    <div className="rounded-xl p-2 flex-shrink-0 bg-bege-transparent">
                      <CreditCard className="w-5 h-5 text-dark" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-2xl font-bold text-dark">3</h4>
                      <p className="text-xs text-dark">DÍVIDAS</p>
                    </div>
                  </div>
                </button>

                {/* Minha Contribuição */}
                <div 
                  className="rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] flex-1 min-h-[80px] bg-bege-transparent"
                  data-testid="my-contribution"
                >
                  <div className="flex items-center gap-3 h-full">
                    <div className="rounded-xl p-2 flex-shrink-0 bg-bege-transparent">
                      <ArrowUp className="w-5 h-5 text-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-2xl font-bold text-dark">R$ 850</h4>
                      <p className="text-xs text-dark">CONTRIBUIÇÃO</p>
                    </div>
                  </div>
                </div>

                {/* Membros */}
                <div 
                  className="col-span-1 sm:col-span-2 lg:col-span-1 rounded-2xl p-4 transition-all duration-200 hover:scale-[1.01] min-h-[80px] bg-bege-transparent"
                  data-testid="fund-members-detail"
                >
                  <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="rounded-xl p-2 flex-shrink-0 bg-bege-transparent">
                        <Users className="w-5 h-5 text-dark" />
                      </div>
                      <div className="flex-shrink-0">
                        <h4 className="text-2xl font-bold text-dark">5</h4>
                        <p className="text-xs text-dark">MEMBROS</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Calendar className="w-4 h-4 text-dark" />
                      <span className="text-sm whitespace-nowrap text-dark opacity-80">
                        {formatDate(fund.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-6 pb-24 bg-creme">
        <div className="px-4">
          {/* Seção de Ações */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-dark">Ações</h2>
                <div className="w-16 h-1 rounded-full gradient-bar"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              {/* Botão Contribuir */}
              <button 
                onClick={() => {
                  // Salvar a página atual antes de navegar
                  sessionStorage.setItem('lastPath', `/fund/${fund.id}`);
                  // Pré-selecionar o fundo atual para contribuição
                  updateContributionCache({
                    fundId: fund.id,
                    fundName: fund.name,
                    fundEmoji: fund.fundImageValue
                  });
                  setLocation('/contribute/amount');
                }}
                className="rounded-3xl p-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] gradient-primary text-creme"
                data-testid="button-contribute"
              >
                <div className="flex flex-col items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}
                  >
                    <ArrowUp className="w-6 h-6 text-creme" />
                  </div>
                  <span className="text-sm font-medium text-creme">Contribuir</span>
                </div>
              </button>

              {/* Botão Solicitar */}
              <button 
                onClick={() => {
                  // Salvar a página atual antes de navegar
                  sessionStorage.setItem('lastPath', `/fund/${fund.id}`);
                  // Pré-selecionar o fundo atual para solicitação
                  updateRequestCache({
                    fundId: fund.id,
                    fundName: fund.name,
                    fundEmoji: fund.fundImageValue
                  });
                  setLocation('/request/amount');
                }}
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-creme border-dark-light"
                data-testid="button-request"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <ArrowDown className="w-6 h-6 text-dark" />
                  </div>
                  <span className="text-sm font-medium text-dark">Solicitar</span>
                </div>
              </button>

              {/* Botão Retribuir */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-creme border-dark-light"
                data-testid="button-reciprocate"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <Heart className="w-6 h-6 text-dark" />
                  </div>
                  <span className="text-sm font-medium text-dark">Retribuir</span>
                </div>
              </button>
            </div>
          </div>

          {/* Seção de Atividades do Fundo */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2 text-dark">Atividades do fundo</h3>
              <div className="w-12 h-1 rounded-full mb-6 gradient-bar"></div>
            </div>

            {/* Card de Atividade - Nova Contribuição */}
            <div 
              className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
              data-testid="activity-contribution-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <ArrowUp className="w-6 h-6 text-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-dark">Contribuição recebida</h4>
                    <p className="text-sm text-dark opacity-70">Carlos Mendes • Hoje, 16:45</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-dark">+R$ 200,00</p>
                </div>
              </div>
            </div>

            {/* Card de Atividade - Pagamento */}
            <div 
              className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
              data-testid="activity-payment-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <ArrowDown className="w-6 h-6 text-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-dark">Pagamento realizado</h4>
                    <p className="text-sm text-dark opacity-70">Material esportivo • Ontem, 10:30</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-dark">-R$ 450,00</p>
                </div>
              </div>
            </div>

            {/* Card de Atividade - Nova Contribuição */}
            <div 
              className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
              data-testid="activity-contribution-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <ArrowUp className="w-6 h-6 text-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-dark">Contribuição recebida</h4>
                    <p className="text-sm text-dark opacity-70">Ana Silva • 2 dias atrás, 14:20</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-dark">+R$ 150,00</p>
                </div>
              </div>
            </div>

            {/* Card de Atividade - Novo Membro */}
            <div 
              className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
              data-testid="activity-member-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <Users className="w-6 h-6 text-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-dark">Novo membro adicionado</h4>
                    <p className="text-sm text-dark opacity-70">Pedro Santos • 3 dias atrás, 11:15</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full gradient-primary">
                    <span className="text-xs font-medium text-creme">+1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de Atividade - Retirada */}
            <div 
              className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
              data-testid="activity-withdrawal-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <ArrowDown className="w-6 h-6 text-dark" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-dark">Retirada autorizada</h4>
                    <p className="text-sm text-dark opacity-70">João Oliveira • 5 dias atrás, 09:45</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-dark">-R$ 300,00</p>
                </div>
              </div>
            </div>

            {/* Botão Ver Mais */}
            <div className="pt-4">
              <button 
                className="w-full rounded-3xl p-4 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] bg-creme border-dark-light"
                data-testid="button-view-all-activities"
              >
                <span className="text-sm font-medium text-dark">Ver todas as atividades</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Menu */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50">
        <div 
          className="mb-4 rounded-3xl px-6 py-4 backdrop-blur-strong border shadow-xl border-dark-light"
          style={{ backgroundColor: 'rgba(255, 253, 250, 0.95)' }}
          data-testid="bottom-navigation-detail"
        >
          <div className="flex items-center gap-4">
            {/* Lado Esquerdo - Home */}
            <button 
              className="rounded-2xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 bg-bege-transparent"
              aria-label="Início"
              onClick={() => setActiveNav(activeNav === 'home' ? null : 'home')}
              data-testid="button-home-nav"
            >
              <Home className="w-6 h-6 text-dark" />
              <span className="text-sm font-medium whitespace-nowrap text-dark">
                Início
              </span>
            </button>

            {/* Centro - Botão Chat */}
            <button 
              className="rounded-2xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 bg-bege-transparent"
              aria-label="Chat"
              onClick={() => {
                setActiveNav(activeNav === 'chat' ? null : 'chat');
                setLocation(`/fund/${fundId}/chat`);
              }}
              data-testid="button-chat-nav"
            >
              <MessageCircle className="w-6 h-6 text-dark" />
              {activeNav === 'chat' && (
                <span className="text-sm font-medium whitespace-nowrap text-dark">
                  Chat
                </span>
              )}
            </button>

            {/* Lado Direito - Avatar do Usuário */}
            <button 
              className="rounded-2xl p-1 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 gradient-primary"
              aria-label="Perfil do usuário"
              onClick={() => {
                setActiveNav(activeNav === 'profile' ? null : 'profile');
                setLocation(`/fund/${fundId}/settings`);
              }}
              data-testid="button-profile-nav"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-creme">
                <User className="w-5 h-5 text-dark" />
              </div>
              {activeNav === 'profile' && (
                <span className="text-sm font-medium whitespace-nowrap pr-2 text-creme">
                  Definições
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}