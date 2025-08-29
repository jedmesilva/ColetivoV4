import { ArrowLeft, Users, Search, Plus, Link, Copy, Check, X, UserPlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { getFundCache, updateFundCache, createFundFromCache } from "@/lib/fund-cache";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Membro {
  id: number;
  nome: string;
  username: string;
  isAdmin?: boolean;
}

// Componente para card de membro encontrado
interface MembroEncontradoCardProps {
  membro: Membro;
  onAdicionar: (membro: Membro) => void;
}

function MembroEncontradoCard({ membro, onAdicionar }: MembroEncontradoCardProps) {
  const [adicionando, setAdicionando] = useState(false);

  const handleAdicionar = async () => {
    setAdicionando(true);
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    onAdicionar(membro);
    setAdicionando(false);
  };

  return (
    <div 
      className="rounded-3xl p-4 border flex items-center justify-between transition-all duration-200 bg-creme border-dark-light"
      data-testid={`found-member-${membro.id}`}
    >
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
          <h4 className="font-bold text-lg text-dark">{membro.nome}</h4>
          <p className="text-sm opacity-70 text-dark">@{membro.username}</p>
        </div>
      </div>

      {/* Botão de adicionar */}
      <button 
        onClick={handleAdicionar}
        disabled={adicionando}
        className="rounded-2xl px-4 py-2 flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
        style={{ 
          background: adicionando ? 'rgba(48, 48, 48, 0.2)' : 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)',
          color: '#fffdfa'
        }}
        data-testid={`add-button-${membro.id}`}
      >
        {adicionando ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Adicionando...</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Adicionar</span>
          </>
        )}
      </button>
    </div>
  );
}

// Componente para membro adicionado
interface MembroAdicionadoCardProps {
  membro: Membro;
  onRemover: (membroId: number) => void;
  isAdmin?: boolean;
}

