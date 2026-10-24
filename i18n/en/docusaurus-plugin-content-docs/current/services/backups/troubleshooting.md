---
sidebar_position: 7
title: "Troubleshooting — Backups"
sidebar_label: Troubleshooting
description: "Solve common Hikube backup issues: destination in error, schedule refused, failed backup, non-restorable archive, restore refused, and the meaning of the 180xxx codes."
---

# Troubleshooting — Backups

### The destination is in error

**Cause**: the bucket or its user can no longer be read (deleted, or credentials revoked), or a deletion of the destination did not complete.

**Solution**:

1. Read the destination's message in the **Destinations** tab.
2. Check in **S3 Buckets** that the bucket and the user still exist.
3. If a deletion did not complete, the message says what could not be released: delete the destination again.
4. If the problem persists, contact [support](mailto:support@hidora.io) with the name of the destination.

---

### The destination stays in Provisioning

**Cause**: the setup is not finished.

**Solution**: wait a few moments, the list updates on its own. If the state does not move to **Ready** after a few minutes, contact [support](mailto:support@hidora.io).

---

### The retention is refused

**Cause**: the value is not a whole number of days between 1 and 3,650, or it is shorter than the lock of a WORM bucket.

**Solution**: on a WORM bucket, enter at least 365 days; the console shows the exact minimum.

---

### The schedule is refused

| Cause | Solution |
|-------|----------|
| The cron expression does not have five fields, or uses `@every`, `CRON_TZ=` or `TZ=` | Use a five-field expression in UTC, or a preset. |
| The time pattern triggers more than once an hour | Space runs at least one hour apart. |
| **No destination ready in this project.** | Create a destination, or wait for it to be **Ready**. |
| The destination is being deleted | Choose another destination. |
| A PostgreSQL database is already backed up to another destination | Use the same destination as its existing schedules. |
| The plan name already exists, or does not follow the rules | Choose another name: lowercase letters, digits and hyphens, at most 40 characters. |

---

### The schedule is in error

**Cause**: the time pattern is no longer valid, or the resource or the destination has been deleted. The schedule's message says which.

**Solution**: delete the schedule and create a new one with a **Ready** destination.

---

### A backup fails

**Solution**:

1. Open **Backups** > **Activity** and read the run's **Message**.
2. Check that the destination is **Ready** and that the bucket user still has access to the bucket.
3. Check that there is space left in the bucket and in the project's object storage quota.
4. Run it again with **Back up now**.
5. If the failure repeats, contact [support](mailto:support@hidora.io) with the name of the run.

---

### The first backup of a PostgreSQL database fails

**Cause**: on its very first backup, and on the first one after an in-place restore, the database is reconfigured to archive its logs and restarts briefly. This backup may fail.

**Solution**: run the backup again with **Back up now**; the following ones succeed.

---

### An on-demand backup is refused

| Cause | Solution |
|-------|----------|
| A restore of the resource is in progress | Wait for the restore to finish. |
| The PostgreSQL database is not ready yet after a failed restore | Wait for the database to be ready, or restore it again: that is what brings it back. |
| The destination is not **Ready**, or is being deleted | Choose another destination. |
| A PostgreSQL database is already backed up to another destination | Choose the destination of its schedules. |

---

### An archive is not restorable

