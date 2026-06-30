# main.tf (root)

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── 1. IAM ────────────────────────────────────────────────────────────────────
# Created first because Lambda needs the role ARN
module "iam" {
  source = "./modules/iam"

  project_name           = var.project_name
  source_bucket_arn      = module.s3.source_bucket_arn
  destination_bucket_arn = module.s3.destination_bucket_arn
  tags                   = local.tags

  # IAM references S3 ARNs → depends_on not needed; Terraform resolves via references
}

# ── 2. Lambda ─────────────────────────────────────────────────────────────────
module "lambda" {
  source = "./modules/lambda"

  project_name            = var.project_name
  source_dir              = "${path.root}/lambda_src"
  lambda_role_arn         = module.iam.lambda_role_arn
  source_bucket_arn       = module.s3.source_bucket_arn
  destination_bucket_name = module.s3.destination_bucket_name
  pillow_layer_arn        = var.pillow_layer_arn
  timeout                 = var.lambda_timeout
  memory_size             = var.lambda_memory
  max_width               = var.max_width
  max_height              = var.max_height
  output_format           = var.output_format
  tags                    = local.tags
}

# ── 3. S3 ─────────────────────────────────────────────────────────────────────
module "s3" {
  source = "./modules/s3"

  source_bucket_name      = "${var.project_name}-source-${var.aws_region}"
  destination_bucket_name = "${var.project_name}-destination-${var.aws_region}"
  lambda_arn              = module.lambda.function_arn
  lambda_permission_id    = module.lambda.lambda_permission_id
  tags                    = local.tags
}

# ── 4. CloudWatch ─────────────────────────────────────────────────────────────
module "cloudwatch" {
  source = "./modules/cloudwatch"

  project_name          = var.project_name
  function_name         = module.lambda.function_name
  aws_region            = var.aws_region
  log_retention_days    = var.log_retention_days
  duration_threshold_ms = var.duration_threshold_ms
  tags                  = local.tags
}


module "download_lambda" {

  source = "./modules/download_lambda"

  project_name = var.project_name

  source_dir = "${path.root}/download_lambda"

  lambda_role_arn = module.iam.lambda_role_arn

  source_bucket_name      = module.s3.source_bucket_name
  destination_bucket_name = module.s3.destination_bucket_name

  timeout     = 60
  memory_size = 512

  tags = local.tags
}

module "apigateway" {

  source = "./modules/apigateway"

  project_name = var.project_name

  lambda_function_name = module.download_lambda.function_name

  lambda_invoke_arn = module.download_lambda.invoke_arn

  tags = local.tags
}

locals {
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
