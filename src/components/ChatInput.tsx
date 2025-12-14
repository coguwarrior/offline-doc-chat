import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
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
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-card border-t border-border">
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
  );
}
