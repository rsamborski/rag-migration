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
    password = "change-me-immediately" # In a real scenario, use a secret manager
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
}

output "cluster_name" {
  value = google_alloydb_cluster.default.name
}

output "instance_ip" {
  value = google_alloydb_instance.default.ip_address
}
