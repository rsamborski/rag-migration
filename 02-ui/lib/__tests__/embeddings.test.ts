import { generateEmbedding } from '../embeddings';

// Mock the global process.env before importing the module
process.env.PROJECT_ID = 'test-project';
process.env.LOCATION = 'us-central1';
process.env.EMBEDDING_MODEL = 'test-model';

// We need to mock the @google/genai library to avoid making real API calls during unit tests
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          embedContent: jest.fn().mockResolvedValue({
            embeddings: [
              { values: [0.1, 0.2, 0.3] }
            ]
          })
        }
      };
    })
  };
});

describe('Embeddings Utility', () => {
  it('should return an array of numbers representing the embedding', async () => {
    const text = 'test query';
    const embedding = await generateEmbedding(text);
    
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
    expect(embedding[0]).toBe(0.1);
  });

  it('should throw an error if the input text is empty', async () => {
    await expect(generateEmbedding('')).rejects.toThrow('Text input is required');
  });
});
