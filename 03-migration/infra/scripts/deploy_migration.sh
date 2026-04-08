#!/bin/bash
set -e

# Configuration
export PROJECT_ID="${PROJECT_ID:-your-project-id}"
export REGION="${REGION:-europe-central2}"
export REPO_NAME="${REPO_NAME:-rag-migration-repo}"
export IMAGE_NAME="${IMAGE_NAME:-rag-migration-job}"
export JOB_NAME="${JOB_NAME:-rag-migration-job}"

# AlloyDB Configuration
export ALLOYDB_REGION="${ALLOYDB_REGION:-europe-central2}"
export ALLOYDB_CLUSTER="${ALLOYDB_CLUSTER:-rag-migration-cluster}"
export ALLOYDB_INSTANCE="${ALLOYDB_INSTANCE:-rag-migration-instance}"
export ALLOYDB_DATABASE="${ALLOYDB_DATABASE:-rag_migration}"
export ALLOYDB_USER="${ALLOYDB_USER:-postgres}"
export DB_PASSWORD="${DB_PASSWORD:-}"

# Full Image URL
export IMAGE_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:latest"

echo "---------------------------------------------------------"
echo "🚀 Starting Gemini Migration Deployment Pipeline"
echo "---------------------------------------------------------"

# 1. Build and Push Image (using gcloud builds)
echo "📦 Step 1: Building and pushing Docker image to Artifact Registry..."
# Note: we are running this from the project root, targeting the 03-migration/ directory
gcloud builds submit --tag "${IMAGE_URL}" .

# 2. Update/Create Cloud Run Job with the new image
echo "🛠️ Step 2: Updating/Creating Cloud Run Job with the new image..."
# Check if job exists to decide between 'create' or 'update'
if gcloud run jobs describe "${JOB_NAME}" --region "${REGION}" &>/dev/null; then
    gcloud run jobs update "${JOB_NAME}" \
        --image "${IMAGE_URL}" \
        --region "${REGION}" \
        --set-env-vars "GEMINI_EMBEDDING_MODEL=gemini-embedding-001,GEMINI_EMBEDDING_DIMENSION=768,ALLOYDB_REGION=${ALLOYDB_REGION},ALLOYDB_CLUSTER=${ALLOYDB_CLUSTER},ALLOYDB_INSTANCE=${ALLOYDB_INSTANCE},ALLOYDB_DATABASE=${ALLOYDB_DATABASE},ALLOYDB_USER=${ALLOYDB_USER},DB_PASSWORD=${DB_PASSWORD}"
else
    gcloud run jobs create "${JOB_NAME}" \
        --image "${IMAGE_URL}" \
        --region "${REGION}" \
        --set-env-vars "GEMINI_EMBEDDING_MODEL=gemini-embedding-001,GEMINI_EMBEDDING_DIMENSION=768,ALLOYDB_REGION=${ALLOYDB_REGION},ALLOYDB_CLUSTER=${ALLOYDB_CLUSTER},ALLOYDB_INSTANCE=${ALLOYDB_INSTANCE},ALLOYDB_DATABASE=${ALLOYDB_DATABASE},ALLOYDB_USER=${ALLOYDB_USER},DB_PASSWORD=${DB_PASSWORD}"
fi

echo "---------------------------------------------------------"
echo "✅ Migration Job Deployment Finished"
echo "💡 To trigger the job, run: gcloud run jobs execute ${JOB_NAME} --region ${REGION}"
echo "---------------------------------------------------------"
