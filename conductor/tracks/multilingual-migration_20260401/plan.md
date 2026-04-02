# Implementation Plan: Embedding Migration to Gemini Unified Model (gemini-embedding-001)

## Phase 1: Database and Environment Preparation [checkpoint: dcaf8db]
- [x] Task: Add `embedding_v2` column to the `products` table in AlloyDB using SQL script [2bfd35d]
- [x] Task: Update environment variables to include the new model name (`gemini-embedding-001`) and dimension (768) [ba99213]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Database and Environment Preparation' (Protocol in workflow.md) [dcaf8db]

## Phase 2: Migration Job Development (Python)
- [ ] Task: Update `01-generation/src/embedder.py` to support `gemini-embedding-001` and configurable dimensions
- [ ] Task: Write tests for the updated embedder utility
- [ ] Task: Create a new migration script/orchestrator `01-generation/migration_orchestrator.py` for batch re-embedding
- [ ] Task: Write tests for the migration orchestrator
- [ ] Task: Update Dockerfile and Cloud Run Job configuration for the migration job
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Migration Job Development (Python)' (Protocol in workflow.md)

## Phase 3: Backend API Updates (Next.js)
- [ ] Task: Update `02-ui/lib/embeddings.ts` to support `gemini-embedding-001` with MRL (768 dimensions)
- [ ] Task: Write tests for the updated embeddings utility
- [ ] Task: Modify `02-ui/app/api/search/route.ts` to accept a `model` parameter and switch between models/columns
- [ ] Task: Write integration tests for the updated search API route
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Backend API Updates (Next.js)' (Protocol in workflow.md)

## Phase 4: Frontend UI Updates (Next.js)
- [ ] Task: Create a `ModelSwitcher` component to toggle between original and Gemini models
- [ ] Task: Write component tests for `ModelSwitcher`
- [ ] Task: Integrate `ModelSwitcher` into the main layout and update `useSearch` hook to pass the model state
- [ ] Task: Write tests for the updated search state management
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Frontend UI Updates (Next.js)' (Protocol in workflow.md)