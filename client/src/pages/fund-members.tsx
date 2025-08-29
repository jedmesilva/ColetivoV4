import React, { useState } from 'react';
import { ArrowLeft, Users, Search, Plus, Link, Copy, Check, X, UserPlus, MoreVertical, Shield, UserMinus, AlertTriangle, ShieldAlert, Crown, Settings } from 'lucide-react';
import { useRoute, useLocation } from "wouter";

interface Membro {
  id: number;
  nome: string;
  username: string;
  isAdmin: boolean;
  isCurrentUser: boolean;
}

interface MembroCardProps {
  membro: Membro;
  isCurrentUser: boolean;
  onAcaoClick: (acao: string, membro: Membro) => void;
}

// Card de Membro
function MembroCard({ membro, isCurrentUser, onAcaoClick }: MembroCardProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  const acoes = isCurrentUser ? [
    // Ações para o usuário atual
    { id: 'sair_admin', label: 'Sair de administrador', icone: UserMinus, disponivel: membro.isAdmin },
    { id: 'sair_fundo', label: 'Sair do fundo', icone: X, disponivel: true }
  ].filter(acao => acao.disponivel) : [
    // Ações para outros membros
    { id: 'promover', label: 'Promover a administrador', icone: Crown, disponivel: !membro.isAdmin },
    { id: 'remover_admin', label: 'Remover de administrador', icone: Shield, disponivel: membro.isAdmin },
    { id: 'remover', label: 'Remover do fundo', icone: UserMinus, disponivel: true },
    { id: 'denunciar_membros', label: 'Denunciar aos membros', icone: AlertTriangle, disponivel: true },
    { id: 'denunciar_admins', label: 'Denunciar aos administradores', icone: ShieldAlert, disponivel: true }
  ].filter(acao => acao.disponivel);

  const handleAcaoClick = (acao: string) => {
    setMenuAberto(false);
    onAcaoClick(acao, membro);
  };

  return (
    <div 
      className="rounded-3xl p-4 border relative"
      style={{ 
        backgroundColor: membro.isAdmin ? 'rgba(255, 229, 189, 0.15)' : '#fffdfa',
        borderColor: membro.isAdmin ? 'rgba(255, 229, 189, 0.4)' : 'rgba(48, 48, 48, 0.1)'
      }}
      data-testid={`member-card-${membro.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' }}
            data-testid={`avatar-${membro.id}`}
          >
            {membro.nome.charAt(0).toUpperCase()}
          </div>
          
          {/* Info do usuário */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-lg" style={{ color: '#303030' }} data-testid={`member-name-${membro.id}`}>
                {isCurrentUser ? 'Você' : membro.nome}
              </h4>
              {membro.isAdmin && (
                <span 
                  className="text-xs px-2 py-1 rounded-full font-medium text-white"
                  style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
                  data-testid={`admin-badge-${membro.id}`}
                >
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm opacity-70" style={{ color: '#303030' }} data-testid={`username-${membro.id}`}>
              @{membro.username}
            </p>
          </div>
        </div>

        {/* Menu de ações */}
        {acoes.length > 0 && (
          <div className="relative">
            <button 
              onClick={() => setMenuAberto(!menuAberto)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: 'rgba(48, 48, 48, 0.1)' }}
              data-testid={`menu-button-${membro.id}`}
            >
              <MoreVertical className="w-4 h-4" style={{ color: '#303030' }} />
            </button>

            {/* Dropdown Menu */}
            {menuAberto && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuAberto(false)}
                />
                
                {/* Menu */}
                <div 
                  className="absolute right-0 top-10 z-20 rounded-2xl shadow-lg border overflow-hidden"
                  style={{ backgroundColor: '#fffdfa', borderColor: 'rgba(48, 48, 48, 0.1)' }}
                  data-testid={`dropdown-menu-${membro.id}`}
                >
                  {acoes.map((acao) => {
                    const IconeAcao = acao.icone;
                    return (
                      <button
                        key={acao.id}
                        onClick={() => handleAcaoClick(acao.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-opacity-50"
                        style={{ 
                          color: '#303030',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = 'rgba(255, 229, 189, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }}
                        data-testid={`action-${acao.id}-${membro.id}`}
                      >
                        <IconeAcao className="w-4 h-4" />
                        <span className="text-sm font-medium whitespace-nowrap">
                          {acao.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FundMembers() {
  const [, params] = useRoute("/fund/:id/members");
  const fundId = params?.id;
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [linkConvite, setLinkConvite] = useState('');
  const [linkCopiado, setLinkCopiado] = useState(false);

  // Dados simulados de membros
  const [membros, setMembros] = useState([
    { id: 1, nome: 'Você', username: 'voce.admin', isAdmin: true, isCurrentUser: true },
    { id: 2, nome: 'Maria Silva', username: 'maria.silva', isAdmin: true, isCurrentUser: false },
    { id: 3, nome: 'João Santos', username: 'joao.santos', isAdmin: false, isCurrentUser: false },
    { id: 4, nome: 'Ana Oliveira', username: 'ana.oliveira', isAdmin: false, isCurrentUser: false },
    { id: 5, nome: 'Pedro Costa', username: 'pedro.costa', isAdmin: false, isCurrentUser: false },
    { id: 6, nome: 'Carla Ferreira', username: 'carla.ferreira', isAdmin: false, isCurrentUser: false },
  ]);

  // Filtrar membros pela busca
  const membrosFiltrados = membros.filter(membro => 
    membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    membro.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separar admins e membros
  const admins = membrosFiltrados.filter(m => m.isAdmin);
  const membrosRegulares = membrosFiltrados.filter(m => !m.isAdmin);

  const handleAcaoClick = (acao: string, membro: Membro) => {
    console.log('Ação selecionada:', { acao, membro: membro.nome });
    // Aqui você pode implementar a lógica para cada ação
  };

  const gerarLinkConvite = async () => {
    // Simular geração de link
    await new Promise(resolve => setTimeout(resolve, 1000));
    const novoLink = `https://app.exemplo.com/convite/fundo-futebol-${Math.random().toString(36).substr(2, 9)}`;
    setLinkConvite(novoLink);
  };

  const copiarLink = async () => {
    if (linkConvite) {
      await navigator.clipboard.writeText(linkConvite);
      setLinkCopiado(true);
      setTimeout(() => setLinkCopiado(false), 2000);
    }
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
              onClick={() => setLocation(`/fund/${fundId}/settings`)}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
              aria-label="Voltar"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
            
            <button 
              onClick={() => setLocation(`/fund/${fundId}/member-settings`)}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
              aria-label="Configurações"
              data-testid="button-settings"
            >
              <Settings className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }} data-testid="page-title">
              Gestão de membros
            </h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }} data-testid="page-subtitle">
              Gerencie os membros do <span className="font-bold">Fundo do futebol</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-4">
          
          {/* Campo de Busca */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#303030' }} data-testid="search-title">
              Buscar membros
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
                placeholder="Digite o nome ou username"
                className="input-limpo"
                data-testid="input-search"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#303030', opacity: 0.5 }} />
            </div>
          </div>

          {/* Lista de Administradores */}
          {admins.length > 0 && (
            <div className="mb-8">
              <h3 className="text-md font-semibold mb-4" style={{ color: '#303030' }} data-testid="admins-title">
                Administradores ({admins.length})
              </h3>
              <div className="space-y-3" data-testid="admins-list">
                {admins.map((membro) => (
                  <MembroCard
                    key={membro.id}
                    membro={membro}
                    isCurrentUser={membro.isCurrentUser}
                    onAcaoClick={handleAcaoClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Lista de Membros Regulares */}
          {membrosRegulares.length > 0 && (
            <div className="mb-8">
              <h3 className="text-md font-semibold mb-4" style={{ color: '#303030' }} data-testid="members-title">
                Membros ({membrosRegulares.length})
              </h3>
              <div className="space-y-3" data-testid="members-list">
                {membrosRegulares.map((membro) => (
                  <MembroCard
                    key={membro.id}
                    membro={membro}
                    isCurrentUser={membro.isCurrentUser}
                    onAcaoClick={handleAcaoClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Seção de Link de Convite */}
          <div className="pt-6 border-t" style={{ borderColor: 'rgba(48, 48, 48, 0.1)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#303030' }} data-testid="invite-title">
              Adicionar novos membros
            </h2>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>

            {!linkConvite ? (
              <button 
                onClick={gerarLinkConvite}
                className="w-full rounded-3xl p-6 border border-dashed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
                style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)', borderColor: 'rgba(48, 48, 48, 0.2)' }}
                data-testid="button-generate-invite"
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
                >
                  <Link className="w-6 h-6" style={{ color: '#303030' }} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold mb-1" style={{ color: '#303030' }}>Gerar link de convite</h3>
                  <p className="text-sm opacity-70" style={{ color: '#303030' }}>Compartilhe com outras pessoas</p>
                </div>
              </button>
            ) : (
              <div 
                className="rounded-3xl p-4 border flex items-center gap-3"
                style={{ backgroundColor: 'rgba(255, 229, 189, 0.1)', borderColor: 'rgba(255, 229, 189, 0.3)' }}
                data-testid="invite-link-card"
              >
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' }}
                >
                  <Link className="w-5 h-5" style={{ color: '#fffdfa' }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1" style={{ color: '#303030' }}>Link de convite</p>
                  <p className="text-xs opacity-70 truncate" style={{ color: '#303030' }} data-testid="invite-link-url">
                    {linkConvite}
                  </p>
                </div>

                <button 
                  onClick={copiarLink}
                  className="flex-shrink-0 rounded-2xl px-3 py-2 flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.5)',
                    color: '#303030'
                  }}
                  data-testid="button-copy-link"
                >
                  {linkCopiado ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm font-medium">Copiar</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {linkConvite && (
              <p className="text-xs opacity-70 mt-3 text-center" style={{ color: '#303030' }} data-testid="invite-expiry">
                O link expira em 7 dias
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}