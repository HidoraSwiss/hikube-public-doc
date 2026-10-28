---
title: Hikube Console v1.4.2
authors: [hikube]
tags: [release]
---

The console accompanies API v1.6.3 with a **Control plane** card on a Kubernetes cluster's page, whose control plane size and number of replicas can now be changed. The pages of the five databases share a single layout, and several creation and edit forms are fixed.

<!-- truncate -->

## Added

- **Kubernetes: control plane state** — A **Control plane** card appears on a cluster's page. It shows the overall state (**Healthy**, **Degraded** or **Critical**) and its reason, the ready replicas, the ready etcd members, and for each replica its state, its restarts with the date and cause of the last one, and its memory and CPU against their limit. When the control plane is short of memory, an **Increase the size** button opens the cluster's edit form.

- **Kubernetes: control plane size** — The size and number of replicas of the control plane can be changed on an existing cluster. As soon as they change, a warning explains that the control plane restarts progressively, and that it temporarily needs headroom in the project's CPU quota. Below the size field, at creation and when editing, a warning flags a size that is too small for the control plane, or too tight for the selected addons (Monitoring Agents, GPU Operator), with a button to switch to the recommended size. The same warning appears at the Addons step of the wizard.

- **Databases** — The PostgreSQL, Redis and RabbitMQ pages show their **Preset**, like the MariaDB page.

## Changed

These changes modify an existing behaviour of the console.

- **Databases** — The pages of the five databases share a single two-column layout. The main column presents the **General information** as tiles (**Version**, **Replicas**, **Volume size**, **Preset**), followed by the engine's own sections. The side column groups the **Connection** card and the status.

- **Databases** — When creating a MariaDB, MongoDB or RabbitMQ cluster, the console offers **1 node (single instance)** or **3 nodes (cluster)**, with a help text that explains each mode and states that the choice is final. When editing, a cluster in cluster mode can change its number of replicas, from 2 to 8. An existing 5-node cluster keeps its value.

- **Databases** — Editing a Redis cluster now only offers the current version and later ones, and no longer allows shrinking the volume. The restart warning only mentions the preset where it can change (PostgreSQL and Redis).

- **Kubernetes** — At creation, the control plane offers 1 or 3 replicas. When editing, the name of an existing node group is read-only, and the last remaining node group can no longer be deleted. Removing an existing node group shows a warning: saving deletes it together with its nodes.

- **Kubernetes** — The public IP option of the first node group is now labelled **Internet traffic entry (public IP)**. A help text explains that it receives the traffic of the services you expose, and that it is not how the cluster's API is reached.

- **Kubernetes** — When a project is not ready yet to host a cluster, the message asks you to contact support with the project name.

- **VM instances** — On a Windows VM, adding an SSH key applies at the next start, without losing the administrator password. The **Restart required** badge is shown in the VM list and on the VM's page as long as the API reports a pending restart.

- **Projects** — When creating a project, the quota step is optional: a field left empty sets no limit of the project's own, and the project then shares the organization's remaining resources (**Limited by the organization**). A quota that has been set can no longer be removed afterwards, and the step says so. The reserved names `root` and `super` are refused as soon as the name is typed.

- **Units** — Sizes (disks, volumes, memory, quotas) are shown in GiB (Gio in French), the API's unit.

## Fixed

- **Databases** — In the creation wizards, a user refused by the API is no longer shown with the password "Error": the console shows **User not created** and the reason. Refused PostgreSQL databases and RabbitMQ vhosts are listed with their reason. A vhost name is checked as it is typed, and the same username can no longer be entered twice (MariaDB, MongoDB, buckets).
