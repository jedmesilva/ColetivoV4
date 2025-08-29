// Cache local para criação de fundos
export interface FundData {
  name: string;
  objective: string;
  emoji: string;
  imageFile?: File;
  members: Array<{
    id: number;
    nome: string;
    username: string;
    isAdmin?: boolean;
  }>;
}

let fundCache: FundData | null = null;

export const getFundCache = (): FundData | null => {
  return fundCache;
};

export const updateFundCache = (data: Partial<FundData>) => {
  if (!fundCache) {
    fundCache = {
      name: '',
      objective: '',
      emoji: '💰',
      members: [{
        id: 0,
        nome: 'Você',
        username: 'voce.admin',
        isAdmin: true
      }]
    };
  }
  
  fundCache = { ...fundCache, ...data };
};

export const clearFundCache = () => {
  fundCache = null;
};

export const createFundFromCache = async (): Promise<any> => {
  if (!fundCache) {
    throw new Error('Nenhum dado de fundo encontrado no cache');
  }

  // Simular criação do fundo
  const newFund = {
    id: `fund-${Date.now()}`,
    name: fundCache.name,
    description: fundCache.objective,
    emoji: fundCache.emoji,
    balance: '0',
    growthPercentage: '0',
    memberCount: fundCache.members.length,
    createdAt: new Date().toISOString(),
    createdBy: 'current-user'
  };

  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Adicionar ao localStorage temporariamente para simular persistência
  const existingFunds = JSON.parse(localStorage.getItem('local-funds') || '[]');
  existingFunds.push(newFund);
  localStorage.setItem('local-funds', JSON.stringify(existingFunds));

  // Limpar cache após criação
  clearFundCache();
  
  return newFund;
};