See [Find out whether an archive is restorable](./how-to/manage-archives.md#find-out-whether-an-archive-is-restorable).

---

### A restore is refused

| Cause | Solution |
|-------|----------|
| A restore of this resource is already in progress | Wait for it to finish. |
| The original database no longer exists | Choose another database as the target. |
| The VM or the disk has been recreated under the same name since the backup (or one of the VM's disks has) | Delete the recreated resource, then restore: the restore recreates it from the archive. |
| Disk backed up on its own, restored onto itself while it exists | Restore an archive of the VM the disk is attached to. |
| Different PostgreSQL major versions | Restore to a PostgreSQL database of the same major version as the backed-up database. |
| **No transaction after this point** | Restore the most recent state: the result is the same. |
| Point outside the restore window | Choose a point within the bounds shown. |
| The restore would start from another branch of the history | Choose an earlier point, or an archive on the branch you want. |
| What the restore would give back cannot be guaranteed | Try again later. |
| Log archiving is not working on the database | Restore the state of the backup, without a point in time. |

---

### The VM restore does not finish

**Cause**: a transfer is stuck. A VM restore does not stop on its own.

**Solution**: cancel it with **Cancel restore** (see [Cancel a backup or a restore](./how-to/cancel-backup-or-restore.md)), then run a restore again. If the VM remains stopped, this new restore is what brings it back.

---

### The VM restore failed and names a disk

**Cause**: a disk of the archive was not rewritten. The message says what this disk contains.

**Solution**: run the restore again. The disks set aside have been kept under the name `<disk>-orig-<identifier>`: delete them from **Disks** once the restore has succeeded.

---

### `-orig-` disks appear in the list of disks

**Cause**: a VM restore with **Keep them**, or a restore that failed or was cancelled, kept the old content of the disks.

**Solution**: these disks are billed like all others. Recover what is useful to you from them, then delete them from **Disks**. The **Restores** section shows which restore created them.

---

### An archive cannot be deleted

| Cause | Solution |
|-------|----------|
| **"…" is locked** (WORM destination) | Wait for the lock end date shown. |
| A restore is reading this archive | Wait for the restore to finish. |

---

### The destination cannot be deleted

**Cause**: **This destination is still used by a plan, a run or a restore.**

**Solution**: delete the schedules that use it, and wait for ongoing backups and restores to finish.

---

## Refusal codes

Every refusal from the backup service carries a six-digit code starting with `180`. If you contact support, give it along with the message.

| Code | Meaning | What to do |
|------|---------|------------|
| 180001 | Destination not found | Check the destination name. |
| 180002 | Schedule not found | Check the schedule name. |
| 180003 | Run not found | It may have been deleted with its schedule or at the end of its retention. |
| 180004 | Archive not found | It may have been deleted, or removed at the end of its retention. |
| 180005 | Restore not found | Check the restore name. |
| 180006 | A destination already has this name | Choose another name. |
| 180007 | A schedule already has this name | Choose another name. |
| 180008 | Conflict with a concurrent change | Try again. |
| 180009 | Service temporarily unavailable | Try again in a moment. |
| 180010 | Setup failed | Try again; contact support if the error persists. |
| 180011 | Bucket not found in the project | Choose a bucket from the same project. |
| 180012 | User not found on this bucket | Choose a user of this bucket, or create one. |
| 180013 | Resource not found | Check that the database, VM or disk exists. |
| 180014 | Destination deletion incomplete | Delete it again. |
| 180015 | Cancellation incomplete | Cancel again to finish. |
| 180101 | Invalid destination name | Lowercase letters, digits and hyphens, at most 40 characters. |
| 180102 | Invalid schedule name | Lowercase letters, digits and hyphens, at most 40 characters. |
| 180103 | Retention out of range | From 1 to 3,650 days. |
| 180105 | Unreadable time pattern, interval or time zone | Five-field cron expression or `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly`, in UTC. |
| 180106 | Time pattern too frequent | At most one run per hour. |
| 180107 | Resource type not covered | Only PostgreSQL, MariaDB, VMs and disks can be backed up. |
| 180109 | Confirmation missing | Confirm the destructive operation. |
| 180200 | Destination not ready | Wait for it to be **Ready**. |
| 180201 | Destination still in use | First delete its schedules; wait for ongoing operations to finish. |
| 180204 | Archive not restorable | The message gives the reason. |
| 180205 | Restore in progress on this resource | Wait for it to finish. |
| 180206 | The target is not of the same type as the archive | Choose a database of the same type. |
| 180207 | Point in time or most recent state requested outside PostgreSQL | Reserved for PostgreSQL. |
| 180208 | Restore to another resource not possible for a VM or a disk | Restore onto the original resource. |
| 180209 | Destination being deleted | Choose another destination. |
| 180210 | Archive being read by a restore | Wait for the restore to finish. |
| 180211 | The original resource no longer exists | Choose another database as the target. |
| 180212 | PostgreSQL database already backed up to another destination | Use the same destination. |
| 180213 | No original disk to keep | **Keep them** only applies to a VM restored onto itself. |
| 180214 | Point outside the restore window | Choose a point within the bounds shown. |
| 180215 | Log archiving interrupted | Restore the state of the backup. |
| 180216 | Backup cannot be cancelled | Wait for it to finish. |
| 180217 | Archive locked by a WORM bucket | Wait for the lock to end. |
| 180218 | Retention shorter than the bucket lock | At least 365 days. |
| 180219 | No transaction after the requested point | Restore the most recent state: it is the same. |
| 180220 | The state of the archive cannot be checked right now | Try again later. |
| 180221 | The restore would start from another branch of the history | Choose an earlier point or another archive. |
| 180222 | The VM or one of its disks has been recreated since the backup | First delete the recreated resource. |
| 180223 | Restore cannot be cancelled | Wait for it to finish on its own. |
| 180224 | Different PostgreSQL major versions | Restore to a database of the same major version. |
| 180225 | A disk is not restored over itself | Restore an archive of the VM it is attached to. |
| 180226 | PostgreSQL database not ready yet after a restore | Wait for it to be ready, or restore it again. |
| 180227 | Nothing to cancel yet | Cancel again in a few seconds. |
