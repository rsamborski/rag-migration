#!/bin/bash

# Configuration
PROJECT_ID="rsamborski-rag"
CLUSTER_ID="rag-migration-cluster"
REGION="europe-central2"

echo "Checking for AlloyDB cluster: $CLUSTER_ID in project: $PROJECT_ID, region: $REGION..."

# Try to describe the cluster
gcloud alloydb clusters describe $CLUSTER_ID --region=$REGION --project=$PROJECT_ID > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "SUCCESS: AlloyDB cluster '$CLUSTER_ID' exists."
    exit 0
else
    echo "FAILURE: AlloyDB cluster '$CLUSTER_ID' does not exist."
    exit 1
fi
