---
sidebar_position: 3
title: Glossary
---

# Hikube glossary

Find here the definitions of the terms and concepts used in the Hikube documentation.

---

| **Term** | **Definition** | **Documentation** |
|-----------|---------------|-------------------|
| **External access** | Option of databases and RabbitMQ that assigns a public IP to the cluster; the address is shown in the **Host** field of the detail page. | [PostgreSQL - Concepts](../services/databases/postgresql/concepts.md) |
| **Add-on / Extension** | Component that can be enabled on a Kubernetes cluster from the **Addons** step of the wizard (cert-manager, Ingress NGINX, monitoring, etc.). | [Kubernetes - Concepts](../services/kubernetes/concepts.md) |
| **AMQP** | Advanced Message Queuing Protocol. Standard messaging protocol used notably by RabbitMQ for communication between applications. | [RabbitMQ - Overview](../services/messaging/rabbitmq/overview.md) |
| **ClickHouse Keeper** | Distributed consensus service built into ClickHouse, used to coordinate the cluster nodes (alternative to ZooKeeper). | [ClickHouse - Overview](../services/databases/clickhouse/overview.md) |
| **Cloud-init** | Tool that automatically initializes virtual machines at first boot: users, packages, scripts, network. The script is entered in the VM creation wizard. | [Configure cloud-init](../services/compute/how-to/configure-cloud-init.md) |
| **CNI (Container Network Interface)** | Standard defining network management for containers in a Kubernetes cluster. Hikube uses Cilium as its CNI. | [Kubernetes - Overview](../services/kubernetes/overview.md) |
| **Console** | Hikube's web interface, [console.hikube.cloud](https://console.hikube.cloud), from which you manage all your resources. | [Key concepts](../getting-started/concepts.md) |
| **Control Plane** | Set of components that manage the state of the Kubernetes cluster (API server, scheduler, controller manager). Its size and number of instances are chosen when the cluster is created. | [Kubernetes - Concepts](../services/kubernetes/concepts.md) |
| **Disk** | Persistent block storage volume attached to a virtual machine (system or data disk), managed in **Infrastructure** → **Disks**. | [Disks - Overview](../services/storage/disks/overview.md) |
| **Golden Image** | Preconfigured base image for virtual machines, optimized for a given operating system (Ubuntu, Rocky Linux, Windows Server, etc.). | [Virtual machines - Overview](../services/compute/overview.md) |
| **Node group** | Set of worker nodes in a Kubernetes cluster sharing an instance type, autoscaling bounds (minimum/maximum) and, where applicable, a GPU. | [Manage node groups](../services/kubernetes/how-to/manage-node-groups.md) |
| **Ingress / IngressClass** | Kubernetes resource that manages external HTTP/HTTPS access to the cluster's services. IngressClass defines the controller used. | [Ingress NGINX](../services/kubernetes/plugins/ingress-nginx.md) |
| **JetStream** | Streaming and persistence system built into NATS, enabling durable message storage, replay and guaranteed delivery. | [NATS - Overview](../services/messaging/nats/overview.md) |
| **Kubeconfig** | Access file for a Kubernetes cluster (server URL, certificates). Your cluster's kubeconfig is downloaded from its detail page in the console (**Kubeconfig** button). | [Kubernetes - Quick start](../services/kubernetes/quick-start.md) |
| **Organization** | Entity that represents your company in Hikube. It groups your users and your projects; it is created by Hidora. | [Key concepts](../getting-started/concepts.md) |
| **Preset** | Predefined resource profile (`nano` to `2xlarge`) offered in the database wizards to size CPU and memory. | [PostgreSQL - Concepts](../services/databases/postgresql/concepts.md) |
| **Project** | Isolated space within an organization that groups resources and carries quotas (CPU, memory, storage). Formerly called **tenant**. | [Key concepts](../getting-started/concepts.md) |
| **PVC (PersistentVolumeClaim)** | Request for persistent storage in a Kubernetes cluster. Allows pods to keep data beyond their lifecycle. | [Kubernetes - Concepts](../services/kubernetes/concepts.md) |
| **Quorum Queues** | RabbitMQ queue type based on Raft consensus, providing strong replication and fault tolerance for critical messages. | [RabbitMQ - Overview](../services/messaging/rabbitmq/overview.md) |
| **Quota** | CPU, memory or storage limit of a project. The wizards show the impact of each creation on the quota. | [Key concepts](../getting-started/concepts.md#quotas) |
| **Sentinel** | Redis component that monitors the cluster state, detects master failures and automatically orchestrates failover to a replica. | [Redis - Overview](../services/databases/redis/overview.md) |
| **Shard / Replica** | A **shard** is a horizontal partition of the data (MongoDB, ClickHouse). A **replica** is a copy of the data for high availability. | [MongoDB - Concepts](../services/databases/mongodb/concepts.md) |
| **StorageClass** | Storage type of persistent volumes in a Kubernetes cluster. `replicated` replicates data across several datacenters. | [Kubernetes - Concepts](../services/kubernetes/concepts.md) |
| **Instance type** | CPU and memory size of a VM or Kubernetes node (`s1`, `u1`, `m1` series). | [Virtual machines - Concepts](../services/compute/concepts.md) |
| **VPC** | Virtual private network of a project, divided into subnets, that connects your VMs to one another. Managed in **Infrastructure** → **Networking**. | [Networking - Overview](../services/networking/overview.md) |
