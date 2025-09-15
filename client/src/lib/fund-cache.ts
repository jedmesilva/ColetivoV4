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

export async function createFundFromCache(): Promise<any> {
  const cached = getFundCache();
  if (!cached) {
    throw new Error('No fund data cached');
  }

  console.log('Creating fund from cache:', cached);

  // Criar o fundo
  const fundResponse = await fetch('/api/funds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: cached.name,
      objective: cached.objective,
      fundImageValue: cached.emoji,
      contributionRate: '100.00',
      retributionRate: '100.00',
      isOpenForNewMembers: true,
      requiresApprovalForNewMembers: false,
    }),
  });

  if (!fundResponse.ok) {
    const errorText = await fundResponse.text();
    console.error('Failed to create fund:', errorText);
    throw new Error(`Failed to create fund: ${errorText}`);
  }

  const fund = await fundResponse.json();
  console.log('Fund created successfully:', fund);

  // TODO: Adicionar membros ao fundo se houver no cache
  if (cached.members && cached.members.length > 1) {
    // Por enquanto, apenas logamos os membros
    console.log('Members to add to fund:', cached.members.filter(m => !m.isAdmin));
  }

  // Limpar cache após criação bem-sucedida
  clearFundCache();

  return fund;
}