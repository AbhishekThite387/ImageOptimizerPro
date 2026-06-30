# variables.tf (root)

variable "aws_region" {
  description = "AWS region to deploy all resources"
  type        = string
  default     = "ap-south-1" # Mumbai — closest to Pune
}

variable "project_name" {
  description = "Prefix for all resource names"
  type        = string
  default     = "img-processor"
}

variable "environment" {
  type    = string
  default = "dev"
}

# Lambda
variable "lambda_timeout" {
  type    = number
  default = 60
}

variable "lambda_memory" {
  type    = number
  default = 512
}

variable "pillow_layer_arn" {
  description = "ARN of a Lambda Layer providing Pillow. See README for how to get one."
  type        = string
  default     = ""
}

# Image processing
variable "max_width" {
  type    = number
  default = 1280
}

variable "max_height" {
  type    = number
  default = 720
}

variable "output_format" {
  description = "JPEG | PNG | WEBP"
  type        = string
  default     = "JPEG"
}

# CloudWatch
variable "log_retention_days" {
  type    = number
  default = 14
}

variable "duration_threshold_ms" {
  type    = number
  default = 45000
}

# Frontend Hosting
variable "frontend_bucket_name" {
  description = "Name of the S3 bucket used to host the static frontend website"
  type        = string
  default     = ""
}
