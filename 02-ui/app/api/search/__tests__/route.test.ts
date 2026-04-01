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

  it('should return search results for a valid query', async () => {
    const mockEmbedding = [0.1, 0.2, 0.3];
    const mockResults = [
      { id: 1, name: 'Product 1', category: 'Cat 1', brand: 'Brand 1', distance: 0.1 },
      { id: 2, name: 'Product 2', category: 'Cat 2', brand: 'Brand 2', distance: 0.2 },
    ];

    (generateEmbedding as jest.Mock).mockResolvedValue(mockEmbedding);
    mockPool.query.mockResolvedValue({ rows: mockResults });

    const req = new NextRequest('http://localhost:3000/api/search?q=test');
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.results).toEqual(mockResults);

    // Verify correct DB query was called
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining('<=>'), // pgvector operator for cosine distance
      expect.arrayContaining([expect.stringContaining('[0.1,0.2,0.3]')])
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

  it('should return 500 if the database query fails', async () => {
    (generateEmbedding as jest.Mock).mockResolvedValue([0.1]);
    mockPool.query.mockRejectedValue(new Error('Database error'));
    
    const req = new NextRequest('http://localhost:3000/api/search?q=test');
    const response = await GET(req);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('An unexpected error occurred during your search.');
  });

  it('should return 500 if the database connection fails (ECONNREFUSED)', async () => {
    (generateEmbedding as jest.Mock).mockResolvedValue([0.1]);
    const error = new Error('connect ECONNREFUSED 127.0.0.1:5434');
    (error as any).code = 'ECONNREFUSED';
    mockPool.query.mockRejectedValue(error);
    
    const req = new NextRequest('http://localhost:3000/api/search?q=test');
    const response = await GET(req);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Unable to connect to the database. Please ensure the database proxy is running.');
  });
});
