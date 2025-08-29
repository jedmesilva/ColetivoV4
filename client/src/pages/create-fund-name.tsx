import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function CreateFundName() {
  const [nomeFundo, setNomeFundo] = useState('');
  const [, setLocation] = useLocation();

  const handleSubmit = () => {
    if (nomeFundo.trim()) {
      // Navegar para a próxima tela passando o nome do fundo
      setLocation(`/create-fund/objective?name=${encodeURIComponent(nomeFundo)}`);
    }
  };

  return (
    <div className="min-h-screen bg-creme">
      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradiente Base */}
        <div className="absolute inset-0 gradient-base" />
        
        {/* Gradiente Invertido - Diagonal Oposta */}
        <div className="absolute inset-0 opacity-70 gradient-overlay-1" />
        
        {/* Gradiente Radial do Centro */}
        <div className="absolute inset-0 opacity-60 gradient-overlay-2" />
        
        {/* Gradiente Horizontal Invertido */}
        <div className="absolute inset-0 opacity-50 gradient-overlay-3" />
        
        {/* Gradiente Vertical */}
        <div className="absolute inset-0 opacity-40 gradient-overlay-4" />
        
        {/* Gradiente Radial Superior Esquerdo */}
        <div className="absolute inset-0 opacity-45 gradient-overlay-5" />
        
        {/* Gradiente Radial Inferior Direito */}
        <div className="absolute inset-0 opacity-35 gradient-overlay-6" />
        
        {/* Gradiente Diagonal 45 graus */}
        <div className="absolute inset-0 opacity-30 gradient-overlay-7" />
        
        {/* Gradiente Cônico */}
        <div className="absolute inset-0 opacity-25 gradient-overlay-8" />
        
        {/* Camada para suavizar o centro */}
        <div className="absolute inset-0 gradient-center-soften" />
        
        {/* Camada de mistura para suavizar */}
        <div className="absolute inset-0 gradient-blend-overlay" />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex justify-between items-center p-4 pt-12">
            <button 
              onClick={() => setLocation('/')}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Voltar"
              data-testid="button-back"
            >
              <ArrowLeft className="w-6 h-6 text-creme" />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme" data-testid="page-title">
              Criar fundo coletivo
            </h1>
            <p className="text-lg opacity-90 text-creme">Defina um nome para começar</p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-24 bg-creme">
        <div className="px-4">
          
          {/* Formulário de Criação */}
          <div className="space-y-8">
            
            {/* Campo de Nome do Fundo */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-dark" data-testid="label-fund-name">
                Nome do fundo
              </label>
              <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>
              
              <input
                type="text"
                value={nomeFundo}
                onChange={(e) => setNomeFundo(e.target.value)}
                placeholder="Ex: Fundo do futebol"
                className="w-full px-6 py-4 rounded-2xl border text-lg bg-bege-light border-dark-light text-dark focus:outline-none focus:scale-[1.02] transition-all duration-200"
                autoFocus
                data-testid="input-fund-name"
              />
            </div>

            {/* Dicas */}
            <div className="rounded-2xl p-4 border bg-bege-light border-dark-light" data-testid="tips-card">
              <h4 className="font-semibold mb-2 text-dark">💡 Dicas</h4>
              <ul className="text-sm space-y-1 text-dark opacity-80">
                <li>• Escolha um nome claro e descritivo</li>
                <li>• Você poderá adicionar membros depois</li>
                <li>• O nome pode ser alterado a qualquer momento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Criar Fundo - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-creme">
        <button 
          onClick={handleSubmit}
          disabled={!nomeFundo.trim()}
          className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ 
            background: nomeFundo.trim() 
              ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
              : 'rgba(48, 48, 48, 0.2)'
          }}
          data-testid="button-create-fund"
        >
          <div className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            <span>Criar fundo</span>
          </div>
        </button>
      </div>
    </div>
  );
}