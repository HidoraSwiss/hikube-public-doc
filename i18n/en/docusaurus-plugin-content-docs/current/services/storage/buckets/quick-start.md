---
sidebar_position: 2
title: Quick Start
---

# Create Your First S3 Bucket

This guide walks you step by step through creating your **first Hikube S3 bucket** in **5 minutes**.  
By the end of this tutorial, you will have a ready-to-use bucket, with valid S3 credentials and operational connectivity.

---

## 🎯 Objective

By the end of this guide, you will have:

- A **functional S3 bucket** in your tenant  
- An **S3 access secret** automatically generated  
- The ability to connect with standard tools (`aws-cli`, `mc`, etc.)

---

## 🧰 Prerequisites

Before starting, make sure you have:

- **kubectl** configured with your Hikube kubeconfig  
- The **necessary rights** on your tenant to create resources  
- An S3 tool of your choice installed (e.g., `aws-cli` or `mc`)

---

## 🚀 Step 1: Create the Bucket (1 minute)

### **Prepare the manifest file**

Create a `bucket.yaml` file:

```yaml title="bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: example-bucket
```

> 📌 The name indicated in `metadata.name` identifies the Kubernetes resource.
> The actual S3 bucket name is automatically generated.

---

### **Deploy the bucket**

```bash
# Create the bucket
kubectl apply -f bucket.yaml

# Verify creation
kubectl get bucket example-bucket -w
```

**Expected result:**

```bash
NAME             READY   AGE
example-bucket   True    15s
```

---

## 🔐 Step 2: Retrieve Credentials (2 minutes)

Bucket creation generates a `Secret` containing a `BucketInfo` key (JSON).

```bash
# Retrieve and store the JSON in a variable
INFO="$(kubectl get secret bucket-example-bucket -o jsonpath='{.data.BucketInfo}' | base64 -d)"

# Export useful variables
export S3_ENDPOINT="$(echo "$INFO" | jq -r '.spec.secretS3.endpoint')"
export S3_ACCESS_KEY="$(echo "$INFO" | jq -r '.spec.secretS3.accessKeyID')"
export S3_SECRET_KEY="$(echo "$INFO" | jq -r '.spec.secretS3.accessSecretKey')"
export BUCKET_NAME="$(echo "$INFO" | jq -r '.spec.bucketName')"
```

> `BUCKET_NAME` is the **actual name** of your bucket on the S3 side. Use it in the commands below.

---

## 🌐 Step 3: Test S3 Connection (2 minutes)

:::warning S3 Root Access
With these credentials, you **do not have** permission to list all buckets on the endpoint.
Commands like `ls` **must target your bucket**:
`… ls s3://$BUCKET_NAME/ …` or `… ls <alias>/$BUCKET_NAME/ …`
:::

### Option A — `aws-cli`

```bash
# Configure a temporary profile
aws configure --profile hikube
# Access Key ID:    $S3_ACCESS_KEY
# Secret Access Key: $S3_SECRET_KEY
# Default region name: (leave empty)
# Default output format: json

# List the contents **of your bucket** (empty right after creation)
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT" --profile hikube

# Upload a test file
echo "hello hikube" > /tmp/hello.txt
aws s3 cp /tmp/hello.txt "s3://$BUCKET_NAME/hello.txt" --endpoint-url "$S3_ENDPOINT" --profile hikube

# Verify
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT" --profile hikube
```

### Option B — `mc` (S3 client)

```bash
# Define an alias for the endpoint
mc alias set hikube "$S3_ENDPOINT" "$S3_ACCESS_KEY" "$S3_SECRET_KEY"

# ⚠️ Do NOT do: `mc ls hikube`  -> AccessDenied
# ✅ Target your bucket directly:
mc ls "hikube/$BUCKET_NAME/"

# Upload a test file
mc cp /tmp/hello.txt "hikube/$BUCKET_NAME/hello.txt"

# Verify
mc ls "hikube/$BUCKET_NAME/"
```

---

## 🧹 Cleanup (optional)

```bash
# Delete the bucket (also erases its content)
kubectl delete buckets example-bucket
```

:::warning Irreversible Deletion
Deleting the bucket **permanently** erases all data it contains.
Check your backups before proceeding.
:::

---

## 🚀 Next Steps

**📚 API Reference** → [Complete specification](./api-reference.md)
**📖 Architecture** → [Overview](./overview.md)

---

## 💡 To Remember

- The provided credentials give access **only** to your bucket
- Always target `s3://$BUCKET_NAME/` (or `alias/$BUCKET_NAME/`) in your commands
- The S3 endpoint is compatible with standard tools and SDKs
- Strict isolation by tenant and dedicated credentials

