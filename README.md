# RAG Embedding Migration Framework

This project is a comprehensive, actionable blueprint for executing complex embedding migrations for large-scale Retrieval-Augmented Generation (RAG) systems. It provides functional, production-ready code examples and deployment scripts to guide you through the entire migration lifecycle.

## Overview

Upgrading core embedding infrastructure without downtime or regressions is a significant challenge for senior AI/ML engineers. This framework demonstrates how to approach this problem systematically. 

The project is structured as a series of steps (or phases), each building upon the last:

1.  **Initial Generation (`01-generation/`)**: (COMPLETED) Fully functional pipeline that ingests raw product data from BigQuery, generates initial embeddings using `text-embedding-004` (via `google-genai` SDK), and stores them in a highly-available AlloyDB for PostgreSQL vector database. Highly parallelizable execution using Cloud Run Jobs.
2.  **Semantic Search UI (`02-ui/`)**: A Next.js application to demonstrate semantic search capabilities using the generated embeddings.
3.  **Embedding Migration (`03-migration/`)**: Tools and scripts supporting batch migration of embeddings to a newer model (`gemini-embedding-001`).

## Technical Stack

*   **Compute:** Google Cloud Run Jobs (for scalable, parallel batch processing)
*   **Database:** AlloyDB for PostgreSQL (with `pgvector` for vector storage)
*   **AI/ML:** Google Vertex AI (`text-embedding-005` via `google-genai` SDK)
*   **Data Source:** BigQuery (`bigquery-public-data.thelook_ecommerce.products`)
*   **Infrastructure as Code:** Terraform

## Getting Started

To get started, navigate to the `01-generation` directory and follow the instructions in its specific README to deploy the initial embedding pipeline.

## License

This project is licensed under the [Apache License 2.0](LICENSE).

## Disclaimer

This is not an officially supported Google product
