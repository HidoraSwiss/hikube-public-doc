---
sidebar_position: 6
title: FAQ
---

# FAQ — Disks

### What is the difference between a disk and an S3 bucket?

A **disk** is a block volume attached to a single VM, which the operating system formats and mounts like a local disk. An [S3 bucket](../buckets/overview.md) is object storage accessible through an HTTPS API from any application, without being attached to a machine.

---

### Can I create a disk directly from the VM wizard?

Yes. At the **Storage** step of the VM creation wizard, each volume in **New** mode creates a disk. These disks then appear in **Infrastructure** → **Disks**, just like those created from the **Disks** menu.

---

### Can a disk be attached to several VMs?

No. A disk is attached to a single VM at a time. To move it, detach it from the first VM, then attach it to the second one (see [Attach a disk to a VM](./how-to/attach-to-vm.md)).

---

### What happens to the disks when I delete a VM?

They are **detached** and kept, with their data. They remain in the **Storage Disks** list with the **Ready** status and keep consuming the project's storage quota until they are deleted.

---

### Can the size of a disk be reduced?

No. "Size reduction is not supported": a disk can only be expanded. To reduce the space used, create a smaller disk, copy the data to it from the VM, then delete the old one.

---

### Can encryption be enabled or replication changed after creation?

No. Encryption and the replication type are chosen at creation; only the size can be changed afterwards. To change these options, create a new disk and copy the data to it.

---

### Which replication should I choose?

- **Asynchronous Replication** (recommended): suitable for most workloads. RPO < 5 min.
- **Synchronous Replication**: for data whose loss must be minimal. RPO < 1 min.

In both cases, the RTO is under 5 minutes.

---

### Why is the minimum size 50 GB for Windows?

A Windows system disk requires at least 50 GB. The console automatically applies this minimum when you select a Windows image.

---

### How is a disk billed?

The wizard displays an **Estimated Cost**: a rate per GB per month, and the monthly cost for the chosen size. The rate depends on encryption; a Windows system disk adds the license cost.

---

### Why can't I delete my disk?

A disk attached to a VM cannot be deleted: the console replies "The disk cannot be deleted as it is in use.". Detach it first from the VM edit page.
