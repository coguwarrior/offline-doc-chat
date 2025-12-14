import { PDFChunk } from './pdf-parser';
import { getEmbedding, cosineSimilarity } from './embeddings';

export interface VectorDocument {
  chunk: PDFChunk;
  embedding: number[];
}

export interface SearchResult {
  chunk: PDFChunk;
  score: number;
}

class VectorStore {
  private documents: VectorDocument[] = [];

  async addDocuments(chunks: PDFChunk[], onProgress?: (current: number, total: number) => void): Promise<void> {
    this.documents = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i].text);
      this.documents.push({
        chunk: chunks[i],
        embedding,
      });
      onProgress?.(i + 1, chunks.length);
    }
  }

  async search(query: string, topK: number = 3): Promise<SearchResult[]> {
    if (this.documents.length === 0) {
      return [];
    }

    const queryEmbedding = await getEmbedding(query);
    
    const scored = this.documents.map(doc => ({
      chunk: doc.chunk,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    scored.sort((a, b) => b.score - a.score);
    
    return scored.slice(0, topK);
  }

  clear(): void {
    this.documents = [];
  }

  get size(): number {
    return this.documents.length;
  }
}

export const vectorStore = new VectorStore();
