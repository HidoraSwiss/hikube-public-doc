---
sidebar_position: 6
title: "FAQ — Backups"
sidebar_label: FAQ
description: "Answers to questions about Hikube backups: covered resources, archive location, quota, time zone, PostgreSQL and destinations, restoring to a copy, deletion."
---

# FAQ — Backups

### Which resources can be backed up?

**PostgreSQL** and **MariaDB** databases, **virtual machines** (with all their disks) and **disks**. MongoDB, Redis, RabbitMQ, Kubernetes clusters and buckets are not covered by this service. The data of a [Kubernetes](../kubernetes/overview.md) cluster is backed up with tools installed in that cluster.

---

### Where are my backups stored?

In the S3 bucket of your project chosen for the destination. Hikube keeps no other copy: deleting the bucket deletes the archives.

---

### Do backups have a quota?

No quota of their own. Archives use the space of their bucket, counted like the rest of object storage.

---

### Do I need to create one destination per resource?

No. A destination serves all the covered resources in the project. Create several for different retentions or buckets.

---

### Can I back up a PostgreSQL database to two destinations?

No. A PostgreSQL database continuously archives its transaction logs to a single destination; two destinations would share this stream and neither would contain a complete history. The second one is refused. Several schedules to the same destination remain possible. See [Concepts](./concepts.md#postgresql-a-single-destination).

---

### Which time zone are schedule times in?

UTC. The console preset converts your local time to UTC; the cron expression is entered directly in UTC. A scheduled backup therefore shifts by one hour in local time at each daylight saving change.

---

### Can I back up more often than once an hour?

Not with a schedule: the maximum frequency is one run per hour. For PostgreSQL, it is not necessary: transaction logs are archived continuously, and [point-in-time restore](./how-to/restore-point-in-time.md) reaches any point between two backups.

---

### How do I get a copy of a database without touching the original?

Create an empty database of the same type (and of the same major version for PostgreSQL), then restore the archive onto it with **Another application**. See [Restore a database](./how-to/restore-database.md).

---

### Can I restore a VM under another name?

No. A VM or a disk is only restored onto itself. To recover files without replacing the whole VM, restore it choosing **Keep them**: the old disks remain available as separate disks. See [Restore a VM or a disk](./how-to/restore-vm-or-disk.md).

---

### Can I restore a single disk of a VM?

No. A VM's archive is restored as a whole, with all its disks. The archive of a disk backed up on its own is only used to recreate it if it has been deleted.

---

### Does deleting an archive free up space in my bucket?

For a **VM** or a **disk**, yes: the data is erased shortly after deletion. For **PostgreSQL** and **MariaDB**, no: only the record disappears from the console, the data stays in the bucket.

---

### What happens to my archives if I delete the backed-up resource?

They are kept and remain restorable. For a VM or a disk, the restore recreates the resource; for a database, choose another database as the target.

---

### What happens to my archives if I delete the destination?

They stay in the bucket, but can no longer be restored from the console, even if you create a destination of the same name again. For PostgreSQL, their retention is no longer enforced.

---

### Why is the size of my archives not shown?

It is not measured today. For a VM or a disk, the percentage shown during a backup measures the data transferred, not the space taken up. The actual space can be read on the bucket.

---

### What happens if a scheduled backup falls during a restore?

An on-demand backup is refused during a restore, but a scheduled backup still triggers. For a PostgreSQL database restored in place, it can make the restore fail: before restoring, check that no run is planned within the next 30 minutes.
