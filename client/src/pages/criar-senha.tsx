import { ArrowLeft, Check, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function CriarSenhaScreen() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [, setLocation] = useLocation();

  // Extrair dados da URL
  const urlParams = new URLSearchParams(window.location.search);
  const nome = urlParams.get('nome') || '';
  const email = urlParams.get('email') || '';

  const handleSubmit = () => {
    if (senha.trim() && confirmarSenha.trim() && senha === confirmarSenha && senha.length >= 8) {
      // Navegar para a próxima tela passando todos os dados
      setLocation(`/criar-conta/username?nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`);
    }
  };

  const senhasIguais = senha === confirmarSenha && confirmarSenha.length > 0;
  const senhaValida = senha.length >= 8;
  const isFormValid = senhaValida && senhasIguais;

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
        
        {/* Camada para suavizar o centro */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'radial-gradient(circle, rgba(255, 156, 65, 1) 0%, rgba(255, 156, 65, 0.7) 8%, rgba(255, 156, 65, 0.4) 15%, rgba(255, 156, 65, 0.1) 22%, transparent 30%)' 
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
              onClick={() => setLocation(`/criar-conta?nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}`)}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>Criar senha</h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>Defina uma senha segura para sua conta</p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-24" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6 max-w-md mx-auto">
          
          {/* Formulário de Criação de Senha */}
          <div className="space-y-8">
            
            {/* Campo de Senha */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Nova senha
              </label>
              
              <div className="relative">
                <div 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-lg p-2"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  <Lock className="w-4 h-4" style={{ color: '#303030' }} />
                </div>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="w-full pl-16 pr-16 py-4 rounded-2xl border text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: 'rgba(48, 48, 48, 0.1)',
                    color: '#303030',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-lg p-2 transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  {mostrarSenha ? (
                    <EyeOff className="w-4 h-4" style={{ color: '#303030' }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: '#303030' }} />
                  )}
                </button>
              </div>
              
              {/* Indicador de força da senha */}
              {senha.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: senha.length < 6 ? '#fd6b61' : 
                                       senha.length < 8 ? '#ffc22f' : 
                                       '#7db46c'
                      }}
                    />
                    <div 
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: senha.length < 8 ? 'rgba(48, 48, 48, 0.2)' : '#7db46c'
                      }}
                    />
                    <div 
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: senha.length < 10 || !/[A-Z]/.test(senha) || !/[0-9]/.test(senha) ? 
                                       'rgba(48, 48, 48, 0.2)' : '#7db46c'
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: '#303030', opacity: 0.7 }}>
                    {senha.length < 6 ? 'Senha fraca' : 
                     senha.length < 8 ? 'Senha média' : 
                     senha.length < 10 || !/[A-Z]/.test(senha) || !/[0-9]/.test(senha) ? 'Senha boa' : 
                     'Senha forte'}
                  </p>
                </div>
              )}
            </div>

            {/* Campo de Confirmação de Senha */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Confirmar senha
              </label>
              
              <div className="relative">
                <div 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-lg p-2"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  <Lock className="w-4 h-4" style={{ color: '#303030' }} />
                </div>
                <input
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Digite novamente sua senha"
                  className="w-full pl-16 pr-16 py-4 rounded-2xl border text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: confirmarSenha.length > 0 ? 
                      (senhasIguais ? '#7db46c' : '#fd6b61') : 
                      'rgba(48, 48, 48, 0.1)',
                    color: '#303030',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-lg p-2 transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  {mostrarConfirmarSenha ? (
                    <EyeOff className="w-4 h-4" style={{ color: '#303030' }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: '#303030' }} />
                  )}
                </button>
              </div>
              
              {/* Indicador de confirmação */}
              {confirmarSenha.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: senhasIguais ? '#7db46c' : '#fd6b61'
                    }}
                  />
                  <p 
                    className="text-sm"
                    style={{ 
                      color: senhasIguais ? '#7db46c' : '#fd6b61'
                    }}
                  >
                    {senhasIguais ? 'Senhas coincidem' : 'Senhas não coincidem'}
                  </p>
                </div>
              )}
            </div>

            {/* Requisitos da Senha */}
            <div 
              className="rounded-2xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.05)', 
                borderColor: 'rgba(48, 48, 48, 0.1)' 
              }}
            >
              <h4 className="font-semibold mb-3" style={{ color: '#303030' }}>Requisitos da senha:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: senha.length >= 8 ? '#7db46c' : 'rgba(48, 48, 48, 0.3)'
                    }}
                  />
                  <span className="text-sm" style={{ color: '#303030', opacity: 0.8 }}>
                    Pelo menos 8 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: /[A-Z]/.test(senha) ? '#7db46c' : 'rgba(48, 48, 48, 0.3)'
                    }}
                  />
                  <span className="text-sm" style={{ color: '#303030', opacity: 0.8 }}>
                    Uma letra maiúscula
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: /[0-9]/.test(senha) ? '#7db46c' : 'rgba(48, 48, 48, 0.3)'
                    }}
                  />
                  <span className="text-sm" style={{ color: '#303030', opacity: 0.8 }}>
                    Um número
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Confirmar Senha - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-3" style={{ backgroundColor: '#fffdfa' }}>
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ 
              background: isFormValid 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
                : 'rgba(48, 48, 48, 0.2)'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              <span>Confirmar senha</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}