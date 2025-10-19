output "vpc_id" {
  description = "ID of the VPC."
  value       = module.network.vpc_id
}

output "alb_dns_name" {
  description = "DNS name of the application load balancer."
  value       = module.alb.lb_dns_name
}

output "ecs_cluster_id" {
  description = "ECS cluster ID."
  value       = module.ecs.cluster_id
}

output "rds_endpoint" {
  description = "Endpoint of the Postgres database."
  value       = module.rds.db_instance_address
}

output "redis_primary_endpoint" {
  description = "Primary endpoint of the Redis cluster."
  value       = module.redis.redis_primary_endpoint_address
}

output "container_repository_url" {
  description = "ECR repository URL for application images."
  value       = module.ecr.repository_url
}
