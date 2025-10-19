variable "project" {
  description = "Name of the project for tagging."
  type        = string
  default     = "daily-emr"
}

variable "environment" {
  description = "Deployment environment (staging, production, etc)."
  type        = string
}

variable "aws_region" {
  description = "AWS region to deploy resources."
  type        = string
  default     = "af-south-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs per availability zone."
  type        = list(string)
  default     = [
    "10.20.0.0/24",
    "10.20.1.0/24"
  ]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs per availability zone."
  type        = list(string)
  default     = [
    "10.20.10.0/24",
    "10.20.11.0/24"
  ]
}

variable "database_username" {
  description = "Master username for the Postgres database."
  type        = string
}

variable "database_password" {
  description = "Master password for the Postgres database."
  type        = string
  sensitive   = true
}

variable "allowed_ingress_cidrs" {
  description = "CIDR blocks allowed to access ALB / bastion."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS listeners."
  type        = string
}

variable "container_image_tag" {
  description = "ECR image tag to deploy for the application."
  type        = string
}
