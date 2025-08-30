import { ArrowLeft, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getRequestCache, updateRequestCache } from "@/lib/request-cache";

interface Fund {
  nome: string;
  emoji: string;
}

export default function RequestReason() {
  const [motivo, setMotivo] = useState('');
  const [dadosSolicitacao, setDadosSolicitacao] = useState<{
    fundo: Fund;
    valor: number;
  } | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const cached = getRequestCache();
    if (cached && cached.fundId && cached.valor) {
      setDadosSolicitacao({
        fundo: {
          nome: cached.fundName || '',
          emoji: cached.fundEmoji || ''
        },
        valor: cached.valor
      });
      
      if (cached.motivo) {
        setMotivo(cached.motivo);
      }
    } else {
      // Se não há dados, redirecionar para seleção
      setLocation('/request/select-fund');
    }
  }, [setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMotivo(e.target.value);
  };

  const handleSubmit = () => {
    if (motivo.trim()) {
      // Salvar motivo no cache
      updateRequestCache({
        motivo: motivo.trim()
      });
      
      // Navegar para plano de pagamento
      setLocation('/request/payment-plan');
    }
  };

  const podeAvancar = motivo.trim().length >= 10; // Mínimo de 10 caracteres

  if (!dadosSolicitacao) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdfa' }}>
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

      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradientes múltiplos */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-70"
          style={{ 
            background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-60"
          style={{ 
            background: 'radial-gradient(circle at center, #ffc22f, #fa7653, #fd6b61, transparent)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-50"
          style={{ 
            background: 'linear-gradient(270deg, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-40"
          style={{ 
            background: 'linear-gradient(180deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-45"
          style={{ 
            background: 'radial-gradient(circle at top left, #ffe5bd, #ffc22f, #fa7653, transparent)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-35"
          style={{ 
            background: 'radial-gradient(circle at bottom right, #fd6b61, #fa7653, #ffc22f, transparent)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            background: 'linear-gradient(45deg, #fa7653, #fd6b61, #ffc22f, #ffe5bd, #fffdfa)' 
          }}
        />
        <div 
          className="absolute inset-0 opacity-25"
          style={{ 
            background: 'conic-gradient(from 0deg at center, #fffdfa, #ffe5bd, #ffc22f, #fa7653, #fd6b61, #fffdfa)' 
          }}
        />
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 253, 250, 0.1), rgba(255, 229, 189, 0.1), rgba(255, 194, 47, 0.1), rgba(250, 118, 83, 0.1), rgba(253, 107, 97, 0.1))',
            mixBlendMode: 'overlay'
          }}
        />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex items-center p-6 pt-12">
            <div className="flex items-center gap-4">
              <button 
                className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
                aria-label="Voltar"
                onClick={() => setLocation('/request/amount')}
              >
                <ArrowLeft className="w-6 h-6" style={{ color: '#fffdfa' }} />
              </button>
              
              {/* Info do Fundo */}
              <span className="text-xl font-bold" style={{ color: '#fffdfa' }}>
                {dadosSolicitacao.fundo.nome}
              </span>
            </div>
          </div>

          {/* Título da Página */}
          <div className="px-6 pb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#fffdfa' }}>Motivo da solicitação</h1>
            <p className="text-lg opacity-90" style={{ color: '#fffdfa' }}>
              Explique o objetivo desta solicitação de <strong>{dadosSolicitacao.valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32" style={{ backgroundColor: '#fffdfa' }}>
        <div className="px-6 max-w-md mx-auto">
          
          {/* Campo de Descrição */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4" style={{ color: '#303030' }}>
              Descreva o motivo
            </label>
            <div 
              className="w-8 h-1 rounded-full mb-6"
              style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
            ></div>
            
            <div className="relative">
              <textarea
                value={motivo}
                onChange={handleInputChange}
                placeholder="Ex: Preciso comprar novos uniformes para o time..."
                className="textarea-limpo"
                rows={4}
                maxLength={500}
              />
              
              {/* Contador de caracteres */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.6)' }}>
                  Mínimo: 10 caracteres
                </p>
                <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.6)' }}>
                  {motivo.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Card Informativo */}
          <div className="mb-8">
            <div 
              className="rounded-2xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(255, 229, 189, 0.1)', 
                borderColor: 'rgba(48, 48, 48, 0.1)',
                borderWidth: '1px'
              }}
            >
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(48, 48, 48, 0.7)' }} />
                <p className="text-sm" style={{ color: 'rgba(48, 48, 48, 0.7)' }}>
                  <strong>Dica:</strong> Seja específico sobre como o valor será utilizado. Isso ajuda os administradores do fundo a entender melhor sua necessidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Continuar - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-3" style={{ backgroundColor: '#fffdfa' }}>
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={!podeAvancar}
            className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ 
              background: podeAvancar 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
                : 'rgba(48, 48, 48, 0.2)'
            }}
          >
            <span>Continuar</span>
          </button>
        </div>
      </div>
    </div>
  );
}