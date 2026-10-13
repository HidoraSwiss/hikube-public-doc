---
title: Hikube Console v1.3.1
authors: [hikube]
tags: [release]
---

The console follows API v1.5.1: the forms offer the sizes the platform serves, with their new prices. The disks of an existing VM can no longer be replaced from the edit page, and the PostgreSQL screens follow the new database rules.

<!-- truncate -->

## Added

- **Databases and Kubernetes** — The size lists come from the platform, with their resources, for example "u1.medium — 1 CPU / 4Gi". For the Kubernetes control plane, the console offers `u1.small` and `u1.2xmedium`. If the list cannot be loaded, a message says so instead of showing an outdated list.

- **Kubernetes** — A cluster's edit page shows, read-only, the size of each of the four control plane components.

- **Overridden resources** — When an instance's resources are set outside its size, the form shows it with the "(override)" note and an explanation.

## Changed

These changes alter an existing behavior of the console.

- **Databases and Kubernetes** — At creation, no size is preselected: you must choose one. When editing, the current size stays displayed and is sent back unchanged, even if it is no longer in the list.

- **Prices** — Estimated costs follow the new prices: a managed application costs 10 CHF per month per vCPU and per GiB, and the Kubernetes control plane stays at the flat fee of 32 CHF. A database that keeps a former size shows "Price unavailable", and the project dashboard says how many databases are excluded from the total.

- **Redis** — The quota preview counts the cluster's three sentinels, at the chosen size. They are not billed.

- **VM instances** — On a VM's edit page, the disks it already has are shown read-only. The system disk no longer has any action, with the explanation "The system disk of an existing VM cannot be replaced: the VM boots from it." A data disk only offers **Detach disk**. The **New** / **Existing** choice remains available for disks added in the form.

- **Disks** — Deleting a detached disk that the VM still uses is refused with a clear message: "This disk was detached, but its VM still uses it until its next restart. Restart the VM, then try again." Deleting an attached disk also shows an explicit message instead of a technical error.

- **PostgreSQL** — System databases are no longer offered in the user wizards, and creating one is refused. In the database list, **Manage extensions** and **Delete** are disabled on a system database. An existing role on a system database is shown locked in **Manage Access**, with a warning: you can remove it, not change it.

- **PostgreSQL** — Database names follow the platform rule: lowercase letters, digits, underscores and hyphens, at most 54 characters, starting with a letter or an underscore, but not with `pg_`. Hyphens are no longer removed while typing.

## Fixed

- **PostgreSQL** — On the **Create a user** page, the username keeps its underscores: `u_app` no longer becomes `uapp`.

- **PostgreSQL** — The creation wizard no longer preselects the `postgres` system database for users. Without an application database, the user is created without rights. If the platform refuses a user, the final step shows "User not created" and the reason, instead of a fake password.

- **Kubernetes and databases** — A cluster whose size is not in the list can be saved again: editing an add-on or another option is no longer blocked.

## Security

- **VM instances** — On a VM's edit page, the **New** / **Existing** choice made it possible to replace or detach the system disk of a running VM. This choice is no longer offered for existing disks, and the platform now refuses this change.
