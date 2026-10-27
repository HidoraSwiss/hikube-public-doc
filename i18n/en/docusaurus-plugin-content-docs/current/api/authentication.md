---
sidebar_position: 2
title: Authentication
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# API key authentication

A public API client (script, CI/CD pipeline, automation tool) authenticates with an **API key**. A key belongs to a **project** and grants, on that project only, the rights of its **scopes**.

Project administrators create and revoke the project's keys from the console, in the **API keys** card of the project settings: see [Get a key](#obtenir).

---

## Sending the key

The key is sent in the `X-Hikube-Api-Key` header, with every request:

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Do not use the `Authorization` header: it is reserved for console sessions. If a request carries both, the API key applies.

A request without a key is denied with `403` and code `10002`, like an invalid key (see [Access denied](./errors.md#acces-refuse)). The denial follows the API error format, with its `requestId`.

A key has the form `sk_hk_<keyId>_<secret>`:

- `sk_hk_` is a fixed prefix that lets secret detection tools recognize a Hikube key left in a repository or a log;
- `<keyId>` identifies the key (32 hexadecimal characters); it appears in the project's key list and is used to revoke it;
- `<secret>` is the secret part. Hikube only keeps a hash of it: the secret is displayed **only once**, when the key is created, and cannot be retrieved afterwards.

---

## Scopes {#scopes}

A key carries one or more scopes. Each scope corresponds to an access level on the project, from lowest to highest; a scope includes the rights of the lower scopes.

| Scope | Matches the role | Use |
|-------|------------------|-----|
| `read` | Read | All `GET` operations: resources, status, catalogs |
| `write` | Use | The rights of `read`, plus starting, stopping and restarting a VM. No creation, update, deletion or reading of credentials |
| `admin` | Admin | Create, update and delete resources; restart a managed database; create users and rotate their passwords; read credentials (kubeconfig, passwords, S3 keys) |
| `superadmin` | Super admin | All rights on the project |

A pipeline that deploys resources therefore needs an `admin` key. For a tool that turns VMs on and off on a schedule, a `write` key is enough; for a monitoring or inventory tool, a `read` key.

:::warning A `read` key is still a secret
Every API key is a secret, whatever its scopes: do not share it, and store it in a secrets manager.
:::

A key never has more rights than its scopes, whatever the rights of the person who created it. Conversely, a key keeps its scopes if that person loses theirs: to remove access, revoke the key.

:::tip Least privilege
Give each key the lowest scope that is enough for its use, and one key per use (a pipeline, a tool): you can then revoke one without cutting off the others.
:::

---

## Validity

Every key expires. Its validity period is chosen at creation from:

| Value | Duration |
|-------|----------|
| `1d` | 1 day |
| `7d` | 7 days |
| `30d` | 30 days |
| `90d` | 90 days (default) |
| `180d` | 180 days |
| `365d` | 1 year (maximum) |

There is no such thing as a key without an expiration date. An expired key is denied like an invalid key. A long-running integration must therefore plan to replace its key before it expires: create the new key, deploy it, then revoke the old one.

The project's key list shows, for each key, its expiration date (`expiresAt`) and its last use (`lastUsedAt`, to the minute): this is how you spot a key that is no longer used before revoking it.

---

## Limits

- **One key, one project.** A key only acts on its project. A request that targets another project, or the organization, is denied.
- **Accessible operations.** A key can only call the operations in the [API reference](/api/reference/hikube-api/). Management of the account, the organization, projects, members and the keys themselves is reserved for signed-in users: **a key cannot create or revoke a key**.
- **Number of keys per project.** The number of active keys in a project is limited according to the organization's plan: **1** for the Starter trial plan, **16** for the Enterprise plan. Expired keys do not count. Beyond that, creation is denied (code `60009`); revoke a key to free up a slot, or contact support to adjust the limit.
- **Rate.** Requests are limited per key and per IP address. Beyond that, the API responds `429` with code `10008` and a `Retry-After` header: see [Rate limits](./errors.md#limites-de-debit).
- **Who manages keys.** Only administrators of the project, or of its organization, create, list and revoke a project's keys. No one can create a key whose scopes exceed their own rights (code `60003`).

:::note Starter plan
With only one key allowed, replacing a key causes a short interruption: revoke the old one before creating the new one.
:::

---

## Get a key {#obtenir}

Administrators of the project, or of its organization, create keys from the [Hikube console](https://console.hikube.cloud):

1. Open the project settings. The **API keys** card lists its keys.
2. Click **Create a key**, then fill in:
   - a name (for example `ci-deploiement`);
   - the **Access level**: **Read** (`read`), **Use** (`write`), **Admin** (`admin`) or **Super admin** (`superadmin`), never above your own;
   - the **Validity**, from 1 day to 1 year.
3. Copy the key: it is displayed only once, along with a sample call. Store it right away in your secrets manager.

The list shows, for each key, its level, creation date, expiration (**Expires soon** during the last 7 days, then **Expired**) and last use. **Renew** creates a new key with the same name and level, then offers to revoke the old one.

A signed-in administrator can also manage keys with `POST`, `GET` and `DELETE` on `/iam/v1alpha1/projects/{projectId}/api-keys`, using their user session and not an API key. The creation body carries `name`, `scopes` (for example `["read"]`) and `validity` (`1d` to `365d`, `90d` by default); the response returns the full key in `secret`, only once.

The project identifier (`projectId`), used in API paths, appears in the sample call displayed with the key: it is the UUID that follows `/projects/`.

---

## Revoke a key {#révoquer-une-clé}

A revoked key is denied from the very next request. Revoke a key:

- as soon as it may have leaked (commit, log, screenshot, lost workstation);
- when the tool that used it is retired;
- when the person or team responsible for it changes.

In the **API keys** card of the project settings, revoke the key, then confirm by typing its name. With a user session, `DELETE /iam/v1alpha1/projects/{projectId}/api-keys/{keyId}` does the same: the `keyId` is the part of the key between `sk_hk_` and the last `_`. Never share the secret, not even with support.

Keys of a deleted project are denied as soon as the project is deleted, then erased.

---

## Best practices

- **Store the key in a secrets manager** (Vault, team password manager, your CI/CD platform's secrets), never in a Git repository, a container image, a versioned configuration file or a ticket.
- **In CI/CD**, declare the key as a masked and protected secret variable, restricted to the branches or environments that need it. GitLab CI example:

  ```yaml title=".gitlab-ci.yml"
  deploy:
    stage: deploy
    image: alpine:3.20
    # HIKUBE_API_KEY: masked and protected CI/CD variable, defined in the
    # GitLab project settings. PROJECT_ID is not a secret.
    variables:
      HIKUBE_API: "<API base URL>"   # see "Overview"
      PROJECT_ID: "<project_id>"
    script:
      - apk add --no-cache curl jq
      - >
        curl -sS --fail-with-body
        "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks"
        -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.totalCount'
  ```

- **Do not log the key**: avoid `curl -v` and `set -x` in scripts that handle it, as they print the headers.
- **One key per use**, with the minimal scope and the shortest validity compatible with the use.
- **Monitor expiration** and plan the replacement of long-lived keys.
- **Respond to a leak** by revoking the key first, then looking for where it was used.

<NavigationFooter
  nextSteps={[
    {label: "Quick start", href: "../quick-start"},
    {label: "Errors", href: "../errors"},
  ]}
  seeAlso={[
    {label: "API overview", href: "../overview"},
  ]}
/>
