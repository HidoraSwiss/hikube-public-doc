---
title: Hikube Console v1.4.4
authors: [hikube]
tags: [release]
---

The console accompanies API v1.6.4. A deleted resource stays displayed until its deletion is complete, and a VM's system disk is changed from a dedicated view. A VM stuck while starting can now be stopped, and the dashboard's topology map loads faster.

<!-- truncate -->

## Added

- **VM instances: change the system disk** — A dedicated view lets you replace the system disk of a stopped VM with an existing unattached disk, or with a new empty disk. A summary reminds you that the old disk is detached and kept, then a confirmation is requested. On a running VM, the view asks you to stop it first and offers to do so. It is reached from the VM's page and from its edit form.

## Changed

These changes modify an existing behaviour of the console.

- **All resources** — A deleted resource stays in the list with the status **Deleting** until it disappears. Its edit actions are disabled, and the reason is shown. Creating a resource under the name of a resource still being deleted shows a dedicated message: retry once the deletion is complete.

- **VM instances** — Right after an update, or a few seconds after a stop, starting may be temporarily refused. The console shows **Change still being applied** and retries on its own; a **Retry** button appears if the wait drags on.

- **VM instances** — A VM stuck while starting or in error, for example for lack of quota, can be stopped from its page, the VM list and the system disk view. The reason it is stuck is shown on its page.

- **Dashboard** — The topology map loads the subnets of all the project's VPCs in a single request, and limits the number of VMs shown per subnet.

## Fixed

- **VM instances** — In the VM list, the **Network** column shows a VM's public address first, tagged “public”, or **No public IP**. It used to show “Public IP: Yes” above every address, private ones included.

- **Disks** — The status colour once again distinguishes a **Ready** disk from an **In Use** disk.

- **Images** — An ISO image card opens with a single click.

- **Navigation** — Returning to a page restores its scroll position.
