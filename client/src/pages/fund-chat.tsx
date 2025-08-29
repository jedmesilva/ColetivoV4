import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Send, Image, Mic, MessageCircle, Plus, ChevronRight } from "lucide-react";
import { Fund } from "@shared/schema";

// Componente para renderizar uma mensagem individual
const MessageBubble = ({ message }: { message: any }) => {
  const { user, content, timestamp, avatar, isCurrentUser } = message;
  
  if (isCurrentUser) {
    // Mensagem do usuário atual (à direita)
    return (
      <div className="flex justify-end" data-testid={`message-current-user`}>
        <div className="flex flex-col items-end max-w-2xl" style={{ maxWidth: '85%' }}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-dark opacity-60">{timestamp}</span>
            <span className="text-dark">{user}</span>
          </div>
          <div 
            className="p-4 leading-relaxed rounded-3xl"
            style={{ 
              backgroundColor: 'rgba(255, 229, 189, 0.25)', 
              color: '#303030',
              borderRadius: '24px 6px 24px 24px'
            }}
          >
            {content}
          </div>
        </div>
      </div>
    );
  }
  
  // Mensagem de outros usuários (à esquerda)
  return (
    <div className="flex space-x-3" style={{ maxWidth: '85%' }} data-testid={`message-other-user`}>
      <div 
        className="w-10 h-10 rounded-2xl flex items-center justify-center font-semibold text-sm flex-shrink-0 bg-bege-transparent text-dark"
      >
        {avatar.initials}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-dark">{user}</span>
          <span className="text-sm text-dark opacity-60">{timestamp}</span>
        </div>
        <div 
          className="p-4 leading-relaxed w-fit max-w-2xl rounded-3xl"
          style={{ 
            backgroundColor: 'rgba(255, 229, 189, 0.1)', 
            color: '#303030',
            borderRadius: '6px 24px 24px 24px'
          }}
        >
          {content}
        </div>
      </div>
    </div>
  );
};

// Dados de teste para mensagens
const sampleMessages = [
  {
    user: "João Pedro",
    content: "Olá! Como está o desenvolvimento do projeto? Preciso saber se conseguiremos entregar até sexta-feira.",
    timestamp: "há 5 minutos",
    avatar: {
      initials: "JP",
      bg: "bg-blue-500"
    },
    isCurrentUser: false
  },
  {
    user: "Maria Rosa",
    content: "Oi João! Está indo muito bem, já terminamos 80% das funcionalidades. Acredito que conseguiremos sim entregar no prazo. Só falta alguns ajustes finais na interface.",
    timestamp: "há 3 minutos",
    avatar: {
      initials: "MR",
      bg: "bg-green-500"
    },
    isCurrentUser: false
  },
  {
    user: "Lucas Costa",
    content: "Perfeito! Se precisarem de ajuda com alguma coisa, podem me chamar. Estou disponível para dar suporte.",
    timestamp: "há 1 minuto",
    avatar: {
      initials: "LC",
      bg: "bg-purple-500"
    },
    isCurrentUser: false
  }
];

