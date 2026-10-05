---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — S3 Buckets

### AccessDenied when accessing the bucket

**Cause**: the keys used are incorrect, the bucket name used is not the actual S3 name, or the user is read-only and is attempting a write.

**Solution**:

1. Open the bucket page and note the **Bucket name** in the **Access & Configuration** card. Use this name, not the name entered in the wizard:
   ```bash
   aws --endpoint-url https://<endpoint> s3 ls s3://<s3-bucket-name>/
   ```
2. In the **Users & Access** card, check the user's permission (**Read-only** or **Read / Write**); change it if needed with **Edit access**.
3. Check that the Access Key ID and the Secret Access Key are correctly configured in your tool. If the secret key is lost, create a new user.

---

### ListBucket fails on the root

**Cause**: a user's keys are limited to their bucket. It is not possible to list all the buckets of the endpoint.

**Solution**:

1. Always target the bucket in your commands:
   ```bash
   aws --endpoint-url https://<endpoint> s3 ls s3://<s3-bucket-name>/
   mc ls hikube/<s3-bucket-name>/
   ```
2. To see all your buckets, use the **Object Storage Buckets** page of the console.

---

### Credentials not found

**Cause**: the secret key is only displayed when the user is created, or no user was created (for example if the bucket was not ready at the end of the wizard).

**Solution**:

1. Open the bucket page and check the **Users & Access** card.
2. Click **Add User** to create a user and get new keys.
3. The endpoint and the S3 name remain available at any time in **Access & Configuration**.

---

### "No S3 connection information available currently."

**Cause**: the bucket is still being provisioned.

**Solution**: wait until the bucket status switches to **Ready**, then reload the page. If the status remains **Creating** or switches to **Error**, [contact support](mailto:support@hidora.io) with the bucket name and its identifier.

---

### Creation fails: "A bucket with this name already exists."

**Cause**: a bucket in the project already has this name.

**Solution**: go back to the **General** step of the wizard and choose another **Bucket name**.

---

### Bucket deletion fails

**Cause**: the console replies "The bucket is not empty or is still in use.".

**Solution**:

1. Empty the bucket with a **Read / Write** user:
   ```bash
   aws --endpoint-url https://<endpoint> s3 rm s3://<s3-bucket-name>/ --recursive
   ```
2. If locking (WORM) is enabled, objects still under retention cannot be deleted before it expires.
3. Retry the deletion from the console. If the error persists, [contact support](mailto:support@hidora.io).

---

### Slow upload or timeout

**Cause**: network issue, large file uploaded without multipart upload.

**Solution**:

1. Check your connectivity to the endpoint:
   ```bash
   curl -s -o /dev/null -w "%{time_total}\n" https://<endpoint>
   ```
2. For large files, use a client that handles multipart upload: `aws s3 cp` and `mc cp` do so automatically above a certain size.
3. If needed, increase client-side parallelism (for example `aws configure set default.s3.max_concurrent_requests 20`).

---

### Bucket not found (`NoSuchBucket`)

**Cause**: the name used is the name chosen in the console, not the actual S3 name.

**Solution**: note the **Bucket name** in the **Access & Configuration** card of the bucket page and use it in your commands.

:::warning
Do not confuse the bucket's name in the console with its S3 name. Only the latter works with S3 clients.
:::
