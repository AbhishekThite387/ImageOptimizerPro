# modules/s3/variables.tf

variable "source_bucket_name" {
  description = "Name of the S3 bucket where users upload raw images"
  type        = string
}

variable "destination_bucket_name" {
  description = "Name of the S3 bucket where processed images are stored"
  type        = string
}

variable "lambda_arn" {
  description = "ARN of the Lambda function to notify on object creation"
  type        = string
}

variable "lambda_permission_id" {
  description = "Dependency handle — ensures Lambda permission is created before the notification"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
