import { NextRequest } from 'next/server';
import { GET } from '../route';

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

// Mock pg
const mockQuery = jest.fn();
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: mockQuery,
  }))
}));

describe('Search API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
    process.env.DB_NAME = 'test-db';
  });

  it('should return 200 and results from mocked database using default model', async () => {
    const mockResults = [
      { id: 1, name: 'Integration Test Product', category: 'Test', brand: 'Brand' }
    ];
    mockQuery.mockResolvedValue({ rows: mockResults });

    const req = new NextRequest('http://localhost:3000/api/search?q=integration');
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.results).toEqual(mockResults);

    // Verify default call to Vertex AI
    expect(mockEmbedContent).toHaveBeenCalledWith(expect.objectContaining({
      model: 'text-embedding-005'
    }));

    // Verify the query targets 'embedding' column
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('(embedding <=> $1)'),
      expect.arrayContaining(['[0.1,0.2,0.3]'])
    );
  });

  it('should use gemini-embedding-001 and embedding_v2 when model=gemini is specified', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const req = new NextRequest('http://localhost:3000/api/search?q=gemini-test&model=gemini');
    const response = await GET(req);

    expect(response.status).toBe(200);

    // Verify Gemini call to Vertex AI with dimensions
    expect(mockEmbedContent).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gemini-embedding-001',
      config: expect.objectContaining({
        outputDimensionality: 768
      })
    }));

    // Verify the query targets 'embedding_v2' column
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('(embedding_v2 <=> $1)'),
      expect.any(Array)
    );
  });
});
