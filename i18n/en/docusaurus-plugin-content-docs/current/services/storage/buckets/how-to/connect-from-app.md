---
title: "How to connect a bucket from an application"
---

# How to connect a bucket from an application

When you create a bucket on Hikube, a Kubernetes Secret containing the S3 credentials is automatically generated. This guide explains how to retrieve these credentials and use them from AWS CLI, Python (boto3), or any S3-compatible application.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **bucket** created on Hikube (or a manifest ready to deploy)
- **jq** installed locally (for credential extraction)
- **AWS CLI** or **Python with boto3** installed (depending on your use case)

## Steps

### 1. Create a bucket

If you don't have a bucket yet, create one:

```yaml title="my-bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: app-data
```

Apply the manifest:

```bash
kubectl apply -f my-bucket.yaml
```

Verify that the bucket and its Secret are created:

```bash
kubectl get bucket app-data
kubectl get secret bucket-app-data
```

**Expected output:**

```
NAME       AGE
app-data   10s

NAME                 TYPE     DATA   AGE
bucket-app-data      Opaque   1      10s
```

### 2. Retrieve the S3 credentials

The `bucket-app-data` Secret contains a `BucketInfo` key in JSON format with all connection information. Extract it:

```bash
kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

**Expected output:**

```json
{
  "spec": {
    "bucketName": "bucket-1df67984-321d-492d-bb06-2f4527bb0f5b",
    "secretS3": {
      "endpoint": "https://prod.s3.hikube.cloud",
      "accessKeyID": "UYL5FFZ0GWTQ4LCN4AI0",
      "accessSecretKey": "L1ZJy67a2PKdOmKqjeuTWQd/4HjJVMJdxnEX4ewq"
    }
  }
}
```

:::note
The `bucketName` is an automatically generated internal identifier. It differs from the name you gave in `metadata.name`. Always use `bucketName` for S3 operations.
:::

### 3. Use the bucket with AWS CLI

Export the credentials as environment variables:

```bash
export AWS_ACCESS_KEY_ID=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessKeyID')
export AWS_SECRET_ACCESS_KEY=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessSecretKey')
export BUCKET_NAME=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.bucketName')
```

Test the connection:

```bash
# List bucket objects
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud

# Upload a file
aws s3 cp file.txt s3://$BUCKET_NAME/ --endpoint-url https://prod.s3.hikube.cloud

# Download a file
aws s3 cp s3://$BUCKET_NAME/file.txt ./file-download.txt --endpoint-url https://prod.s3.hikube.cloud
```

### 4. Use the bucket with Python (boto3)

Here is a complete example using the `boto3` library:

```python title="s3_example.py"
import boto3
import json
import subprocess

# Option 1: Read credentials from the Kubernetes Secret
result = subprocess.run(
    ["kubectl", "get", "secret", "bucket-app-data",
     "-o", "jsonpath={.data.BucketInfo}"],
    capture_output=True, text=True
)
import base64
bucket_info = json.loads(base64.b64decode(result.stdout))

endpoint = bucket_info["spec"]["secretS3"]["endpoint"]
access_key = bucket_info["spec"]["secretS3"]["accessKeyID"]
secret_key = bucket_info["spec"]["secretS3"]["accessSecretKey"]
bucket_name = bucket_info["spec"]["bucketName"]

# Option 2: Use environment variables (recommended in production)
# import os
# endpoint = "https://prod.s3.hikube.cloud"
# access_key = os.environ["AWS_ACCESS_KEY_ID"]
# secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
# bucket_name = os.environ["BUCKET_NAME"]

# Create the S3 client
s3 = boto3.client(
    "s3",
    endpoint_url=endpoint,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
)

# Upload a file
s3.upload_file("local-file.txt", bucket_name, "remote-file.txt")
print("Upload complete")

# Download a file
s3.download_file(bucket_name, "remote-file.txt", "downloaded.txt")
print("Download complete")

# List objects
response = s3.list_objects_v2(Bucket=bucket_name)
for obj in response.get("Contents", []):
    print(f"  {obj['Key']} ({obj['Size']} bytes)")
```

:::tip
In production, prefer environment variables or Kubernetes Secrets mounted as volumes rather than calling `kubectl` from your application code.
:::

## Verification

Confirm that the connection works correctly:

1. **Check the bucket**:

```bash
kubectl get bucket app-data
```

2. **Test an upload/download**:

```bash
echo "test" > /tmp/test-hikube.txt
aws s3 cp /tmp/test-hikube.txt s3://$BUCKET_NAME/test.txt --endpoint-url https://prod.s3.hikube.cloud
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud
```

**Expected output:**

```
2024-01-15 10:30:00          5 test.txt
```

3. **Clean up the test file**:

```bash
aws s3 rm s3://$BUCKET_NAME/test.txt --endpoint-url https://prod.s3.hikube.cloud
```

## Next steps

- [Buckets API reference](../api-reference.md)
- [How to configure S3 access](./configure-access.md)