function MembroAdicionadoCard({ membro, onRemover, isAdmin = false }: MembroAdicionadoCardProps) {
  const [removendo, setRemovendo] = useState(false);

  const handleRemover = async () => {
    setRemovendo(true);
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    onRemover(membro.id);
    setRemovendo(false);
  };

  return (
    <div 
      className="rounded-3xl p-4 border flex items-center justify-between transition-all duration-200 bg-bege-light border-bege-transparent"
      data-testid={`added-member-${membro.id}`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
          style={{ background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' }}
        >
          {membro.nome.charAt(0).toUpperCase()}
        </div>
        
        {/* Info do usuário */}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-dark">{membro.nome}</h4>
            {isAdmin && (
              <span 
                className="text-xs px-2 py-1 rounded-full font-medium text-white"
                style={{ 
                  background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)'
                }}
                data-testid={`admin-badge-${membro.id}`}
              >
                Admin
              </span>
            )}
          </div>
          <p className="text-sm opacity-70 text-dark">@{membro.username}</p>
        </div>
      </div>

      {/* Ícone de check e botão remover */}
      <div className="flex items-center gap-2">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
        >
          <Check className="w-4 h-4" style={{ color: '#fffdfa' }} />
        </div>
        
        {/* Não permitir remover o admin */}
        {!isAdmin && (
          <button 
            onClick={handleRemover}
            disabled={removendo}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-50 bg-bege-transparent"
            data-testid={`remove-button-${membro.id}`}
          >
            {removendo ? (
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <X className="w-4 h-4 text-dark" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CreateFundMembers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [membrosEncontrados, setMembrosEncontrados] = useState<Membro[]>([]);
  const [membrosAdicionados, setMembrosAdicionados] = useState<Membro[]>([]);
  const [linkConvite, setLinkConvite] = useState('');
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [nomeFundo, setNomeFundo] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Carregar dados do cache
  useEffect(() => {
    const cached = getFundCache();
    if (cached) {
      setNomeFundo(cached.name);
      if (cached.members) {
        // Separar admin dos outros membros
        const admin = cached.members.find(m => m.isAdmin);
        const otherMembers = cached.members.filter(m => !m.isAdmin);
        setMembrosAdicionados(otherMembers);
      }
    }
  }, []);

  // Usuário atual (administrador)
  const usuarioAtual: Membro = {
    id: 0,
    nome: 'Você',
    username: 'voce.admin',
    isAdmin: true
  };

  // Dados simulados de usuários
  const usuariosSimulados: Membro[] = [
    { id: 1, nome: 'Maria Silva', username: 'maria.silva' },
    { id: 2, nome: 'João Santos', username: 'joao.santos' },
    { id: 3, nome: 'Ana Oliveira', username: 'ana.oliveira' },
    { id: 4, nome: 'Pedro Costa', username: 'pedro.costa' },
    { id: 5, nome: 'Carla Ferreira', username: 'carla.ferreira' }
  ];

  // Buscar usuários
  const buscarUsuarios = async (termo: string) => {
    if (!termo.trim()) {
      setMembrosEncontrados([]);
      return;
    }

    setBuscando(true);
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const resultados = usuariosSimulados.filter(usuario => 
      usuario.nome.toLowerCase().includes(termo.toLowerCase()) ||
      usuario.username.toLowerCase().includes(termo.toLowerCase())
    ).filter(usuario => 
      !membrosAdicionados.some(adicionado => adicionado.id === usuario.id)
    );
    
    setMembrosEncontrados(resultados);
    setBuscando(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setSearchTerm(valor);

    // Debounce da busca
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      buscarUsuarios(valor);
    }, 500);
  };

  const handleAdicionarMembro = (membro: Membro) => {
    const novosMembros = [...membrosAdicionados, membro];
    setMembrosAdicionados(novosMembros);
    setMembrosEncontrados(prev => prev.filter(m => m.id !== membro.id));
    
    // Atualizar cache
    updateFundCache({ 
      members: [usuarioAtual, ...novosMembros]
    });
  };

  const handleRemoverMembro = (membroId: number) => {
    const novosMembros = membrosAdicionados.filter(m => m.id !== membroId);
    setMembrosAdicionados(novosMembros);
    
    // Atualizar cache
    updateFundCache({ 
      members: [usuarioAtual, ...novosMembros]
    });
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

  // Mutation para criar o fundo usando cache
  const createFundMutation = useMutation({
    mutationFn: createFundFromCache,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
      setLocation(`/fund/${data.id}`);
    },
    onError: () => {
      // Em caso de erro, apenas navegar para home
      setLocation('/');
    }
  });

  const handleFinalizar = () => {
    // Salvar membros no cache antes de criar
    updateFundCache({ 
      members: [usuarioAtual, ...membrosAdicionados]
    });
    
    // Criar o fundo
    createFundMutation.mutate();
  };

  // Todos os membros (admin + adicionados)
  const todosMembros = [usuarioAtual, ...membrosAdicionados];

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
            <button 
              onClick={() => setLocation('/create-fund/image')}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Voltar"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-creme" />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme" data-testid="page-title">
              Adicionar membros
            </h1>
            <p className="text-lg opacity-90 text-creme">
              Adicione pessoas ao <span className="font-bold">{nomeFundo}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32 bg-creme">
        <div className="px-4">
          
          {/* Seção de Busca por Username */}
          <div className="space-y-6">
            
            {/* Campo de Busca */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-dark" data-testid="search-title">
                Buscar por username
              </h2>
              <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Digite o username ou nome"
                  className="w-full px-6 py-4 rounded-2xl border text-lg bg-bege-light border-dark-light text-dark focus:outline-none focus:scale-[1.02] transition-all duration-200 pl-12"
                  data-testid="input-search"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark opacity-50" />
                
                {buscando && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Resultados da Busca */}
            {membrosEncontrados.length > 0 && (
              <div data-testid="search-results">
                <h3 className="text-md font-semibold mb-3 text-dark">
                  Usuários encontrados
                </h3>
                <div className="space-y-3">
                  {membrosEncontrados.map((membro) => (
                    <MembroEncontradoCard
                      key={membro.id}
                      membro={membro}
                      onAdicionar={handleAdicionarMembro}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Membros Adicionados */}
            <div data-testid="members-list">
              <h3 className="text-md font-semibold mb-3 text-dark">
                Membros do fundo ({todosMembros.length})
              </h3>
              <div className="space-y-3">
                {/* Mostrar admin primeiro */}
                <MembroAdicionadoCard
                  key={usuarioAtual.id}
                  membro={usuarioAtual}
                  onRemover={handleRemoverMembro}
                  isAdmin={true}
                />
                {/* Depois os membros adicionados */}
                {membrosAdicionados.map((membro) => (
                  <MembroAdicionadoCard
                    key={membro.id}
                    membro={membro}
                    onRemover={handleRemoverMembro}
                    isAdmin={false}
                  />
                ))}
              </div>
            </div>

            {/* Seção de Link de Convite */}
            <div className="pt-6 border-t border-dark-light">
              <h2 className="text-lg font-semibold mb-4 text-dark" data-testid="invite-section-title">
                Link de convite
              </h2>
              <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>

              {!linkConvite ? (
                <button 
                  onClick={gerarLinkConvite}
                  className="w-full rounded-3xl p-6 border border-dashed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 bg-bege-light border-dark-light"
                  data-testid="button-generate-invite"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-bege-transparent">
                    <Link className="w-6 h-6 text-dark" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold mb-1 text-dark">Gerar link de convite</h3>
                    <p className="text-sm opacity-70 text-dark">Compartilhe com outras pessoas</p>
                  </div>
                </button>
              ) : (
                <div className="rounded-3xl p-4 border flex items-center gap-3 bg-bege-light border-bege-transparent" data-testid="invite-link-card">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' }}
                  >
                    <Link className="w-5 h-5" style={{ color: '#fffdfa' }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1 text-dark">Link de convite</p>
                    <p className="text-xs opacity-70 truncate text-dark" data-testid="invite-link-url">
                      {linkConvite}
                    </p>
                  </div>

                  <button 
                    onClick={copiarLink}
                    className="flex-shrink-0 rounded-2xl px-3 py-2 flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent text-dark"
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
                <p className="text-xs opacity-70 mt-3 text-center text-dark" data-testid="invite-expiry">
                  O link expira em 7 dias
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Continuar - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-creme">
        <button 
          onClick={handleFinalizar}
          disabled={createFundMutation.isPending}
          className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{ 
            background: 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)'
          }}
          data-testid="button-finish"
        >
          <div className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            <span>
              {createFundMutation.isPending 
                ? 'Criando fundo...' 
                : `Finalizar (${todosMembros.length} membro${todosMembros.length !== 1 ? 's' : ''})`
              }
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}