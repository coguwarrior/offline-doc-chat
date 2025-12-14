import { User, Bot } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div
      className={`flex gap-3 p-4 ${
        isUser 
          ? 'bg-chat-user' 
          : isSystem 
            ? 'bg-chat-system border-l-2 border-primary' 
            : 'bg-chat-assistant'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
        isUser 
          ? 'bg-secondary' 
          : isSystem 
            ? 'bg-primary/20' 
            : 'bg-primary/10'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <Bot className={`w-4 h-4 ${isSystem ? 'text-primary' : 'text-primary'}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {isUser ? 'You' : isSystem ? 'System' : 'Assistant'}
          </span>
          <span className="text-xs text-muted-foreground/50">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
}
