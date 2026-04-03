# Phase 2: Semantic Search UI

This is a **Next.js** application offering a visual demonstration of the RAG platform vector search capabilities. It allows running natural language terminology queries directly against our AlloyDB catalog collections.

---

## ✨ Features

*   **Natural Language queries**: Matches concept intents directly against product database text records.
*   **Vector similarity matching**: Encodes search strings on the fly via Vertex AI API lookups and compares against stored indexes.
*   **Component suite**: Modern sleek layout backed by Tailwind utility systems.

---

## 🛠️ Prerequisites

*   **Node.js** (v20+ recommended)
*   `gcloud` SDK installed and configured
*   A deployed Phase 1 data pipeline generating embedded vectors

---

## ⚙️ Configuration

Fill out environment credentials by copying the provided template:

```bash
cp .env.template .env
```

### Critical variables:
*   `PROJECT_ID`: Your GCP Sandbox ID.
*   `DB_PASSWORD`: The AlloyDB password you passed to Terraform init setup.
*   `DB_HOST`: Point this to `127.0.0.1` when funneling queries through locally running Auth Proxy.

---

## 🏃 Execution

1.  **Install project dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Database Tunnel** (Run in separate terminal window):
    ```bash
    ./alloydb-auth-proxy projects/<your-project-id>/locations/europe-central2/clusters/rag-migration-cluster/instances/rag-migration-instance
    ```

3.  **Spin up Next.js loop**:
    ```bash
    npm run dev
    ```

Navigate to [http://localhost:3000](http://localhost:3000) to play with the matching portal.
