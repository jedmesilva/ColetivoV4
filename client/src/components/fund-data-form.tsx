import { ArrowLeft, Upload, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// Interface para as props do componente
interface FundDataFormProps {
  title: string;
  subtitle: string;
  initialName?: string;
  initialImageType?: 'emoji' | 'url';
  initialImageValue?: string;
  backButtonText?: string;
  submitButtonText?: string;
  onBack: () => void;
  onSubmit: (fundData: { name: string; imageType: 'emoji' | 'url'; imageValue: string }) => void;
  isLoading?: boolean;
}

// Componente para o card de upload
interface UploadCardProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isSelected: boolean;
  onSelect: () => void;
}

function UploadCard({ onFileSelect, selectedFile, isSelected, onSelect }: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    onSelect();
    if (!selectedFile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-3xl p-6 border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer relative outline-none focus:outline-none min-h-32"
      style={{ 
        backgroundColor: isSelected ? 'rgba(255, 229, 189, 0.2)' : '#fffdfa', 
        borderColor: isSelected ? 'rgba(255, 229, 189, 0.8)' : 'rgba(48, 48, 48, 0.1)',
        borderWidth: isSelected ? '2px' : '1px',
        borderStyle: selectedFile ? 'solid' : 'dashed'
      }}
      data-testid="upload-card"
    >
      {/* Check icon para selecionado */}
      {isSelected && (
        <div 
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
          data-testid="upload-check"
        >
          <Check className="w-4 h-4" style={{ color: '#fffdfa' }} />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        data-testid="file-input"
      />

      <div className="flex flex-col items-center text-center h-full justify-center">
        {selectedFile ? (
          <>
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="Imagem selecionada"
              className="w-16 h-16 rounded-2xl object-cover mb-3"
              data-testid="selected-image"
            />
            <h3 className="text-lg font-bold text-dark">
              Sua imagem
            </h3>
            <p className="text-sm opacity-70 text-dark">
              {selectedFile.name.length > 20 ? selectedFile.name.substring(0, 20) + '...' : selectedFile.name}
            </p>
          </>
        ) : (
          <>
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{ backgroundColor: 'rgba(255, 229, 189, 0.3)' }}
            >
              <Upload className="w-8 h-8" style={{ color: '#303030' }} />
            </div>
            <h3 className="text-lg font-bold mb-1 text-dark">
              Enviar imagem
            </h3>
            <p className="text-sm opacity-70 text-dark">
              JPG, PNG até 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// Componente EmojiCard
interface EmojiCardProps {
  option: {
    id: string;
    name: string;
    emoji: string;
  };
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

function EmojiCard({ option, isSelected = false, onSelect }: EmojiCardProps) {
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
      data-testid={`emoji-${option.id}`}
    >
      {/* Check icon para selecionado */}
      {isSelected && (
        <div 
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(90deg, #ffc22f, #fa7653, #fd6b61)' }}
          data-testid={`emoji-check-${option.id}`}
        >
          <Check className="w-4 h-4" style={{ color: '#fffdfa' }} />
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        {/* Emoji */}
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-3xl"
          style={{ 
            backgroundColor: isSelected ? 
              'rgba(255, 194, 47, 0.2)' : 
              'rgba(255, 229, 189, 0.3)' 
          }}
        >
          {option.emoji}
        </div>
        
        {/* Nome */}
        <h3 className="text-lg font-bold text-dark">
          {option.name}
        </h3>
      </div>
    </button>
  );
}

export default function FundDataForm({
  title,
  subtitle,
  initialName = '',
  initialImageType = 'emoji',
  initialImageValue = '💰',
  backButtonText = 'Voltar',
  submitButtonText = 'Continuar',
  onBack,
  onSubmit,
  isLoading = false
}: FundDataFormProps) {
  const [step, setStep] = useState(1); // 1 = nome, 2 = imagem
  const [nomeFundo, setNomeFundo] = useState(initialName);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedOption, setSelectedOption] = useState(''); // 'upload' ou id do ícone

  // Emojis pré-definidos organizados por categoria
  const emojisPredefinidos = [
    { id: 'compras', name: 'Compras', emoji: '🛒' },
    { id: 'viagens', name: 'Viagens', emoji: '✈️' },
    { id: 'casa', name: 'Casa', emoji: '🏠' },
    { id: 'grupo', name: 'Grupo', emoji: '👥' },
    { id: 'emergencia', name: 'Emergência', emoji: '🚨' },
    { id: 'carro', name: 'Carro', emoji: '🚗' },
    { id: 'presente', name: 'Presente', emoji: '🎁' },
    { id: 'cafe', name: 'Café', emoji: '☕' },
    { id: 'amor', name: 'Amor', emoji: '❤️' },
    { id: 'musica', name: 'Música', emoji: '🎵' },
    { id: 'jogos', name: 'Jogos', emoji: '🎮' },
    { id: 'exercicio', name: 'Exercício', emoji: '💪' },
    { id: 'estudo', name: 'Estudo', emoji: '📚' },
    { id: 'bebe', name: 'Bebê', emoji: '👶' },
    { id: 'dinheiro', name: 'Poupança', emoji: '💰' }
  ];

  // Inicializar seleção baseada nos valores iniciais
  useEffect(() => {
    if (initialImageType === 'emoji' && initialImageValue) {
      const emojiSelecionado = emojisPredefinidos.find(e => e.emoji === initialImageValue);
      if (emojiSelecionado) {
        setSelectedIcon(emojiSelecionado.id);
        setSelectedOption(emojiSelecionado.id);
      }
    } else if (initialImageType === 'url' && initialImageValue) {
      // Para URLs, configurar para upload (simulação)
      setSelectedOption('upload');
    }
  }, [initialImageType, initialImageValue]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setSelectedIcon('');
    setSelectedOption('upload');
  };

  const handleIconSelect = (id: string) => {
    const emoji = emojisPredefinidos.find(e => e.id === id);
    if (emoji) {
      setSelectedIcon(id);
      setSelectedFile(null);
      setSelectedOption(id);
    }
  };

  const handleUploadSelect = () => {
    setSelectedOption('upload');
    setSelectedIcon('');
  };

  const handleNameContinue = () => {
    if (nomeFundo.trim()) {
      setStep(2);
    }
  };

  const handleImageBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (!nomeFundo.trim()) return;

    let finalImageType: 'emoji' | 'url' = 'emoji';
    let finalImageValue = '💰';

    if (selectedFile) {
      // Para upload de arquivo, usar URL (simulação)
      finalImageType = 'url';
      finalImageValue = URL.createObjectURL(selectedFile);
    } else if (selectedIcon) {
      const selectedEmoji = emojisPredefinidos.find(e => e.id === selectedIcon);
      if (selectedEmoji) {
        finalImageType = 'emoji';
        finalImageValue = selectedEmoji.emoji;
      }
    }

    onSubmit({
      name: nomeFundo.trim(),
      imageType: finalImageType,
      imageValue: finalImageValue
    });
  };

  const canProceedStep1 = nomeFundo.trim() && !isLoading;
  const canProceedStep2 = (selectedFile || selectedIcon) && !isLoading;

  if (step === 1) {
    // Step 1: Nome do fundo
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
                onClick={onBack}
                className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
                aria-label={backButtonText}
                data-testid="button-back"
              >
                <ArrowLeft className="w-6 h-6 text-creme" />
              </button>
            </div>

            {/* Título da Página */}
            <div className="px-4 pb-8">
              <h1 className="text-3xl font-bold mb-2 text-creme" data-testid="page-title">
                {title}
              </h1>
              <p className="text-lg opacity-90 text-creme">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section - Fundo Branco */}
        <div className="rounded-t-3xl min-h-96 pt-8 pb-24 bg-creme">
          <div className="px-4">
            
            {/* Formulário de Nome */}
            <div className="space-y-8">
              
              {/* Campo de Nome do Fundo */}
              <div>
                <label className="block text-lg font-semibold mb-4 text-dark" data-testid="label-fund-name">
                  Nome do fundo
                </label>
                <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>
                
                <input
                  type="text"
                  value={nomeFundo}
                  onChange={(e) => setNomeFundo(e.target.value)}
                  placeholder="Ex: Fundo do futebol"
                  className="w-full px-6 py-4 rounded-2xl border text-lg bg-bege-light border-dark-light text-dark focus:outline-none focus:scale-[1.02] transition-all duration-200"
                  autoFocus
                  data-testid="input-fund-name"
                  disabled={isLoading}
                />
              </div>

              {/* Dicas */}
              <div className="rounded-2xl p-4 border bg-bege-light border-dark-light" data-testid="tips-card">
                <h4 className="font-semibold mb-2 text-dark">💡 Dicas</h4>
                <ul className="text-sm space-y-1 text-dark opacity-80">
                  <li>• Escolha um nome claro e descritivo</li>
                  <li>• Você poderá adicionar membros depois</li>
                  <li>• O nome pode ser alterado a qualquer momento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Continuar - Fixo na Parte Inferior */}
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-creme">
          <button 
            onClick={handleNameContinue}
            disabled={!canProceedStep1}
            className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ 
              background: canProceedStep1 
                ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
                : 'rgba(48, 48, 48, 0.2)'
            }}
            data-testid="button-continue-name"
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

  // Step 2: Imagem do fundo
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
              onClick={handleImageBack}
              className="rounded-xl p-3 transition-all duration-200 hover:scale-105 active:scale-95 bg-bege-transparent"
              aria-label="Voltar para nome"
              data-testid="button-back-to-name"
            >
              <ArrowLeft className="w-6 h-6 text-creme" />
            </button>
          </div>

          {/* Título da Página */}
          <div className="px-4 pb-8">
            <h1 className="text-3xl font-bold mb-2 text-creme" data-testid="page-title-image">
              Imagem do fundo
            </h1>
            <p className="text-lg opacity-90 text-creme">
              Escolha uma imagem que seja a cara do <span className="font-bold">{nomeFundo}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content Section - Fundo Branco */}
      <div className="rounded-t-3xl min-h-96 pt-8 pb-32 bg-creme">
        <div className="px-4">
          
          {/* Seção de Upload */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-dark" data-testid="upload-section-title">
              Enviar uma imagem
            </h2>
            <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>
            
            <UploadCard
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              isSelected={selectedOption === 'upload'}
              onSelect={handleUploadSelect}
            />
          </div>

          {/* Seção de Emojis */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-dark" data-testid="emoji-section-title">
              Ou escolha um ícone
            </h2>
            <div className="w-8 h-1 rounded-full mb-6 gradient-bar"></div>
            
            <div className="grid grid-cols-3 gap-4">
              {emojisPredefinidos.slice(0, 12).map((emoji) => (
                <EmojiCard
                  key={emoji.id}
                  option={emoji}
                  isSelected={selectedOption === emoji.id}
                  onSelect={isLoading ? undefined : handleIconSelect}
                />
              ))}
            </div>

            {/* Última linha com 3 emojis centralizados */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {emojisPredefinidos.slice(12).map((emoji) => (
                <EmojiCard
                  key={emoji.id}
                  option={emoji}
                  isSelected={selectedOption === emoji.id}
                  onSelect={isLoading ? undefined : handleIconSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Finalizar - Fixo na Parte Inferior */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-creme">
        <button 
          onClick={handleSubmit}
          disabled={!canProceedStep2}
          className="w-full rounded-3xl p-4 text-white font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ 
            background: canProceedStep2 
              ? 'linear-gradient(135deg, #ffc22f, #fa7653, #fd6b61)' 
              : 'rgba(48, 48, 48, 0.2)'
          }}
          data-testid="button-submit"
        >
          <div className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            <span>{isLoading ? 'Salvando...' : submitButtonText}</span>
          </div>
        </button>
      </div>
    </div>
  );
}