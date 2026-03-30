import { generateEmbedding } from '../embeddings';

// Mock the global process.env before importing the module
process.env.PROJECT_ID = 'test-project';
process.env.LOCATION = 'us-central1';
process.env.EMBEDDING_MODEL = 'test-model';

// Mock the @google-cloud/vertexai library
jest.mock('@google-cloud/vertexai', () => {
  const mockEmbedContent = jest.fn().mockResolvedValue({
    embeddings: [{ values: [0.1, 0.2, 0.3] }]
  });

  return {
    VertexAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        embedContent: mockEmbedContent
      })
    }))
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
