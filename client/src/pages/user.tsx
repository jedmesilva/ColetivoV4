import { useState } from "react";
import { useLocation } from "wouter";
import { Bell, Menu, Settings, Copy, ArrowDownToLine, ArrowUpFromLine, ArrowUp, User, CreditCard, Heart, Users, History } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";

export default function UserProfile() {
  const [, setLocation] = useLocation();
  
  const handleCopyKey = () => {
    navigator.clipboard.writeText('Lucas@ColetivoBank.app');
    // Aqui você poderia adicionar um toast de confirmação
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
        
        {/* Camada para suavizar o centro */}
        <div className="absolute inset-0 gradient-center-soften" />
        
        {/* Camada de mistura para suavizar */}
        <div className="absolute inset-0 gradient-blend-overlay" />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex justify-between items-center px-4 pt-12 pb-6">
            <button 
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Menu"
              data-testid="button-menu"
            >
              <Menu className="w-6 h-6 text-creme" />
            </button>
            <button 
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Notificações"
              data-testid="button-notifications"
            >
              <Bell className="w-6 h-6 text-creme" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar do usuário */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 253, 250, 0.9)' }}
                  data-testid="user-avatar"
                >
                  <User className="w-8 h-8 text-dark" />
                </div>
                
                {/* Nome do usuário */}
                <div>
                  <h1 className="text-3xl font-bold text-creme" data-testid="user-name">Lucas</h1>
                  <p className="text-lg opacity-90 text-creme" data-testid="user-handle">@lucas</p>
                </div>
              </div>
              
              {/* Botões Histórico e Settings */}
              <div className="flex items-center gap-3">
                <button 
                  className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                  aria-label="Histórico"
                  data-testid="button-history"
                >
                  <History className="w-6 h-6 text-creme" />
                </button>
                <button 
                  className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                  aria-label="Configurações"
                  data-testid="button-settings"
                >
                  <Settings className="w-6 h-6 text-creme" />
                </button>
              </div>
            </div>
          </div>

          {/* User Key Card */}
          <div className="mx-4 pb-8">
            <div 
              className="backdrop-blur-sm rounded-3xl p-6 border bg-creme border-dark-light"
              data-testid="user-key-card"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-2 text-dark">Sua chave ColetivoBank</h3>
                  <div className="w-16 h-1 rounded-full mb-4 gradient-bar"></div>
                  <p className="text-lg font-mono text-dark" data-testid="user-key">Lucas@ColetivoBank.app</p>
                </div>
                
                <button 
                  onClick={handleCopyKey}
                  className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                  aria-label="Copiar chave"
                  data-testid="button-copy-key"
                >
                  <Copy className="w-5 h-5 text-dark" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-6 pb-24 bg-creme">
        <div className="px-4">
          {/* Seção Ações */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-dark">Ações</h2>
                <div className="w-16 h-1 rounded-full gradient-bar"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Botão Receber */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-creme border-dark-light"
                data-testid="button-receive"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <ArrowDownToLine className="w-6 h-6 text-dark" />
                  </div>
                  <span className="text-sm font-medium text-dark">Receber</span>
                </div>
              </button>

              {/* Botão Enviar */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-creme border-dark-light"
                data-testid="button-send"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <ArrowUpFromLine className="w-6 h-6 text-dark" />
                  </div>
                  <span className="text-sm font-medium text-dark">Enviar</span>
                </div>
              </button>

              {/* Botão Pagar */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-creme border-dark-light"
                data-testid="button-pay"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <CreditCard className="w-6 h-6 text-dark" />
                  </div>
                  <span className="text-sm font-medium text-dark">Pagar</span>
                </div>
              </button>
            </div>

            {/* Segunda linha de botões */}
            <div className="grid grid-cols-3 gap-4">
              {/* Botão Pagamento Coletivo */}
              <button 
                className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-creme border-dark-light"
                data-testid="button-collective-payment"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                    <Users className="w-6 h-6 text-dark" />
                  </div>
                  <span className="text-sm font-medium text-dark">Pg. Col.</span>
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

              {/* Botão Contribuir */}
              <button 
                onClick={() => {
                  // Salvar a página atual antes de navegar
                  sessionStorage.setItem('lastPath', '/user');
                  setLocation('/contribute/select-fund');
                }}
                className="rounded-3xl p-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-creme gradient-primary"
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
            </div>
          </div>

          {/* Seção de Atividades */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2 text-dark">Atividades</h3>
              <div className="w-12 h-1 rounded-full mb-6 gradient-bar"></div>
            </div>

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
                    <ArrowUp className="w-6 h-6 text-dark" />
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

      {/* Bottom Navigation */}
      <BottomNavigation 
        onNavigateHome={() => setLocation('/')}
        onOpenContribution={() => console.log('Open contribution modal')}
        onOpenProfile={() => setLocation('/user')}
      />
    </div>
  );
}