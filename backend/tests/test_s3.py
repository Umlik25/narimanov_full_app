from unittest import TestCase
from unittest.mock import Mock, patch

from app.core.s3 import S3Storage


class S3StorageTests(TestCase):
    @patch("app.core.s3.boto3.client")
    @patch("app.core.s3.settings")
    def test_creates_separate_internal_and_public_clients(
        self,
        mock_settings,
        mock_boto_client,
    ) -> None:
        internal_client = Mock(name="internal_client")
        public_client = Mock(name="public_client")
        mock_boto_client.side_effect = [internal_client, public_client]
        mock_settings.s3_bucket_name = "issue-images"
        mock_settings.s3_endpoint_url = "http://localhost:30990"
        mock_settings.s3_public_endpoint_url = "http://main-server:30990"
        mock_settings.s3_access_key_id = "admin"
        mock_settings.s3_secret_access_key = "change-me"
        mock_settings.s3_region_name = "us-east-1"
        mock_settings.s3_presigned_url_expires_seconds = 3600

        storage = S3Storage()

        self.assertIs(storage.client, internal_client)
        self.assertIs(storage.public_client, public_client)
        self.assertEqual(mock_boto_client.call_args_list[0].kwargs["endpoint_url"], "http://localhost:30990")
        self.assertEqual(mock_boto_client.call_args_list[1].kwargs["endpoint_url"], "http://main-server:30990")

    @patch("app.core.s3.boto3.client")
    @patch("app.core.s3.settings")
    def test_create_presigned_get_url_uses_public_client(
        self,
        mock_settings,
        mock_boto_client,
    ) -> None:
        internal_client = Mock(name="internal_client")
        public_client = Mock(name="public_client")
        public_client.generate_presigned_url.return_value = "http://main-server:30990/issue-images/issues/1.jpg"
        mock_boto_client.side_effect = [internal_client, public_client]
        mock_settings.s3_bucket_name = "issue-images"
        mock_settings.s3_endpoint_url = "http://localhost:30990"
        mock_settings.s3_public_endpoint_url = "http://main-server:30990"
        mock_settings.s3_access_key_id = "admin"
        mock_settings.s3_secret_access_key = "change-me"
        mock_settings.s3_region_name = "us-east-1"
        mock_settings.s3_presigned_url_expires_seconds = 3600

        storage = S3Storage()
        url = storage.create_presigned_get_url("issues/1.jpg")

        self.assertEqual(url, "http://main-server:30990/issue-images/issues/1.jpg")
        public_client.generate_presigned_url.assert_called_once_with(
            ClientMethod="get_object",
            Params={
                "Bucket": "issue-images",
                "Key": "issues/1.jpg",
            },
            ExpiresIn=3600,
        )
        internal_client.generate_presigned_url.assert_not_called()
