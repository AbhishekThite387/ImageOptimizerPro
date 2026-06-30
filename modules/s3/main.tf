# modules/s3/main.tf

resource "aws_s3_bucket" "source" {
  bucket        = var.source_bucket_name
  force_destroy = true

  tags = var.tags
}

resource "aws_s3_bucket" "destination" {
  bucket        = var.destination_bucket_name
  force_destroy = true

  tags = var.tags
}


resource "aws_s3_bucket_cors_configuration" "destination_cors" {
  bucket = aws_s3_bucket.destination.id

  cors_rule {
    allowed_headers = ["*"]

    allowed_methods = [
      "GET",
      "HEAD"
    ]

    allowed_origins = [
      "http://127.0.0.1:5500",
      "http://localhost:5500"
    ]

    expose_headers = [
      "Content-Length",
      "Content-Type",
      "ETag"
    ]

    max_age_seconds = 3000
  }
}

# Block all public access on both buckets
resource "aws_s3_bucket_public_access_block" "source" {
  bucket                  = aws_s3_bucket.source.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "destination" {
  bucket                  = aws_s3_bucket.destination.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning on source bucket
resource "aws_s3_bucket_versioning" "source" {
  bucket = aws_s3_bucket.source.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 → Lambda event notification (triggers Lambda on every object upload)
resource "aws_s3_bucket_notification" "trigger" {
  bucket = aws_s3_bucket.source.id

  lambda_function {
    lambda_function_arn = var.lambda_arn
    events              = ["s3:ObjectCreated:*"]
    filter_suffix       = "" # all file types; restrict to e.g. ".jpg" if needed
  }

  depends_on = [var.lambda_permission_id]
}
