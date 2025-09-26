import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Fund } from "@shared/schema";
import FundDataForm from "@/components/fund-data-form";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function EditFundData() {
  const [, params] = useRoute("/fund/:id/edit-data");
  const fundId = params?.id;
  const [, setLocation] = useLocation();

  // Carregar dados do fundo
  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  // Mutation para atualizar dados do fundo
  const updateDataMutation = useMutation({
    mutationFn: async (fundData: { name: string; imageType: 'emoji' | 'url'; imageValue: string }) => {
      if (!fundId) throw new Error('Fund ID is required');
      
      return apiRequest(
        'PUT',
        `/api/funds/${fundId}/data`,
        {
          name: fundData.name,
          imageType: fundData.imageType,
          imageValue: fundData.imageValue,
          changeReason: 'Dados do fundo atualizados pelo usuário'
        }
      );
    },
    onSuccess: () => {
      // Invalidar cache do fundo e histórico de dados para refletir mudanças
      queryClient.invalidateQueries({ queryKey: ['/api/funds', fundId] });
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
      queryClient.invalidateQueries({ queryKey: ['fund-data-history', fundId] });
      
      // Voltar para histórico de dados
      setLocation(`/fund/${fundId}/historico-dados`);
    },
    onError: (error) => {
      console.error('Erro ao atualizar dados do fundo:', error);
      // Por enquanto apenas log, mas poderia mostrar toast de erro
    }
  });

  const handleBack = () => {
    setLocation(`/fund/${fundId}/historico-dados`);
  };

  const handleSubmit = (fundData: { name: string; imageType: 'emoji' | 'url'; imageValue: string }) => {
    updateDataMutation.mutate(fundData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Carregando...</div>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Fundo não encontrado</div>
      </div>
    );
  }

  return (
    <FundDataForm
      title="Alterar dados do fundo"
      subtitle={`Atualize o nome e imagem do fundo ${fund.name}`}
      initialName={fund.name || ''}
      initialImageType={(fund.imageType as 'emoji' | 'url') || 'emoji'}
      initialImageValue={fund.imageValue || '💰'}
      backButtonText="Voltar"
      submitButtonText="Salvar alterações"
      onBack={handleBack}
      onSubmit={handleSubmit}
      isLoading={updateDataMutation.isPending}
    />
  );
}