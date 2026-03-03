# Specification: Initial Embeddings Creation Pipeline

## 1. Overview
This track involves building the foundational data pipeline for the RAG Migration Framework. We will create a Python-based application that runs as a Cloud Run Job to ingest the 'products' table from the BigQuery 'thelook_ecommerce' public dataset, generate embeddings for relevant fields, and store the results in AlloyDB. 

This is the first step in a multi-part series, and all assets will be organized to support future blog content.

## 2. Functional Requirements
*   **Dataset Ingestion:** Connect to BigQuery public data (`bigquery-public-data.thelook_ecommerce.products`).
*   **Embedding Generation:**
    *   Target fields: `name`, `category`, `brand`.
    *   Model: Use a standard embedding model (Google's `text-embedding-005`).
*   **Data Storage:** Store the original product metadata and the generated vector embeddings in **AlloyDB for PostgreSQL**.
*   **Scalability:** Orchestrate the process using **Cloud Run Jobs** to handle the dataset in parallel batches (if needed).
*   **Project Organization:** All code, infrastructure scripts (Terraform), and configuration for this track must reside within a top-level directory named `01-generation/`.

## 3. Non-Functional Requirements
*   **Reproducibility:** The pipeline should be easily deployable by a third party with appropriate GCP permissions.
*   **Observability:** Implement logging to track job progress and capture errors during embedding or storage.
*   **Efficiency:** Use batching for embedding API calls and database insertions to optimize performance and cost.

## 4. Acceptance Criteria
*   [ ] Cloud Run Job successfully executes without errors.
*   [ ] AlloyDB table is populated with product data and corresponding embeddings.
*   [ ] The `01-generation/` folder contains all source code and deployment scripts.
*   [ ] Python unit tests are provided for core embedding and data transformation logic.

## 5. Out of Scope
*   Incremental updates (Cloud Run Functions/PubSub).
*   Web UI (Next.js demonstration).
*   Post-migration evaluation framework.
