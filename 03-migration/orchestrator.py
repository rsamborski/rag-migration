import os
import sys
import math
import time
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from main import init_db_engine

def get_total_unmigrated_products() -> int:
    """Gets the count of products that need migration (embedding_v2 IS NULL)."""
    engine = init_db_engine()
    Session = sessionmaker(bind=engine)
    with Session() as session:
        stmt = text("SELECT COUNT(*) FROM products WHERE embedding_v2 IS NULL")
        result = session.execute(stmt).scalar()
        return result or 0

def execute_cloud_run_job(tasks_count: int, batch_size: int):
    """
    Triggers the Cloud Run Job with a specific number of tasks.
    Returns the execution name.
    """
    from google.cloud import run_v2
    
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "rsamborski-rag")
    region = os.environ.get("GOOGLE_CLOUD_REGION", "europe-central2")
    job_name = os.environ.get("CLOUD_RUN_JOB_NAME", "rag-migration-job")
    
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
        return operation
    except Exception as e:
        print(f"❌ Failed to trigger Cloud Run Job: {e}")
        return None

def poll_execution(execution_name: str):
    """
    Polls the execution status and displays a progress summary.
    """
    from google.cloud import run_v2
    
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
            
            status_line = (
                f"Succeeded: {succeeded}/{total} | "
                f"Running: {running} | "
                f"Failed: {failed} | "
                f"Cancelled: {cancelled}"
            )
            
            sys.stdout.write(f"\r{status_line}")
            sys.stdout.flush()
            
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
    total_products = get_total_unmigrated_products()
    print(f"🔍 Found {total_products} products needing migration.")
    
    if total_products == 0:
        print("⏭️ Nothing to process. All products migrated.")
        return
        
    tasks_count = math.ceil(total_products / batch_size)
    
    operation = execute_cloud_run_job(tasks_count, batch_size)
    
    if operation:
        print("🕒 Waiting for execution to initialize...")
        while not operation.metadata.name:
             time.sleep(1)
             
        execution_name = operation.metadata.name
        poll_execution(execution_name)

if __name__ == "__main__":
    batch_size = int(os.environ.get("BATCH_SIZE", 100))
    run_orchestrator(batch_size=batch_size)
