import pytest
import os
from unittest.mock import MagicMock, patch
from src.migration_orchestrator import get_total_unmigrated_products, execute_cloud_run_job, run_orchestrator

def test_get_total_unmigrated_products():
    mock_session = MagicMock()
    mock_session.execute.return_value = MagicMock(scalar=lambda: 550)
    mock_sessionmaker = MagicMock(return_value=mock_session)
    mock_engine = MagicMock()
    
    with patch("src.migration_orchestrator.init_db_engine", return_value=mock_engine), \
         patch("src.migration_orchestrator.sessionmaker", return_value=mock_sessionmaker):
         
         mock_session.__enter__.return_value = mock_session
         total = get_total_unmigrated_products()
         assert total == 550

def test_execute_cloud_run_job():
    mock_client = MagicMock()
    mock_operation = MagicMock()
    mock_client.run_job.return_value = mock_operation
    mock_client.job_path.return_value = "projects/test/locations/europe-central2/jobs/rag-migration-job"
    
    with patch("src.migration_orchestrator.run_v2.JobsClient", return_value=mock_client), \
         patch.dict(os.environ, {"GOOGLE_CLOUD_PROJECT": "test", "GOOGLE_CLOUD_REGION": "europe-central2", "CLOUD_RUN_JOB_NAME": "rag-migration-job"}):
         
         operation = execute_cloud_run_job(tasks_count=5, batch_size=100)
         
         assert operation == mock_operation
         mock_client.run_job.assert_called_once()
         kwargs = mock_client.run_job.call_args.kwargs
         assert kwargs["request"].name == "projects/test/locations/europe-central2/jobs/rag-migration-job"
         assert kwargs["request"].overrides.task_count == 5

@patch("src.migration_orchestrator.get_total_unmigrated_products", return_value=0)
def test_run_orchestrator_no_products(mock_get_total):
    run_orchestrator()
    # Verify no exceptions
    mock_get_total.assert_called_once()
