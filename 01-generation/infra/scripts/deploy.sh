#!/bin/bash
set -e

# Configuration
export PROJECT_ID="${PROJECT_ID:-your-project-id}"
export REGION="${REGION:-europe-central2}"
export REPO_NAME="${REPO_NAME:-rag-migration-repo}"
export IMAGE_NAME="${IMAGE_NAME:-rag-embedding-worker}"
export JOB_NAME="${JOB_NAME:-rag-embedding-job}"

# Full Image URL
export IMAGE_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:latest"

echo "---------------------------------------------------------"
echo "🚀 Starting Deployment Pipeline"
echo "---------------------------------------------------------"

# 1. Build and Push Image (using gcloud builds)
echo "📦 Step 1: Building and pushing Docker image to Artifact Registry..."
gcloud builds submit --tag "${IMAGE_URL}" .

# 2. Update Cloud Run Job with the new image
echo "🛠️ Step 2: Updating Cloud Run Job with the new image..."
gcloud run jobs update "${JOB_NAME}" \
    --image "${IMAGE_URL}" \
    --region "${REGION}"

echo "---------------------------------------------------------"
echo "✅ Deployment Finished"
echo "---------------------------------------------------------"
