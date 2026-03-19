---
sidebar_position: 6
title: FAQ
---

# FAQ — S3 Buckets

### What is the Hikube S3 endpoint?

The Hikube public S3 endpoint is:

```
https://prod.s3.hikube.cloud
```

This endpoint is compatible with the standard AWS S3 API. You can use it with any S3-compatible tool or SDK.

---

### What tools are compatible?

All tools compatible with the S3 API work with Hikube buckets:

| Tool | Configuration |
|------|--------------|
| **aws-cli** | `aws --endpoint-url https://prod.s3.hikube.cloud s3 ls` |
| **mc** (MinIO Client) | `mc alias set hikube https://prod.s3.hikube.cloud ACCESS_KEY SECRET_KEY` |
| **rclone** | Configure a remote of type `s3` with the Hikube endpoint |
| **s3cmd** | Configure `host_base` and `host_bucket` to the Hikube endpoint |
| **Velero** | Kubernetes backup to Hikube S3 |
| **Restic** | File backup to Hikube S3 |

Any AWS S3-compatible library (boto3, aws-sdk-js, etc.) also works.

---

### How do credentials work?

When a bucket is created, Hikube automatically generates a Kubernetes Secret named `bucket-<name>`. This secret contains a `BucketInfo` key in JSON format with all access information:

```bash
kubectl get secret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

The JSON contains:

| Field | Description |
|-------|-------------|
| `spec.bucketName` | Real bucket name in the S3 backend |
| `spec.secretS3.endpoint` | S3 endpoint (`https://prod.s3.hikube.cloud`) |
| `spec.secretS3.accessKeyID` | S3 access key |
| `spec.secretS3.accessSecretKey` | S3 secret key |

:::warning
Use `spec.bucketName` (not `metadata.name`) as the bucket name when accessing S3. The real name is automatically generated and differs from the Kubernetes name.
:::

---

### Can I have multiple buckets?

Yes, you can create as many buckets as needed. Each `Bucket` resource provisions an independent bucket with its own credentials:

```yaml title="bucket-logs.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: app-logs
```

```yaml title="bucket-backups.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: db-backups
```

Each bucket generates its own Secret (`bucket-app-logs`, `bucket-db-backups`) with distinct credentials.

---

### What is the data durability?

Data stored in Hikube buckets benefits from **triple replication** across three datacenters:

- Geneva
- Gland
- Lucerne

This architecture guarantees high availability and data durability, even in case of a complete datacenter failure.

---

### Is the configuration really just metadata.name?

Yes, the `Bucket` object is intentionally minimal. No `spec` fields are required:

```yaml title="bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: my-bucket
```

That's all you need to provision a fully functional S3 bucket. The endpoint, credentials, and real bucket name are automatically generated and made available in the associated Secret.
