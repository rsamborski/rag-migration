import { GoogleGenAI } from '@google/genai';

/**
 * Generates text embeddings for a given query string using Google Vertex AI.
 * @param text The input string to embed.
 * @returns An array of floating-point numbers representing the embedding vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim() === '') {
    throw new Error('Text input is required');
  }

  // Prioritize PROJECT_ID and LOCATION from the .env file over global environment variables
  const project = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'rsamborski-rag';
  const location = process.env.LOCATION || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  const modelId = process.env.EMBEDDING_MODEL || 'text-embedding-004';

  // Initialize the Gen AI client for Vertex AI using the unified SDK.
  // It automatically handles authentication via Application Default Credentials (ADC).
  const client = new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });

  const response = await client.models.embedContent({
    model: modelId,
    contents: [text],
    config: {
      taskType: 'RETRIEVAL_QUERY',
    },
  });

  if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
    throw new Error('Failed to generate embeddings from Vertex AI');
  }

  return response.embeddings[0].values;
}
