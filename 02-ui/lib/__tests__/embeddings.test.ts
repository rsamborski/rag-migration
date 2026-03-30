import { generateEmbedding } from '../embeddings';

// Mock process.env
process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
process.env.GOOGLE_CLOUD_LOCATION = 'europe-central2';

// Mock @google/genai
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      embedContent: jest.fn().mockResolvedValue({
        embeddings: [{ values: [0.1, 0.2, 0.3] }]
      })
    }
  }))
}));

describe('Embeddings Utility', () => {
  it('should return an array of numbers representing the embedding', async () => {
    const text = 'test query';
    const embedding = await generateEmbedding(text);
    
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(3);
    expect(embedding[0]).toBe(0.1);
  });

  it('should throw an error if the input text is empty', async () => {
    await expect(generateEmbedding('')).rejects.toThrow('Text input is required');
  });
});
