---
title: Hikube API v1.5.0
authors: [hikube]
tags: [release]
---

The API now returns the internal address of managed databases, the members of an exposed MongoDB replica set and the retention of WORM buckets. It refuses up front the changes the platform cannot apply, such as a lower version or a smaller storage, and restricts the kubeconfig to project administrators.

<!-- truncate -->

## Added

- **Managed databases** — The new `internalHost` field gives the internal address of every PostgreSQL, MariaDB, MongoDB, Redis and RabbitMQ cluster, even without external access. It is reachable from the VMs and Kubernetes clusters of the same project, on the engine's default port. If a Debian VM does not resolve this address, follow [How to resolve .local DNS in VMs](/services/compute/how-to/fix-dns-local/).

- **MongoDB** — A replica set with external access returns the address of each of its members in `hosts`, and the replica set name in `replicaSet`. The `host` field stays empty for a replica set, which has no single entry point. From outside, connect to one member with `directConnection=true`.

- **S3 Storage** — A locked (WORM) bucket returns its retention in `retention`: duration in days, mode (`compliance`) and whether its objects are kept when the bucket is deleted.

- **Compute** — A VM's `restartRequired` field tells that a change is waiting for a restart to apply, for example a reloaded UserData or a detached disk.

- **OpenAPI specification** — Field descriptions now state the rules the API actually enforces: name length and format, expected image name, allowed roles. The specification also describes the error body (`requestId`, `code`, `message`, `details`) and the complete list of error codes.

- **Error codes** — Each new refusal has its own code. All of them are returned as HTTP 400.

| Code | Service | Meaning |
| --- | --- | --- |
| `30200` | Disks | A disk cannot be shrunk |
| `70205` | Kubernetes | The project's Kubernetes environment is being prepared: retry in a few minutes |
| `70206` | Kubernetes | Version downgrade refused |
| `70207` | Kubernetes | The project's configuration does not allow creating a cluster: do not retry, contact support |
| `70208` | Kubernetes | Preparing the project's Kubernetes environment failed: do not retry, contact support |
| `80203` / `80204` | PostgreSQL | Version downgrade refused / storage cannot be shrunk |
| `110203` / `110204` | MariaDB | Version downgrade refused / storage cannot be shrunk |
| `120203` / `120204` | Redis | Version downgrade refused / storage cannot be shrunk |
| `140203` / `140204` | RabbitMQ | Version downgrade refused / storage cannot be shrunk |
| `150203` / `150204` | MongoDB | Version downgrade refused / storage cannot be shrunk |

## Changed

These changes alter an existing behavior. Check them if you call the API from your own tools.

- **Managed databases and Kubernetes** — An update that asks for a lower version, or for less storage than the current one, is refused before it reaches the platform. Until now it was accepted, then failed on the platform, and the resource stayed stuck in provisioning. For Kubernetes, only the version is checked: reducing the node disk is still possible, because the nodes are replaced. If your last change failed, going back to the values in service is still allowed.

- **Disks** — A disk can no longer be shrunk, neither directly nor through an update of the VM that uses it (code `30200`).

- **Resource status** — A VPC, a project or a managed application whose last change could not be applied now has the `error` status. These resources used to stay in `provisioning` indefinitely. A resource whose change failed may keep running with its previous configuration.

- **Kubernetes** — A cluster's kubeconfig grants administrator access: downloading it is now reserved for project administrators. Other members receive a 403 error.

- **Compute** — The `use` role of a project can now start, stop and restart VMs. These actions used to require the administrator role.

- **Kubernetes** — Creating the first cluster of a project no longer starts before the project's Kubernetes environment is ready. During those few minutes, the API answers `70205` and creates nothing. Send the same request again later. A later cluster may briefly get this code while the project is being changed, for example during a quota change.

- **MariaDB and MongoDB** — System databases can no longer be the target of a role or be created: `mysql`, `information_schema`, `performance_schema` and `sys` for MariaDB, `admin`, `local` and `config` for MongoDB. If an existing user still has a role on a system database, remove it in its next update, or the update will be refused.

- **Authorization** — A project that does not exist and a project that exists but is forbidden now get the same 403 error, with the same code and message. These cases used to return 400 or 404 depending on the resource.

- **Projects** — The project name `super` is reserved.

## Fixed

- **Kubernetes** — The first cluster of a project no longer stays failed for about twenty minutes at startup, and its add-ons no longer remain in error.

- **Compute** — Updating a VM no longer returns a 500 error when one of its existing disks is smaller than the creation minimum (20 GB). A refusal about a disk is returned with its own code and the disk concerned (`disks[1]: …`). Disks handled before the refused one stay changed.

- **Compute** — The same IP address no longer appears several times in a VM's address list.

- **Databases and disks** — A volume of 1 TiB or more is reported with its actual size (`1024` for 1 TiB) instead of `1`.

- **MariaDB** — A single MariaDB server with external access returns its external address in `host`.

- **S3 Storage** — A read-only bucket user can be made read-write again. The response returns the user as stored. Always send `readonly` explicitly: `"config": {}` makes the user read-write.

- **Platform** — A request that triggers an internal error gets a 500 response and no longer interrupts the service for other requests.

## Security

- **Kubernetes** — A project member without the administrator role could download the kubeconfig, which grants administrator access to the cluster. This download is now reserved for project administrators.

- **Authorization** — Error responses no longer reveal whether a project you cannot access exists.

- **Real-time events** — Access to the event stream is checked for each requested resource type, quotas included. A request that names no type is refused (400).
