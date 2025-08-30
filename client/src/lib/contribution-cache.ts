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

  // Simular processamento da contribuição
  const contribution = {
    id: `contrib-${Date.now()}`,
    fundId: contributionCache.fundId,
    fundName: contributionCache.fundName,
    fundEmoji: contributionCache.fundEmoji,
    valor: contributionCache.valor,
    metodoPagamento: contributionCache.metodoPagamento,
    status: 'concluida',
    dataContribuicao: new Date().toISOString(),
    idTransacao: `TXN-${Date.now()}`
  };

  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000));

  // NÃO limpar cache aqui - será limpo quando o usuário sair da tela de confirmação
  
  return contribution;
};