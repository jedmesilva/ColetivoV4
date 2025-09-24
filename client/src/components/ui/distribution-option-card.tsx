
import React from 'react';
import { Check, TrendingUp, Users } from 'lucide-react';

interface DistributionOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface DistributionOptionCardProps {
  option: DistributionOption;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function DistributionOptionCard({ 
  option, 
  isSelected = false, 
  onSelect 
}: DistributionOptionCardProps) {
  const getIconComponent = () => {
    switch (option.icon) {
      case 'TrendingUp':
        return TrendingUp;
      case 'Users':
        return Users;
      default:
        return TrendingUp;
    }
  };

  const IconComponent = getIconComponent();

  return (
    <button
      onClick={onSelect}
      className="w-full rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] text-left relative outline-none focus:outline-none"
      style={{ 
        backgroundColor: isSelected ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa',
        borderColor: isSelected ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
        borderWidth: isSelected ? '2px' : '1px'
      }}
      data-testid={`distribution-option-${option.id}`}
    >
      {/* Check icon para selecionado */}
      {isSelected && (
        <div 
          className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
        >
          <Check className="w-4 h-4" style={{ color: '#fffdfa' }} />
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div 
          className="p-3 rounded-2xl flex-shrink-0"
          style={{ 
            backgroundColor: isSelected ? 
              'rgba(255, 194, 47, 0.2)' : 
              'rgba(255, 229, 189, 0.3)' 
          }}
        >
          <IconComponent className="w-6 h-6" style={{ color: '#303030' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2" style={{ color: '#303030' }}>
            {option.title}
          </h3>
          <p className="leading-relaxed" style={{ color: '#303030' }}>
            {option.description}
          </p>
        </div>
      </div>
    </button>
  );
}
