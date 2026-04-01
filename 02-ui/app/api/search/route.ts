import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '../../../lib/embeddings';
import { getDbPool } from '../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Missing search query' },
        { status: 400 }
      );
    }

    // 1. Generate embedding for the query
    const embedding = await generateEmbedding(query);
    const embeddingString = `[${embedding.join(',')}]`;

    // 2. Query AlloyDB using pgvector similarity search
    const pool = getDbPool();
    const result = await pool.query(
      `SELECT id, name, category, brand, 
              (embedding <=> $1) as distance
       FROM products
       ORDER BY distance ASC
       LIMIT 10`,
      [embeddingString]
    );

    // 3. Return results
    return NextResponse.json({ results: result.rows });
  } catch (error: any) {
    console.error('Search API error:', error);
    
    let errorMessage = 'An unexpected error occurred during your search.';
    
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connect ECONNREFUSED')) {
      errorMessage = 'Unable to connect to the database. Please ensure the database proxy is running.';
    } else if (error.message?.includes('Vertex AI')) {
      errorMessage = 'A problem occurred with the AI embedding service. Please try again later.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
