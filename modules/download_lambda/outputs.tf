output "function_name" {
  value = aws_lambda_function.download_lambda.function_name
}

output "function_arn" {
  value = aws_lambda_function.download_lambda.arn
}

output "invoke_arn" {
  value = aws_lambda_function.download_lambda.invoke_arn
}