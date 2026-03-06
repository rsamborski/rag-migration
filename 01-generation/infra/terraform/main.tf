# Enable AlloyDB API
resource "google_project_service" "alloydb" {
  project            = var.project_id
  service            = "alloydb.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "servicenetworking" {
  project            = var.project_id
  service            = "servicenetworking.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "compute" {
  project            = var.project_id
  service            = "compute.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "aiplatform" {
  project            = var.project_id
  service            = "aiplatform.googleapis.com"
  disable_on_destroy = false
}

resource "google_compute_network" "default" {
  name                    = "rag-migration-network"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.compute]
}

resource "google_compute_subnetwork" "default" {
  name          = "rag-migration-subnetwork"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.default.id
}

resource "google_compute_global_address" "private_ip_alloc" {
  name          = "rag-migration-private-ip-alloc"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.default.id
}

resource "google_service_networking_connection" "default" {
  network                 = google_compute_network.default.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_alloc.name]

  depends_on = [google_project_service.servicenetworking]
}

resource "google_alloydb_cluster" "default" {
  cluster_id = "rag-migration-cluster"
  location   = var.region
  network_config {
    network = google_compute_network.default.id
  }

  initial_user {
    password = var.db_password # In a real scenario, use a secret manager
  }

  depends_on = [
    google_service_networking_connection.default,
    google_project_service.alloydb
  ]
}

resource "google_alloydb_instance" "default" {
  cluster       = google_alloydb_cluster.default.name
  instance_id   = "rag-migration-instance"
  instance_type = "PRIMARY"

  machine_config {
    cpu_count = 2
  }

  database_flags = {
    "password.enforce_complexity" = "on"
  }

  # Enable Public IP for the instance
  network_config {
    enable_public_ip = true
  }
}

output "cluster_name" {
  value = google_alloydb_cluster.default.name
}

output "instance_ip" {
  value = google_alloydb_instance.default.ip_address
}

output "public_ip" {
  value = google_alloydb_instance.default.public_ip_address
}

# --- Cloud Run and Artifact Registry ---

resource "google_project_service" "run" {
  project            = var.project_id
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifactregistry" {
  project            = var.project_id
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "rag-migration-repo"
  description   = "Docker repository for RAG Migration pipeline"
  format        = "DOCKER"
  depends_on    = [google_project_service.artifactregistry]
}

# Service Account for Cloud Run
resource "google_service_account" "job_sa" {
  account_id   = "rag-job-sa"
  display_name = "Cloud Run Job Service Account"
}

# Roles for the SA
resource "google_project_iam_member" "sa_roles" {
  for_each = toset([
    "roles/aiplatform.user",
    "roles/bigquery.dataViewer",
    "roles/bigquery.jobUser",
    "roles/alloydb.client",
  ])
  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.job_sa.email}"
}

resource "google_cloud_run_v2_job" "job" {
  name     = "rag-embedding-job"
  location = var.region

  template {
    template {
      service_account = google_service_account.job_sa.email
      containers {
        # We use a dummy image initially. The actual image will be built and deployed via gcloud/CI
        image = "us-docker.pkg.dev/cloudrun/container/job:latest"
        
        env {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.project_id
        }
        env {
          name  = "GOOGLE_CLOUD_REGION"
          value = var.region
        }
        env {
          name  = "DB_PASSWORD"
          value = var.db_password # Ideally from Secret Manager
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].template[0].containers[0].image,
    ]
  }

  depends_on = [google_project_service.run]
}

output "repository_url" {
  value = "${google_artifact_registry_repository.repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
}

