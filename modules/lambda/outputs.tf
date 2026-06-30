# modules/lambda/outputs.tf

output "function_arn" {
  value = aws_lambda_function.image_processor.arn
}

output "function_name" {
  value = aws_lambda_function.image_processor.function_name
}

output "lambda_permission_id" {
  description = "Used as a dependency handle by the S3 module"
  value       = aws_lambda_permission.allow_s3.id
}

