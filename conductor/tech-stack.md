# Technology Stack

This document outlines the key technologies chosen for the RAG Embedding Migration Framework project. The stack is designed to provide a scalable, modern, and reproducible environment for demonstrating the migration process.

## 1. Backend & Data Processing

*   **GCP Project:** `rsamborski-rag` (Target project for all infrastructure and services)
*   **Compute Engine:** **Google Cloud Run Jobs**
    *   **Rationale:** Chosen for its serverless, scalable nature, which is ideal for the "Big Bang" historical corpus re-embedding. Its ability to run highly parallelizable tasks allows for rapid and cost-effective processing of large datasets without managing underlying infrastructure.

## 2. Database & Vector Storage

*   **Primary Datastore:** **AlloyDB for PostgreSQL**
    *   **Rationale:** Selected for its high-performance capabilities and its native support for vector embeddings via the `pgvector` extension. This allows us to store both the source text and the generated vectors in a single, powerful, and fully managed database service.

## 3. Frontend

*   **Web Framework:** **Next.js**
    *   **Implementation:** Next.js with App Router, TypeScript, and Tailwind CSS.
    *   **Rationale:** Provides a fast, type-safe, and responsive development experience. The App Router and API Routes simplify the orchestration between the UI and the vector database. This allows stakeholders to easily test and verify the semantic search functionality against the migrated data.

## 4. Data Source

*   **Dataset:** **TheLook eCommerce Dataset**
    *   **Source:** Google BigQuery Public Data
    *   **Rationale:** This publicly available dataset provides a rich and realistic collection of e-commerce product data. Its structured nature is well-suited for demonstrating a real-world RAG use case.

## 5. AI / Machine Learning

*   **Embedding Models:** **Google Vertex AI**
    *   **Original Model:** `text-embedding-005` (or previous versions like `text-embedding-004`) used for the initial data ingestion.
    *   **Target Model:** `gemini-embedding-001` with Matryoshka Representation Learning (MRL) configured for 768 dimensions.
    *   **Rationale:** The transition demonstrates upgrading from a legacy embedding model to the unified Gemini architecture, offering superior multilingual capabilities while utilizing MRL to avoid breaking existing database schemas (by keeping the dimensions at 768).
