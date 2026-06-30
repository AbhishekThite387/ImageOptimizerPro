resource "aws_cloudfront_distribution" "frontend" {

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  origin {

    domain_name = var.frontend_website_endpoint
    origin_id   = "frontend-s3"

    custom_origin_config {

      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"

      origin_ssl_protocols = [
        "TLSv1.2"
      ]
    }
  }

  default_cache_behavior {

    allowed_methods = [
      "GET",
      "HEAD"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    target_origin_id = "frontend-s3"

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {

      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {

    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {

    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.project_name}-frontend-cloudfront"
  }
}