# Technology Stack

This document outlines the key technologies chosen for the RAG Embedding Migration Framework project. The stack is designed to provide a scalable, modern, and reproducible environment for demonstrating the migration process.

## 1. Backend & Data Processing

*   **Compute Engine:** **Google Cloud Run Jobs**
    *   **Rationale:** Chosen for its serverless, scalable nature, which is ideal for the "Big Bang" historical corpus re-embedding. Its ability to run highly parallelizable tasks allows for rapid and cost-effective processing of large datasets without managing underlying infrastructure.

## 2. Database & Vector Storage

*   **Primary Datastore:** **AlloyDB for PostgreSQL**
    *   **Rationale:** Selected for its high-performance capabilities and its native support for vector embeddings via the `pgvector` extension. This allows us to store both the source text and the generated vectors in a single, powerful, and fully managed database service.

## 3. Frontend

*   **Web Framework:** **Next.js**
    *   **Rationale:** A simple, modern web UI will be built with Next.js to provide an interactive demonstration of the final RAG system's capabilities. This allows stakeholders to easily test and verify the semantic search functionality against the migrated data.

## 4. Data Source

*   **Dataset:** **TheLook eCommerce Dataset**
    *   **Source:** Google BigQuery Public Data
    *   **Rationale:** This publicly available dataset provides a rich and realistic collection of e-commerce product data. Its structured nature is well-suited for demonstrating a real-world RAG use case.
