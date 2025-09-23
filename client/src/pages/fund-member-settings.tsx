import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Users, Link, UserPlus, Info, Save } from 'lucide-react';
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Componente Toggle Switch
interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ enabled, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 flex-shrink-0 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{
        background: enabled && !disabled 
          ? 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' 
          : 'rgba(48, 48, 48, 0.2)'
      }}
      disabled={disabled}
      data-testid={`toggle-switch-${enabled ? 'enabled' : 'disabled'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          enabled && !disabled ? 'translate-x-6' : 'translate-x-1'
        }`}
        style={{
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      />
    </button>
  );
}

// Componente Card de Configuração
interface ConfigCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  isMainOption?: boolean;
}

function ConfigCard({ 
  title, 
  description, 
  icon: Icon, 
  enabled, 
  onChange, 
  disabled = false,
  isMainOption = false 
}: ConfigCardProps) {
  return (
    <div 
      className={`rounded-3xl p-6 border transition-all duration-200 ${
        disabled ? 'opacity-60' : ''
      }`}
      style={{ 
        backgroundColor: isMainOption && enabled 
          ? 'rgba(255, 229, 189, 0.15)' 
          : '#fffdfa',
        borderColor: isMainOption && enabled 
          ? 'rgba(255, 229, 189, 0.4)' 
          : 'rgba(48, 48, 48, 0.1)'
      }}
      data-testid={`config-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ 
              background: enabled && !disabled 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
                : 'rgba(48, 48, 48, 0.1)' 
            }}
          >
            <Icon 
              className="w-6 h-6" 
              style={{ 
                color: enabled && !disabled ? '#fffdfa' : '#303030' 
              }} 
            />
          </div>
          
          <div>
            <h3 className="text-lg font-bold" style={{ color: '#303030' }} data-testid={`card-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {title}
            </h3>
            {isMainOption && enabled && (
              <span 
                className="text-xs px-2 py-1 rounded-full font-medium text-white inline-block mt-1"
                style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                data-testid="active-badge"
              >
                Ativo
              </span>
            )}
          </div>
        </div>

        <ToggleSwitch 
          enabled={enabled} 
          onChange={onChange}
          disabled={disabled}
        />
      </div>

      <p className="text-sm opacity-70 leading-relaxed" style={{ color: '#303030' }} data-testid={`card-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        {description}
      </p>
    </div>
  );
}

export default function FundMemberSettings() {
  const [, params] = useRoute("/fund/:id/member-settings");
  const fundId = params?.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [permitirNovosMembros, setPermitirNovosMembros] = useState(true);
  const [entradaPorLink, setEntradaPorLink] = useState(true);
  const [entradaPorSolicitacao, setEntradaPorSolicitacao] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar configurações atuais
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: [`/api/funds/${fundId}/access-settings`],
    enabled: !!fundId,
  });

  // Mutation para salvar configurações
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const response = await fetch(`/api/funds/${fundId}/access-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/funds/${fundId}/access-settings`] });
      setHasChanges(false);
      toast({
        title: "Configurações salvas",
        description: "As configurações de acesso foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Atualizar estados quando carregar as configurações
  useEffect(() => {
    if (settings && typeof settings === 'object') {
      setPermitirNovosMembros((settings as any).isOpenForNewMembers ?? true);
      setEntradaPorLink((settings as any).allowsInviteLink ?? true);
      setEntradaPorSolicitacao((settings as any).requiresApprovalForNewMembers ?? false);
    }
  }, [settings]);

  const handlePermitirNovosMembrosChange = (value: boolean) => {
    setPermitirNovosMembros(value);
    setHasChanges(true);
    
    // Se desativar a entrada de novos membros, desativa as opções específicas
    if (!value) {
      setEntradaPorLink(false);
      setEntradaPorSolicitacao(false);
    }
  };

  const handleEntradaPorLinkChange = (value: boolean) => {
    setEntradaPorLink(value);
    setHasChanges(true);
  };

  const handleEntradaPorSolicitacaoChange = (value: boolean) => {
    setEntradaPorSolicitacao(value);
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar as configurações.",
        variant: "destructive",
      });
      return;
    }

    saveSettingsMutation.mutate({
      isOpenForNewMembers: permitirNovosMembros,
      requiresApprovalForNewMembers: entradaPorSolicitacao,
      allowsInviteLink: entradaPorLink,
      changeReason: 'Configurações atualizadas pelo usuário'
    });
  };

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
        
        {/* Gradiente Horizontal Suave */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{ 
            background: 'linear-gradient(270deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
          }}
        />
        
        {/* Gradiente Vertical Suave */}
        <div 
          className="absolute inset-0 opacity-35"
          style={{ 
            background: 'linear-gradient(180deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        
        {/* Gradiente Radial Suave Superior Esquerdo */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{ 
            background: 'radial-gradient(ellipse 120% 80% at top left, #ffe5bd, #ffc22f, transparent 70%)' 
          }}
        />
        
        {/* Gradiente Radial Suave Inferior Direito */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            background: 'radial-gradient(ellipse 120% 80% at bottom right, #fd6b61, #fa7653, transparent 70%)' 
          }}
        />
        
        {/* Gradiente Diagonal Suave */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{ 
            background: 'linear-gradient(45deg, #fa7653, #fd6b61, #ffc22f, #ffe5bd, #fffdfa)' 
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
          <div className="flex justify-between items-center p-4 pt-12">
            <button 
              onClick={() => setLocation(`/fund/${fundId}/members`)}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
              aria-label="Voltar"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }} data-testid="page-title">
              Definições de membros
            </h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }} data-testid="page-subtitle">
              Configure as regras de entrada no <span className="font-bold">Fundo do futebol</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-4">
          
          {/* Configuração Principal */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#303030' }} data-testid="general-control-title">
              Controle geral
            </h2>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>
            
            <ConfigCard
              title="Permitir novos membros"
              description="Controla se o fundo está aberto para receber novos membros. Quando desativado, nenhuma forma de entrada funcionará."
              icon={Users}
              enabled={permitirNovosMembros}
              onChange={handlePermitirNovosMembrosChange}
              isMainOption={true}
            />
          </div>

          {/* Tipos de Entrada */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#303030' }} data-testid="entry-types-title">
              Tipos de entrada permitidos
            </h2>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>

            <div className="space-y-4">
              <ConfigCard
                title="Entrada por link de convite"
                description="Permite que novos membros entrem no fundo através de links de convite gerados pelos administradores."
                icon={Link}
                enabled={entradaPorLink}
                onChange={handleEntradaPorLinkChange}
                disabled={!permitirNovosMembros}
              />

              <ConfigCard
                title="Entrada por solicitação"
                description="Permite que pessoas interessadas solicitem entrada no fundo. As solicitações precisam ser aprovadas pelos administradores."
                icon={UserPlus}
                enabled={entradaPorSolicitacao}
                onChange={handleEntradaPorSolicitacaoChange}
                disabled={!permitirNovosMembros}
              />
            </div>
          </div>

          {/* Informação adicional */}
          <div 
            className="rounded-3xl p-4 border flex items-start gap-3"
            style={{ 
              backgroundColor: 'rgba(255, 229, 189, 0.1)', 
              borderColor: 'rgba(255, 229, 189, 0.3)' 
            }}
            data-testid="info-card"
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255, 194, 47, 0.3)' }}
            >
              <Info className="w-4 h-4" style={{ color: '#303030' }} />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: '#303030' }} data-testid="info-title">
                Dica importante
              </p>
              <p className="text-xs opacity-70 leading-relaxed" style={{ color: '#303030' }} data-testid="info-description">
                Você pode ativar ambos os tipos de entrada simultaneamente. Os membros poderão entrar por qualquer método ativo.
              </p>
            </div>
          </div>

          {/* Botão de Salvar - só aparece quando há mudanças */}
          {hasChanges && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
              <button
                onClick={handleSaveSettings}
                disabled={saveSettingsMutation.isPending || isLoadingSettings}
                className="flex items-center gap-3 px-8 py-4 rounded-3xl font-semibold text-white text-lg shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                style={{ 
                  background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)',
                  boxShadow: '0 8px 32px rgba(255, 194, 47, 0.3)' 
                }}
                data-testid="button-save-settings"
              >
                {saveSettingsMutation.isPending ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-6 h-6" />
                )}
                {saveSettingsMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}