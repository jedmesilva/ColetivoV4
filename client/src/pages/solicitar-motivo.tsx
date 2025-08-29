import { ArrowLeft, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getSolicitationCache, updateSolicitationCache } from "@/lib/solicitation-cache";

export default function SolicitarMotivo() {
  const [motivo, setMotivo] = useState('');
  const [, setLocation] = useLocation();
  
  // Dados da solicitação
  const [dadosSolicitacao, setDadosSolicitacao] = useState({
    fundo: {
      nome: '',
      emoji: ''
    },
    valor: 0
  });

  useEffect(() => {
    const cached = getSolicitationCache();
    if (!cached || !cached.fundId || !cached.valor) {
      // Se não há dados, redirecionar para seleção de fundo
      setLocation('/solicitar/select-fund');
      return;
    }

    setDadosSolicitacao({
      fundo: {
        nome: cached.fundName || '',
        emoji: cached.fundEmoji || ''
      },
      valor: cached.valor
    });
  }, [setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMotivo(e.target.value);
  };

  const handleSubmit = () => {
    if (motivo.trim().length >= 10) {
      // Salvar motivo no cache
      updateSolicitationCache({
        motivo: motivo.trim()
      });
      
      // Avançar para próxima tela
      setLocation('/solicitar/plano');
    }
  };

  const handleVoltar = () => {
    setLocation('/solicitar/valor');
  };

  const podeAvancar = motivo.trim().length >= 10;

  return (
    <div className="min-h-screen bg-creme">
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
      `}</style>

      {/* Header Section com Múltiplos Gradientes */}
      <div className="relative overflow-hidden">
        {/* Gradientes múltiplos */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 opacity-70" style={{ 
          background: 'linear-gradient(315deg, #fd6b61, #fa7653, #ffc22f, #ffe5bd, #fffdfa)' 
        }} />
        <div className="absolute inset-0 opacity-60" style={{ 
          background: 'radial-gradient(circle at center, #ffc22f, #fa7653, #fd6b61, transparent)' 
        }} />

        {/* Conteúdo do Header */}
        <div className="relative z-10">
          {/* Navigation Header */}
          <div className="flex items-center p-4 pt-12">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleVoltar}
                className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                aria-label="Voltar"
                data-testid="button-back"
              >
                <ArrowLeft className="w-6 h-6 text-creme" />
              </button>
              
              {/* Info do Fundo */}
              <span className="text-xl font-bold text-creme">
                {dadosSolicitacao.fundo.nome}
              </span>
            </div>
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme">Motivo da solicitação</h1>
            <p className="text-lg opacity-90 text-creme">
              Explique o objetivo desta solicitação de <strong>{dadosSolicitacao.valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32 bg-creme">
        <div className="px-4 max-w-md mx-auto">
          
          {/* Campo de Descrição */}
          <div className="mb-8">
            <label className="block text-lg font-semibold mb-4 text-dark">
              Descreva o motivo
            </label>
            <div className="w-8 h-1 rounded-full mb-6 gradient-primary"></div>
            
            <div className="relative">
              <textarea
                value={motivo}
                onChange={handleInputChange}
                placeholder="Ex: Preciso comprar novos uniformes para o time..."
                className="textarea-limpo"
                rows={4}
                maxLength={500}
                data-testid="input-reason"
              />
              
              {/* Contador de caracteres */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-dark opacity-60">
                  Mínimo: 10 caracteres
                </p>
                <p className="text-sm text-dark opacity-60">
                  {motivo.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Card Informativo */}
          <div className="mb-8">
            <div className="rounded-2xl p-4 border bg-white border-bege opacity-60">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5 text-dark opacity-70" />
                <p className="text-sm text-dark opacity-70">
                  <strong>Dica:</strong> Seja específico sobre como o valor será utilizado. Isso ajuda os administradores do fundo a entender melhor sua necessidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Continuar - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-6 bg-creme">
        <div className="max-w-md mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={!podeAvancar}
            className="w-full rounded-3xl p-4 text-creme font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ 
              background: podeAvancar 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
                : 'rgba(48, 48, 48, 0.2)'
            }}
            data-testid="button-continue"
          >
            <span>Continuar</span>
          </button>
        </div>
      </div>
    </div>
  );
}