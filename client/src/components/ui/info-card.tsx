import { Lightbulb, LucideIcon } from "lucide-react";

interface InfoCardProps {
  icon?: LucideIcon;
  title?: string;
  message: string;
  className?: string;
}

export default function InfoCard({ 
  icon: Icon = Lightbulb, 
  title = "Dica:", 
  message, 
  className = "" 
}: InfoCardProps) {
  return (
    <div 
      className={`rounded-2xl p-4 border ${className}`}
      style={{ 
        backgroundColor: 'rgba(255, 229, 189, 0.1)', 
        borderColor: 'rgba(48, 48, 48, 0.1)',
        borderWidth: '1px'
      }}
      data-testid="info-card"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(48, 48, 48, 0.7)' }} />
        <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
          <strong>{title}</strong> {message}
        </p>
      </div>
    </div>
  );
}