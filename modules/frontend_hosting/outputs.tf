# modules/frontend_hosting/outputs.tf

output "bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}

output "website_endpoint" {
  description = "S3 static website endpoint URL"
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}
