import { useState, ChangeEvent, TextareaHTMLAttributes } from "react";

interface TextareaLimpoProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  rows?: number;
  showCounter?: boolean;
  showMinLength?: boolean;
  label?: string;
  className?: string;
}

export default function TextareaLimpo({ 
  value = '',
  onChange,
  placeholder = '',
  maxLength = 500,
  minLength = 0,
  rows = 4,
  showCounter = true,
  showMinLength = true,
  label,
  className = "",
  ...props 
}: TextareaLimpoProps) {
  const [internalValue, setInternalValue] = useState(value);
  
  // Se onChange não for fornecido, usa estado interno
  const isControlled = onChange !== undefined;
  const currentValue = isControlled ? value : internalValue;
  
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (isControlled && onChange) {
      onChange(e);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <div className={className}>
      <style>{`
        .textarea-limpo {
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 1rem;
          border: 1px solid rgba(48, 48, 48, 0.1);
          font-size: 1.125rem;
          background-color: rgba(255, 229, 189, 0.1);
          color: #303030;
          outline: none;
          box-shadow: none;
          min-height: 120px;
          resize: vertical;
          font-family: inherit;
          line-height: 1.5;
        }

        .textarea-limpo:focus {
          outline: none;
          box-shadow: none;
          border-color: rgba(48, 48, 48, 0.1);
        }

        .textarea-limpo::placeholder {
          color: rgba(48, 48, 48, 0.5);
        }

        .textarea-limpo:focus-visible {
          outline: none;
          box-shadow: none;
        }

        .textarea-limpo:active,
        .textarea-limpo:hover {
          outline: none;
          box-shadow: none;
        }
      `}</style>

      {label && (
        <>
          <label className="block text-lg font-semibold mb-4 text-dark">
            {label}
          </label>
          <div 
            className="w-8 h-1 rounded-full mb-6"
            style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
          ></div>
        </>
      )}
      
      <div className="relative">
        <textarea
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="textarea-limpo"
          rows={rows}
          maxLength={maxLength}
          data-testid="textarea-limpo"
          {...props}
        />
        
        {/* Contador de caracteres */}
        {(showCounter || showMinLength) && (
          <div className="flex justify-between items-center mt-2">
            {showMinLength && minLength > 0 && (
              <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.6)' }}>
                Mínimo: {minLength} caracteres
              </p>
            )}
            {showCounter && (
              <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.6)' }}>
                {currentValue.length}/{maxLength}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}