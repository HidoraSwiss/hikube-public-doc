---
title: "How to manage object retention in a locked bucket"
description: "Check and change a WORM bucket's default retention, set or extend an object's retention and place a legal hold with the standard S3 Object Lock commands."
---

# How to manage object retention in a locked bucket

A bucket created with **Enable Object Lock (WORM)** locks each object by default for 365 days after it is written, in `COMPLIANCE` mode. This guide shows how to check that lock and adapt it with the standard S3 Object Lock commands: the bucket's default retention, per-object retention, extension, legal hold.

These operations are done with an S3 client. The Hikube console and API show the default retention the bucket was created with (365 days): they do not reflect a change made with an S3 client.

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
| **Retention** | Until a date (`RetainUntilDate`) | The bucket, when each object is written (default retention, 365 days unless changed), or you, object by object | Automatically when it expires; can only be extended |
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

### 2. Change the bucket's default retention

Any **Read / Write** user can replace the default retention, in days (`Days`) or years (`Years`). Example for 55 days:

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-lock-configuration \
  --bucket "$BUCKET_NAME" \
  --object-lock-configuration '{"ObjectLockEnabled":"Enabled","Rule":{"DefaultRetention":{"Mode":"COMPLIANCE","Days":55}}}'
```

The new value only applies to objects written afterwards: an object that is already locked keeps its expiry. Without `Rule`, the bucket no longer has a default retention and an object written without a retention of its own is not locked. Run step 1 again to check the value in place.

:::info Display in the console
The Hikube console and API always show the default retention chosen when the bucket was created (365 days): a change made with an S3 client does not appear there. Only step 1 gives the value in place. Changing the default retention from the console will be available soon.
:::

:::warning Who can change the retention
A **Read / Write** key is enough to shorten or remove the default retention of future objects. Reserve these keys for the applications that write to the bucket and give the others **Read-only** access.
:::

### 3. Upload an object with its own retention

An expiry date given at upload replaces the default retention for that object, whether it is longer (a ten-year regulatory archive, for example) or shorter (a backup kept for 55 days in a 365-day bucket).

```bash
# Expiry date: ISO 8601, in UTC
RETAIN_UNTIL="2036-12-31T00:00:00Z"

aws --endpoint-url "$S3_ENDPOINT" s3api put-object \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf --body ./report-2026.pdf \
  --object-lock-mode COMPLIANCE \
  --object-lock-retain-until-date "$RETAIN_UNTIL"
```

### 4. Read an object's retention

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

### 5. Extend an object's retention

A retention can only be **extended**: the new date must be later than the current expiry, otherwise the request is rejected.

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-retention \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --retention '{"Mode":"COMPLIANCE","RetainUntilDate":"2040-12-31T00:00:00Z"}'
```

### 6. Place or remove a legal hold

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
| `AccessDenied` on `put-object-lock-configuration`, `put-object-retention` or `put-object-legal-hold` | **Read-only** user | Use a **Read / Write** user |
| Extension rejected | New date earlier than the current expiry | Choose a date later than the current expiry (step 4) |
| Date rejected on upload | Past date or wrong format | Future date, in ISO 8601 UTC format (`2036-12-31T00:00:00Z`) |
| Object written with an unexpected retention | Default retention changed by a bucket user | Read the default retention (step 1) and restore it if needed (step 2) |
| `AccessDenied` when deleting an object | Retention still running or legal hold in place | Read the object's retention (step 4) and legal hold (step 6) |

## Going further

- [S3 bucket concepts](../concepts.md): locking and deleting a locked bucket
- [S3 bucket FAQ](../faq.md#what-is-locking-worm-for)
