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

  const handleSubmit = (objective: string) => {
    // Salvar no cache
    updateFundCache({ objective });
    // Navegar para a próxima tela
    setLocation('/create-fund/image');
  };

  const initialObjective = (() => {
    const cached = getFundCache();
    return cached?.objective || '';
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