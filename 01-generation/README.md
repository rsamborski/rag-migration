# Phase 1: Initial Embeddings Creation Pipeline

This directory contains the code and infrastructure configuration to build the foundational data pipeline for our RAG system.

## What this does

It runs as a highly parallelized **Google Cloud Run Job**. The job reads product data from a public BigQuery dataset, generates vector embeddings using Vertex AI's `text-embedding-005` model (via the `google-genai` SDK), and writes the original metadata alongside the vectors into an **AlloyDB for PostgreSQL** database using `pgvector`.

## Architecture

The pipeline is decoupled into two main components:

1.  **Worker (`main.py`)**: A Python script designed to be run as an individual task within a Cloud Run Job array. It uses the `CLOUD_RUN_TASK_INDEX` environment variable to calculate which specific "batch" (offset) of the BigQuery data it is responsible for.
2.  **Orchestrator (`orchestrator.py`)**: A Python script that checks the total number of rows in the BigQuery source table, calculates how many parallel worker tasks are needed based on a configured `BATCH_SIZE`, triggers the Cloud Run Job via the API, and provides a real-time console UI polling the execution progress.

## Prerequisites

*   A Google Cloud Project
*   Google Cloud CLI (`gcloud`) authenticated (`gcloud auth login` and `gcloud auth application-default login`)
*   Terraform installed
*   Python 3.13+ and `uv` package manager installed
*   (Local Testing) AlloyDB Auth Proxy installed

## Deployment & Execution

The provided shell script `infra/scripts/deploy_and_run.sh` automates the entire process:
1.  **Builds & Pushes** the Docker image to Artifact Registry.
2.  **Updates** the Cloud Run Job configuration with the new image.
3.  **Triggers** the `orchestrator.py` locally to start and monitor the job.

```bash
# Set your configuration
export PROJECT_ID="your-project-id"
export REGION="europe-central2"

# From the project root
chmod +x 01-generation/infra/scripts/deploy_and_run.sh
./01-generation/infra/scripts/deploy_and_run.sh
```

## Local Development & Testing

1.  **Install dependencies:**
    ```bash
    uv sync
    ```

2.  **Run tests:**
    ```bash
    uv run pytest tests/
    ```

3.  **Local Execution (Testing the worker):**
    Ensure your AlloyDB Auth Proxy is running in the background and pointing to your provisioned instance.

    ```bash
    export GOOGLE_CLOUD_PROJECT=your-project-id
    export GOOGLE_CLOUD_REGION=europe-central2
    export BATCH_SIZE=5
    export CLOUD_RUN_TASK_INDEX=0
    
    # Run a single batch of 5 items
    uv run main.py
    
    # Run all batches at once to process through the whole dataset
    uv run orchestrator.py
    ```

## Infrastructure (Terraform)

The `infra/terraform` directory contains the configuration to provision the necessary networking, APIs, and the AlloyDB cluster/instance. 

Note: When testing locally, you will need the [AlloyDB Auth Proxy](https://docs.cloud.google.com/alloydb/docs/auth-proxy/connect) to connect to the private database instance.
