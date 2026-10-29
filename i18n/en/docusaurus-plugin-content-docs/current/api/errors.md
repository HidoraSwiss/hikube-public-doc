---
sidebar_position: 4
title: Errors
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# API errors

A failed request returns an **HTTP status code** and a **JSON body** carrying a stable **numeric code**. Base your scripts' logic on the HTTP status code and this numeric code, never on the message text, which may change.

This format applies to all errors, including authentication denials and [rate limit](#limites-de-debit) overruns.

---

## Format

```json
{
  "requestId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "code": 30101,
  "message": "invalid name: must start with a letter, end with a letter or digit, and contain only lowercase letters, digits, and hyphens",
  "details": []
}
```

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Request identifier. Give it to support for any investigation request |
| `code` | integer | Numeric error code (see below). Absent when the error has no dedicated code |
| `message` | string | Human-readable description, in English. For a validation error, it names the offending field |
| `details` | array | Additional information, usually empty. For example, the list of VMs still using a VPC, or the unavailable GPU types |

### Request identifier {#identifiant-de-requete}

Every response, including a `2xx` response, carries an `x-request-id` header. The body of an error also carries a `requestId`, which does not always have the same value as the header. For any investigation request to support, give one or the other, and both if you have them: keep the header in your tools' logs, as it also lets you find a request that succeeded.

```bash
curl -sS -D - -o /dev/null "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | grep -i '^x-request-id'
```

---

## HTTP status codes

| HTTP code | Meaning | What to do |
|-----------|---------|------------|
| `400` | Invalid request: missing or malformed field, out-of-range value, operation not possible in the resource's current state | Fix the request based on `message`; do not retry it unchanged |
| `401` | Invalid or expired user token (code `10001`). Only concerns console sessions, not API keys | With an API key, do not send an `Authorization` header |
| `403` | Access denied (code `10002`), including for a request without a key | See [Access denied](#acces-refuse) |
| `404` | Resource not found in the project | Check the resource name in the path |
| `409` | Conflict: a resource already has this name, is still in use, or was modified at the same time | Change the name, free the resource, or read it again before retrying |
| `429` | Too many requests (code `10008`) | Wait for the delay given by the `Retry-After` header, then retry. See [Rate limits](#limites-de-debit) |
| `500` | Internal error | Retry later; if the error persists, contact support with the `requestId` |
| `503` | Service temporarily unavailable. With code `10004`, the key could not be verified: it is not considered invalid | Retry with an increasing delay (for example 1 s, 2 s, 4 s…) |

---

## Access denied {#acces-refuse}

Any key-related access denial returns the **same** `403` response with code `10002`, whatever the reason:

- no key presented (`X-Hikube-Api-Key` header missing or empty);
- malformed, unknown, revoked or expired key;
- key from a project other than the one in the path, or nonexistent project;
- insufficient scope (for example a `read` key for a creation);
- operation not accessible to API keys (management of the account, organization, projects or keys).

This uniform response is intentional: it reveals nothing about the existence of a project or a key. To diagnose, check in order the key (`HIKUBE_API_KEY`), the project ID (`PROJECT_ID`), then the required scope (see [Scopes](./authentication.md#scopes)).

---

## Common codes

| Code | HTTP | Meaning |
|------|------|---------|
| `10001` | 401 | Invalid or expired user token. A request with neither a key nor a token receives `10002`, not `10001` |
| `10002` | 403 | Access denied (see above) |
| `10004` | 503 | The key could not be verified for now. This is not a denial: the key is not at fault, retry |
| `10008` | 429 | Too many requests: wait for the `Retry-After` delay, then retry (see [Rate limits](#limites-de-debit)) |
| `10005` | 403 or 400 | Denied by a platform rule: the message names the rejected field, `details` the rule and its reason |
| `10006` | 400 | An `updateMask` path does not designate any updatable field of the `PATCH` request (see [Partial updates](./overview.md#mises-a-jour-partielles)) |

A client that cancels its request or exceeds its own timeout receives `499` or `504`, without a numeric code.

---

## Rate limits {#limites-de-debit}

Requests are limited **per API key** and **per IP address**. Both limits apply together: a request is denied as soon as either one is reached. Current values, subject to change:

| Limit | Burst | Sustained rate |
|-------|-------|----------------|
| Per API key | 120 requests | 300 requests per minute |
| Per IP address | 300 requests | 600 requests per minute |

The burst is the number of requests accepted at once. It then refills at the sustained rate.

Every response carries two headers, which describe the most restrictive limit for the caller:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Number of requests allowed by this limit |
| `X-RateLimit-Remaining` | Number of requests still available |

Beyond that, the request is denied with `429` and code `10008`. The response carries a `Retry-After` header, in seconds (currently 5): wait for this delay, then retry. Do not retry immediately, as the request would be denied again.

```json
{
  "requestId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "code": 10008,
  "message": "Too many requests. Please slow down.",
  "details": []
}
```

Several tools that share a key or an IP address (for example the jobs of a single pipeline behind a NAT gateway) also share its limit. Give each tool its own key, and space out the `GET` requests that track a resource's status.

---

## Service codes

Each service has its own code range. The last digits follow the same logic everywhere:

| Code ending | Category | Examples |
|-------------|----------|----------|
| `001` to `099` | Platform state: not found (`…001`), already exists (`…002`), access denied (`…003`), unavailable (`…005`), provisioning failed (`…006`) | `30001` disk not found, `80002` PostgreSQL cluster already exists |
| `100` to `199` | Request validation: invalid project ID (`…100`), invalid name (`…101`), then one code per field | `20103` unknown instance type, `70103` unsupported Kubernetes version |
| `200` to `299` | Business rule: operation not possible in the current state | `20200` disk already attached to another VM, `20201` VM already started |

| Prefix | Service |
|--------|---------|
| `20xxx` | Virtual machines |
| `30xxx` | Disks |
| `50xxx` | Buckets |
| `60xxx` | API keys |
| `70xxx` | Kubernetes |
| `80xxx` | PostgreSQL |
| `110xxx` | MariaDB |
| `120xxx` | Redis |
| `140xxx` | RabbitMQ |
| `150xxx` | MongoDB |
| `160xxx` | Networking |
| `170xxx` | Pricing |
| `180xxx` | Backups |

A few useful business codes:

| Code | HTTP | Meaning |
|------|------|---------|
| `20200` | 400 | The disk is already attached to another VM |
| `20201` / `20202` | 400 | The VM is already started / already stopped |
| `20204`, `20205`, `20207` | 400 | Requested GPU unavailable, insufficient quantity, or impossible to gather on a single server |
| `20206` | 400 | No public IPv4 address left |
| `20209` | 400 | The VM cannot start yet: its latest update is still being applied. Retry in a few seconds |
| `30007` | 400 | The disk is attached to a VM: detach it before deleting it |
| `80201`, `110201`, `120201`, `140201`, `150201` | 400 | Switching from a single instance to a replicated cluster (or the reverse) is not possible after creation |
| `80205`, `110205`, `120205`, `140205`, `150205` | 400 | Restart of a database still being created: nothing to restart, retry once the cluster is ready |
| `160003` / `160012` | 409 | The VPC / the subnet is still used by VMs, listed in `details` |
| `160152` | 400 | The address range overlaps an existing subnet |
| `180200` | 400 | The backup destination is not ready yet |
| `180205` | 400 | A restore is already in progress for this application |
| `180214` | 400 | The requested restore point is outside the restore window |

The [API reference](/api/reference/hikube-api/) lists the possible HTTP status codes for each operation.

---

## API key codes

These codes concern key management (creation, listing, revocation), reserved for project administrators, from the console or with their user session (see [Get a key](./authentication.md#obtenir)).

| Code | HTTP | Meaning |
|------|------|---------|
| `60003` | 403 | Requested scope exceeds the rights of the person creating the key |
| `60005` | 503 | The project's key limit is temporarily unreadable; retry |
| `60006` | 404 | Key not found in this project |
| `60007` | 503 | Saving temporarily impossible. For a revocation, it may have been applied: retry, the operation can safely be repeated |
| `60008` | 400 | API keys not enabled on this environment |
| `60009` | 400 | Maximum number of active keys reached for the project |
| `60106` | 400 | Invalid scope (allowed values: `read`, `write`, `admin`, `superadmin`) |
| `60107` | 400 | Invalid key identifier (32 lowercase hexadecimal characters) |
| `60108` | 400 | Invalid key name (required, 255 characters maximum, no control characters) |
| `60109` | 400 | Invalid validity period (allowed values: `1d`, `7d`, `30d`, `90d`, `180d`, `365d`) |

---

## Retrying safely

- Retry `503` and `10004` responses with an increasing delay and a bounded number of attempts.
- After a `429`, wait for the delay in the `Retry-After` header before retrying.
- Do not retry a `400` or a `403` unchanged: the request or the key must be fixed first.
- After a creation that failed with a timeout, read the resource with `GET` before creating it again: it may have been created, and a new attempt would return `409`.

<NavigationFooter
  nextSteps={[
    {label: "API FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Authentication", href: "../authentication"},
    {label: "API reference", href: "../reference/hikube-api"},
  ]}
/>
