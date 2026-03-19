---
title: "How to configure S3 access"
---

# How to configure S3 access

Each bucket created on Hikube automatically generates a unique pair of S3 access keys. This guide explains how to retrieve these credentials, configure different S3 clients (AWS CLI, MinIO Client, rclone), and inject the keys into your Kubernetes pods securely.

## Prerequisites

- **kubectl** configured with your Hikube kubeconfig
- A **bucket** created on Hikube
- **jq** installed locally
- One or more S3 clients installed: **AWS CLI**, **mc** (MinIO Client), or **rclone**

## Steps

### 1. Understand the access model

On Hikube, each bucket has its own pair of access keys:

- **1 bucket = 1 key pair** (accessKeyID + accessSecretKey)
- Keys are automatically generated when the bucket is created
- Credentials are stored in a Kubernetes Secret named `bucket-<bucket-name>`
- The S3 endpoint is common to all buckets: `https://prod.s3.hikube.cloud`

:::tip
Each bucket benefits from **triple-replicated** high-availability storage. Your data is automatically distributed to ensure durability.
:::

### 2. Retrieve the credentials

Extract the connection information from the Kubernetes Secret:

```bash
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

To extract values individually:

```bash
# S3 endpoint
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.endpoint'

# Access Key
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessKeyID'

# Secret Key
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessSecretKey'

# Actual bucket name
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.bucketName'
```

:::note
The `bucketName` returned by the Secret is an internal identifier (e.g., `bucket-1df67984-321d-492d-bb06-2f4527bb0f5b`). It differs from the `metadata.name` of your manifest. Always use this value for S3 operations.
:::

### 3. Configure S3 clients

#### AWS CLI

Configure a dedicated profile for Hikube:

```bash
aws configure --profile hikube
```

Enter the following values:

```
AWS Access Key ID: <accessKeyID>
AWS Secret Access Key: <accessSecretKey>
Default region name: (leave empty)
Default output format: json
```

Use the profile with the Hikube endpoint:

```bash
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud --profile hikube
```

#### MinIO Client (mc)

Create an alias for the Hikube endpoint:

```bash
mc alias set hikube https://prod.s3.hikube.cloud ACCESS_KEY SECRET_KEY
```

Test the connection:

```bash
# List objects
mc ls hikube/$BUCKET_NAME

# Upload a file
mc cp file.txt hikube/$BUCKET_NAME/

# Download a file
mc cp hikube/$BUCKET_NAME/file.txt ./
```

#### rclone

Add an rclone configuration for Hikube. Create or edit the file `~/.config/rclone/rclone.conf`:

```ini title="rclone.conf"
[hikube]
type = s3
provider = Minio
endpoint = https://prod.s3.hikube.cloud
access_key_id = ACCESS_KEY
secret_access_key = SECRET_KEY
acl = private
```

Test the connection:

```bash
# List objects
rclone ls hikube:$BUCKET_NAME

# Sync a local directory
rclone sync ./my-folder hikube:$BUCKET_NAME/my-folder

# Copy a file
rclone copy file.txt hikube:$BUCKET_NAME/
```

### 4. Use the bucket in a Kubernetes pod

To inject S3 credentials into a pod, use an `initContainer` that reads the Secret and exposes the values as environment variables, or mount the Secret directly:

```yaml title="app-with-bucket.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      initContainers:
      - name: extract-s3-creds
        image: bitnami/kubectl:latest
        command:
        - sh
        - -c
        - |
          SECRET=$(cat /secrets/BucketInfo)
          echo "export AWS_ACCESS_KEY_ID=$(echo $SECRET | jq -r '.spec.secretS3.accessKeyID')" > /env/s3.env
          echo "export AWS_SECRET_ACCESS_KEY=$(echo $SECRET | jq -r '.spec.secretS3.accessSecretKey')" >> /env/s3.env
          echo "export S3_ENDPOINT=$(echo $SECRET | jq -r '.spec.secretS3.endpoint')" >> /env/s3.env
          echo "export BUCKET_NAME=$(echo $SECRET | jq -r '.spec.bucketName')" >> /env/s3.env
        volumeMounts:
        - name: bucket-secret
          mountPath: /secrets
        - name: env-vars
          mountPath: /env
      containers:
      - name: app
        image: my-app:latest
        command:
        - sh
        - -c
        - |
          source /env/s3.env
          exec my-app-binary
        volumeMounts:
        - name: env-vars
          mountPath: /env
      volumes:
      - name: bucket-secret
        secret:
          secretName: bucket-app-data
      - name: env-vars
        emptyDir: {}
```

:::tip
For a simpler approach, you can also mount the full Secret and read the JSON directly in your application at startup.
:::

### 5. Security best practices

:::warning
Never store your S3 keys in plaintext in your manifests or Git repositories. Always use Kubernetes Secrets to manage credentials.
:::

Recommendations:

- **Use Kubernetes Secrets**: the credentials are already stored in an automatically generated Secret. Reference it rather than copying the keys in plaintext.
- **Never commit keys**: add files containing credentials to your `.gitignore`.
- **Restrict Secret access**: configure Kubernetes RBAC to limit which namespaces and users can read bucket Secrets.
- **Key rotation**: if you suspect a compromise, delete and recreate the bucket to obtain new keys.

## Verification

Confirm that your configuration is functional with each client:

1. **AWS CLI**:

```bash
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud
```

2. **MinIO Client**:

```bash
mc ls hikube/$BUCKET_NAME
```

3. **rclone**:

```bash
rclone ls hikube:$BUCKET_NAME
```

If the command returns an empty list (empty bucket) or the list of existing objects without error, the configuration is correct.

## Next steps

- [Buckets API reference](../api-reference.md)
- [How to connect a bucket from an application](./connect-from-app.md)
