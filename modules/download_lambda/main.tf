# Package the download_lambda/ directory into a zip
data "archive_file" "function_zip" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/function.zip"
}

resource "aws_lambda_function" "download_lambda" {

  function_name = "${var.project_name}-download-lambda"

  role    = var.lambda_role_arn
  handler = "handler.lambda_handler"
  runtime = "python3.12"

  filename         = data.archive_file.function_zip.output_path
  source_code_hash = data.archive_file.function_zip.output_base64sha256

  timeout     = var.timeout
  memory_size = var.memory_size

  environment {
    variables = {
      SOURCE_BUCKET = var.source_bucket_name
      DEST_BUCKET   = var.destination_bucket_name
    }
  }

  tags = var.tags
}