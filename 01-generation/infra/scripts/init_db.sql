-- Create the database
CREATE DATABASE rag_migration;

-- Connect to the new database
\c rag_migration

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    bigquery_id INT,
    name TEXT,
    category TEXT,
    brand TEXT,
    retail_price NUMERIC,
    embedding VECTOR(768), -- text-embedding-005 uses 768 dimensions
    embedding_v2 VECTOR(768), -- gemini-embedding-001 uses 768 dimensions with MRL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add embedding_v2 to existing table if it was created previously
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding_v2 VECTOR(768);
