import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

export interface PDFChunk {
  text: string;
  pageNumber: number;
  chunkIndex: number;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n\n';
  }
  
  return fullText.trim();
}

export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): PDFChunk[] {
  const chunks: PDFChunk[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    if ((currentChunk + ' ' + trimmedSentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        pageNumber: 1, // Simplified - could be enhanced to track actual pages
        chunkIndex: chunkIndex++,
      });
      
      // Keep overlap from previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(' ') + ' ' + trimmedSentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      pageNumber: 1,
      chunkIndex: chunkIndex,
    });
  }
  
  return chunks;
}
