# Implementation Plan: Initial Embeddings Creation Pipeline

## Phase 1: Infrastructure Setup (AlloyDB)
- [ ] Task: Provision AlloyDB cluster and instance (Terraform)
- [ ] Task: Create database and the `products` table with `vector` type column
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure Setup (AlloyDB)' (Protocol in workflow.md)

## Phase 2: Python Application Development (In-folder: 01-generation)
- [ ] Task: Initialize Python project using `uv` and install dependencies (`google-cloud-bigquery`, `google-cloud-aiplatform`, `sqlalchemy`, `pgvector`)
- [ ] Task: Implement BigQuery data fetcher (with tests)
- [ ] Task: Implement Vertex AI embedding generator for `text-embedding-005` (with tests)
- [ ] Task: Implement AlloyDB data writer (with tests)
- [ ] Task: Implement main orchestration logic for the Cloud Run Job
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Python Application Development' (Protocol in workflow.md)

## Phase 3: Containerization and Deployment
- [ ] Task: Create Dockerfile for the Python application (optimized for `uv`)
- [ ] Task: Provision Cloud Run Job (Terraform)
- [ ] Task: Deploy and run the initial ingestion job
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Containerization and Deployment' (Protocol in workflow.md)
