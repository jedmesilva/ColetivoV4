import { ArrowLeft, Check, AtSign, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function CriarUsernameScreen() {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  // Extrair dados da URL
  const urlParams = new URLSearchParams(window.location.search);
  const nome = urlParams.get('nome') || '';
  const email = urlParams.get('email') || '';
  const senha = urlParams.get('senha') || '';

  // Simular verificação de disponibilidade
  useEffect(() => {
    if (username.length >= 3) {
      setIsChecking(true);
      const timer = setTimeout(async () => {
        try {
          // Verificar no backend se o username está disponível
          const response = await fetch(`/api/users/check-username/${encodeURIComponent(username)}`);
          const data = await response.json();
          setIsAvailable(data.available);
          setIsChecking(false);
          
          // Gerar sugestões se não estiver disponível
          if (!data.available) {
            setSuggestions([
              `${username}123`,
              `${username}_oficial`,
              `${username}2024`,
              `my_${username}`
            ]);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          // Fallback para simulação local se o backend não estiver funcionando
          const unavailableUsernames = ['lucas', 'admin', 'user', 'test', 'coletivo', 'bank'];
          const isUnavailable = unavailableUsernames.includes(username.toLowerCase());
          setIsAvailable(!isUnavailable);
          setIsChecking(false);
          
          if (isUnavailable) {
            setSuggestions([
              `${username}123`,
              `${username}_oficial`,
              `${username}2024`,
              `my_${username}`
            ]);
          } else {
            setSuggestions([]);
          }
        }
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      setIsAvailable(null);
      setSuggestions([]);
      setIsChecking(false);
    }
  }, [username]);

  const handleSubmit = async () => {
    if (username.trim() && isAvailable && isValidUsername(username)) {
      try {
        // Criar usuário no backend
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nome,
            email: email,
            password: senha,
            username: username
          }),
        });

        if (response.ok) {
          console.log('Usuário criado com sucesso!');
          // Redirecionar para a página inicial ou de login
          setLocation('/');
        } else {
          console.error('Erro ao criar usuário');
          // Aqui você pode mostrar uma mensagem de erro
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        // Aqui você pode mostrar uma mensagem de erro
      }
    }
  };

  const isValidUsername = (value: string) => {
    return /^[a-zA-Z0-9_]+$/.test(value) && value.length >= 3 && value.length <= 20;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
  };

  const isFormValid = username.trim() && isAvailable && isValidUsername(username);

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
              onClick={() => setLocation(`/criar-conta/senha?nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}`)}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>Nome de usuário</h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>Escolha um nome único para sua conta</p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-24" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6 max-w-md mx-auto">
          
          {/* Formulário de Criação de Username */}
          <div className="space-y-8">
            
            {/* Campo de Username */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Nome de usuário
              </label>
              
              <div className="relative">
                <div 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-lg p-2"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  <AtSign className="w-4 h-4" style={{ color: '#303030' }} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="Digite seu nome de usuário"
                  className="w-full pl-16 pr-16 py-4 rounded-2xl border text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: username.length > 0 ? 
                      (isAvailable === true ? '#7db46c' : 
                       isAvailable === false ? '#fd6b61' : 
                       'rgba(48, 48, 48, 0.1)') : 
                      'rgba(48, 48, 48, 0.1)',
                    color: '#303030',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  autoFocus
                />
                
                {/* Indicador de status */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {isChecking && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent" style={{ borderColor: '#ffc22f' }} />
                  )}
                  {!isChecking && isAvailable === true && (
                    <div className="rounded-lg p-1" style={{ backgroundColor: '#7db46c' }}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {!isChecking && isAvailable === false && (
                    <div className="rounded-lg p-1" style={{ backgroundColor: '#fd6b61' }}>
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mensagem de status */}
              {username.length > 0 && !isChecking && (
                <div className="mt-3">
                  {isAvailable === true && isValidUsername(username) && (
                    <p className="text-sm flex items-center gap-2" style={{ color: '#7db46c' }}>
                      <Check className="w-4 h-4" />
                      @{username} está disponível!
                    </p>
                  )}
                  {isAvailable === false && (
                    <p className="text-sm flex items-center gap-2" style={{ color: '#fd6b61' }}>
                      <AlertCircle className="w-4 h-4" />
                      @{username} não está disponível
                    </p>
                  )}
                  {!isValidUsername(username) && username.length > 0 && (
                    <p className="text-sm flex items-center gap-2" style={{ color: '#fd6b61' }}>
                      <AlertCircle className="w-4 h-4" />
                      Username deve ter 3-20 caracteres (apenas letras, números e _)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sugestões */}
            {suggestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3" style={{ color: '#303030' }}>Sugestões disponíveis:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 rounded-xl border text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{ 
                        backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                        borderColor: 'rgba(255, 194, 47, 0.3)',
                        color: '#303030'
                      }}
                    >
                      @{suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Regras do Username */}
            <div 
              className="rounded-2xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.05)', 
                borderColor: 'rgba(48, 48, 48, 0.1)' 
              }}
            >
              <h4 className="font-semibold mb-3" style={{ color: '#303030' }}>Regras do nome de usuário:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: username.length >= 3 && username.length <= 20 ? '#7db46c' : 'rgba(48, 48, 48, 0.3)'
                    }}
                  />
                  <span className="text-sm" style={{ color: '#303030', opacity: 0.8 }}>
                    Entre 3 e 20 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: /^[a-zA-Z0-9_]+$/.test(username) && username.length > 0 ? '#7db46c' : 'rgba(48, 48, 48, 0.3)'
                    }}
                  />
                  <span className="text-sm" style={{ color: '#303030', opacity: 0.8 }}>
                    Apenas letras, números e sublinhado (_)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: isAvailable === true ? '#7db46c' : 'rgba(48, 48, 48, 0.3)'
                    }}
                  />
                  <span className="text-sm" style={{ color: '#303030', opacity: 0.8 }}>
                    Deve estar disponível
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Finalizar - Fixo na Parte Inferior */}
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
              <span>Finalizar cadastro</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}