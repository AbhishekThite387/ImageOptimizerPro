# modules/cloudwatch/variables.tf

variable "project_name" {
  type = string
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
}

variable "function_name" {
  description = "Name of the Lambda function to monitor"
  type        = string
}

variable "log_retention_days" {
  description = "How many days to keep Lambda logs in CloudWatch"
  type        = number
  default     = 14
}

variable "duration_threshold_ms" {
  description = "Alarm threshold for average Lambda duration (milliseconds)"
  type        = number
  default     = 45000 # 45 seconds (out of default 60s timeout)
}

variable "tags" {
  type    = map(string)
  default = {}
}
