from app.core.s3 import S3Storage, s3_storage


def get_s3_storage() -> S3Storage:
    return s3_storage
