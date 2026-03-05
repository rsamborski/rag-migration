variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The region to deploy resources to"
  type        = string
  default     = "europe-central2"
}

variable "db_password" {
  description = "Password for the AlloyDB postgres user (should be managed by Secret Manager in production)"
  type        = string
  sensitive   = true
}
