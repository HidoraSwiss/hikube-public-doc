---
sidebar_position: 3
title: Quick start
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import {ApiEnv} from '@site/src/components/HikubeApi';

# First calls to the public API

This guide walks you from getting an API key to creating a first resource, an S3 bucket, with `curl`.

:::warning Preview
The public API is in preview (`v1alpha1`): paths and fields may still change.
:::

---

## Objectives

By the end of this guide, you will have:

- An **API key** and your **project ID**
- A **shell environment** ready for all the examples in the documentation
- A successful first **read call**
- An **S3 bucket** created through the API, with a user and their access keys

---

## Prerequisites

- A **Hikube account** and a **project** (see the [Hikube quick start](../../getting-started/quick-start))
- Being an **administrator** of the project or of its organization, or going through an administrator, to get the key
- `curl` and [`jq`](https://jqlang.org/) on your workstation

---

## Step 1: Get a key and the project ID {#project-id}

An administrator of the project or organization creates the key in the console: project settings, **API keys** card, **Create a key** (see [Get a key](./authentication.md#obtenir)).

For this guide, create a key with the **Admin** level (`admin`): it must be able to create and delete a bucket. A validity of 7 days is enough for a trial.

The console displays:

- the **key**, in the form `sk_hk_<keyId>_<secret>`. It is displayed only once: save it right away in your secrets manager;
- a sample call, which contains the **project ID** (`projectId`) after `/projects/`: a UUID such as `01928f6e-7b2c-7d4e-9a10-3f5b6c7d8e9f`.

:::note Project ID
Note the project ID from the sample call. Do not confuse it with the project name, or with the **Organization ID** displayed in **My Account**.
:::

---

## Step 2: Set up the environment {#environnement}

All the `curl` examples in the documentation read the base URL, the key and the project ID from three variables. Define them in your shell:

<ApiEnv />

Replace `sk_hk_<keyId>_<secret>` and `<project_id>` with your values. To keep the key out of your shell history, read it from your secrets manager rather than typing it in plain text.

---

## Step 3: Make a first read call

Start with a catalog, which does not depend on any project: the list of instance types.

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/instance-types" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq .
```

Then list the buckets in your project, which checks the key **and** the project ID:

```bash
curl -sS "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq .
```

**Expected result:**

```json
{
  "totalCount": "0",
  "buckets": []
}
```

64-bit integer fields, such as `totalCount`, are returned as strings. A `403` response with code `10002` means the key is invalid, expired, revoked, or does not belong to this project.

---

## Step 4: Create a bucket

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "demoapi", "locking": false, "encrypted": false}'
```

- `name`: 16 characters maximum, lowercase letters and digits;
- `locking`: object locking (WORM), cannot be changed after creation;
- `encrypted`: encryption at rest, cannot be changed after creation.

The response describes the bucket, with its `id` and a `status` of `provisioning`. Creation is asynchronous: move on to the next step.

---

## Step 5: Check the status and retrieve the credentials

Poll the bucket until its status is `ready`:

```bash
curl -sS "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, bucketName, endpoint}'
```

**Expected result:** `status` is `ready`; `bucketName` is the bucket's S3 name and `endpoint` the URL of the S3 endpoint.

Then create a bucket user, with read-write access:

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username": "app", "config": {"readonly": false}}'
```

The response contains `bucketName`, `endpoint` and `secrets.accessKeyId` / `secrets.accessSecretKey`.

:::warning S3 keys displayed only once
The S3 keys are only returned when the user is created. Save them right away in your secrets manager. If they are lost, generate new ones with `POST .../users/app/rotate-credentials`.
:::

Test access with an S3 client, for example the AWS CLI (see [Buckets — quick start](../../services/storage/buckets/quick-start)).

---

## Step 6: Quick troubleshooting

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| `403`, code `10002` | Invalid, expired or revoked key, wrong `PROJECT_ID`, or insufficient scope (`read` for a creation) | Check the variables; creation requires an `admin` key |
| `400`, validation code | Invalid field (name too long, forbidden character…) | Read `message`, which names the offending field |
| `409` | A resource with this name already exists in the project | Choose another name |
| `503`, code `10004` | Key verification temporarily unavailable | Retry after a few seconds: the key is not at fault |
| `curl: (6) Could not resolve host` | `HIKUBE_API` empty or incorrect | Run step 2 again |

See also [Errors](./errors.md).

---

## Step 7: Cleanup

Delete the user, then the bucket:

```bash
curl -sS -X DELETE "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi/users/app" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS -X DELETE "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Each successful deletion returns `200` and an empty object `{}`.

:::warning Irreversible deletion
Deleting a bucket is permanent. A bucket that still contains objects cannot be deleted: empty it first with your S3 client.
:::

If the key was only for this trial, ask for it to be revoked (see [Revoke a key](./authentication.md#révoquer-une-clé)).

<NavigationFooter
  nextSteps={[
    {label: "Authentication and best practices", href: "../authentication"},
    {label: "API reference", href: "../reference/hikube-api"},
  ]}
  seeAlso={[
    {label: "Errors", href: "../errors"},
    {label: "API FAQ", href: "../faq"},
  ]}
/>
