# Embedding Migration (v2)

This directory contains the tools and scripts to migrate product embeddings from the old format to the new `gemini-embedding-001` format.

The migration is designed as a **Cloud Run Job** divided into multiple concurrent tasks, coordinated by an **Orchestrator** script. Each task fetches a batch of products missing the new embedding, generates the new embedding using Gemini, and updates the database.

---

## 🛠️ Prerequisites

Before running any scripts, ensure you have:

1.  Installed [uv](https://github.com/astral-sh/uv) (recommended Python package manager)
2.  Authenticated with Google Cloud:
    ```bash
    gcloud auth login
    gcloud auth application-default login
    ```
3.  Set up your local environment:
    ```bash
    cd 03-migration
    uv sync
    ```

---

## ⚙️ Configuration

Both the deployment script and the application code rely on environment variables. 

### AlloyDB Configuration
These variables are used by the worker tasks and the orchestrator to connect to the DB:
*   `ALLOYDB_PROJECT`: Google Cloud Project ID (default: current default)
*   `ALLOYDB_REGION`: AlloyDB Region (default: `europe-central2`)
*   `ALLOYDB_CLUSTER`: AlloyDB Cluster name (default: `rag-migration-cluster`)
*   `ALLOYDB_INSTANCE`: AlloyDB Instance name (default: `rag-migration-instance`)
*   `ALLOYDB_DATABASE`: AlloyDB Database name (default: `rag_migration`)
*   `ALLOYDB_USER`: Database user (default: `postgres`)
*   `DB_PASSWORD`: **Required** Database password.

### Job Configuration
*   `GEMINI_EMBEDDING_MODEL`: The model to use (default: `gemini-embedding-001`)
*   `GEMINI_EMBEDDING_DIMENSION`: Model output dimension (default: `768`)
*   `BATCH_SIZE`: Number of items to process per task range (default: `100`)

---

## 🧪 Testing

We use `pytest` for running unit tests. You can verify changes locally without hitting live resources via mocks.

Run all tests:
```bash
uv run pytest
```

Optionally with coverage:
```bash
uv run pytest --cov=.
```

---

## 🗄️ Database Schema Setup

Before running the migration pipeline or deploying the job, you must ensure the target tables have the new column to store v2 embeddings.

Run the provided SQL migration script against your AlloyDB instance. Typically this is applied via `psql` using the AlloyDB Auth Proxy:

```bash
# Example running from 03-migration directory
# 1. Ensure proxy is running connected to your instance on port 5432
# 2. Run the script:
psql -h 127.0.0.1 -U postgres -d rag_migration -f 001_add_embedding_v2.sql
```

---

## 🚀 Deployment

Build the Docker image via Google Cloud Builds and push it to Artifact Registry, then create/update the Cloud Run Job.

Use the provided deploy script:

```bash
# 1. Provide the necessary password context for the Job deployment
export DB_PASSWORD="your-alloydb-password"

# 2. Run the deployment script
./infra/scripts/deploy_migration.sh
```

---

## 🏃 Running the Migration

The migration consists of two stages:

### 1. The Orchestrator
Runs locally (or in an administrative runner setup) to count products needing migration and spawns the correct number of parallel Cloud Run tasks.

Ensure you have your DB vars set before running the orchestrator:
```bash
export DB_PASSWORD="your-alloydb-password"
# Optional overrides
# export BATCH_SIZE=50

# Run orchestrator
uv run python orchestrator.py
```

### 2. Manual Cloud Run Job Execution
If you wish to trigger the Cloud Run Job execution manually without the Python orchestrator sizing it:

```bash
gcloud run jobs execute rag-migration-job --region europe-central2
```
