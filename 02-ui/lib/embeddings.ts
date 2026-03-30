import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI with the project and location
const vertex_ai = new VertexAI({
  project: process.env.PROJECT_ID || 'rsamborski-rag',
  location: process.env.LOCATION || 'europe-central2',
});

/**
 * Generates text embeddings for a given query string using Google Vertex AI.
 * @param text The input string to embed.
 * @returns An array of floating-point numbers representing the embedding vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim() === '') {
    throw new Error('Text input is required');
  }

  const modelId = process.env.EMBEDDING_MODEL || 'text-embedding-005';
  
  const generativeModel = vertex_ai.getGenerativeModel({
    model: modelId,
  });

  const request = {
    content: [{ role: 'user', parts: [{ text }] }],
    taskType: 'RETRIEVAL_QUERY' as any, // Cast as any because taskType might not be in the base type but supported by endpoint
  };

  const response = await generativeModel.embedContent(request);
  const embedding = response.embeddings[0];

  if (!embedding || !embedding.values) {
    throw new Error('Failed to generate embeddings from Vertex AI');
  }

  return embedding.values;
}
