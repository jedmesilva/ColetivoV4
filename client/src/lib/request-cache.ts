// Cache local para fluxo de solicitações de capital
export interface RequestData {
  fundId?: string;
  fundName?: string;
  fundEmoji?: string;
  valor?: number;
  motivo?: string;
  planoPagamento?: {
    tipo: 'automatico' | 'personalizado';
    dataInicio?: string;
    numeroParcelas?: number;
    intervaloParcelas?: string;
    parcelas?: Array<{
      id: number;
      numero: number;
      valor: number;
      data: string;
      dataFormatada: string;
    }>;
  };
}

let requestCache: RequestData | null = null;

export const getRequestCache = (): RequestData | null => {
  return requestCache;
};

export const updateRequestCache = (data: Partial<RequestData>) => {
  if (!requestCache) {
    requestCache = {};
  }
  
  requestCache = { ...requestCache, ...data };
};

export const clearRequestCache = () => {
  requestCache = null;
};

export const processRequest = async (): Promise<any> => {
  if (!requestCache) {
    throw new Error('Nenhum dado de solicitação encontrado no cache');
  }

  if (!requestCache.fundId || !requestCache.valor || !requestCache.motivo) {
    throw new Error('Dados incompletos para processar solicitação');
  }

  // Simular processamento da solicitação
  const request = {
    id: `request-${Date.now()}`,
    fundId: requestCache.fundId,
    fundName: requestCache.fundName,
    fundEmoji: requestCache.fundEmoji,
    valor: requestCache.valor,
    motivo: requestCache.motivo,
    planoPagamento: requestCache.planoPagamento,
    status: 'pendente', // solicitações começam como pendentes
    dataSolicitacao: new Date().toISOString(),
    idSolicitacao: `REQ-${Date.now()}`
  };

  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Limpar cache após processamento
  clearRequestCache();
  
  return request;
};