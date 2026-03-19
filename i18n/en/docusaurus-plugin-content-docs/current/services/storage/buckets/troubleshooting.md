---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — S3 Buckets

### AccessDenied when accessing the bucket

**Cause**: the credentials used are incorrect, or the bucket name used does not match the real name in the S3 backend.

**Solution**:

1. Retrieve credentials from the Kubernetes Secret:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
   ```

2. Use the `spec.bucketName` field as the bucket name (not `metadata.name`):
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<spec.bucketName>/
   ```

3. Verify that `accessKeyID` and `accessSecretKey` are correctly configured in your S3 tool.

---

### ListBucket fails on the root

**Cause**: each bucket has its own isolated credentials. It is not possible to list all buckets with a single set of credentials.

**Solution**:

1. Use the specific credentials for the bucket you want to list:
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<spec.bucketName>/
   ```

2. To list all your buckets, use `kubectl`:
   ```bash
   kubectl get buckets
   ```

3. For each bucket, retrieve the individual credentials from the corresponding Secret.

---

### Credentials not found

**Cause**: the Secret name follows the pattern `bucket-<name>` where `<name>` is the `metadata.name` of the Bucket resource.

**Solution**:

1. List available Secrets:
   ```bash
   kubectl get tenantsecrets | grep bucket-
   ```

2. Extract access information:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
   ```

3. To extract only the keys:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' \
     | base64 -d \
     | jq -r '.spec.secretS3 | "\(.accessKeyID) \(.accessSecretKey)"'
   ```

---

### Slow upload or timeout

**Cause**: network issue, large file size without multipart upload, or distant endpoint.

**Solution**:

1. Check your connectivity to the endpoint:
   ```bash
   curl -s -o /dev/null -w "%{time_total}" https://prod.s3.hikube.cloud
   ```

2. Use the regional endpoint `https://prod.s3.hikube.cloud` (no intermediate CDN).

3. For large files, enable multipart upload:
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 cp large-file.tar.gz s3://<bucket-name>/ \
     --expected-size $(stat -c%s large-file.tar.gz)
   ```

4. With `mc`, multipart is automatic for files larger than 64 MB.

---

### Bucket not found after creation

**Cause**: the real bucket name in the S3 backend (`spec.bucketName`) differs from the Kubernetes resource's `metadata.name`.

**Solution**:

1. Check the Bucket resource status:
   ```bash
   kubectl get bucket <name>
   kubectl describe bucket <name>
   ```

2. Retrieve the real bucket name from the Secret:
   ```bash
   kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' \
     | base64 -d \
     | jq -r '.spec.bucketName'
   ```

3. Use this real name to access the bucket:
   ```bash
   aws --endpoint-url https://prod.s3.hikube.cloud s3 ls s3://<real-bucket-name>/
   ```

:::warning
Do not confuse `metadata.name` (Kubernetes name) with `spec.bucketName` (real name in S3). Only the latter works for S3 access.
:::
