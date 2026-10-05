---
title: "How to create a system disk from an image"
---

# How to create a system disk from an image

A **system disk** contains a pre-installed operating system and can serve as the boot disk of a VM. This guide explains how to create one from the [Hikube console](https://console.hikube.cloud), from a catalog image or from your own image.

## Prerequisites

- A **project** with sufficient storage quota
- For a custom image: a public **HTTPS URL** to an ISO or QCOW2 file

## Steps

### 1. Open the wizard

Open **Infrastructure** → **Disks** and click **Create a disk**. At the **General** step, enter the **Disk Name**.

### 2. Choose the source

At the **Source** step, select **System Disk**. The **OS Image / Source** selector is displayed:

- **Catalog image**: choose the operating system, then its **Version**;
- **Custom image**: click **Custom Image** and fill in the **Image URL (ISO/QCOW2)**. The URL must point to a raw or compressed file recognized by the system.

URL validation rules:

| Rule | Console message |
|------|-----------------|
| URL required | "URL is required" |
| HTTPS only | "URL must use the HTTPS protocol" |
| No private or local address | "Private or local IP addresses are not allowed" |

### 3. Configure size and security

At the **Configuration** step:

- **Size (GB)**: at least 20 GB, and at least **50 GB for a Windows image** (the console adjusts the value automatically);
- **Replication Type**: **Asynchronous Replication** (Recommended) or **Synchronous Replication**;
- **Disk Encryption**: enable it if needed.

### 4. Review and create

At the **Summary** step, the **Source & Content** section shows **System Disk** and the chosen image (**Cloud Image: …** or **Custom image (ISO/QCOW2)** with the URL). The **Estimated Cost** includes the license for a Windows image. Click **Create disk**.

### 5. Follow the download

After creation, the disk goes through the **Downloading** status: the platform imports the image and the disk page shows the progress as a percentage. The disk then switches to **Ready**.

The disk page shows the source image in the **Source** section.

## Use the system disk

To boot a VM from this disk, select **Existing** on the **System Disk (Boot)** at the **Storage** step of the VM creation wizard (see [Attach a disk to a VM](./attach-to-vm.md)).

:::note
Custom image (ISO) is only available when creating a disk.
:::

## Verification

- The disk has the **Ready** status.
- Its page shows the source image (**Source system image**) in the **Source** section.

## Further reading

- [Concepts](../concepts.md)
- [Troubleshooting](../troubleshooting.md)
