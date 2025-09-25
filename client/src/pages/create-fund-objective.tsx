import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getFundCache, updateFundCache } from "@/lib/fund-cache";
import FundObjectiveForm from "@/components/fund-objective-form";

export default function CreateFundObjective() {
  const [nomeFundo, setNomeFundo] = useState('');
  const [, setLocation] = useLocation();

  // Carregar dados do cache
  useEffect(() => {
    const cached = getFundCache();
    if (cached?.name) {
      setNomeFundo(cached.name);
    }
  }, []);

  const handleBack = () => {
    setLocation('/create-fund/name');
  };

  const handleSubmit = (objectiveData: { type: 'standard' | 'custom'; objectiveOptionId?: string; customObjective?: string }) => {
    // Salvar no cache
    updateFundCache({ objective: objectiveData });
    // Navegar para a próxima tela
    setLocation('/create-fund/image');
  };

  const initialObjective = (() => {
    const cached = getFundCache();
    if (cached?.objective) {
      if (typeof cached.objective === 'string') {
        return cached.objective;
      } else if (cached.objective.type === 'custom') {
        return cached.objective.customObjective || '';
      }
    }
    return '';
  })();

  return (
    <FundObjectiveForm
      title="Objetivo do fundo"
      subtitle={`Qual o objetivo do fundo ${nomeFundo}?`}
      initialObjective={initialObjective}
      backButtonText="Voltar"
      submitButtonText="Continuar"
      onBack={handleBack}
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}