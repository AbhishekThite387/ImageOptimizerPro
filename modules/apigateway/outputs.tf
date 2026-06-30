
# API Gateway ID

output "api_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.image_api.id
}


# API Root Resource ID

output "root_resource_id" {
  description = "Root Resource ID"
  value       = aws_api_gateway_rest_api.image_api.root_resource_id
}

# API Execution ARN

output "execution_arn" {
  description = "Execution ARN of API Gateway"
  value       = aws_api_gateway_rest_api.image_api.execution_arn
}

# Invoke URL

output "invoke_url" {
  description = "Base Invoke URL"

  value = "https://${aws_api_gateway_rest_api.image_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.dev.stage_name}"
}

# Process Endpoint

output "process_endpoint" {
  description = "Complete Process API Endpoint"

  value = "https://${aws_api_gateway_rest_api.image_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${aws_api_gateway_stage.dev.stage_name}/process"
}