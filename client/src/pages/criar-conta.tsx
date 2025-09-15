import { ArrowLeft, Check, User, Mail, Lock, Eye, EyeOff, Phone, FileText, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function CriarContaScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  const handleSubmit = async () => {
    setError('');
    
    if (!isFormValid) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: nome,
          email: email,
          passwordHash: senha,
          phone: telefone || null,
          cpf: cpf || null,
        }),
      });

      if (response.ok) {
        console.log('Usuário criado com sucesso!');
        // Redirecionar para a página de login
        setLocation('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const senhaValida = senha.length >= 8;
  const senhasIguais = senha === confirmarSenha && confirmarSenha.length > 0;
  const isFormValid = nome.trim() && 
                     email.trim() && 
                     email.includes('@') && 
                     senhaValida && 
                     senhasIguais;

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
              onClick={() => setLocation('/')}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
              aria-label="Voltar"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>Criar conta</h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>Preencha seus dados para começar (formulário seguro)</p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-24" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6 max-w-md mx-auto">
          
          {/* Formulário de Criação de Conta */}
          <div className="space-y-8">
            
            {/* Campo de Nome */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Nome completo *
              </label>
              
              <div className="relative">
                <div 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-lg p-2"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  <User className="w-4 h-4" style={{ color: '#303030' }} />
                </div>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full pl-16 pr-6 py-4 rounded-2xl border text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: 'rgba(48, 48, 48, 0.1)',
                    color: '#303030',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* Campo de Email */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Email *
              </label>
              
              <div className="relative">
                <div 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-lg p-2"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  <Mail className="w-4 h-4" style={{ color: '#303030' }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  className="w-full pl-16 pr-6 py-4 rounded-2xl border text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: 'rgba(48, 48, 48, 0.1)',
                    color: '#303030',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Senha * <span className="text-sm font-normal opacity-70">(mínimo 8 caracteres)</span>
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
                  placeholder="Digite sua senha"
                  className="w-full pl-16 pr-16 py-4 rounded-2xl border text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: senhaValida ? 'rgba(34, 197, 94, 0.3)' : 'rgba(48, 48, 48, 0.1)',
                    color: '#303030',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  {mostrarSenha ? 
                    <EyeOff className="w-4 h-4" style={{ color: '#303030' }} /> : 
                    <Eye className="w-4 h-4" style={{ color: '#303030' }} />
                  }
                </button>
              </div>
              {senha.length > 0 && !senhaValida && (
                <p className="text-sm mt-2" style={{ color: '#ef4444' }}>
                  A senha deve ter pelo menos 8 caracteres
                </p>
              )}
            </div>

            {/* Campo de Confirmar Senha */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Confirmar senha *
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
                  placeholder="Confirme sua senha"
                  className="w-full pl-16 pr-16 py-4 rounded-2xl border text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: senhasIguais ? 'rgba(34, 197, 94, 0.3)' : 'rgba(48, 48, 48, 0.1)',
                    color: '#303030',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  {mostrarConfirmarSenha ? 
                    <EyeOff className="w-4 h-4" style={{ color: '#303030' }} /> : 
                    <Eye className="w-4 h-4" style={{ color: '#303030' }} />
                  }
                </button>
              </div>
              {confirmarSenha.length > 0 && !senhasIguais && (
                <p className="text-sm mt-2" style={{ color: '#ef4444' }}>
                  As senhas não coincidem
                </p>
              )}
            </div>

            {/* Campo de Telefone (Opcional) */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                Telefone <span className="text-sm font-normal opacity-70">(opcional)</span>
              </label>
              
              <div className="relative">
                <div 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-lg p-2"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  <Phone className="w-4 h-4" style={{ color: '#303030' }} />
                </div>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-16 pr-6 py-4 rounded-2xl border text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: 'rgba(48, 48, 48, 0.1)',
                    color: '#303030',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
              </div>
            </div>

            {/* Campo de CPF (Opcional) */}
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
                CPF <span className="text-sm font-normal opacity-70">(opcional)</span>
              </label>
              
              <div className="relative">
                <div 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-lg p-2"
                  style={{ backgroundColor: 'rgba(255, 194, 47, 0.2)' }}
                >
                  <FileText className="w-4 h-4" style={{ color: '#303030' }} />
                </div>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full pl-16 pr-6 py-4 rounded-2xl border text-lg"
                  style={{ 
                    backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                    borderColor: 'rgba(48, 48, 48, 0.1)',
                    color: '#303030',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div 
                className="rounded-2xl p-4 border flex items-center gap-3"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  borderColor: 'rgba(239, 68, 68, 0.2)' 
                }}
              >
                <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
              </div>
            )}

            {/* Informações */}
            <div 
              className="rounded-2xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.05)', 
                borderColor: 'rgba(48, 48, 48, 0.1)' 
              }}
            >
              <h4 className="font-semibold mb-2" style={{ color: '#303030' }}>🔒 Seus dados estão seguros</h4>
              <ul className="text-sm space-y-1" style={{ color: '#303030', opacity: 0.8 }}>
                <li>• Utilizamos criptografia para proteger suas informações</li>
                <li>• Você pode alterar seus dados a qualquer momento</li>
                <li>• Não compartilhamos seus dados com terceiros</li>
                <li>• Campos marcados com * são obrigatórios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Criar Conta - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-3" style={{ backgroundColor: '#fffdfa' }}>
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ 
              background: (isFormValid && !isLoading) 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
                : 'rgba(48, 48, 48, 0.2)'
            }}
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Criando conta...' : 'Criar conta'}</span>
            </div>
          </button>

          {/* Link para Login */}
          <div className="mt-4 text-center">
            <p className="text-sm" style={{ color: '#303030', opacity: 0.8 }}>
              Já tem uma conta?{' '}
              <button 
                onClick={() => setLocation('/login')}
                className="font-semibold underline"
                style={{ color: '#fa7653' }}
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}