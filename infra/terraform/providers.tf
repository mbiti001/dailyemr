terraform {
  required_version = ">= 1.8.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # TODO: replace with your Terraform state bucket/region/table
    bucket = "daily-emr-terraform-state"
    key    = "global/s3/terraform.tfstate"
    region = "af-south-1"
    dynamodb_table = "daily-emr-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}
