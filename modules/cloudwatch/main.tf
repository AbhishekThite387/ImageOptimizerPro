# modules/cloudwatch/main.tf

# Log group for the Lambda function
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# Alarm: Lambda errors in the last 5 minutes
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.function_name}-errors"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300 # 5 minutes
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Triggers when the image processor Lambda has ≥1 error"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = var.function_name
  }

  tags = var.tags
}

# Alarm: Lambda duration approaching timeout
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "${var.function_name}-high-duration"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Average"
  threshold           = var.duration_threshold_ms
  alarm_description   = "Average Lambda duration exceeded threshold — may be approaching timeout"
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = var.function_name
  }

  tags = var.tags
}

# Dashboard: errors + duration + invocations at a glance
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-image-processing"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          title   = "Lambda Invocations"
          region  = var.aws_region
          period  = 300
          stat    = "Sum"
          metrics = [["AWS/Lambda", "Invocations", "FunctionName", var.function_name]]
        }
      },
      {
        type = "metric"
        properties = {
          title   = "Lambda Errors"
          region  = var.aws_region
          period  = 300
          stat    = "Sum"
          metrics = [["AWS/Lambda", "Errors", "FunctionName", var.function_name]]
        }
      },
      {
        type = "metric"
        properties = {
          title   = "Lambda Duration (avg ms)"
          region  = var.aws_region
          period  = 300
          stat    = "Average"
          metrics = [["AWS/Lambda", "Duration", "FunctionName", var.function_name]]
        }
      }
    ]
  })
}
