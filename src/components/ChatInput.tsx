import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ChatMode = 'chat' | 'evaluate';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  showModeToggle?: boolean;
}

export function ChatInput({ 
  onSend, 
  disabled, 
  placeholder, 
  mode, 
  onModeChange,
  showModeToggle = true 
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  return (
    <div className="bg-card border-t border-border">
      {/* Mode Toggle */}
      {showModeToggle && (
        <div className="flex gap-1 px-4 pt-3">
          <button
            type="button"
            onClick={() => onModeChange('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'chat'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            Q&A Mode
          </button>
          <button
            type="button"
            onClick={() => onModeChange('evaluate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'evaluate'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <ClipboardCheck className="w-3 h-3" />
            Evaluate Mode
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Ask a question about your document...'}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-muted text-foreground placeholder:text-muted-foreground rounded-md px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed scrollbar-thin"
        />
        <Button
          type="submit"
          disabled={disabled || !input.trim()}
          size="icon"
          className="h-auto aspect-square bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
