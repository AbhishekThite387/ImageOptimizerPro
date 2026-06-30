# modules/frontend_hosting/variables.tf

variable "bucket_name" {
  description = "Name of the S3 bucket used for static website hosting"
  type        = string
}

variable "index_document" {
  description = "Default document served for the website"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "Document served for 4xx errors"
  type        = string
  default     = "error.html"
}

variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
