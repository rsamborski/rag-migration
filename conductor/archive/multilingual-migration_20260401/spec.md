# Specification: Embedding Migration to Gemini Unified Model (gemini-embedding-001)

## Overview
This track focuses on migrating the existing product embeddings to the `gemini-embedding-001` (Gemini) model. This unified model provides superior multilingual capabilities and supports Matryoshka Representation Learning (MRL). We will use MRL to output 768-dimensional vectors to maintain consistency with the existing database schema while leveraging the improved accuracy of the Gemini architecture. The track includes a new migration job and a UI toggle for testing and evaluating the new model.

## Architecture
- **Inference Service:** Google Cloud Vertex AI's `gemini-embedding-001` model.
- **Migration Job:** A new Cloud Run Job to perform the batch re-embedding of products.
- **Database Schema (AlloyDB):** Add a new `embedding_v2` column (vector type, 768 dimensions) to the existing `products` table.
- **Backend (API):** Update the Next.js API route to handle queries using either the old or new embedding model based on a switch.
- **Frontend (UI):** Implement a UI toggle (for testing/development) to switch between the original and the new Gemini-based model for semantic search.

## Functional Requirements
- **Re-embedding Process:**
  - Create a new Cloud Run Job (`migrate-embeddings`) to fetch products from AlloyDB and generate new embeddings using the `gemini-embedding-001` model.
  - The job will specify an output dimensionality of 768 to match the current database schema.
  - The job will process the dataset in batches for efficiency.
  - The new embeddings will be stored in the `embedding_v2` column of the `products` table.
- **UI & Search:**
  - The Next.js API will be updated to optionally use the `gemini-embedding-001` model and its corresponding database column.
  - The UI will include a toggle (e.g., in the search bar or header) for developers to switch between "Original Model" and "Gemini Multilingual Model".
  - When the "Gemini Multilingual Model" is active, the search query must be embedded using `gemini-embedding-001` (at 768 dimensions), and the vector search must target the `embedding_v2` column in AlloyDB.

## Acceptance Criteria
- [ ] New `embedding_v2` column added to the `products` table in AlloyDB.
- [ ] A new Cloud Run Job successfully re-embeds all products using the `gemini-embedding-001` model (768 dimensions).
- [ ] The `embedding_v2` column is fully populated for all products.
- [ ] The UI allows switching between the original and Gemini models.
- [ ] Semantic search works correctly with the new model, returning relevant results.

## Out of Scope
- Full 3,072-dimensional storage (decided to stick with 768 for now to minimize schema changes and storage impact).
- Automated precision/recall benchmarking between models.
- Real-time re-embedding of new product additions.