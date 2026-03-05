import pytest
from unittest.mock import MagicMock, patch
import orchestrator
from orchestrator import run_orchestrator


def test_run_orchestrator_success():
    # Mock row count: 250 products, batch size 100 -> 3 tasks
    mock_operation = MagicMock()
    mock_operation.metadata.name = "executions/exec-123"

    with patch("orchestrator.get_total_products", return_value=250), patch(
        "orchestrator.execute_cloud_run_job", return_value=mock_operation
    ) as mock_execute, patch("orchestrator.poll_execution") as mock_poll:

        run_orchestrator(batch_size=100)

        mock_execute.assert_called_once_with(3, 100)
        mock_poll.assert_called_once_with("executions/exec-123")


def test_run_orchestrator_zero_rows():
    with patch("orchestrator.get_total_products", return_value=0), patch(
        "orchestrator.execute_cloud_run_job"
    ) as mock_execute:

        run_orchestrator()
        mock_execute.assert_not_called()


def test_poll_execution_success():
    mock_client = MagicMock()

    # Mock sequence of executions: first running, then succeeded
    mock_exec_running = MagicMock()
    mock_exec_running.succeeded_count = 1
    mock_exec_running.task_count = 2
    mock_exec_running.conditions = [MagicMock(type="Ready", status="Unknown")]

    mock_exec_done = MagicMock()
    mock_exec_done.succeeded_count = 2
    mock_exec_done.task_count = 2
    mock_exec_done.conditions = [MagicMock(type="Ready", status="True")]

    mock_client.get_execution.side_effect = [mock_exec_running, mock_exec_done]

    with patch("orchestrator.run_v2.ExecutionsClient", return_value=mock_client), patch(
        "orchestrator.time.sleep"
    ):  # Skip sleep
        orchestrator.poll_execution("exec-path")

    assert mock_client.get_execution.call_count == 2


def test_execute_cloud_run_job_error():
    mock_client = MagicMock()
    mock_client.run_job.side_effect = Exception("API Error")

    with patch("orchestrator.run_v2.JobsClient", return_value=mock_client):
        result = orchestrator.execute_cloud_run_job(1, 100)
        assert result is None
