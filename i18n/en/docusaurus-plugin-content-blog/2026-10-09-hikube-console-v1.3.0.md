---
title: Hikube Console v1.3.0
authors: [hikube]
tags: [release]
---

The console follows API v1.5.0: it no longer offers changes the platform would refuse, explains what detaching a disk and deleting a bucket do, and shows the members of an exposed MongoDB replica set.

<!-- truncate -->

## Added

- **MongoDB** — The page of a replica set with external access lists its members, each with a copyable address, instead of showing "Not defined". It offers a connection string that connects directly to one member. That member may be a secondary, which does not accept writes.

- **Kubernetes** — While a project's Kubernetes environment is being prepared, creating its first cluster is retried automatically, without losing the configuration you entered. A banner shows the wait, with a **Cancel** button. If the environment cannot be prepared, a message says so and the console does not retry.

- **Projects** — The project settings show its identifier, with a copy button. The organization identifier, in **My Account**, can be copied the same way.

- **Statuses** — A VPC's page shows its status. A project whose last change could not be applied has an **Error** badge in the project selector. The status filters of VPCs and Kubernetes clusters offer **Ready** and **Error**.

- **VM instances** — After **Reload UserData**, the console says a restart is needed to apply it and that the SSH host keys will be regenerated. A **Restart** button is offered.

- **VM instances** — When a VPC is attached to a Debian or Ubuntu VM, a warning reminds you that the interface must be configured in the operating system. See [How to connect a VM to a VPC](/services/networking/how-to/attach-vm-to-vpc/).

- **Projects** — If creating a project fails, the error message shows a request reference to give to support.

## Changed

These changes alter an existing behavior of the console.

- **Kubernetes** — The **Kubeconfig** button is reserved for project administrators. For other members it is disabled, with the note "Reserved for project administrators."

- **Databases** — Editing a PostgreSQL, MariaDB, MongoDB or RabbitMQ cluster only offers the current version and higher ones. The disk size can no longer go below the current size. A warning says that changing the version or the preset restarts the instances, and that an upgraded version cannot be lowered again.

- **MariaDB and MongoDB** — The creation wizard asks for the application database of each user. System databases are refused: `mysql`, `information_schema`, `performance_schema` and `sys` for MariaDB, `admin`, `local` and `config` for MongoDB. The "Global role" field, which never worked, is removed.

- **Databases and RabbitMQ** — User, database and vhost names follow the API rules: lowercase letters, digits and hyphens, starting with a letter. Validation errors are translated. PostgreSQL is not affected.

- **VM instances** — Removing a disk from a VM detaches it without deleting it. The confirmation is now titled "Detach", without typing the name. It states that the disk stays in **Disks** with its data, and that the detachment only takes effect at the next VM restart.

- **VM instances** — The minimum system disk size depends on the chosen image: 40 GB for Oracle Linux, 28 GB for Windows Server, 20 GB for other images. Choosing a more demanding image raises the size to its minimum.

- **S3 Storage** — The bucket deletion confirmation says what happens to the objects. Without WORM, the bucket and all its objects are deleted, even if it is not empty. With WORM, the bucket leaves the console, but its objects are kept and stay locked for 365 days after they were written, in COMPLIANCE mode. The creation wizard states this retention.

- **Kubernetes** — The node group field "Ephemeral storage size" becomes "Node disk size": this disk is persistent. The Monitoring Agents add-on no longer offers a Helm configuration, which it did not apply. The add-on help links point to this documentation.

- **VM instances** — The vCPU and RAM gauges, which reflected no real measurement, are removed from the VM page and from the instance type selection. The page shows the instance type's actual series: Standard (S), Universal (U) or Memory (M).

## Fixed

- **S3 Storage** — The console no longer shows the resource name in place of the bucket's S3 name. It shows the actual name (`bucket-…`) or says it will be available in a few moments. If you configured an S3 client with the name shown when creating a user and it gets "Access Denied", take the S3 name from the bucket page.

- **S3 Storage** — Unchecking "Read-only" on a bucket user now really makes it read-write.

- **VM instances** — Saving a VM whose existing disk does not follow the rules of a new disk (name longer than 16 characters, size below 20 GB) no longer fails without a message. When a save is refused, the console says why.

- **VM instances** — The SSH connection block shows the default user returned by the API: `Hikube` for Windows, `opc` for Oracle Linux. When it is unknown, the console says so instead of guessing one.

- **VM instances** — Choosing an **Existing** disk when editing a VM no longer offers system disks or disks attached to another VM.

- **Kubernetes** — The first Helm override of Cilium, CoreDNS or Vertical Pod Autoscaler entered when editing a cluster is now saved. The hourly cost follows the console language ("CHF/h").

- **PostgreSQL** — Editing a cluster offers the same replica counts as creation (1, 2 or 3). For a cluster with 2 replicas, this choice is no longer shown empty.

- **Databases** — **Manage Access** shows its own confirmation message, and the **Databases** column of MariaDB and MongoDB users shows the role on each database. The English labels of the PostgreSQL, MariaDB, MongoDB and Redis screens no longer use RabbitMQ vocabulary.

- **Navigation** — The breadcrumb shows a resource name as is, even when it matches a word of the interface: a cluster named `postgres` no longer appears as "PostgreSQL".

- **VM instances** — The "Custom image" card of the wizard explains how to use it: create a disk first, then choose it.

## Security

- **MariaDB and MongoDB** — The cluster creation wizard gave every user a role on the system database (`mysql` for MariaDB, `admin` for MongoDB). It no longer does. For users created before this version, open **Manage Access**: the system database line shows an error there. Remove it.
