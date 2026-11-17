---
title: Hikube API v1.7.1
authors: [hikube]
tags: [release]
---

This patch release makes the NVIDIA L4 GPU available. A new size chosen for a database or a Kubernetes control plane now actually applies, and the size of a MariaDB, MongoDB or RabbitMQ cluster can be changed without recreating it.

<!-- truncate -->

## Added

- **GPU** — The NVIDIA L4 GPU, with 24 GB of video memory, is available under the name `l4`. It appears in `GET /gpu/v1alpha1/gpus` and can be requested for a VM instance as well as for a Kubernetes node group.

## Fixed

- **PostgreSQL, Redis, Kubernetes** — Changing the size of a database or of a cluster's control plane could have no effect: the new size was saved and read back, but the database kept running with its former resources. The new size now applies, and the database restarts to take it.

- **MariaDB, MongoDB, RabbitMQ** — The size of a cluster could only be chosen at creation. It can now be changed with an update, through the `preset` field, without recreating the cluster. As for PostgreSQL and Redis, the cluster restarts to take its new size.
