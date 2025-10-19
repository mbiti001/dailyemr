locals {
  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

module "network" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.5.1"

  name = "${var.project}-${var.environment}-vpc"

  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, length(var.public_subnet_cidrs))
  public_subnets  = var.public_subnet_cidrs
  private_subnets = var.private_subnet_cidrs

  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = local.tags
}

data "aws_availability_zones" "available" {}

module "alb_security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.2.0"

  name        = "${var.project}-${var.environment}-alb"
  description = "Security group for ALB"
  vpc_id      = module.network.vpc_id

  ingress_cidr_blocks = var.allowed_ingress_cidrs
  ingress_rules       = ["http-80-tcp", "https-443-tcp"]
  egress_rules        = ["all-all"]

  tags = local.tags
}

module "ecs_security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.2.0"

  name        = "${var.project}-${var.environment}-ecs"
  description = "Security group for ECS tasks"
  vpc_id      = module.network.vpc_id

  ingress_with_source_security_group_id = [
    {
      description              = "Allow ALB to reach ECS tasks"
      from_port                = 3000
      to_port                  = 3000
      protocol                 = "tcp"
      source_security_group_id = module.alb_security_group.this_security_group_id
    }
  ]

  egress_rules = ["all-all"]

  tags = local.tags
}

module "db_security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.2.0"

  name        = "${var.project}-${var.environment}-db"
  description = "Security group for Postgres"
  vpc_id      = module.network.vpc_id

  ingress_with_source_security_group_id = [
    {
      description              = "Allow ECS tasks to access Postgres"
      from_port                = 5432
      to_port                  = 5432
      protocol                 = "tcp"
      source_security_group_id = module.ecs_security_group.this_security_group_id
    }
  ]

  egress_rules = ["all-all"]

  tags = local.tags
}

module "ecs" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "5.10.0"

  cluster_name = "${var.project}-${var.environment}"

  fargate_capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  tags = local.tags
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.project}-${var.environment}-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = module.ecs.execution_role_arn
  task_role_arn            = module.ecs.task_exec_role_arn

  container_definitions = jsonencode([
    {
      name      = "next-app"
      image     = "${module.ecr.repository_url}:${var.container_image_tag}"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "DATABASE_URL"
          value = aws_ssm_parameter.database_url.value
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.app.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "${var.project}-${var.environment}"
        }
      }
    }
  ])
}

module "ecr" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "2.4.0"

  repository_name = "${var.project}/${var.environment}/app"
  tags            = local.tags
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/ecs/${var.project}-${var.environment}"
  retention_in_days = 90
  tags              = local.tags
}

module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.5.4"

  identifier = "${var.project}-${var.environment}-db"

  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.m6g.large"
  allocated_storage = 100

  name     = "dailyemr"
  username = var.database_username
  password = var.database_password
  port     = 5432

  multi_az               = true
  storage_encrypted      = true
  backup_retention_period = 7
  deletion_protection    = true

  subnet_ids         = module.network.private_subnets
  vpc_security_group_ids = [module.db_security_group.this_security_group_id]

  tags = local.tags
}

resource "aws_ssm_parameter" "database_url" {
  name      = "/${var.project}/${var.environment}/DATABASE_URL"
  type      = "SecureString"
  value     = "postgresql://${var.database_username}:${var.database_password}@${module.rds.db_instance_address}:5432/dailyemr?schema=public"
  overwrite = true
  tags      = local.tags
}

module "redis" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "1.6.0"

  name                 = "${var.project}-${var.environment}-redis"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.t3.medium"
  number_cache_clusters = 2

  vpc_id    = module.network.vpc_id
  subnet_ids = module.network.private_subnets
  security_group_description = "Redis security group"
  security_group_rules = {
    ingress = {
      description = "App access"
      type        = "ingress"
      from_port   = 6379
      to_port     = 6379
      protocol    = "tcp"
      cidr_blocks = module.network.private_subnets_cidr_blocks
    }
  }

  tags = local.tags
}

resource "aws_ecs_service" "app" {
  name            = "${var.project}-${var.environment}"
  cluster         = module.ecs.cluster_id
  task_definition = aws_ecs_task_definition.app.arn
  launch_type     = "FARGATE"
  desired_count   = 2

  network_configuration {
    subnets         = module.network.private_subnets
    security_groups = [module.ecs_security_group.this_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = module.alb.target_group_arns[0]
    container_name   = "next-app"
    container_port   = 3000
  }

depends_on = [module.alb]
}

module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "9.0.0"

  name               = "${var.project}-${var.environment}"
  load_balancer_type = "application"

  vpc_id          = module.network.vpc_id
  subnets         = module.network.public_subnets
  security_groups = [module.alb_security_group.this_security_group_id]

  target_groups = [
    {
      name_prefix      = "app"
      backend_protocol = "HTTP"
      backend_port     = 3000
      target_type      = "ip"
      health_check = {
        enabled             = true
        interval            = 30
        path                = "/api/health"
        healthy_threshold   = 3
        unhealthy_threshold = 3
        matcher             = "200-399"
      }
    }
  ]

  http_tcp_listeners = [
    {
      port        = 80
      protocol    = "HTTP"
      action_type = "redirect"
      redirect = {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  ]

  https_listeners = [
    {
      port            = 443
      protocol        = "HTTPS"
      certificate_arn = var.acm_certificate_arn
      ssl_policy      = "ELBSecurityPolicy-TLS13-1-2-2021-06"
      action_type     = "forward"
    }
  ]

  tags = local.tags
}
