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
terraform init \
  -backend-config="bucket=YOUR_STATE_BUCKET" \
  -backend-config="key=prod/terraform.tfstate" \
  -backend-config="region=af-south-1" \
  -backend-config="dynamodb_table=YOUR_LOCK_TABLE"

terraform plan \
  -var="environment=production" \
  -var="database_username=emr_admin" \
  -var="database_password=$(pass show dailyemr/prod/db_password)" \
  -var="acm_certificate_arn=arn:aws:acm:af-south-1:123456789012:certificate/abcdef" \
  -var="container_image_tag=2025-10-19"

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
