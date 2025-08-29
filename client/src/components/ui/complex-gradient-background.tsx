interface ComplexGradientBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export default function ComplexGradientBackground({ 
  children, 
  className = "w-full h-screen" 
}: ComplexGradientBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Gradiente Base */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(135deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
        }}
      />
      
      {/* Gradiente Invertido - Diagonal Oposta */}
      <div 
        className="absolute inset-0 opacity-70"
        style={{ 
          background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
        }}
      />
      
      {/* Gradiente Radial do Centro */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{ 
          background: 'radial-gradient(circle at center, #ffc22f, #fa7653, #fd6b61, transparent)' 
        }}
      />
      
      {/* Gradiente Horizontal Invertido */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{ 
          background: 'linear-gradient(270deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
        }}
      />
      
      {/* Gradiente Vertical */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{ 
          background: 'linear-gradient(180deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
        }}
      />
      
      {/* Gradiente Radial Superior Esquerdo */}
      <div 
        className="absolute inset-0 opacity-45"
        style={{ 
          background: 'radial-gradient(circle at top left, #ffe5bd, #ffc22f, #fa7653, transparent)' 
        }}
      />
      
      {/* Gradiente Radial Inferior Direito */}
      <div 
        className="absolute inset-0 opacity-35"
        style={{ 
          background: 'radial-gradient(circle at bottom right, #fd6b61, #fa7653, #ffc22f, transparent)' 
        }}
      />
      
      {/* Gradiente Diagonal 45 graus */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{ 
          background: 'linear-gradient(45deg, #fa7653, #fd6b61, #ffc22f, #ffe5bd, #fffdfa)' 
        }}
      />
      
      {/* Gradiente Cônico */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{ 
          background: 'conic-gradient(from 0deg at center, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61, #fffdfa)' 
        }}
      />
      
      {/* Camada para suavizar o centro */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'radial-gradient(circle, rgba(255, 156, 65, 1) 0%, rgba(255, 156, 65, 0.7) 8%, rgba(255, 156, 65, 0.4) 15%, rgba(255, 156, 65, 0.1) 22%, transparent 30%)' 
        }}
      />
      
      {/* Camada de mistura para suavizar */}
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.1), rgba(255, 229, 189, 0.1), rgba(255, 194, 47, 0.1), rgba(250, 118, 83, 0.1), rgba(253, 107, 97, 0.1))',
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Conteúdo */}
      {children && (
        <div className="relative z-10 h-full">
          {children}
        </div>
      )}
    </div>
  );
}