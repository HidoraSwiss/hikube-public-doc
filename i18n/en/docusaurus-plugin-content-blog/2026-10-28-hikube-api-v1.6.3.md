---
title: Hikube API v1.6.3
authors: [hikube]
tags: [release]
---

This release tells you why a resource is not ready, through the new `statusDetail` field, and gives the state of a Kubernetes cluster's control plane. Each service announces its default preset. It also fixes the addition of SSH keys on a Windows VM, which replaced its password, and the rotation of a bucket user's credentials. The additions remove nothing from the existing contract.

**Behaviour change**: rotating the password of a MariaDB or RabbitMQ user is now refused, because it was never applied (see *Security*).

<!-- truncate -->

## Added

- **Detailed status** — Projects, VPCs, buckets, Kubernetes clusters, and PostgreSQL, MariaDB, MongoDB, Redis and RabbitMQ clusters return a `statusDetail` field, which gives the cause behind `status`. Its `reason` field takes one of the values `install_failed` (the resource could not be created), `update_failed` (the latest change could not be applied; the resource may still run with its previous configuration), `workloads_not_ready` (the resource is applied, but some of its components are not running), and, for a Kubernetes cluster only, `quota_exceeded` (nodes cannot start because the project quota is exhausted) or `node_failed` (a node is in error). `reason` is empty when there is nothing to report. `message` gives an English sentence for display, and `since` the moment the cause started to apply. Base your decisions on `reason`: the wording of `message` may change. Other values may be added: treat an unknown value as a generic failure.

- **Kubernetes: control plane state** — `GET /kubernetes/v1alpha1/projects/{project_id}/clusters/{name}/control-plane/status` returns the state of a cluster's control plane: `healthy`, `degraded` or `critical`, with its reason, for example `replicas_not_ready`, `out_of_memory` or `memory_near_limit`. The response details each replica (state, restarts and the cause of the last one, memory and CPU used against the limit), as well as the state of the cluster's etcd. This state is read on demand: it is not part of the cluster resource.

- **Default presets** — `GET /{service}/v1alpha1/presets` also returns `default`, the preset to offer when nothing points to another choice, for Kubernetes, PostgreSQL, MariaDB, MongoDB, Redis and RabbitMQ. It is always one of the presets in the list. The API does not apply this default on its own: a creation without a preset is still refused.

- **Error codes** — They are returned with HTTP 400. The error format is described in [Errors](/api/errors/).

| Code | Service | Meaning |
| --- | --- | --- |
| `70209` | Kubernetes | The project quota leaves no room to complete the change of the control plane's size or replicas: raise the quota |
| `110206` | MariaDB | User password rotation not available yet: the new password would not be applied |
| `110207` | MariaDB | Cluster just created: retry the user creation in a few seconds |
| `140206` | RabbitMQ | User password rotation not available yet: the new password would not be applied |

## Changed

These changes modify an existing behaviour. Check them if you call the API from your own tools.

- **Kubernetes** — A change of the control plane's size or number of replicas is checked before it is applied. During the rolling replacement, the control plane reserves more resources from the project quota. If the quota does not allow it, the update is refused with code `70209` and nothing is changed. The message states, for each resource, how much to raise the quota, and `details.quotaShortfall` gives the same information as JSON.

- **MariaDB and RabbitMQ** — `POST .../clusters/{cluster}/users/{user}/rotate-password` is refused with code `110206` (MariaDB) or `140206` (RabbitMQ), without touching the password. Rotation will be reopened once it can be applied.

- **MariaDB** — A new user's password is stored before its account is created, which guarantees that the returned password is the account's. On a cluster that was just created, a user creation may be refused with code `110207`: retry a few seconds later.

## Fixed

- **Compute** — On a Windows VM, adding or removing an SSH key no longer replaces the administrator password set at creation. The keys apply at the VM's next start (a restart, or a stop then a start), which `restartRequired` reports in the update response. A key added from within Windows is kept. Reloading the UserData (`reload-userdata`) restores the creation password instead of losing it.

- **Buckets** — Creating a bucket user and rotating its credentials no longer fail after a wait of about two minutes when the keys are slow to be issued. A rotation always returns keys that differ from the previous ones.

- **Managed databases** — The address (`host`) of an exposed database no longer shows up empty in the console's real-time updates. API responses were not affected.

## Security

- **MariaDB and RabbitMQ** — Rotating a user's password returned a new password that was never applied: the old one stayed valid. If you rotated a password before this release, the account's password is still the old one. If you believe it is compromised, contact support.

- **Buckets** — A rotation of a bucket user's credentials could return the old keys as if they were new, without revoking them. If a rotation made before this release gave you back the same keys as before, run it again.

:::warning Windows VMs created before this release
For SSH key changes to apply at restart, reload the VM's UserData once. This reload restores the administrator password set at creation: if you changed it in Windows, change it again afterwards.
:::
