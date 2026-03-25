import os
import math
import time
import sys
from google.cloud import run_v2
from src.bigquery_fetcher import get_total_products

def execute_cloud_run_job(tasks_count: int, batch_size: int):
    """
    Triggers the Cloud Run Job with a specific number of tasks.
    Returns the execution name.
    """
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "rsamborski-rag")
    region = os.environ.get("GOOGLE_CLOUD_REGION", "europe-central2")
    job_name = os.environ.get("CLOUD_RUN_JOB_NAME", "rag-embedding-job")
    
    client = run_v2.JobsClient()
    job_path = client.job_path(project_id, region, job_name)
    
    overrides = {
        "task_count": tasks_count,
        "container_overrides": [{
            "env": [
                {"name": "BATCH_SIZE", "value": str(batch_size)}
            ]
        }]
    }
    
    print(f"\n🚀 Triggering Cloud Run Job: {job_name}")
    print(f"📦 Total Tasks: {tasks_count} (Batch Size: {batch_size})")
    
    try:
        request = run_v2.RunJobRequest(
            name=job_path,
            overrides=overrides
        )
        operation = client.run_job(request=request)
        # The operation metadata contains the execution name
        # We need to wait a tiny bit or parse the metadata to get the execution ID
        # For simplicity, we'll fetch the latest execution for this job
        return operation
    except Exception as e:
        print(f"❌ Failed to trigger Cloud Run Job: {e}")
        return None

def poll_execution(execution_name: str):
    """
    Polls the execution status and displays a progress summary.
    """
    client = run_v2.ExecutionsClient()
    
    print(f"\n⏳ Monitoring execution: {execution_name.split('/')[-1]}")
    print("-" * 50)
    
    while True:
        try:
            execution = client.get_execution(name=execution_name)
            
            succeeded = execution.succeeded_count
            failed = execution.failed_count
            running = execution.running_count
            cancelled = execution.cancelled_count
            total = execution.task_count
            
            # Simple Progress UI
            status_line = (
                f"Succeeded: {succeeded}/{total} | "
                f"Running: {running} | "
                f"Failed: {failed} | "
                f"Cancelled: {cancelled}"
            )
            
            # Use carriage return to overwrite the same line in the terminal
            sys.stdout.write(f"\r{status_line}")
            sys.stdout.flush()
            
            # Check if finished
            # Using conditions to check for completion
            is_finished = False
            for condition in execution.conditions:
                if condition.type == "Completed" and condition.state.name in ["CONDITION_SUCCEEDED", "CONDITION_FAILED"]:
                    is_finished = True
                    break
            
            if is_finished:
                print("\n" + "-" * 50)
                if succeeded == total:
                    print("✅ Execution completed successfully!")
                else:
                    print(f"⚠️ Execution finished with some failures ({failed} failed).")
                break
                
        except Exception as e:
            print(f"\n⚠️ Error polling status: {e}")
            
        time.sleep(10)

def run_orchestrator(batch_size=100):
    """
    Main orchestration flow.
    """
    total_products = get_total_products()
    print(f"🔍 Found {total_products} products to process.")
    
    if total_products == 0:
        print("⏭️ Nothing to process.")
        return
        
    tasks_count = math.ceil(total_products / batch_size)
    
    operation = execute_cloud_run_job(tasks_count, batch_size)
    
    if operation:
        # The 'name' of the execution is in the operation metadata or results
        # In Run V2, run_job returns an Operation. The response property (once done) 
        # or metadata contains the execution.
        # For immediate polling, we can use the latest execution created for the job.
        
        # Wait for the operation to start and provide the execution name
        # Metadata type is google.cloud.run.v2.Execution
        print("🕒 Waiting for execution to initialize...")
        while not operation.metadata.name:
             time.sleep(1)
             
        execution_name = operation.metadata.name
        poll_execution(execution_name)

if __name__ == "__main__":
    batch_size = int(os.environ.get("BATCH_SIZE", 100))
    run_orchestrator(batch_size=batch_size)
