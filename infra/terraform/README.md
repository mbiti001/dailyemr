# Terraform Stack – Daily EMR

This directory bootstraps a reference AWS environment for the Daily EMR production rollout.

> **Status**: Scaffold – replace placeholder values (state bucket, certificate ARN, CIDR ranges) before running `terraform init/plan/apply`.

## Prerequisites

1. Terraform >= 1.8
2. AWS account with administrator (or delegated) access.
3. S3 bucket + DynamoDB table for remote state (or migrate to Terraform Cloud).
4. ACM certificate issued in the target region for your production domain.
5. Container image pushed to ECR with the tag you plan to deploy.

## Usage

```bash
cd infra/terraform
# Copy the example tfvars when preparing a new environment
cp environments/staging.tfvars.example staging.tfvars

terraform init \
  -backend-config="bucket=YOUR_STATE_BUCKET" \
  -backend-config="key=prod/terraform.tfstate" \
  -backend-config="region=af-south-1" \
  -backend-config="dynamodb_table=YOUR_LOCK_TABLE"

terraform plan \
  -var-file="staging.tfvars" \
  -var="container_image_tag=$(git rev-parse --short HEAD)"

terraform apply
```

## What gets provisioned

- VPC with public/private subnets and managed NAT gateway.
- Application Load Balancer with HTTP→HTTPS redirect.
- ECS cluster (Fargate) + service wired to ECR image.
- RDS PostgreSQL Multi-AZ instance with secure credentials stored in SSM Parameter Store.
- ElastiCache Redis replication group for session caching and queues.
- CloudWatch log group for container logs.

## Next steps

- Wire up GitHub Actions deployment workflow to build/push the container and run `terraform plan`/`apply` (see docs/production-launch.md).
- Create AWS WAF rules, AWS Backup plan, and CloudFront distribution if global caching is required.
- Layer in additional microservices (claims, notifications) as separate task definitions or Lambda functions.

### Staging quickstart

1. Copy `environments/staging.tfvars.example` to `staging.tfvars` and update with real values (ingress CIDRs, ACM cert, database credentials).
2. Point the backend configuration to your staging state path (for example, `key=staging/terraform.tfstate`).
3. Run `terraform init`, `terraform plan -var-file=staging.tfvars`, and `terraform apply`.
4. Update GitHub repository secrets used by the staging deploy workflow to match the new infrastructure (role ARNs, database passwords, ACM certificate).
