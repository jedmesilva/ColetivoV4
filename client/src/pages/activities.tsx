
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Users, Heart, Search, DollarSign } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

interface AccountTransaction {
  id: string;
  transactionType: string;
  amount: string;
  description: string;
  referenceType: string;
  referenceId: string;
  status: string;
  createdAt: string;
  created_at: string; // Adicionar campo do banco
  processedAt: string;
}

export default function Activities() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const handleBack = () => {
    const lastPath = sessionStorage.getItem('lastPath') || '/account';
    setLocation(lastPath);
  };

  // Buscar transações do usuário
  const { data: transactions, isLoading } = useQuery<AccountTransaction[]>({
    queryKey: ['/api/accounts', user?.id, 'transactions'],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/accounts/${user.id}/transactions`);
      if (!response.ok) throw new Error('Falha ao carregar transações');
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Filtrar transações baseado no termo de busca
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (transaction.description || '').toLowerCase().includes(searchLower) ||
        transaction.transactionType.toLowerCase().includes(searchLower) ||
        transaction.referenceType.toLowerCase().includes(searchLower)
      );
    });
  }, [transactions, searchTerm]);

  // Função para obter ícone baseado no tipo de transação
  const getTransactionIcon = (transaction: AccountTransaction) => {
    const amount = parseFloat(transaction.amount);
    
    switch (transaction.referenceType) {
      case 'contribution':
        return ArrowUpFromLine;
      case 'capital_request':
        return amount > 0 ? ArrowDownToLine : ArrowUpFromLine;
      case 'retribution':
        return Heart;
      case 'transfer':
        return amount > 0 ? ArrowDownToLine : ArrowUpFromLine;
      default:
        return DollarSign;
    }
  };

  // Função para obter título baseado no tipo de transação
  const getTransactionTitle = (transaction: AccountTransaction) => {
    const amount = parseFloat(transaction.amount);
    
    switch (transaction.referenceType) {
      case 'contribution':
        return 'Contribuição enviada';
      case 'capital_request':
        return amount > 0 ? 'Pagamento recebido' : 'Solicitação enviada';
      case 'retribution':
        return amount > 0 ? 'Retribuição recebida' : 'Retribuição enviada';
      case 'transfer':
        return amount > 0 ? 'Transferência recebida' : 'Transferência enviada';
      default:
        return transaction.transactionType === 'deposit' ? 'Depósito' : 'Transação';
    }
  };

  // Função para formatar valor
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    try {
      // Normalizar a string de data para garantir compatibilidade
      let normalizedDate = dateString;
      
      // Se a data não terminar com Z, adicionar Z para indicar UTC
      if (!normalizedDate.endsWith('Z') && !normalizedDate.includes('+')) {
        normalizedDate = normalizedDate + 'Z';
      }
      
      const date = new Date(normalizedDate);
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 2) {
        return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays <= 7) {
        return `${diffDays - 1} dias atrás`;
      } else if (diffDays <= 14) {
        return '1 semana atrás';
      } else if (diffDays <= 21) {
        return '2 semanas atrás';
      } else {
        return date.toLocaleDateString('pt-BR');
      }
    } catch (error) {
      console.error('Erro ao formatar data:', error, 'String original:', dateString);
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Carregando atividades...</div>
      </div>
    );
  }

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
          <div className="w-12" />
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
              placeholder="Digite o tipo de atividade ou descrição"
              className="input-limpo"
              data-testid="input-search"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#303030', opacity: 0.5 }} />
          </div>
        </div>

        {/* Seção de Atividades */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-dark mb-4">
                {searchTerm ? 'Nenhuma atividade encontrada' : 'Nenhuma atividade registrada'}
              </p>
              <p className="text-sm text-dark opacity-60">
                {searchTerm ? 'Tente buscar por outros termos' : 'Suas transações aparecerão aqui'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const IconComponent = getTransactionIcon(transaction);
              const amount = parseFloat(transaction.amount);
              const isPositive = amount > 0;
              
              return (
                <div 
                  key={transaction.id}
                  className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] bg-creme border-dark-light"
                  data-testid={`activity-${transaction.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bege-transparent">
                        <IconComponent className="w-6 h-6 text-dark" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 text-dark">
                          {getTransactionTitle(transaction)}
                        </h4>
                        <p className="text-sm text-dark opacity-70">
                          {transaction.description || 'Sem descrição'} • {formatDate(transaction.createdAt || transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                      </p>
                      <p className="text-xs text-dark opacity-50 capitalize">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
