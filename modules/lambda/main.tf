# modules/lambda/main.tf

# Package the lambda_src/ directory into a zip at plan time
data "archive_file" "function_zip" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/function.zip"
}

resource "aws_lambda_function" "image_processor" {
  function_name    = "${var.project_name}-image-processor"
  role             = var.lambda_role_arn
  handler          = "handler.lambda_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.function_zip.output_path
  source_code_hash = data.archive_file.function_zip.output_base64sha256

  timeout     = var.timeout
  memory_size = var.memory_size

  environment {
    variables = {
      DEST_BUCKET   = var.destination_bucket_name
      MAX_WIDTH     = tostring(var.max_width)
      MAX_HEIGHT    = tostring(var.max_height)
      OUTPUT_FORMAT = var.output_format
    }
  }

  layers = var.pillow_layer_arn != "" ? [var.pillow_layer_arn] : []

  tags = var.tags
}

# Allow S3 to invoke this Lambda
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_processor.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.source_bucket_arn
}
