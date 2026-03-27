import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI client specifically for Vertex AI
const client = new GoogleGenAI({
  project: process.env.PROJECT_ID,
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

  const response = await client.models.embedContent({
    model: modelId,
    contents: text,
    config: {
      taskType: 'RETRIEVAL_QUERY',
    },
  });

  if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
    throw new Error('Failed to generate embeddings from Vertex AI');
  }

  return response.embeddings[0].values;
}
