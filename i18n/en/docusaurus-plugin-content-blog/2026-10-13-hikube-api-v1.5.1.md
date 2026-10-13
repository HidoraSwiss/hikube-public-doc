---
title: Hikube API v1.5.1
authors: [hikube]
tags: [release]
---

Managed databases, RabbitMQ and the Kubernetes control plane are now sized with the virtual machine sizes. This version also protects the system disk of running VMs and aligns the PostgreSQL database rules.

<!-- truncate -->

## Added

- **Managed databases and RabbitMQ** — The `preset` field takes the virtual machine sizes, from the `u1`, `s1` and `m1` series. A size has the same resources as a VM of the same name: `u1.medium` is 1 vCPU and 4 GiB. The 17 sizes offered range from `s1.small` (1 vCPU / 2 GiB) to `m1.8xlarge` (32 vCPU / 256 GiB). The `presets` operation of each service lists them with their resources.

- **Kubernetes** — The control plane is sized `s1.small` (1 vCPU / 2 GiB) or `s1.medium` (2 vCPU / 4 GiB). The size applies to its four components, and the response details the size of each.

- **Resources** — The response of a database, of RabbitMQ or of a Kubernetes cluster gives the actual resources of its size (`resources`: CPU and memory).

- **Error codes** — Two new refusals, returned as HTTP 400:

| Code | Service | Meaning |
| --- | --- | --- |
| `20208` | Compute | The system disk of an existing VM can be neither replaced, detached nor moved |
| `30201` | Disks | The disk is detached, but the VM still uses it until its next restart: it cannot be deleted yet |

## Changed

These changes alter an existing behavior. Check them if you call the API from your own tools.

- **Database and RabbitMQ sizes** — The former names (`small`, `medium`, `large`…) are still accepted for now, with unchanged resources. Each request that uses one gets a `Warning` header naming the equivalent size to use. Each size exists in one series only: 1 vCPU / 2 GiB is called `s1.small`.

- **Kubernetes** — A control plane smaller than `small` is refused at creation and on a size change (code `70111`): `nano`, `micro` and their equivalents. An existing cluster of that size stays editable as long as its size does not change.

- **Quotas** — The quota now counts the three sentinels of a Redis cluster, at the cluster's size, as well as the four components of the Kubernetes control plane.

- **PostgreSQL** — The system databases `postgres`, `template0` and `template1` can no longer receive a role, nor be created, modified or deleted (code `80105`). A user who already holds a role on one of them keeps it as long as that role does not change.

- **PostgreSQL** — A database name may contain lowercase letters, digits, underscores (`_`) and hyphens. It starts with a letter or an underscore, does not start with `pg_`, and has at most 54 characters. Names of 55 to 63 characters, accepted until now, are refused (code `80105`).

- **Compute** — A VM update that replaces, removes or moves its system disk is refused (code `20208`). To change the system disk, delete the VM, then create it again from the disk you want.

- **Disks** — Deleting a disk still in use is refused: a disk attached to or listed in a VM (code `30007`), or a detached disk the VM uses until its next restart (code `30201`). Restart the VM, then try again.

## Fixed

- **Kubernetes** — An update that does not change the control plane, such as enabling an add-on, no longer modifies it and no longer replaces its components.

- **Kubernetes, PostgreSQL and Redis** — A cluster whose size is not in the list stays editable: its size is returned as is and is no longer refused as long as it does not change.

- **PostgreSQL** — Database names with an underscore, such as `app_db`, are accepted.

## Security

- **Compute and disks** — A VM update could replace or detach the system disk of a running VM, and that disk could then be deleted while the VM still used it. The API now refuses both operations.
