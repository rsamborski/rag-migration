import { NextRequest } from 'next/server';
import { GET } from '../route';

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
    process.env.PROJECT_ID = 'test-project';
    process.env.DB_NAME = 'test-db';
  });

  it('should return 200 and results from mocked database', async () => {
    const mockResults = [
      { id: 1, name: 'Integration Test Product', category: 'Test', brand: 'Brand' }
    ];
    mockQuery.mockResolvedValue({ rows: mockResults });

    const req = new NextRequest('http://localhost:3000/api/search?q=integration');
    const response = await GET(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.results).toEqual(mockResults);

    // Verify the query format (pgvector)
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('<=>'),
      expect.arrayContaining(['[0.1,0.2,0.3]'])
    );
  });
});
