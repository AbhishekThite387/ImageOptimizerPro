# modules/lambda/variables.tf

variable "project_name" {
  type = string
}

variable "source_dir" {
  description = "Path to the directory containing handler.py"
  type        = string
}

variable "lambda_role_arn" {
  description = "IAM role ARN the Lambda function assumes"
  type        = string
}

variable "source_bucket_arn" {
  description = "ARN of the source S3 bucket (for the invoke permission)"
  type        = string
}

variable "destination_bucket_name" {
  description = "Name of the destination S3 bucket (passed as env var)"
  type        = string
}

variable "pillow_layer_arn" {
  description = "ARN of a Lambda Layer that provides Pillow. Leave empty to skip."
  type        = string
  default     = ""
}

variable "timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 60
}

variable "memory_size" {
  description = "Lambda memory in MB"
  type        = number
  default     = 512
}

variable "max_width" {
  type    = number
  default = 1280
}

variable "max_height" {
  type    = number
  default = 720
}

variable "output_format" {
  description = "Output image format: JPEG | PNG | WEBP"
  type        = string
  default     = "JPEG"
}

variable "tags" {
  type    = map(string)
  default = {}
}
