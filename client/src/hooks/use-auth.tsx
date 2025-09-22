import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface User {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Verificar se há uma sessão salva ao carregar a aplicação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('auth_user');
        const sessionToken = localStorage.getItem('auth_session');
        
        if (savedUser && sessionToken) {
          // Verificar se a sessão ainda é válida fazendo uma requisição para uma rota protegida
          const response = await fetch('/api/accounts/' + JSON.parse(savedUser).id, {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${sessionToken}`
            }
          });
          
          if (response.ok) {
            setUser(JSON.parse(savedUser));
          } else {
            // Sessão inválida, limpar dados
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_session');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_session');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const { session, ...userData } = data;
        
        // Salvar dados do usuário e sessão
        setUser(userData);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        if (session?.access_token) {
          localStorage.setItem('auth_session', session.access_token);
        }
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const sessionToken = localStorage.getItem('auth_session');
      
      // Fazer logout no servidor
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_token: sessionToken }),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erro durante logout:', error);
    } finally {
      // Limpar dados locais independente do resultado da requisição
      setUser(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_session');
      setLocation('/login');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}