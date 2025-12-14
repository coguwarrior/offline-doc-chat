import { getEmbedding, cosineSimilarity } from './embeddings';
import { vectorStore, SearchResult } from './vector-store';

export interface EvaluationResult {
  similarityPercentage: number;
  justification: string;
  missingElements: string[];
  referenceExcerpts: string[];
}

export async function evaluateAnswer(
  studentAnswer: string,
  referenceQuery: string
): Promise<EvaluationResult> {
  // Search for relevant reference content from the PDF
  const referenceResults = await vectorStore.search(referenceQuery, 5);
  
  if (referenceResults.length === 0 || referenceResults[0].score < 0.3) {
    return {
      similarityPercentage: 0,
      justification: 'No relevant reference content found in the document for the given topic.',
      missingElements: ['Unable to find reference material in the uploaded document'],
      referenceExcerpts: [],
    };
  }

  // Combine reference texts for comparison
  const referenceText = referenceResults
    .filter(r => r.score > 0.3)
    .map(r => r.chunk.text)
    .join(' ');

  // Get embeddings for semantic similarity
  const studentEmbedding = await getEmbedding(studentAnswer);
  const referenceEmbedding = await getEmbedding(referenceText);
  
  // Calculate base semantic similarity
  const semanticSimilarity = cosineSimilarity(studentEmbedding, referenceEmbedding);
  
  // Extract key concepts from reference
  const referenceConcepts = extractKeyConcepts(referenceText);
  const studentConcepts = extractKeyConcepts(studentAnswer);
  
  // Calculate concept coverage
  const coveredConcepts = referenceConcepts.filter(concept => 
    studentConcepts.some(sc => 
      sc.toLowerCase().includes(concept.toLowerCase()) ||
      concept.toLowerCase().includes(sc.toLowerCase())
    )
  );
  
  const conceptCoverage = referenceConcepts.length > 0 
    ? coveredConcepts.length / referenceConcepts.length 
    : 0;

  // Weighted score: 60% semantic similarity, 40% concept coverage
  const finalScore = (semanticSimilarity * 0.6) + (conceptCoverage * 0.4);
  const percentage = Math.round(finalScore * 100);

  // Find missing concepts
  const missingConcepts = referenceConcepts.filter(concept =>
    !studentConcepts.some(sc => 
      sc.toLowerCase().includes(concept.toLowerCase()) ||
      concept.toLowerCase().includes(sc.toLowerCase())
    )
  );

  // Generate justification
  const justification = generateJustification(percentage, semanticSimilarity, conceptCoverage, coveredConcepts.length, referenceConcepts.length);

  return {
    similarityPercentage: percentage,
    justification,
    missingElements: missingConcepts.slice(0, 5),
    referenceExcerpts: referenceResults.slice(0, 2).map(r => r.chunk.text.slice(0, 200) + '...'),
  };
}

function extractKeyConcepts(text: string): string[] {
  // Extract meaningful phrases (2-4 word sequences with important terms)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  
  // Common stop words to filter
  const stopWords = new Set([
    'that', 'this', 'with', 'from', 'have', 'been', 'were', 'they', 'their',
    'which', 'when', 'will', 'would', 'could', 'should', 'about', 'there',
    'these', 'those', 'than', 'then', 'only', 'also', 'more', 'such', 'some',
    'very', 'just', 'being', 'other', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'under', 'again', 'further', 'once'
  ]);

  const keyWords = words.filter(w => !stopWords.has(w));
  
  // Get unique key terms
  const uniqueTerms = [...new Set(keyWords)];
  
  return uniqueTerms.slice(0, 20);
}

function generateJustification(
  percentage: number,
  semanticSim: number,
  conceptCov: number,
  covered: number,
  total: number
): string {
  if (percentage >= 80) {
    return `Strong match with ${percentage}% similarity. The answer covers ${covered}/${total} key concepts from the reference material. Semantic alignment is high (${Math.round(semanticSim * 100)}%).`;
  } else if (percentage >= 60) {
    return `Moderate match with ${percentage}% similarity. The answer captures ${covered}/${total} key concepts. Some important points from the reference may be missing or differently expressed.`;
  } else if (percentage >= 40) {
    return `Partial match with ${percentage}% similarity. Only ${covered}/${total} key concepts are addressed. Consider reviewing the reference material for additional important points.`;
  } else {
    return `Low match with ${percentage}% similarity. The answer covers only ${covered}/${total} reference concepts. The response may be addressing different aspects or missing core information.`;
  }
}
