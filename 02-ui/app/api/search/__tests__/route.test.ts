import { NextRequest } from 'next/server';
import { GET } from '../route';
import { generateEmbedding } from '../../../../lib/embeddings';
import { getDbPool } from '../../../../lib/db';

// Mock the utilities
jest.mock('../../../../lib/embeddings', () => ({
  generateEmbedding: jest.fn(),
}));

jest.mock('../../../../lib/db', () => ({
  getDbPool: jest.fn(),
}));

describe('Search API Route', () => {
  const mockPool = {
    query: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDbPool as jest.Mock).mockReturnValue(mockPool);
  });

  it('should return 400 if the query is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/search');
    const response = await GET(req);
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing search query');
  });

  it('should return search results for a valid query using default model', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockResults = [{ id: 1, name: 'Product 1', distance: 0.1 }];

    (generateEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);
    mockPool.query.mockResolvedValue({ rows: mockResults });

    const req = new NextRequest('http://localhost:3000/api/search?q=test');
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.results).toEqual(mockResults);

    // Verify generateEmbedding was called with no extra args (defaults)
    expect(generateEmbedding).toHaveBeenCalledWith('test', undefined, undefined);

    // Verify correct DB query was called (defaulting to 'embedding' column)
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, name, category, brand, \n              (embedding <=> $1) as distance'),
      expect.any(Array)
    );
  });

  it('should use gemini-embedding-001 and embedding_v2 when model=gemini is passed', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    (generateEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);
    mockPool.query.mockResolvedValue({ rows: [] });

    const req = new NextRequest('http://localhost:3000/api/search?q=test&model=gemini');
    await GET(req);

    // Verify generateEmbedding was called with Gemini params
    expect(generateEmbedding).toHaveBeenCalledWith('test', 'gemini-embedding-001', 768);

    // Verify correct DB query was called (using 'embedding_v2' column)
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('(embedding_v2 <=> $1) as distance'),
      expect.any(Array)
    );
  });

  it('should return 500 if embedding generation fails', async () => {
    (generateEmbedding as jest.Mock).mockRejectedValue(new Error('Vertex AI error'));
    
    const req = new NextRequest('http://localhost:3000/api/search?q=test');
    const response = await GET(req);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('A problem occurred with the AI embedding service. Please try again later.');
  });
});
