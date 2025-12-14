import { SearchResult } from './vector-store';

const SIMILARITY_THRESHOLD = 0.3;
const NO_ANSWER_MESSAGE = "The document does not contain this information.";

export function generateAnswer(query: string, results: SearchResult[]): string {
  // Filter results by similarity threshold
  const relevantResults = results.filter(r => r.score >= SIMILARITY_THRESHOLD);
  
  if (relevantResults.length === 0) {
    return NO_ANSWER_MESSAGE;
  }

  // Check if any result has a high enough score to be considered a match
  const bestMatch = relevantResults[0];
  
  if (bestMatch.score < SIMILARITY_THRESHOLD) {
    return NO_ANSWER_MESSAGE;
  }

  // Build context from relevant chunks
  const context = relevantResults
    .map((r, i) => `[Source ${i + 1}] ${r.chunk.text}`)
    .join('\n\n');

  // Generate a synthesized answer
  const answer = synthesizeAnswer(query, relevantResults);
  
  return answer;
}

function synthesizeAnswer(query: string, results: SearchResult[]): string {
  const queryLower = query.toLowerCase();
  const chunks = results.map(r => r.chunk.text);
  
  // Combine the most relevant chunks into an answer
  if (results.length === 1) {
    return formatResponse(results[0].chunk.text, results[0].score);
  }

  // For multiple results, try to provide a comprehensive answer
  const combinedText = chunks.join(' ');
  
  // Extract sentences that seem most relevant to the query
  const sentences = combinedText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  const relevantSentences = sentences.filter(sentence => {
    const sentenceLower = sentence.toLowerCase();
    const queryWords = queryLower.split(' ').filter(w => w.length > 3);
    return queryWords.some(word => sentenceLower.includes(word));
  });

  if (relevantSentences.length > 0) {
    const answer = relevantSentences.slice(0, 3).join('. ').trim();
    return formatResponse(answer + '.', results[0].score);
  }

  // Fallback to the best matching chunk
  return formatResponse(results[0].chunk.text, results[0].score);
}

function formatResponse(text: string, confidence: number): string {
  const confidenceLevel = confidence > 0.6 ? 'high' : confidence > 0.4 ? 'moderate' : 'low';
  
  let response = text;
  
  // Clean up the response
  response = response.replace(/\s+/g, ' ').trim();
  
  // Add confidence indicator
  if (confidenceLevel === 'low') {
    response += `\n\n_Note: This answer has low confidence (${(confidence * 100).toFixed(0)}% match). The document may not directly address your question._`;
  }
  
  return response;
}
