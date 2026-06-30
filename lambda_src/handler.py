import boto3
import os
import io
import logging
from PIL import Image

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client("s3")

DEST_BUCKET = os.environ["DEST_BUCKET"]


def lambda_handler(event, context):

    for record in event["Records"]:

        src_bucket = record["s3"]["bucket"]["name"]
        src_key = record["s3"]["object"]["key"]

        logger.info(f"Processing s3://{src_bucket}/{src_key}")

        # Download image
        response = s3.get_object(
            Bucket=src_bucket,
            Key=src_key
        )

        img_data = response["Body"].read()

        # Read metadata
        head = s3.head_object(
            Bucket=src_bucket,
            Key=src_key
        )

        metadata = head["Metadata"]

        width = int(metadata.get("width", 1280))
        height = int(metadata.get("height", 720))
        quality = int(metadata.get("quality", 85))
        output_format = metadata.get("format", "JPEG").upper()

        with Image.open(io.BytesIO(img_data)) as img:

            if output_format == "JPEG" and img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            img.thumbnail((width, height), Image.LANCZOS)

            buffer = io.BytesIO()

            save_kwargs = {
                "format": output_format,
                "optimize": True
            }

            if output_format == "JPEG":
                save_kwargs["quality"] = quality

            img.save(buffer, **save_kwargs)
            buffer.seek(0)

        ext = output_format.lower().replace("jpeg", "jpg")
        base_name = os.path.splitext(os.path.basename(src_key))[0]
        dest_key = f"processed/{base_name}.{ext}"

        s3.put_object(
            Bucket=DEST_BUCKET,
            Key=dest_key,
            Body=buffer.getvalue(),
            ContentType=f"image/{ext}"
        )

        logger.info(f"Saved to s3://{DEST_BUCKET}/{dest_key}")

    return {
        "statusCode": 200,
        "body": "Processing complete"
    }