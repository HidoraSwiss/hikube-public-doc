---
title: Hikube API v1.6.0
authors: [hikube]
tags: [release]
---

The API opens to automation tools with API keys, and gains a backup and restore service for PostgreSQL, MariaDB, VMs and disks, including point-in-time restore for PostgreSQL. Managed databases can be restarted, and a VM now returns its internal address and its public address separately. `PATCH` requests become true partial updates: a field left out of the body keeps its value.

<!-- truncate -->

## Added

- **API keys** — Tools without a session, such as a CI pipeline, Terraform or a script, authenticate with an API key sent in the `X-Hikube-Api-Key` header. A key acts on a single project, with an access level (`read`, `write`, `admin` or `superadmin`) that follows the project's roles. It expires after 1 to 365 days (90 by default), and its secret is shown only once, at creation. Project administrators create, list and revoke its keys from the console, or with `POST`, `GET` and `DELETE` on `/iam/v1alpha1/projects/{project_id}/api-keys`. Nobody can give a key more rights than their own (`60003`), and the number of active keys per project is limited (`60009`). A key can neither manage keys nor act on the account, the organization or the projects. See [Authentication](/api/authentication/).

- **Backups** — A new service backs up and restores PostgreSQL and MariaDB clusters, VMs and disks. The other services (MongoDB, Redis, RabbitMQ, Kubernetes, buckets) are not supported: a request for one of them is refused with code `180107`.

- **Backups: destinations** — A destination binds a bucket of the project, the bucket user whose credentials it uses, and a retention in days. Archives are written to your bucket and use its storage: there is no platform-provided storage and no separate backup quota. On a locked (WORM) bucket, the retention cannot be shorter than the lock (`180218`). A destination cannot be deleted while a plan, a running backup or a restore uses it. Deleting it does not touch the archives already written to the bucket.

- **Backups: plans and on-demand backups** — A plan schedules a recurring backup with a five-field cron expression, or with `@hourly`, `@daily`, `@weekly`, `@monthly` and `@yearly`. The schedule is interpreted in UTC, and the `nextRunAt` field gives the next run. A schedule firing more than once an hour is refused (`180106`), as are `@every` and time zone prefixes (`180105`). A backup can also be started on demand, then cancelled while it has not finished.

- **Backups: archives** — Each archive says whether it can be restored. When it cannot, `notRestorableCause` gives the reason as a closed value (`not_ready`, `destination_removed`, `destination_tearing_down`, `destination_replaced`, `destination_unverified`, `stored_archive_gone`), and `notRestorableReason` the sentence to display. A destination created again under the same name does not make the archives written before its creation restorable. Once past their retention, archives are removed automatically. The most recent restorable archive of each application is always kept, whatever its age.

- **Backups: deleting an archive** — For PostgreSQL and MariaDB, deleting an archive removes only its record: the data stays in your bucket. For a VM or a disk, the data is destroyed irreversibly. The request must then carry `confirm_destructive=true`, and the response says so in `archiveDeleted`. An archive locked by a WORM bucket cannot be deleted before its lock ends (`180217`).

- **Backups: restore** — An archive is restored over the application it was taken from or, for PostgreSQL and MariaDB, into another application of the same type. Any restore that overwrites data requires `confirmDestructive`. A PostgreSQL archive is only restored into a database of the same major version (`180224`). During a restore, the application refuses on-demand backups (`180205`).

- **Backups: PostgreSQL point-in-time restore** — A PostgreSQL archive is restored to the exact state of the backup (`restorePoint: backup`, the default), to the most recent archived state (`latest`), or to a chosen instant (`recoveryTime`). The restore window of each archive (`recoveryWindow`) gives the bounds to respect, to the microsecond. Send them back as they are, without recomputing them. An instant outside the window is refused (`180214`).

- **Backups: restoring a VM** — The VM's current disks are replaced by those of the archive. With `originalDisks: discard` (the default), their previous content is deleted once the restore has succeeded. With `keep`, it is kept in a separate, detached disk named `<disk>-orig-<id>`. A restore that fails or is cancelled deletes nothing. Before reaching `succeeded`, the restore checks that every disk of the archive was written back. A VM restore that does not finish can be cancelled. A disk is not restored over itself while it exists (`180225`): restore a backup of the VM it is attached to. A VM or a disk deleted and created again under the same name since the backup is refused (`180222`).

- **Managed databases** — PostgreSQL, MariaDB, MongoDB, RabbitMQ and Redis clusters can be restarted (`POST .../clusters/{name}/restart`). PostgreSQL restarts its instances one after the other. The other services restart all their instances, which briefly interrupts the service. Data is kept.

- **Redis** — The new `restartRequired` field says that an authentication change or a password rotation is waiting for a cluster restart to take effect.

- **Compute** — The `network.internalIp` field gives the address of the VM on its project's network, with or without a public IP. It is reachable from the other resources of the project, subject to the guest system's firewall. It is returned when reading and listing VMs, and is empty while the VM is stopped. The `network.publicIp` field gives the public address, when `publicIpv4` is enabled. It can belong to a private range: do not infer it from its range.

