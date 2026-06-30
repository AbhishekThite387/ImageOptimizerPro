import json
import os
import uuid
import time
import logging
import urllib.request
import base64

from urllib.parse import urlparse
from botocore.exceptions import ClientError

import boto3

# Logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS Clients

from botocore.config import Config

s3 = boto3.client(
    "s3",
    region_name="ap-south-1",
    config=Config(s3={"addressing_style": "virtual"})
)


# Environment Variables

SOURCE_BUCKET = os.environ["SOURCE_BUCKET"]
DEST_BUCKET = os.environ["DEST_BUCKET"]



# Lambda Handler

def lambda_handler(event, context):

    try:

   
        # Parse Request Body

        body = json.loads(event.get("body", "{}"))

        image_url = body.get("image_url")
        image_base64 = body.get("image_base64")
        file_name_input = body.get("file_name")
        width = str(body.get("width", 1280))
        height = str(body.get("height", 720))
        quality = str(body.get("quality", 85))
        output_format = body.get("format", "JPEG")

      
        # Validation


        if not image_url and not image_base64:
            return response(
                400,
                {
                    "message": "Either image_url or image_base64 is required."
                }
            )

        # Download or Decode Image

        if image_url:

            logger.info(f"Downloading image: {image_url}")

            image_data = urllib.request.urlopen(image_url).read()

            # Generate File Name

            parsed = urlparse(image_url)

            extension = os.path.splitext(parsed.path)[1]

            if extension == "":
                extension = ".jpg"

        else:

            logger.info("Decoding uploaded image (base64).")

            image_data = base64.b64decode(image_base64)

            # Generate File Name from uploaded file name (if provided)

            extension = os.path.splitext(file_name_input or "")[1]

            if extension == "":
                extension = ".jpg"

        file_name = f"{uuid.uuid4()}{extension}"

        object_key = f"original/{file_name}"

        base_name = os.path.splitext(file_name)[0]

        output_ext = output_format.lower().replace("jpeg", "jpg")

        dest_key = f"processed/{base_name}.{output_ext}"

       
        # Upload to S3

        s3.put_object(
            Bucket=SOURCE_BUCKET,
            Key=object_key,
            Body=image_data,
            Metadata={
                "width": width,
                "height": height,
                "quality": quality,
                "format": output_format
            }
        )

        logger.info("Image uploaded successfully.")

        logger.info("Waiting for processed image...")

        max_attempts = 10

        for attempt in range(max_attempts):

                try:

                    s3.head_object(
                    Bucket=DEST_BUCKET,
                    Key=dest_key
                    )

                    logger.info("Processed image found.")

                    break

                except ClientError:
                     logger.info(
                        f"Attempt {attempt + 1}: Image not ready..."
                    )

                time.sleep(1)
                
        else:
            return response(
                 504,
                {
                    "status": "timeout",
                    "message": "Image processing timed out."
                }
            )


        download_url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={
            "Bucket": DEST_BUCKET,
            "Key": dest_key,
            "ResponseContentDisposition": f'attachment; filename="{base_name}.{output_ext}"'
        },
        ExpiresIn=600
        )


        # Return Success

        return response(
        200,
        {
            "status": "success",
            "message": "Image processed successfully.",

            "source_key": object_key,

            "processed_key": dest_key,

            "download_url": download_url,

            "expires_in": "10 minutes"
        }
        )

    except Exception as e:

        logger.exception("Error occurred")

        return response(
            500,
            {
                "status": "error",
                "message": str(e)
            }
        )

# Helper Function

def response(status_code, body):

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        },
        "body": json.dumps(body)
    }