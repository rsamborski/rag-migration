# RAG Embedding Migration Framework

This project is a comprehensive, actionable blueprint for executing complex embedding migrations for large-scale Retrieval-Augmented Generation (RAG) systems. It provides functional, production-ready code examples and deployment scripts to guide you through the entire migration lifecycle.

## Overview

Upgrading core embedding infrastructure without downtime or regressions is a significant challenge for senior AI/ML engineers. This framework demonstrates how to approach this problem systematically. 

The project is structured as a series of steps (or phases), each building upon the last:

1.  **Initial Generation (`01-generation/`)**: Setting up the baseline. Ingesting raw data, generating initial embeddings using Google's `text-embedding-005` model via the new `google-genai` SDK, and storing them in an AlloyDB vector database.
2.  *(Future phases will cover semantic search UI, evaluation frameworks, and the actual zero-downtime migration process.)*

## Technical Stack

*   **Compute:** Google Cloud Run Jobs (for scalable, parallel batch processing)
*   **Database:** AlloyDB for PostgreSQL (with `pgvector` for vector storage)
*   **AI/ML:** Google Vertex AI (`text-embedding-005` via `google-genai` SDK)
*   **Data Source:** BigQuery (`bigquery-public-data.thelook_ecommerce.products`)
*   **Infrastructure as Code:** Terraform

## Getting Started

To get started, navigate to the `01-generation` directory and follow the instructions in its specific README to deploy the initial embedding pipeline.
