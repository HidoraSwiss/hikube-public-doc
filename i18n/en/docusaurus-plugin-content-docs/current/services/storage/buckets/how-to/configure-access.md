---
title: "How to manage users and access keys"
---

# How to manage users and access keys

Each Hikube bucket can have several **S3 users**, each with their own key pair and permission (**Read-only** or **Read / Write**). This guide explains how to manage these users from the [Hikube console](https://console.hikube.cloud) and how to configure common S3 clients (AWS CLI, MinIO Client, rclone).

## Prerequisites

- A **bucket** created in your project (see the [quick start](../quick-start.md)), with the **Ready** status
- One or more S3 clients installed: **AWS CLI**, **mc** (MinIO Client) or **rclone**

## Understanding the access model

- A bucket can have **several users**; each has their own **Access Key ID** and **Secret Access Key**.
- A user's keys give access **only to that bucket**.
- The bucket's **actual S3 name** and the **endpoint** are shared by all its users; they are displayed in the **Access & Configuration** card of the bucket page.
- The **secret key is displayed only once**, when the user is created.

## Create a user

1. Open **Infrastructure** → **S3 Buckets**, then click the bucket.
2. In the **Users & Access** card, click **Add User**.
3. In the **New User** window:
   - enter the **Username** (3 to 16 characters: lowercase letters, digits and hyphens; must start with a letter);
   - check **Read-only access** if the user should only read objects.
4. Click **Create User**.

The **Generated Credentials** window displays the **S3 Bucket**, the **S3 Endpoint**, the **Access Key ID** and the **Secret Access Key**.

:::warning
Copy these values before clicking **I have saved these keys**: the secret key cannot be retrieved afterwards.
:::

## Change a user's permission

1. In the **Users & Access** card, open the user's actions menu.
2. Choose **Edit access**.
3. Check or uncheck **Read-only access**, then click **Save changes**.

The **Access** column of the table then shows **Read-only** or **Read / Write**. The user's keys do not change.

## Renew keys

The console does not offer key rotation for an existing user. To renew keys (lost secret key, suspected leak):

1. Create a **new user** with the same permission and retrieve their keys.
2. Update your applications with the new keys.
3. Delete the old user: actions menu → **Delete**, then confirm.

## Configure S3 clients

In the following examples, replace:

- `<endpoint>` with the **Endpoint**, prefixed with `https://` (for example `https://prod.s3.hikube.cloud`);
- `<bucket>` with the S3 **Bucket name** displayed in **Access & Configuration**;
- `<access-key>` and `<secret-key>` with the user's keys.

### AWS CLI

Configure a dedicated profile:

```bash
aws configure --profile hikube
```

```text
AWS Access Key ID: <access-key>
AWS Secret Access Key: <secret-key>
Default region name: (leave empty)
Default output format: json
```

Use the profile with the Hikube endpoint:

```bash
aws s3 ls s3://<bucket>/ --endpoint-url <endpoint> --profile hikube
```

### MinIO Client (mc)

```bash
mc alias set hikube <endpoint> <access-key> <secret-key>

# List, upload and download
mc ls hikube/<bucket>/
mc cp fichier.txt hikube/<bucket>/
mc cp hikube/<bucket>/fichier.txt ./
```

### rclone

Add a remote in `~/.config/rclone/rclone.conf`:

```ini title="rclone.conf"
[hikube]
type = s3
provider = Minio
endpoint = <endpoint>
access_key_id = <access-key>
secret_access_key = <secret-key>
acl = private
```

```bash
# List objects
rclone ls hikube:<bucket>

# Synchronize a local directory
rclone sync ./mon-dossier hikube:<bucket>/mon-dossier
```

## Security best practices

:::warning
Never store your S3 keys in plain text in your Git repositories or container images. Use a secrets manager, environment variables or, in a Kubernetes cluster, a Secret (see [Connect an application](./connect-from-app.md)).
:::

- **One user per application**: you can revoke one application's access without affecting the others.
- **Read-only by default** for applications that only read.
- **Delete unused users.**

## Verification

With each client configured, list the bucket:

```bash
aws s3 ls s3://<bucket>/ --endpoint-url <endpoint> --profile hikube
mc ls hikube/<bucket>/
rclone ls hikube:<bucket>
```

If the command returns an empty list (empty bucket) or the list of objects without errors, the configuration is correct. With a **Read-only** user, a file upload must fail with `AccessDenied`.

## Further reading

- [Connect a bucket from an application](./connect-from-app.md)
- [Concepts](../concepts.md)
