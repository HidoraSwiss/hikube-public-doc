---
sidebar_position: 1
title: Overview
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import {HikubeApiUrl} from '@site/src/components/HikubeApi';

# Hikube public API

The **Hikube public API** lets you manage a project's resources from a script, a CI/CD pipeline or an automation tool, without going through the [Hikube console](https://console.hikube.cloud). It exposes, over REST and JSON, the operations the console performs on virtual machines, disks, buckets, Kubernetes clusters, networking and databases.

The API complements the console; it does not replace it. Account, organization, project and member management stays in the console.

:::warning Preview
The public API is in **preview** (`v1alpha1`). Paths, fields and behaviors may still change, and the final public URL has yet to be confirmed. Do not build critical automation on this version yet unless you plan to keep up with its changes.
:::

---

## What the API covers

| Domain | Path prefix | Operations |
|--------|-------------|------------|
| Virtual machines | `/instance/v1alpha1` | Create, list, get, update, delete; start, stop, restart; reload cloud-init. Catalogs: images (`/cloud-images`) and instance types (`/instance-types`) |
| Disks | `/disk/v1alpha1` | Create, list, get, expand, delete |
| S3 buckets | `/bucket/v1alpha1` | Create, list, get, delete; manage a bucket's users and rotate their keys |
| Kubernetes | `/kubernetes/v1alpha1` | Create, list, get, update, delete a cluster; download its kubeconfig. Catalogs: versions, presets |
| Networking | `/network/v1alpha1` | VPCs and subnets: create, list, get, delete |
| PostgreSQL | `/postgres/v1alpha1` | Clusters (including restart), databases, users (including password rotation). Catalogs: presets, extensions |
| MariaDB | `/mariadb/v1alpha1` | Clusters (including restart), databases, users (including password rotation). Catalog: presets |
| MongoDB | `/mongodb/v1alpha1` | Clusters (including restart), databases, users (including password rotation). Catalog: presets |
| Redis | `/redis/v1alpha1` | Clusters (including restart), password rotation. Catalog: presets |
| RabbitMQ | `/rabbitmq/v1alpha1` | Clusters (including restart), users, vhosts. Catalog: presets |
| Backups | `/backup/v1alpha1` | Destinations, schedules (`plans`), on-demand backups and their tracking (`jobs`), archives (`backups`), restores (`restores`), including PostgreSQL point-in-time restore; cancel a backup or restore in progress. For VMs, disks, and PostgreSQL and MariaDB databases |
| GPU | `/gpu/v1alpha1` | Catalog of available GPUs (assignment is done on the VM or the node group) |
| Pricing | `/billing/v1alpha1` | Price lists (VMs, databases, Kubernetes, licenses, GPUs, networking, block and object storage) |

The complete list of operations, with their parameters and responses, is in the [API reference](/api/reference/hikube-api/).

### What the API does not cover

- **Account, organization, projects, members and roles**: console only.
- **API keys**: a key cannot create or revoke a key (see [Authentication](./authentication.md)).
- The console's **real-time event stream**.
- **Services not available in the console** (ClickHouse, Kafka, NATS): on request from support.

An operation that is not in the reference cannot be called with an API key, even if the console offers it.

---

## Base URL

All requests start from the following base URL:

<HikubeApiUrl />

The paths in the reference are appended to this URL. The documentation examples read it from the `HIKUBE_API` variable:

