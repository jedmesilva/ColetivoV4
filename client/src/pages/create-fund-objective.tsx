import { ArrowLeft, Target, Check, ShoppingCart, Plane, Home, Users, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// Componente IconCard
interface IconCardProps {
  option: {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
  };
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

function IconCard({ option, isSelected = false, onSelect }: IconCardProps) {
  return (
    <button
      onClick={() => onSelect && onSelect(option.id)}
      className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] w-full relative outline-none focus:outline-none"
      style={{ 
        backgroundColor: isSelected ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
        borderColor: isSelected ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
        borderWidth: isSelected ? '2px' : '1px',
        boxShadow: 'none'
      }}
      data-testid={`option-${option.id}`}
    >
      {/* Check icon para selecionado */}
      {isSelected && (
        <div 
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
          data-testid={`check-${option.id}`}
        >
          <Check className="w-4 h-4" style={{ color: '#fffdfa' }} />
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        {/* Ícone */}
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{ 
            backgroundColor: isSelected ? 
              'rgba(255, 194, 47, 0.2)' : 
              'rgba(255, 229, 189, 0.3)' 
          }}
        >
          <option.icon className="w-7 h-7" style={{ color: '#303030' }} />
        </div>
        
        {/* Nome */}
        <h3 className="text-lg font-bold text-dark">
          {option.name}
        </h3>
      </div>
    </button>
  );
}

export default function CreateFundObjective() {
  const [objetivo, setObjetivo] = useState('');
  const [objetivoSelecionado, setObjetivoSelecionado] = useState('');
  const [nomeFundo, setNomeFundo] = useState('');
  const [, setLocation] = useLocation();

  // Pegar o nome do fundo da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    if (name) {
      setNomeFundo(decodeURIComponent(name));
    }
  }, []);

  // Objetivos pré-definidos
  const objetivosPredefinidos = [
    { id: 'compras', name: 'Compras', icon: ShoppingCart },
    { id: 'viagens', name: 'Viagens', icon: Plane },
    { id: 'aluguel', name: 'Aluguel', icon: Home },
    { id: 'churrasco', name: 'Churrasco', icon: Users },
    { id: 'emergencia', name: 'Emergência', icon: AlertCircle }
  ];

  const handleObjetivoSelecionado = (id: string) => {
    const objetivoObj = objetivosPredefinidos.find(obj => obj.id === id);
    if (objetivoObj) {
      setObjetivo(objetivoObj.name);
      setObjetivoSelecionado(id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setObjetivo(e.target.value);
    // Se o usuário digitar, limpar seleção dos cards
    if (e.target.value !== objetivosPredefinidos.find(obj => obj.id === objetivoSelecionado)?.name) {
      setObjetivoSelecionado('');
    }
  };

  const handleSubmit = () => {
    if (objetivo.trim()) {
      // Navegar para a próxima tela passando os dados
      setLocation(`/create-fund/image?name=${encodeURIComponent(nomeFundo)}&objective=${encodeURIComponent(objetivo)}`);
    }
  };

  const podeAvancar = objetivo.trim();

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
              onClick={() => setLocation('/create-fund/name')}
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
              Objetivo do fundo
            </h1>
            <p className="text-lg opacity-90 text-creme">
              Qual o objetivo do fundo <span className="font-bold">{nomeFundo}</span>?
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32 bg-creme">
        <div className="px-4">
          
          {/* Formulário de Objetivo */}
          <div className="space-y-6">
            
            {/* Campo de Objetivo */}
            <div>
              <label className="block text-lg font-semibold mb-4 text-dark" data-testid="label-objective">
                Descreva o objetivo
              </label>
              <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>
              
              <input
                type="text"
                value={objetivo}
                onChange={handleInputChange}
                placeholder="Ex: Compras do grupo"
                className="w-full px-6 py-4 rounded-2xl border text-lg transition-all duration-200 focus:outline-none focus:scale-[1.02] bg-bege-light border-dark-light text-dark"
                autoFocus
                data-testid="input-objective"
              />
            </div>

            {/* Seção de Objetivos Pré-definidos */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-dark" data-testid="predefined-options-title">
                Ou escolha uma das opções
              </h2>
              <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>
              
              <div className="grid grid-cols-2 gap-4">
                {objetivosPredefinidos.slice(0, 4).map((opcao) => (
                  <IconCard
                    key={opcao.id}
                    option={opcao}
                    isSelected={objetivoSelecionado === opcao.id}
                    onSelect={handleObjetivoSelecionado}
                  />
                ))}
              </div>
              
              {/* Quinta opção centralizada */}
              <div className="flex justify-center mt-4">
                <div className="w-1/2">
                  <IconCard
                    key={objetivosPredefinidos[4].id}
                    option={objetivosPredefinidos[4]}
                    isSelected={objetivoSelecionado === objetivosPredefinidos[4].id}
                    onSelect={handleObjetivoSelecionado}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Continuar - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-creme">
        <button 
          onClick={handleSubmit}
          disabled={!podeAvancar}
          className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ 
            background: podeAvancar 
              ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
              : 'rgba(48, 48, 48, 0.2)'
          }}
          data-testid="button-continue"
        >
          <div className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            <span>Continuar</span>
          </div>
        </button>
      </div>
    </div>
  );
}