- **Partial updates** — Every update request accepts an optional `updateMask` field. If you do not send it, it is derived from the keys of the JSON body. A path that names no updatable field, or a single key of a collection (such as `nodeGroups.workers`), is refused with code `10006`. The OpenAPI specification lists the updatable paths of each resource. See [Partial updates](/api/overview/#mises-a-jour-partielles).

- **Error codes** — Each new refusal has its own code. They are returned with HTTP 400 unless stated otherwise. The error format is described in [Errors](/api/errors/).

| Code | Service | Meaning |
| --- | --- | --- |
| `10004` | All | HTTP 503: the API key could not be checked. Retry: the key is not deemed invalid |
| `10005` | All | HTTP 403 or 400: refused by a platform rule: the message names the refused field, `details` the rule and its reason |
| `10006` | All | Invalid `updateMask`: unknown path, or a key of a collection |
| `60003` | API keys | HTTP 403: access level above your own |
| `60006` | API keys | HTTP 404: key not found in this project |
| `60009` | API keys | Maximum number of active keys reached for the project |
| `60106` to `60109` | API keys | Invalid key level, identifier, name or validity |
| `20115` | Compute | The UserData of a Windows VM is generated by the platform and cannot be changed |
| `40202` | Projects | The requested quota exceeds what the organization has left |
| `80205` / `110205` / `120205` / `140205` / `150205` | PostgreSQL / MariaDB / Redis / RabbitMQ / MongoDB | The cluster is still being created: nothing to restart yet |
| `120206` | Redis | Password rotation refused: authentication is disabled |
| `120207` | Redis | Password rotation refused: authentication was just enabled, retry in a few seconds |
| `180001` to `180227` | Backups | Refusals of the backup service, each with a message saying what to do. The full list is in the OpenAPI specification |

## Changed

These changes alter an existing behavior. Check them if you call the API from your own tools.

- **Partial updates** — A `PATCH` now changes only the fields present in the body: a field left out keeps its stored value. The fields that were required on update, such as `version`, `instanceType` or `disks`, no longer are: `{"external": true}` is enough to turn on the external access of a database. An empty body (`{}`) changes nothing and returns the resource as stored. The other rules:
  - a list sent empty is emptied: `gpus`, `sshKeys`, `network.vpcs`, `allowedInboundPorts`, the groups of an IAM user, the extensions of a PostgreSQL database, the grants of a user;
  - a sub-object sent empty, such as `"config": {}`, names all its fields, which are reset to their default value. To change a single field, send only that field;
  - `null` is the same as a field left out, except for a free-form configuration override (Cilium, CoreDNS, Vertical Pod Autoscaler and the addon overrides of a Kubernetes cluster), where `null` removes the override;
  - a free-form configuration override that is sent replaces the stored override, instead of being merged into it;
  - a field that is sent is validated with the creation rules, even at zero: `replicas: 0` is refused, where it used to mean "no change", and a project quota of 0 is refused (`40103` to `40105`).

- **Compute** — `userData: ""` removes the UserData of a Linux VM. On a Windows VM, UserData sent on update is refused (`20115`), and an empty string is ignored.

- **Compute** — The `network.ips` list no longer contains the internal address of the VM, returned separately in `internalIp`. The public address is still listed there, and also in `publicIp`.

- **Units** — The sizes of the API (disks, memory, storage, quotas) are expressed in GiB: 1 GiB is 1,024 MiB. The specification and the error messages said "GB", and a client calculating in GB underestimated the real size. In the `quotaFloor` detail of the `40201` refusal, `unit` is now `" GiB"` instead of `"Gi"`.

- **Refusals by platform rules** — A request refused by a platform rule receives code `10005`, with the field at fault. Until now it received the code of another error, for example `40002` ("the project already exists").

- **Redis** — Password rotation generates a new 32-character password, applied after a cluster restart. It is refused when authentication is disabled (`120206`).

## Fixed

- **Partial updates** — An update no longer resets the fields it does not mention. Until now, a body without these fields:
  - turned off the public IP of a VM and rewrote its restart policy;
  - turned off the addons of a Kubernetes cluster left out of the body;
  - turned off the external access of a MariaDB, RabbitMQ or Redis cluster, and the authentication of a Redis cluster;
  - turned off the sharding of a MongoDB cluster and reset the quorum of a PostgreSQL cluster;
  - reset the connection limit of a MariaDB user and the replication privilege of a PostgreSQL user;
  - removed a RabbitMQ user from all its vhosts.

- **Projects** — A project quota that exceeds what the organization has left is refused with code `40202` and the quota at fault. It used to be refused with code `40001` (project not found) or `40002` (project already exists).

- **Error messages** — The name of a resource type is no longer cut of its first letter in error messages.

- **IAM** — The changes to a user created through the API (name, groups) and its deletion are now applied to its sign-in account, found by its email address. Until now, only its creation was.

- **Lists** — Resource lists, in particular the VM list, respond faster. A VM list could take several seconds.

## Security

- **Redis** — Rotating the password of a Redis cluster returned the previous password instead of generating a new one. If you rotated a password before this version, rotate it again, then restart the cluster.

:::warning Known limitation
A scheduled backup can start during the in-place restore of a PostgreSQL cluster and make it fail. Before such a restore, check the `nextRunAt` of the application's plans: if a run is due within 30 minutes, wait for it to finish.
:::
