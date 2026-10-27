---
sidebar_position: 6
title: FAQ
---

# FAQ — Public API

### Is the API ready for production?

It is in **preview** (`v1alpha1`): paths, fields and the public URL may still change. You can use it for your automation, provided you follow its changes in the [changelog](/blog).

---

### How do I get an API key?

An administrator of the project or organization creates it in the console, in the **API keys** card of the project settings, by choosing its name, its access level and its validity period (see [Get a key](./authentication.md#obtenir)).

---

### Where do I find my project ID?

In the sample call the console displays when an API key is created: it is the UUID that follows `/projects/`. It is distinct from the project name and from the **Organization ID** displayed in **My Account**.

---

### Can I use the same key for several projects?

No. A key is bound to a single project, and any request targeting another project is denied. Use one key per project.

---

### Can I create an API key with another API key?

No. Key management is reserved for administrators, from their console session: a key can neither create nor revoke a key. This prevents a compromised key from granting itself new access.

---

### Which scope should I choose?

`read` to read (inventory, monitoring), `admin` to create, update or delete resources (deployment). See [Scopes](./authentication.md#scopes).

---

### Why can't a key be unlimited?

This way, a forgotten or leaked key eventually expires on its own. The maximum validity is one year (`365d`); plan to replace your integrations' keys before they expire.

---

### I lost my key's secret. Can it be sent to me again?

No. Hikube only keeps a hash of the secret, which is displayed only at creation. Revoke the lost key and create a new one, or use **Renew** in the **API keys** card: the console creates a key with the same name and level, then offers to revoke the old one.

---

### My key has leaked. What should I do?

**Revoke it immediately** in the **API keys** card of the project settings. If you go through support, give its `keyId`, never the secret. Revocation takes effect from the next request. Then create a new key and look for where the old one may have been used.

---

### All my requests return `403` with code `10002`. Why?

This single response covers every denial: missing, invalid, expired or revoked key, wrong project ID, insufficient scope, or operation not accessible to keys. First check that the `X-Hikube-Api-Key` header is actually sent: a request without a key also receives `403`, not `401`. See [Access denied](./errors.md#acces-refuse).

---

### Are all console operations available in the API?

No. The API covers project resources (VMs, disks, buckets, Kubernetes, networking, databases, RabbitMQ) and catalogs. Management of the account, the organization, projects, members and keys stays in the console. The [API reference](/api/reference/hikube-api/) lists exactly which operations are available.

---

### Is there an official client or a Terraform provider?

Not yet. You can generate a client in your language from the [OpenAPI specification](pathname:///openapi/hikube-public.swagger.json). A Terraform provider built on the public API is being considered (see [Terraform](../../tools/terraform)).

---

### Does the API enforce a maximum number of requests?

Yes. Requests are limited per API key (currently a burst of 120 requests, then 300 per minute) and per IP address (a burst of 300, then 600 per minute). These values may change. Beyond that, the API responds `429` with code `10008`: wait for the delay in the `Retry-After` header, then retry. The `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers on every response show where you stand. See [Rate limits](./errors.md#limites-de-debit).

To track a creation, an interval of a few seconds between two `GET` requests is enough.

---

### What should I give support to investigate a request?

The request identifier: the `x-request-id` header, present on every response, and the `requestId` field in the body of an error. Either one is enough; give both if you have them. Never the key's secret. See [Request identifier](./errors.md#identifiant-de-requete).
