import { createClient } from '@google/genai';
import { GoogleAuth } from 'google-auth-library';

// Function to generate the bearer token programmatically
async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

/**
 * Generates text embeddings for a given query string using Google Vertex AI.
 * @param text The input string to embed.
 * @returns An array of floating-point numbers representing the embedding vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim() === '') {
    throw new Error('Text input is required');
  }

  const project = process.env.PROJECT_ID || 'rsamborski-rag';
  const location = process.env.LOCATION || 'europe-central2';
  const modelId = process.env.EMBEDDING_MODEL || 'text-embedding-004'; // Default to stable 004 if 005 not found

  const token = await getAccessToken();

  if (!token) {
    throw new Error('Failed to obtain authentication token');
  }

  // Initialize the Gen AI client for Vertex AI
  const client = createClient({
    vertexai: true,
    project,
    location,
    httpOptions: {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
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
