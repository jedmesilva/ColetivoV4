import { Check } from "lucide-react";

interface IconCardProps {
  option: {
    emoji?: string;
    icon?: React.ComponentType<any>;
    name: string;
  };
  isSelected?: boolean;
  onSelect?: (emoji: string) => void;
}

export default function IconCard({ 
  option, 
  isSelected = false, 
  onSelect 
}: IconCardProps) {
  return (
    <button
      onClick={() => onSelect && onSelect(option.emoji || option.name)}
      className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] w-full relative outline-none focus:outline-none"
      style={{ 
        backgroundColor: isSelected ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
        borderColor: isSelected ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
        borderWidth: isSelected ? '2px' : '1px',
        boxShadow: 'none'
      }}
      data-testid={`icon-card-${option.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Check icon para selecionado */}
      {isSelected && (
        <div 
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
        >
          <Check className="w-4 h-4 text-creme" />
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
          {option.icon ? (
            <option.icon className="w-7 h-7 text-dark" />
          ) : (
            <span className="text-2xl">{option.emoji}</span>
          )}
        </div>
        
        {/* Nome */}
        <h3 className="text-lg font-bold text-dark">
          {option.name}
        </h3>
      </div>
    </button>
  );
}