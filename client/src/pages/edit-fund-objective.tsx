import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Fund } from "@shared/schema";
import FundObjectiveForm from "@/components/fund-objective-form";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function EditFundObjective() {
  const [, params] = useRoute("/fund/:id/edit-objective");
  const fundId = params?.id;
  const [, setLocation] = useLocation();

  // Carregar dados do fundo
  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  // Mutation para atualizar objetivo
  const updateObjectiveMutation = useMutation({
    mutationFn: async (objective: string) => {
      if (!fundId) throw new Error('Fund ID is required');
      
      return apiRequest(
        'POST',
        `/api/funds/${fundId}/objective`,
        {
          objective,
          changeReason: 'Objetivo atualizado pelo usuário'
        }
      );
    },
    onSuccess: () => {
      // Invalidar cache do fundo para refletir mudanças
      queryClient.invalidateQueries({ queryKey: ['/api/funds', fundId] });
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
      
      // Voltar para histórico de objetivos
      setLocation(`/fund/${fundId}/historico-objetivos`);
    },
    onError: (error) => {
      console.error('Erro ao atualizar objetivo:', error);
      // Por enquanto apenas log, mas poderia mostrar toast de erro
    }
  });

  const handleBack = () => {
    setLocation(`/fund/${fundId}/historico-objetivos`);
  };

  const handleSubmit = (objective: string) => {
    updateObjectiveMutation.mutate(objective);
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
    <FundObjectiveForm
      title="Alterar objetivo"
      subtitle={`Qual o novo objetivo do fundo ${fund.name}?`}
      initialObjective={fund.objective || ''}
      backButtonText="Voltar"
      submitButtonText="Salvar alterações"
      onBack={handleBack}
      onSubmit={handleSubmit}
      isLoading={updateObjectiveMutation.isPending}
    />
  );
}