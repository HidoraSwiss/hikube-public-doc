---
title: Hikube API v1.6.4
authors: [hikube]
tags: [release]
---

This release keeps a resource that is being deleted visible, paginates the lists of instances and disks, and lists the subnets of a whole project in a single call. It also protects the system disk of a running VM, and refuses upfront a disk that the project's storage quota cannot hold. The additions remove nothing from the existing contract.

**Behaviour change**: a deleted resource no longer disappears from the API immediately. It stays readable with the status `deleting` until it is actually removed (see *Changed*).

<!-- truncate -->

## Added

- **Network: subnets of a project** — `GET /network/v1alpha1/projects/{project_id}/subnets` returns in a single call the subnets of all the project's VPCs, instead of one call per VPC.

- **Compute and disks: pagination** — `GET .../instances` and `GET .../disks` accept `pageSize` (500 at most; a larger value is served as 500) and `pageToken`, the `nextPageToken` of the previous response. Items are sorted by name, and `totalCount` gives the size of the whole collection on every page. `nextPageToken` is empty on the last page. Without these parameters, the list is returned in full, as before.

- **Error codes** — They are returned with HTTP 400. The error format is described in [Errors](/api/errors/).

| Code | Service | Meaning |
| --- | --- | --- |
| `10009` | All | Invalid page request: negative `pageSize`, or a `pageToken` that does not come from this list |
| `10010` | All | The resource is being deleted: it can be read, but no longer changed, and its name cannot be reused until it is gone |
| `20208` | Compute | A VM's system disk can only be replaced, detached or moved while the VM is stopped: stop it first |
| `20209` | Compute | The VM cannot start yet: its latest change is still being applied (about 30 seconds). Retry |
| `20210` | Compute | The disks that the creation or the update adds or enlarges do not fit in the project's remaining storage quota |
| `30202` | Disks | The disk to create, or its new size, does not fit in the project's remaining storage quota |

## Changed

These changes modify an existing behaviour. Check them if you call the API from your own tools.

- **All resources** — After its deletion, a resource stays readable and listed with the status `deleting`, until it has actually disappeared; a `GET` then returns 404. In the meantime, any change to the resource or to its sub-resources, and any creation under the same name, are refused with code `10010`. A new deletion request is still accepted. Before, the resource returned 404 as soon as deletion was requested, although it still existed. In real time, the console receives `status_changed` with `deleting`, then `deleted`.

- **Compute** — A VM's system disk (`disks[0]`) can only be replaced, detached or moved if the VM is stopped (`stopped`). Otherwise, the update is refused with code `20208` and nothing is changed.

- **Compute** — Right after an update, starting a VM is refused with code `20209` until the update has been applied, which takes about 30 seconds. Starting earlier could make the VM start on its previous configuration, for example on a system disk that had just been replaced. This refusal can also occur a few seconds after a VM is stopped: retry.

- **Disks and compute** — A disk to create or enlarge is checked against the project's remaining storage quota. If it does not fit, the request is refused with code `30202` (disks) or `20210` (creation or update of a VM), and nothing is created. `details.storageQuota` gives the requested size and the remaining space. Before, the disk was accepted, then stayed stuck for lack of space.

- **Quotas** — For a project that has sub-projects, the quota shown and checked is the one the project really has left, once the share given to its sub-projects is deducted. This is the quota that applies to new resources, to the size check of the Kubernetes control plane (`70209`) and to the console's real-time updates.

## Fixed

- **Compute** — A stopped VM stays stopped when you update it or during a platform maintenance. It could restart on its own.

- **MariaDB** — Creating a user was refused with an authorization error since v1.6.3. It works again.
