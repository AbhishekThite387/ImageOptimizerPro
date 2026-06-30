# modules/cloudwatch/outputs.tf

output "log_group_name" {
  value = aws_cloudwatch_log_group.lambda_logs.name
}

output "dashboard_name" {
  value = aws_cloudwatch_dashboard.main.dashboard_name
}
