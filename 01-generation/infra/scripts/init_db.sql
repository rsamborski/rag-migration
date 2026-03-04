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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
