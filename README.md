# 🚀 Automated Image Processing System

> A production-ready **Serverless Image Processing Platform** built with
> **AWS, Terraform, Python, and GitHub Actions**.

## 🌐 Live Demo

**Website:** https://d2rzx2ftc8aeso.cloudfront.net

## 📖 Project Overview

The Automated Image Processing System is a fully serverless AWS
application that allows users to upload an image, automatically resize,
compress, and convert it (JPEG/PNG/WEBP), then securely download the
optimized image through a temporary Amazon S3 Pre-Signed URL.

The infrastructure is provisioned using **Terraform**, while **GitHub
Actions** automates frontend and Lambda deployments.

## ✨ Features

- Serverless AWS architecture
- Image resize, compression and format conversion
- Amazon CloudFront CDN
- API Gateway REST API
- Event-driven processing using Amazon S3 events
- Secure downloads using Pre-Signed URLs
- Infrastructure as Code (Terraform)
- GitHub Actions CI/CD
- CloudWatch monitoring

## 🏗️ Architecture

```text
User
 │
 ▼
CloudFront
 │
 ▼
Frontend S3 Bucket
 │
 ▼
API Gateway
 │
 ▼
Download Lambda
 │
 ▼
Source S3 Bucket
 │
 ▼
S3 ObjectCreated Event
 │
 ▼
Image Processor Lambda
 │
 ▼
Destination S3 Bucket
 │
 ▼
Pre-Signed URL
 │
 ▼
Browser Download
```

## 🔄 Workflow

1.  User opens the CloudFront website.
2.  Frontend sends image to API Gateway.
3.  Download Lambda uploads image to Source S3.
4.  S3 ObjectCreated triggers Image Processor Lambda.
5.  Pillow resizes, compresses and converts the image.
6.  Optimized image is stored in Destination S3.
7.  Download Lambda generates a temporary Pre-Signed URL.
8.  Browser downloads the optimized image.

## ☁️ AWS Services

Service Purpose

---

S3 Static website and image storage
Lambda Image processing
API Gateway REST API
CloudFront CDN
IAM Permissions
CloudWatch Monitoring

## 📁 Terraform Modules

```text
modules/
├── apigateway/
├── cloudfront/
├── cloudwatch/
├── download_lambda/
├── frontend_hosting/
├── iam/
├── lambda/
└── s3/
```

## ⚙️ terraform.tfvars

Stores deployment-specific variables like region, project name,
environment, bucket names, and Lambda configuration. It should not be
committed to Git.

## 🚀 GitHub Actions

Workflow file:

```text
.github/workflows/deploy.yml
```

Pipeline: - Upload frontend to S3 - Deploy Lambda functions - Invalidate
CloudFront cache

## 🔐 Security

- IAM Least Privilege
- Private S3 Buckets
- HTTPS
- Pre-Signed URLs
- GitHub Secrets

## 📊 Monitoring

CloudWatch Logs and metrics monitor Lambda execution and troubleshoot
issues.

## 📂 .gitignore

Excludes: - .terraform/ - terraform.tfstate - terraform.tfvars - .env -
Lambda ZIP files - Python cache

## 👨‍💻 Author

**Abhishek Thite**

GitHub: https://github.com/AbhishekThite387
