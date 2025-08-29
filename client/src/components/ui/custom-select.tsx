import { ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function CustomSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Selecione uma opção",
  disabled = false,
  className = "",
  label = null
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fechar dropdown ao pressionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-lg font-semibold mb-3 text-dark">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
        }`}
        style={{ 
          backgroundColor: 'rgba(255, 229, 189, 0.1)', 
          borderColor: isOpen ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
          borderWidth: isOpen ? '2px' : '1px',
          color: '#303030'
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-testid="custom-select-trigger"
      >
        <span className={`font-medium ${!selectedOption ? 'opacity-60' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-dark`}
        />
      </button>
      
      {isOpen && !disabled && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 bg-creme border-dark-light"
          role="listbox"
          data-testid="custom-select-options"
        >
          {options.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              onClick={() => handleSelect(opcao.value)}
              className="w-full p-4 text-left hover:bg-opacity-50 transition-all duration-150 flex items-center justify-between focus:outline-none focus:bg-opacity-70 text-dark"
              style={{ 
                backgroundColor: value === opcao.value ? 'rgba(255, 229, 189, 0.2)' : 'transparent'
              }}
              role="option"
              aria-selected={value === opcao.value}
              data-testid={`custom-select-option-${opcao.value}`}
            >
              <span className="font-medium">{opcao.label}</span>
              {value === opcao.value && (
                <Check className="w-4 h-4" style={{ color: '#fa7653' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}