import { useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  currentFile: File | null;
  onClear: () => void;
  isProcessing: boolean;
  processingStatus: string;
}
export function PDFUpload({
  onFileSelect,
  currentFile,
  onClear,
  isProcessing,
  processingStatus
}: PDFUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  if (currentFile) {
    return <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-mono text-sm text-foreground truncate max-w-[200px]">
                {currentFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(currentFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          {isProcessing ? <div className="text-xs text-muted-foreground font-mono animate-pulse">
              {processingStatus}
            </div> : <Button variant="ghost" size="icon" onClick={onClear} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </Button>}
        </div>
      </div>;
  }
  return <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 cursor-pointer transition-colors bg-card/50">
      <input ref={inputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="p-3 bg-muted rounded-full">
          <Upload className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Get started</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your document stays 100% local
          </p>
        </div>
      </div>
    </div>;
}