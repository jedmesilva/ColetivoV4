// Cache local para fluxo de contribuições
export interface ContributionData {
  fundId?: string;
  fundName?: string;
  fundEmoji?: string;
  valor?: number;
  metodoPagamento?: 'conta' | 'pix';
}

let contributionCache: ContributionData | null = null;

export const getContributionCache = (): ContributionData | null => {
  return contributionCache;
};

export const updateContributionCache = (data: Partial<ContributionData>) => {
  if (!contributionCache) {
    contributionCache = {};
  }
  
  contributionCache = { ...contributionCache, ...data };
};

export const clearContributionCache = () => {
  contributionCache = null;
};

export const processContribution = async (): Promise<any> => {
  if (!contributionCache) {
    throw new Error('Nenhum dado de contribuição encontrado no cache');
  }

  if (!contributionCache.fundId || !contributionCache.valor || !contributionCache.metodoPagamento) {
    throw new Error('Dados incompletos para processar contribuição');
  }

  try {
    // Preparar dados para a API
    const contributionData = {
      fundId: contributionCache.fundId,
      amount: contributionCache.valor.toString(),
      description: `Contribuição para ${contributionCache.fundName}`,
      paymentMethod: contributionCache.metodoPagamento === 'conta' ? 'account_balance' : contributionCache.metodoPagamento
    };

    // Chamar API real para processar a contribuição
    const response = await fetch('/api/contributions/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contributionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao processar contribuição');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Falha no processamento da contribuição');
    }

    // Formatar resposta para compatibilidade com o frontend
    return {
      id: result.contribution.id,
      fundId: contributionCache.fundId,
      fundName: contributionCache.fundName,
      fundEmoji: contributionCache.fundEmoji,
      valor: contributionCache.valor,
      metodoPagamento: contributionCache.metodoPagamento,
      status: result.contribution.status === 'completed' ? 'concluida' : 'pendente',
      dataContribuicao: result.contribution.created_at,
      idTransacao: result.contribution.transaction_id || result.contribution.id,
      message: result.message,
      accountTransaction: result.accountTransaction
    };
    
  } catch (error) {
    console.error('Erro ao processar contribuição:', error);
    throw error;
  }
};