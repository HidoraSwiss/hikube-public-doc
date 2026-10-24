---
title: Hikube Console v1.4.0
authors: [hikube]
tags: [release]
---

The console accompanies API v1.6.0 with a new **Backups** screen: destinations, schedules, on-demand backups, archives and restores of VMs, disks, and PostgreSQL and MariaDB databases. The project settings manage its API keys, managed databases can be restarted from their page, and the VM and database pages separate internal addresses from external ones.

<!-- truncate -->

## Added

- **Backups** — A **Backups** entry appears in the project menu, with four tabs:
  - **Destinations**: an S3 bucket of the project, the user whose credentials the destination uses, and a retention period. A destination on a WORM bucket shows the duration of its lock;
  - **Protection**: every application of the project, with its state (**Scheduled**, **Covered**, **Unprotected**) and its last backup. The **Unprotected** filter lists those without any backup, and the **Schedule** button creates one;
  - **Activity**: backups and restores, with their status, duration and message;
  - **Archives**: all the archives of the project.

- **Backups on resource pages** — The pages of VM instances, disks, and PostgreSQL and MariaDB clusters have a **Backups** tab. It offers **Back up now**, the application's schedule, the state of running jobs, its archives and its restores. The tab flags an unprotected resource or a failed last backup.

- **Scheduling** — A backup is scheduled every hour, every day or every week, or with a cron expression. The schedule is in UTC, and the console shows the next run. A warning reminds you that the schedule shifts by an hour when the clocks change. A PostgreSQL cluster can be backed up to a single destination only: the console explains this when a plan already exists.

- **Restore** — **Restore** offers the restore target: **In place**, or **Another application** for PostgreSQL and MariaDB. A restore that overwrites data asks you to type the target's name. For a VM, you choose what becomes of its current disks: **Discard them** once the restore has succeeded, or **Keep them** as separate disks. Running VM backups and restores show their progress.

- **PostgreSQL point-in-time restore** — The **Restore up to** field offers the exact state of the backup, the **Most recent state**, or an instant chosen on a timeline, at a scale from one hour to seven days, or typed as a date and time. An instant outside the restorable period is brought back to the nearest bound, and the console says so.

- **Archives** — An archive that cannot be restored says why: archive not ready yet, destination deleted, being deleted or created again since, data erased at the end of its retention. Several archives of an application can be deleted at once: the confirmation asks you to type their number. The console says whether the deletion destroys the data (VMs and disks) or leaves the archive in your bucket (databases). Archives locked by a WORM bucket are left out, with the date their lock ends.

- **Cancellation** — A running backup and a VM restore can be cancelled. When the cancellation is not possible yet or still has to be finished, the console says so and offers **Retry**.

- **API keys** — An **API keys** card appears in the project settings, for its administrators. **Create a key** asks for a name, an **Access level** (**Read**, **Use**, **Admin** or **Super admin**, never above your own) and a **Validity** from 1 day to 1 year. The key is shown only once, with an example call. The list gives the level, creation, expiry (**Expires soon** in the last 7 days, then **Expired**) and last use of each key. **Renew** creates a new key with the same name and level, then offers to revoke the old one. Revocation is confirmed with the key's name. See [Authentication](/api/authentication/).

- **Managed databases** — A **Restart** button appears on the page of PostgreSQL, MariaDB, MongoDB, RabbitMQ and Redis clusters. The confirmation states the interruption: rolling restart for PostgreSQL, brief interruption for the others. Data is kept.

- **Redis** — A **Restart required** banner is shown while an authentication change or a password rotation is waiting for a restart, with a **Restart now** button. After such a change, the console offers to restart right away or later.

- **Addresses** — The pages of VM instances and of PostgreSQL, MariaDB, MongoDB, Redis and RabbitMQ clusters show their addresses in two zones. **Internal**: reachable from the resources of the project, with the address of the VM on the project's network, labelled **mgmt**, or the internal address of the database and its port. **External**: reachable from the Internet, with the public IP of the VM or the external address of the database. A VM without a public IP finally shows its address, and a database without external access its internal address. When external access is off, the zone says so instead of showing "Not defined".

## Changed

These changes alter an existing behavior of the console.

- **VM instances** — The suggested SSH command targets the public IP, otherwise the **mgmt** address. The public IP is the one returned by the platform, even when it belongs to a private range.

- **Projects** — Quota fields left empty keep the current value. A quota of 0, negative or decimal is refused. When a quota exceeds what the organization has left, the field concerned says so, with the highest possible value.

- **Projects** — The refusal of a quota below current usage shows its values in the console's units: vCPU, and GiB. The memory and storage fields of the form show "GiB" in English.

## Fixed

- **VM instances** — Removing the last VPC of a VM now detaches it. Until now, the VPC stayed attached.

- **PostgreSQL** — Removing all the grants of a user no longer removes its replication privilege.

- **Kubernetes** — Emptying a Cilium, CoreDNS, Vertical Pod Autoscaler or addon override now removes it from the cluster.

- **Redis** — The texts announcing an immediate revocation of the previous password are corrected: the new password takes effect after the cluster restarts.
