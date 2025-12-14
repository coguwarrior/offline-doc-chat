import { pipeline } from '@huggingface/transformers';

let extractor: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

export async function initializeEmbeddings(
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  if (extractor) return;
  if (loadPromise) {
    await loadPromise;
    return;
  }

  isLoading = true;
  onProgress?.(0, 'Loading embedding model...');

  loadPromise = pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    {
      progress_callback: (data: any) => {
        if (data.status === 'progress' && data.progress) {
          onProgress?.(data.progress, `Downloading: ${data.file || 'model files'}`);
        }
      },
    }
  );

  extractor = await loadPromise;
  isLoading = false;
  onProgress?.(100, 'Model loaded!');
}

export async function getEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    throw new Error('Embeddings not initialized. Call initializeEmbeddings first.');
  }

  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

export function isModelLoaded(): boolean {
  return extractor !== null;
}

export function isModelLoading(): boolean {
  return isLoading;
}
