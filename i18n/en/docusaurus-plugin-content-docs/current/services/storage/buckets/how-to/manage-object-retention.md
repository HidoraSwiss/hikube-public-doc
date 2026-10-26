---
title: "How to manage object retention in a locked bucket"
description: "Check a WORM bucket's lock, extend an object's retention and place a legal hold with the standard S3 Object Lock commands."
---

# How to manage object retention in a locked bucket

A bucket created with **Enable Object Lock (WORM)** locks each object for 365 days after it is written, in `COMPLIANCE` mode. This guide shows how to check that lock and, with the standard S3 Object Lock commands, keep an object for longer: per-object retention, extension, legal hold.

These operations are done with an S3 client. The Hikube console and API only expose the bucket's default retention.

## Prerequisites

- A **locked (WORM) bucket** with the **Ready** status: locking is chosen at creation (see the [quick start](../quick-start.md)) and cannot be enabled afterwards
- An **S3 user** with **Read / Write** access to this bucket (see [Manage users and access keys](./configure-access.md))
- [AWS CLI](https://aws.amazon.com/cli/) installed, and the `S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `BUCKET_NAME` variables exported as in [step 4 of the quick start](../quick-start.md#step-4-retrieve-the-credentials)

:::warning A lock cannot be removed
A retention in `COMPLIANCE` mode can be neither shortened nor removed. The object cannot be deleted, nor the bucket emptied, before it expires. Check the date before running a command.
:::

## Understand the two mechanisms

| Mechanism | Duration | Set by | Released |
|-----------|----------|--------|----------|
| **Retention** | Until a date (`RetainUntilDate`) | The bucket, when each object is written (365 days), or you, object by object | Automatically when it expires; can only be extended |
| **Legal hold** | No expiry | You, object by object | When you remove it (`Status=OFF`) |

Both apply together: an object can only be deleted once its retention has expired **and** its legal hold has been removed.

## Steps

### 1. Check the bucket's lock

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-lock-configuration \
  --bucket "$BUCKET_NAME"
```

**Expected result:**

```json
{
    "ObjectLockConfiguration": {
        "ObjectLockEnabled": "Enabled",
        "Rule": {
            "DefaultRetention": {
                "Mode": "COMPLIANCE",
                "Days": 365
            }
        }
    }
}
```

`DefaultRetention` is the retention applied to every object written without a retention of its own.

### 2. Upload an object with its own retention

To keep an object beyond 365 days (a ten-year regulatory archive, for example), give it an expiry date when you upload it. Choose a date **later** than the default expiry (365 days after the upload): an object's own retention is used to keep it longer.

```bash
# Expiry date: ISO 8601, in UTC
RETAIN_UNTIL="2036-12-31T00:00:00Z"

aws --endpoint-url "$S3_ENDPOINT" s3api put-object \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf --body ./report-2026.pdf \
  --object-lock-mode COMPLIANCE \
  --object-lock-retain-until-date "$RETAIN_UNTIL"
```

### 3. Read an object's retention

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-retention \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf
```

**Expected result:**

```json
{
    "Retention": {
        "Mode": "COMPLIANCE",
        "RetainUntilDate": "2036-12-31T00:00:00+00:00"
    }
}
```

### 4. Extend an object's retention

A retention can only be **extended**: the new date must be later than the current expiry, otherwise the request is rejected.

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-retention \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --retention '{"Mode":"COMPLIANCE","RetainUntilDate":"2040-12-31T00:00:00Z"}'
```

### 5. Place or remove a legal hold

A legal hold blocks the deletion of an object with no expiry date, for example during litigation or an audit:

```bash
# Place the hold
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --legal-hold Status=ON

# Check the hold
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf

# Remove the hold
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --legal-hold Status=OFF
```

Removing the legal hold does not release the retention: the object stays protected until it expires.

## `GOVERNANCE` mode

`GOVERNANCE` mode is accepted, but bucket users are not allowed to bypass a retention: `--bypass-governance-retention` returns `AccessDenied`. An object in `GOVERNANCE` is therefore, in practice, as immutable as in `COMPLIANCE` until it expires. Use `COMPLIANCE`, which states what will be enforced.

## Troubleshooting

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| `get-object-lock-configuration` fails | Bucket created without locking | Locking can only be enabled at creation: create a locked bucket and copy the objects into it |
| `AccessDenied` on `put-object-retention` or `put-object-legal-hold` | **Read-only** user | Use a **Read / Write** user |
| Extension rejected | New date earlier than the current expiry | Choose a date later than the current expiry (step 3) |
| Date rejected on upload | Past date or wrong format | Future date, in ISO 8601 UTC format (`2036-12-31T00:00:00Z`) |
| `AccessDenied` when deleting an object | Retention still running or legal hold in place | Read the object's retention (step 3) and legal hold (step 5) |

## Going further

- [S3 bucket concepts](../concepts.md): locking and deleting a locked bucket
- [S3 bucket FAQ](../faq.md#what-is-locking-worm-for)
