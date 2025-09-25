// Cache local para criação de fundos
export interface FundData {
  name: string;
  objective: {
    type: 'standard' | 'custom';
    objectiveOptionId?: string;
    customObjective?: string;
  } | string; // Suporte para compatibilidade com string
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
      objective: { type: 'custom', customObjective: '' },
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

  // Determinar objective como string para compatibilidade com API de criação
  let objectiveString = '';
  if (typeof cached.objective === 'string') {
    objectiveString = cached.objective;
  } else if (cached.objective.type === 'custom') {
    objectiveString = cached.objective.customObjective || '';
  } else {
    // Para objetivo padrão, usar placeholder (será substituído pela nova estrutura)
    objectiveString = 'Objetivo selecionado';
  }

  // Criar o fundo
  const fundResponse = await fetch('/api/funds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: cached.name,
      objective: objectiveString,
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
  
  // Agora definir o objetivo usando a nova estrutura
  if (typeof cached.objective === 'object' && fund.id) {
    try {
      if (cached.objective.type === 'standard' && cached.objective.objectiveOptionId) {
        // Definir objetivo padrão
        await fetch(`/api/funds/${fund.id}/objective/standard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            objectiveOptionId: cached.objective.objectiveOptionId,
            changeReason: 'Objetivo definido durante a criação do fundo'
          }),
        });
      } else if (cached.objective.type === 'custom' && cached.objective.customObjective) {
        // Definir objetivo personalizado
        await fetch(`/api/funds/${fund.id}/objective/custom`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customObjective: cached.objective.customObjective,
            customIcon: 'Target',
            changeReason: 'Objetivo personalizado definido durante a criação do fundo'
          }),
        });
      }
      console.log('Fund objective set successfully using new structure');
    } catch (objectiveError) {
      console.error('Error setting fund objective:', objectiveError);
      // Não falhar a criação do fundo se houver erro ao definir objetivo
    }
  }

  // TODO: Adicionar membros ao fundo se houver no cache
  if (cached.members && cached.members.length > 1) {
    // Por enquanto, apenas logamos os membros
    console.log('Members to add to fund:', cached.members.filter(m => !m.isAdmin));
  }

  // Limpar cache após criação bem-sucedida
  clearFundCache();

  return fund;
}