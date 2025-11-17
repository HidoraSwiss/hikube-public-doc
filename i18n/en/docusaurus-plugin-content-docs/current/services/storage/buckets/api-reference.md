---
sidebar_position: 3
title: API Reference
---

# API Reference - S3 Buckets

This reference details Hikube's `Bucket` API, used to provision S3-compatible [MinIO](https://min.io/) buckets in your Kubernetes tenant.  
S3 buckets allow storing and serving data (files, objects, backups, logs, etc.) in a durable, highly available, and S3-standard tool compatible way.

---

## Bucket

### **Overview**

The `Bucket` API allows creating S3 buckets directly from Kubernetes.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: example-bucket
```

> 📌 Creating a `Bucket` object in your tenant automatically creates the corresponding bucket in the S3 backend.

---

### **Complete Specification**

The `Bucket` object has **no configurable `spec` field**.
The only required part is the **`metadata.name` metadata**, which defines the name of the bucket created in the user interface.

| **Parameter**        | **Type** | **Description**                                      | **Required** |
| -------------------- | -------- | ---------------------------------------------------- | ---------- |
| `metadata.name`      | string   | Unique bucket name (used as S3 name)          | ✅          |

---

### **Minimal Example**

```yaml title="zitadel-bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: backup-prod
```

---

## 🔐 S3 Access Secret

When a bucket is created, Hikube automatically generates an associated Kubernetes secret.
This secret is named according to the following pattern:

```txt
bucket-<bucket-name>
```

For example:

```bash
kubectl get secret
```

```bash
NAME                  TYPE     DATA   AGE
bucket-backup-prod    Opaque   1      10s
```

The content of this secret is stored in a **unique `BucketInfo` key** in JSON format:

```json
{
  "metadata": {
    "name": "bc-254505e2-1f26-4f47-bf75-42faae918531",
    "creationTimestamp": null
  },
  "spec": {
    "bucketName": "bucket-1df67984-321d-492d-bb06-2f4527bb0f5b",
    "authenticationType": "KEY",
    "secretS3": {
      "endpoint": "https://prod.s3.hikube.cloud",
      "region": "",
      "accessKeyID": "UYL5FFZ0GWTQ4LCN4AI0",
      "accessSecretKey": "L1ZJy67a2PKdOmKqjeuTWQd/4HjJVMJdxnEX4ewq"
    },
    "secretAzure": null,
    "protocols": ["s3"]
  }
}
```

---

### **Important Fields**

| **Field**                       | **Description**                               |
| ------------------------------- | --------------------------------------------- |
| `spec.bucketName`               | Real internal name of the bucket in the S3 backend |
| `spec.secretS3.endpoint`        | HTTPS endpoint of the Hikube S3 service           |
| `spec.secretS3.accessKeyID`     | S3 access key generated for this bucket         |
| `spec.secretS3.accessSecretKey` | Associated S3 secret key                       |
| `spec.protocols`                | Supported protocols (currently `["s3"]`)  |

---

### **Extracting Credentials**

You can retrieve the information with `kubectl` and `jq`:

```bash
kubectl get secret bucket-bckprd -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Or to extract only the key and secret:

```bash
kubectl get secret bucket-bckprd -o jsonpath='{.data.BucketInfo}' \
  | base64 -d \
  | jq -r '.spec.secretS3.accessKeyID, .spec.secretS3.accessSecretKey'
```

---

## 🌐 S3 Endpoint

The public endpoint to access your buckets is:

```url
https://prod.s3.hikube.cloud
```

You can use it with:

* `aws-cli` (by configuring a profile with `--endpoint-url`)
* `mc` (MinIO Client)
* `rclone`, `s3cmd`, Velero, or any AWS S3 compatible library.

---

## ⚠️ Best Practices

### **Security**

* Never store your S3 keys in plain text in your manifests or Git repositories.
* Always use Kubernetes Secrets and secure mounts.
* Limit permissions to the strict minimum (1 bucket = 1 key pair ideally).

### **Naming**

* Use explicit names to easily identify buckets.
* Keep in mind that the real name in S3 (`bucketName`) is automatically generated and may differ from the Kubernetes name.

### **Usage**

* Configure your S3 tools to point to `https://prod.s3.hikube.cloud`.
* Use the `accessKeyID` and `accessSecretKey` provided in the associated secret.

---

:::tip Good to Know
Each bucket created via the Hikube API is stored on a **triple-replicated** infrastructure and benefits from the native high availability of the S3 cluster.
:::

