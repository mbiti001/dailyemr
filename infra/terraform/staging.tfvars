project            = "daily-emr"
environment        = "staging"
aws_region         = "af-south-1"
allowed_ingress_cidrs = ["0.0.0.0/0"]

# Replace with Secrets Manager or Terraform Cloud variables in practice
# These values are placeholders for local testing only.
database_username  = "emr_staging"
database_password  = "change-me"
acm_certificate_arn = "arn:aws:acm:af-south-1:123456789012:certificate/abcdef12-3456-7890-abcd-ef1234567890"

# The CI pipeline will override this with the pushed image tag
container_image_tag = "latest"
