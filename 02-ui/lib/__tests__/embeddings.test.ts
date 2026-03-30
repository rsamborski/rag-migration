import { generateEmbedding } from '../embeddings';

// Mock process.env
process.env.PROJECT_ID = 'test-project';
process.env.LOCATION = 'europe-central2';

// Mock google-auth-library
jest.mock('google-auth-library', () => ({
  GoogleAuth: jest.fn().mockImplementation(() => ({
    getClient: jest.fn().mockResolvedValue({
      getAccessToken: jest.fn().mockResolvedValue({ token: 'mock-token' })
    })
  }))
}));

// Mock @google/genai
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    Models: {
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
