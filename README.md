# Automated Image Processing System — Terraform

#Test
Serverless image processing on AWS using Terraform modules.

## Architecture

```
User → S3 (source) → Lambda (resize/compress) → S3 (destination)
                          ↓
                    CloudWatch (logs + alarms + dashboard)
```

## Project Structure

```
image-processing-terraform/
├── main.tf                  # Root — wires all modules
├── variables.tf
├── outputs.tf
├── terraform.tfvars         # Your values go here
├── lambda_src/
│   └── handler.py           # Python image processor (Pillow)
└── modules/
    ├── s3/                  # Source + destination buckets, event notification
    ├── iam/                 # Lambda execution role + S3 policies
    ├── lambda/              # Lambda function + S3 invoke permission
    └── cloudwatch/          # Log group, alarms, dashboard
```

## Prerequisites

- Terraform >= 1.6
- AWS CLI configured (`aws configure`)
- AWS account with IAM permissions for S3, Lambda, CloudWatch, IAM

## Step 1 — Get Pillow Lambda Layer ARN

Pillow is not included in the Lambda runtime. Use a public pre-built layer:

1. Go to: https://github.com/keithrozario/Klayers
2. Find the ARN for **Pillow**, **Python 3.12**, **ap-south-1**
3. Paste it into `terraform.tfvars` → `pillow_layer_arn`

Example format:

```
arn:aws:lambda:ap-south-1:770693421928:layer:Klayers-p312-Pillow:X
```

## Step 2 — Deploy

```bash
terraform init
terraform plan
terraform apply
```

## Step 3 — Test

Upload any image to the source bucket:

```bash
aws s3 cp test.jpg s3://<source-bucket-name>/
```

Check the destination bucket after a few seconds:

```bash
aws s3 ls s3://<destination-bucket-name>/processed/
```

Check logs:

```bash
aws logs tail /aws/lambda/img-processor-image-processor --follow
```

## Step 4 — Destroy

```bash
terraform destroy
```

## Module Inputs Summary

| Module     | Key inputs                                      |
| ---------- | ----------------------------------------------- |
| s3         | bucket names, lambda_arn                        |
| iam        | source/destination bucket ARNs                  |
| lambda     | role ARN, source dir, env vars, pillow layer    |
| cloudwatch | function name, retention days, alarm thresholds |
