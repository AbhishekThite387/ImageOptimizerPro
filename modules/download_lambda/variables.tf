variable "project_name" {
  type = string
}

variable "source_dir" {
  type = string
}

variable "lambda_role_arn" {
  type = string
}

variable "source_bucket_name" {
  type = string
}

variable "destination_bucket_name" {
  type = string
}

variable "timeout" {
  type    = number
  default = 60
}

variable "memory_size" {
  type    = number
  default = 512
}

variable "tags" {
  type    = map(string)
  default = {}
}