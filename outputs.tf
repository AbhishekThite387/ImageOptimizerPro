# outputs.tf (root)

output "source_bucket_name" {
  description = "Upload your raw images here"
  value       = module.s3.source_bucket_name
}

output "destination_bucket_name" {
  description = "Processed images appear here"
  value       = module.s3.destination_bucket_name
}

output "lambda_function_name" {
  value = module.lambda.function_name
}

output "cloudwatch_dashboard" {
  value = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home#dashboards:name=${module.cloudwatch.dashboard_name}"
}

output "log_group" {
  value = module.cloudwatch.log_group_name
}

output "api_invoke_url" {
  value = module.apigateway.invoke_url
}

output "process_endpoint" {
  value = module.apigateway.process_endpoint
}

output "frontend_bucket_name" {
  value = module.frontend_hosting.bucket_name
}

output "frontend_website_endpoint" {
  description = "Visit this URL to access the hosted frontend"
  value       = module.frontend_hosting.website_endpoint
}