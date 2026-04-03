import { generateEmbedding } from '../embeddings';

// Mock process.env
process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
process.env.GOOGLE_CLOUD_LOCATION = 'europe-central2';
process.env.EMBEDDING_MODEL = 'text-embedding-004';

// Mock @google/genai
const mockEmbedContent = jest.fn().mockResolvedValue({
  embeddings: [{ values: [0.1, 0.2, 0.3] }]
});

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      embedContent: mockEmbedContent
    }
  }))
}));

describe('Embeddings Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should allow overriding the model and dimensions', async () => {
    const text = 'test query';
    const model = 'gemini-embedding-001';
    const dimensions = 768;
    
    await generateEmbedding(text, model, dimensions);
    
    expect(mockEmbedContent).toHaveBeenCalledWith(expect.objectContaining({
      model: model,
      config: expect.objectContaining({
        outputDimensionality: dimensions
      })
    }));
  });

  it('should use default model from env if not provided', async () => {
    const text = 'test query';
    await generateEmbedding(text);
    
    expect(mockEmbedContent).toHaveBeenCalledWith(expect.objectContaining({
      model: 'text-embedding-004'
    }));
  });
});
