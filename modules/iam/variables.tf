# modules/iam/variables.tf

variable "project_name" {
  description = "Used as a prefix for all IAM resource names"
  type        = string
}

variable "source_bucket_arn" {
  description = "ARN of the source S3 bucket (for read permissions)"
  type        = string
}

variable "destination_bucket_arn" {
  description = "ARN of the destination S3 bucket (for write permissions)"
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