export default function FundChat() {
  const [, params] = useRoute("/fund/:id/chat");
  const fundId = params?.id;
  const [, setLocation] = useLocation();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(sampleMessages);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Remove a funcionalidade de envio com Enter
    // Agora Enter sempre quebra linha, independente do dispositivo
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const hadContent = message.trim().length > 0;
    const hasContent = newValue.trim().length > 0;
    
    // Se mudou de estado (vazio para com conteúdo ou vice-versa), inicia transição
    if (hadContent !== hasContent) {
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 100);
    }
    
    setMessage(newValue);
    adjustTextareaHeight(textareaRef.current);
  };

  const handleSend = () => {
    if (message.trim()) {
      // Adiciona a nova mensagem ao histórico
      const newMessage = {
        user: "Você",
        content: message,
        timestamp: "agora",
        avatar: {
          initials: "EU",
          bg: "bg-indigo-500"
        },
        isCurrentUser: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleImageUpload = () => {
    console.log('Abrir galeria de imagens');
  };

  const handleAudioRecord = () => {
    console.log('Iniciar gravação de áudio');
  };

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Carregando...</div>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-creme">
        <div className="text-xl text-dark">Fundo não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-creme">
      {/* Header Section com Múltiplos Gradientes - FIXO */}
      <div 
        className="relative overflow-hidden fixed top-0 left-0 right-0 z-40"
      >
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
          {/* Chat Header Section */}
          <div className="px-4 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Ícone do chat */}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255, 253, 250, 0.9)' }}
                  data-testid="chat-icon"
                >
                  <MessageCircle className="w-7 h-7 text-dark" />
                </div>
                
                {/* Título e descrição do chat */}
                <div>
                  <h1 className="text-2xl font-bold mb-0.5 text-creme" data-testid="fund-name-chat">
                    {fund.name}
                  </h1>
                  <p className="text-base opacity-90 text-creme">Chat coletivo</p>
                </div>
              </div>
              
              {/* Botão chevron */}
              <button 
                onClick={() => setLocation(`/fund/${fundId}`)}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'rgba(255, 253, 250, 0.2)' }}
                title="Detalhes do fundo"
                data-testid="button-back-to-details"
              >
                <ChevronRight className="w-6 h-6 text-creme" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section - Messages */}
      <div 
        className="rounded-t-3xl min-h-96 pt-32 pb-24 flex-1 overflow-y-auto bg-creme" 
      >
        <div className="max-w-4xl mx-auto px-4 space-y-6" data-testid="messages-container">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
        </div>
      </div>
      
      {/* Input Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-creme" data-testid="input-section">
        <div className="max-w-4xl mx-auto flex items-end gap-3 px-4">
          {/* Container do Input - Centro */}
          <div 
            className="flex items-end gap-2 rounded-2xl border backdrop-blur-sm flex-1 bg-creme"
            style={{ 
              borderColor: 'rgba(48, 48, 48, 0.1)',
              paddingLeft: '12px',
              paddingRight: '12px',
              marginTop: '12px',
              marginBottom: '12px'
            }}
          >
            {/* Botão Plus - Lado esquerdo do input */}
            <div className="flex items-end flex-shrink-0" style={{ marginTop: '14px', marginBottom: '14px' }}>
              <button 
                onClick={() => console.log('Abrir menu de anexos')}
                className="flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                title="Anexar"
                data-testid="button-attach"
              >
                <Plus size={20} className="text-dark" />
              </button>
            </div>
            
            <div className="relative flex-1 flex items-start min-w-0">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="w-full resize-none bg-transparent outline-none text-base leading-relaxed max-h-28 text-dark"
                style={{ 
                  paddingTop: '10px',
                  paddingBottom: '10px'
                }}
                rows={1}
                data-testid="input-message"
              />
            </div>
            
            {/* Botão de imagem dentro do input - com transição de escala */}
            <div className={`flex items-end flex-shrink-0 transition-all duration-150 ${
              message.trim() 
                ? 'hidden' 
                : isTransitioning 
                  ? 'scale-0 opacity-0' 
                  : 'scale-100 opacity-100'
            }`} style={{
              transitionProperty: 'transform, opacity',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: '14px',
              marginBottom: '14px'
            }}>
              <button 
                onClick={handleImageUpload}
                className="flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                title="Enviar imagem"
                data-testid="button-image"
              >
                <Image size={20} className="text-dark" />
              </button>
            </div>
          </div>

          {/* Botões Dinâmicos - Direita (Dois botões individuais com transição de escala) */}
          <div className="flex items-center justify-center flex-shrink-0 relative" style={{ marginTop: '12px', marginBottom: '12px' }}>
            {/* Botão de Microfone - Visível quando input vazio */}
            <button 
              onClick={handleAudioRecord}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-creme transition-all duration-150 hover:scale-105 active:scale-95 absolute gradient-primary ${
                message.trim() 
                  ? 'scale-0 opacity-0' 
                  : isTransitioning 
                    ? 'scale-0 opacity-0' 
                    : 'scale-100 opacity-100'
              }`}
              style={{ 
                transitionProperty: 'transform, opacity',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              title="Gravar áudio"
              data-testid="button-mic"
            >
              <Mic size={20} />
            </button>
            
            {/* Botão de Envio - Visível quando há conteúdo */}
            <button 
              onClick={handleSend}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-creme transition-all duration-150 hover:scale-105 active:scale-95 absolute gradient-primary ${
                !message.trim() 
                  ? 'scale-0 opacity-0' 
                  : isTransitioning 
                    ? 'scale-0 opacity-0' 
                    : 'scale-100 opacity-100'
              }`}
              style={{ 
                transitionProperty: 'transform, opacity',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: isTransitioning && message.trim() ? '75ms' : '0ms'
              }}
              title="Enviar mensagem"
              data-testid="button-send"
            >
              <Send size={20} />
            </button>
            
            {/* Espaçador invisível para manter o espaço */}
            <div className="w-12 h-12 opacity-0 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}