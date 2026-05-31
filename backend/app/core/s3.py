import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import settings


class S3Storage:
    def __init__(self) -> None:
        self.bucket_name = settings.s3_bucket_name
        self.client = self._create_client(settings.s3_endpoint_url)
        self.public_client = self._create_client(settings.s3_public_endpoint_url)

    def _create_client(self, endpoint_url: str):
        return boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.s3_access_key_id,
            aws_secret_access_key=settings.s3_secret_access_key,
            region_name=settings.s3_region_name,
            config=Config(
                signature_version="s3v4",
                s3={"addressing_style": "path"},
            ),
        )

    def ensure_bucket_exists(self) -> None:
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
        except ClientError as exc:
            status_code = exc.response.get("ResponseMetadata", {}).get("HTTPStatusCode")
            if status_code != 404:
                raise
            self.client.create_bucket(Bucket=self.bucket_name)

    def upload_file(
        self,
        object_key: str,
        content: bytes,
        content_type: str,
    ) -> None:
        self.ensure_bucket_exists()
        self.client.put_object(
            Bucket=self.bucket_name,
            Key=object_key,
            Body=content,
            ContentType=content_type,
        )

    def create_presigned_get_url(self, object_key: str) -> str:
        return self.public_client.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": self.bucket_name,
                "Key": object_key,
            },
            ExpiresIn=settings.s3_presigned_url_expires_seconds,
        )

    def delete_file(self, object_key: str) -> None:
        self.client.delete_object(Bucket=self.bucket_name, Key=object_key)


s3_storage = S3Storage()
