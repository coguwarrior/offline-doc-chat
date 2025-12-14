import { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, FileText, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFUpload } from '@/components/PDFUpload';
import { ChatMessage, Message } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ModelStatus } from '@/components/ModelStatus';
import { extractTextFromPDF, chunkText } from '@/lib/pdf-parser';
import { initializeEmbeddings, isModelLoaded } from '@/lib/embeddings';
import { vectorStore } from '@/lib/vector-store';
import { generateAnswer } from '@/lib/answer-generator';
import { toast } from '@/hooks/use-toast';

type ModelState = 'idle' | 'loading' | 'ready' | 'error';

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [modelState, setModelState] = useState<ModelState>('idle');
  const [modelProgress, setModelProgress] = useState(0);
  const [modelMessage, setModelMessage] = useState('Model not loaded');
  const [documentReady, setDocumentReady] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadModel = async () => {
    if (isModelLoaded()) {
      setModelState('ready');
      setModelMessage('Embedding model ready');
      return;
    }

    setModelState('loading');
    try {
      await initializeEmbeddings((progress, status) => {
        setModelProgress(progress);
        setModelMessage(status);
      });
      setModelState('ready');
      setModelMessage('Embedding model ready');
    } catch (error) {
      setModelState('error');
      setModelMessage('Failed to load model');
      toast({
        title: 'Error',
        description: 'Failed to load the embedding model',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setDocumentReady(false);
    
    try {
      // First ensure model is loaded
      if (!isModelLoaded()) {
        setProcessingStatus('Loading AI model...');
        await loadModel();
      }

      setProcessingStatus('Extracting text...');
      const text = await extractTextFromPDF(selectedFile);
      
      if (!text.trim()) {
        throw new Error('No text found in PDF');
      }

      setProcessingStatus('Splitting into chunks...');
      const chunks = chunkText(text);
      
      setProcessingStatus('Creating embeddings...');
      await vectorStore.addDocuments(chunks, (current, total) => {
        setProcessingStatus(`Embedding ${current}/${total} chunks...`);
      });

      setDocumentReady(true);
      setMessages([{
        id: 'system-1',
        role: 'system',
        content: `Document loaded successfully!\n\n• ${chunks.length} text chunks indexed\n• ${text.length.toLocaleString()} characters extracted\n\nYou can now ask questions about "${selectedFile.name}"`,
        timestamp: new Date(),
      }]);

      toast({
        title: 'Document Ready',
        description: `${chunks.length} chunks indexed from ${selectedFile.name}`,
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process PDF',
        variant: 'destructive',
      });
      setFile(null);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleClear = () => {
    setFile(null);
    setMessages([]);
    setDocumentReady(false);
    vectorStore.clear();
  };

  const handleSendMessage = async (content: string) => {
    if (!documentReady) {
      toast({
        title: 'No document',
        description: 'Please upload a PDF first',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsQuerying(true);

    try {
      const results = await vectorStore.search(content, 3);
      const answer = generateAnswer(content, results);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error querying:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'An error occurred while processing your question. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsQuerying(false);
    }
  };

  const clearChat = () => {
    setMessages(documentReady ? [{
      id: 'system-cleared',
      role: 'system',
      content: 'Chat cleared. You can continue asking questions about the loaded document.',
      timestamp: new Date(),
    }] : []);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground font-mono">
                PDF Chat
              </h1>
              <p className="text-xs text-muted-foreground">
                100% Offline • Local AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Model & Document Status */}
        <div className="p-4 space-y-3 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Cpu className="w-3 h-3" />
            <span className="font-mono">Local Inference</span>
          </div>
          
          <ModelStatus
            status={modelState}
            progress={modelProgress}
            message={modelMessage}
          />
          
          <PDFUpload
            onFileSelect={handleFileSelect}
            currentFile={file}
            onClear={handleClear}
            isProcessing={isProcessing}
            processingStatus={processingStatus}
          />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-medium text-foreground mb-2">
                Upload a PDF to get started
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Your document is processed entirely in your browser. 
                No data leaves your device.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isQuerying && (
                <div className="p-4 bg-chat-assistant">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="font-mono">Searching document...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={!documentReady || isQuerying || isProcessing}
          placeholder={
            !file 
              ? 'Upload a PDF to start chatting...' 
              : isProcessing 
                ? 'Processing document...' 
                : 'Ask a question about your document...'
          }
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-3">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-muted-foreground font-mono">
            Runs entirely in your browser • No API calls • Your data stays private
          </p>
        </div>
      </footer>
    </div>
  );
}
