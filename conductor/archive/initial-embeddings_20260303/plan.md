# Implementation Plan: Initial Embeddings Creation Pipeline

## Phase 1: Infrastructure Setup (AlloyDB) [checkpoint: 6168abb]
- [x] Task: Configure local GCP environment for project `rsamborski-rag` and account `remik@cloudadvocacyorg.joonix.net`
- [x] Task: Provision AlloyDB cluster and instance (Terraform) 52d06fd
- [x] Task: Create database and the `products` table with `vector` type column 4647e9f
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure Setup (AlloyDB)' (Protocol in workflow.md)

## Phase 2: Python Application Development (In-folder: 01-generation) [checkpoint: 4fd12c5]
- [x] Task: Initialize Python project using `uv` and install dependencies (`google-cloud-bigquery`, `google-cloud-aiplatform`, `sqlalchemy`, `pgvector`) dce87c5
- [x] Task: Implement BigQuery data fetcher (with tests) 0c1fc01
- [x] Task: Implement Vertex AI embedding generator for `text-embedding-005` (with tests) 4e6e385
- [x] Task: Implement AlloyDB data writer (with tests) 0cb3b1b
- [x] Task: Implement worker logic using `CLOUD_RUN_TASK_INDEX` for batch offsets d16872e
- [x] Task: Implement orchestrator to calculate batches and trigger Cloud Run Job d16872e
- [x] Task: Conductor - User Manual Verification 'Phase 2: Python Application Development' (Protocol in workflow.md) 4fd12c5

## Phase 3: Containerization and Deployment
- [x] Task: Create Dockerfile for the Python application (optimized for `uv`) 99cd336
- [x] Task: Provision Cloud Run Job (Terraform) d79334e
- [x] Task: Deploy and run the initial ingestion job 9ff86f9
- [x] Task: Conductor - User Manual Verification 'Phase 3: Containerization and Deployment' (Protocol in workflow.md) 9ff86f9
