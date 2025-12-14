import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ModelStatusProps {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress: number;
  message: string;
}

export function ModelStatus({ status, progress, message }: ModelStatusProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      {status === 'loading' && (
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
      )}
      {status === 'ready' && (
        <CheckCircle className="w-4 h-4 text-primary" />
      )}
      {status === 'error' && (
        <XCircle className="w-4 h-4 text-destructive" />
      )}
      {status === 'idle' && (
        <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-foreground truncate">
            {message}
          </span>
          {status === 'loading' && (
            <span className="text-xs text-muted-foreground font-mono">
              {progress.toFixed(0)}%
            </span>
          )}
        </div>
        {status === 'loading' && (
          <div className="h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
