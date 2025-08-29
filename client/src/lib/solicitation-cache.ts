// Cache para dados da solicitação de capital em progresso
interface SolicitationData {
  fundId?: string;
  fundName?: string;
  fundEmoji?: string;
  valor?: number;
  motivo?: string;
  planoRetribuicao?: {
    tipo: 'automatico' | 'personalizado';
    dataInicio?: string;
    numeroParcelas?: number;
    intervaloParcelas?: string;
    parcelas?: Array<{
      numero: number;
      valor: number;
      data: string;
    }>;
  };
}

const SOLICITATION_CACHE_KEY = 'solicitation_cache';

export const getSolicitationCache = (): SolicitationData | null => {
  try {
    const cached = localStorage.getItem(SOLICITATION_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Erro ao ler cache de solicitação:', error);
    return null;
  }
};

export const updateSolicitationCache = (data: Partial<SolicitationData>) => {
  try {
    const existing = getSolicitationCache() || {};
    const updated = { ...existing, ...data };
    localStorage.setItem(SOLICITATION_CACHE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Erro ao atualizar cache de solicitação:', error);
  }
};

export const clearSolicitationCache = () => {
  try {
    localStorage.removeItem(SOLICITATION_CACHE_KEY);
  } catch (error) {
    console.error('Erro ao limpar cache de solicitação:', error);
  }
};

// Simulação do processamento da solicitação
export const processSolicitation = async () => {
  const cached = getSolicitationCache();
  if (!cached || !cached.fundId || !cached.valor || !cached.motivo) {
    throw new Error('Dados incompletos para processamento');
  }

  // Simular processamento (aqui seria a API real)
  await new Promise(resolve => setTimeout(resolve, 2000));

  const result = {
    id: `solicit-${Date.now()}`,
    fundId: cached.fundId,
    fundName: cached.fundName,
    fundEmoji: cached.fundEmoji,
    valor: cached.valor,
    motivo: cached.motivo,
    planoRetribuicao: cached.planoRetribuicao,
    status: 'pendente',
    dataSolicitacao: new Date().toISOString(),
    idSolicitacao: `SOL-${Date.now()}`
  };

  // Limpar cache após processamento
  clearSolicitationCache();

  return result;
};