```bash
curl -sS "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

---

## Versions

Each service carries its version in the path: `/disk/v1alpha1/...`, `/postgres/v1alpha1/...`. All services are currently at `v1alpha1`, that is, in preview: a `v1alpha1` version may change in incompatible ways. Changes are announced in the [changelog](/blog).

---

## Organization and project

On Hikube, an **organization** groups **projects**, and every resource (VM, disk, database…) belongs to a project. In the API, the project appears in the path of every operation:

```text
/<service>/v1alpha1/projects/{projectId}/<resources>/{name}
```

- `projectId` is the project identifier, a UUID (for example `01928f6e-7b2c-7d4e-9a10-3f5b6c7d8e9f`). It is not the project name displayed in the console.
- `name` is the name you gave the resource when you created it: it is what identifies the resource in paths.

An API key is bound to **a single project**: any request targeting another project is denied. To automate several projects, use one key per project. See [Find the project ID](./quick-start.md#project-id).

Catalogs (images, instance types, versions, presets, GPUs, pricing) do not depend on any project: their paths do not contain `projectId`.

---

## Conventions

- **Format**: request and response bodies are JSON (`Content-Type: application/json`), with field names in *camelCase* (`instanceType`, `asyncReplication`). Dates follow RFC 3339 (`2026-10-05T09:30:00Z`).
- **Verbs**: `GET` reads, `POST` creates or triggers an action, `PATCH` updates, `PUT` triggers an action on a VM (start, stop…), `DELETE` deletes.
- **Asynchronous operations**: a create or update returns the resource immediately, with a `status` field (`provisioning`, then `ready`). Poll the resource with `GET` until it reaches the expected state before using it.
- **Updates**: a `PATCH` is a partial update; only the fields sent change (see [Partial updates](#mises-a-jour-partielles)).
- **Errors**: an error returns an HTTP status code and a JSON body with a stable numeric code (see [Errors](./errors.md)).

---

## Partial updates {#mises-a-jour-partielles}

All `PATCH` requests follow the same rule: **only the fields sent are modified**. There is no need to read the resource and send it back in full.

- **Missing field**: a field absent from the body, or sent as `null`, keeps its value. `{"external": true}` on a Redis cluster enables external access and keeps the version, size and authentication.
- **Field sent**: its value is applied as is, including an empty value (`false`, `0`, `""`). It is validated as on creation: a size of `0` is rejected.
- **Sub-object**: it is updated field by field. `{"network": {"publicIpv4": true}}` on a VM touches neither the firewall nor the VPCs. Sent empty, however, it resets **each of its fields** to its empty value: `{"network": {}}` removes the public address, disables the firewall and detaches all VPCs.
- **List or map**: when sent, it replaces the existing one, and `[]` or `{}` empties it. `{"network": {"vpcs": []}}` detaches all VPCs from a VM; `{"config": {"databases": {}}}` removes all privileges from a database user.
- **Free-form configuration** (Helm overrides of a Kubernetes cluster: `config.cni`, `config.dns`, `config.verticalPodAutoscaler`, addons' `configOverride`): an object sent replaces the existing override, `{}` changes nothing, and `null` removes it.
- **Empty body**: `{}` changes nothing and returns the resource as stored.
- **Immutable fields**: the name and the path identifiers are ignored if they appear in the body. A field set at creation (for example the mode of a database cluster, standalone or replicated) may be sent back with its current value; any other value is rejected with a service-specific code. A field that is not part of the update request (such as `preset` on MariaDB or `image` on a VM) is rejected as an unknown field (`400`).

For example, to enable external access on a Redis cluster without changing anything else:

```bash
curl -sS -X PATCH "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"external": true}'
```

### The `updateMask` field

Every `PATCH` request accepts an optional `updateMask` field: the comma-separated list of paths to update, in *camelCase* (`external,authEnabled`). Without it, the paths are inferred from the fields present in the body, which is enough in most cases.

With `updateMask`, only the listed paths are updated, with the value from the body. A path that is listed but absent from the body takes its empty value: `{"updateMask": "external"}` alone **disables** external access. A path that does not designate any updatable field is rejected with code `10006` (see [Errors](./errors.md)).

---

## OpenAPI specification

The public API specification can be downloaded in OpenAPI 2.0 (Swagger) format: [`hikube-public.swagger.json`](pathname:///openapi/hikube-public.swagger.json). You can use it to generate a client in your language. It only describes the operations that can be called with an API key.

<NavigationFooter
  nextSteps={[
    {label: "Authentication", href: "../authentication"},
    {label: "Quick start", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "API reference", href: "../reference/hikube-api"},
    {label: "Errors", href: "../errors"},
  ]}
/>
