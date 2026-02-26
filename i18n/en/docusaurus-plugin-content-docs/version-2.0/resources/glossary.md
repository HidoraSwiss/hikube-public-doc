---
sidebar_position: 3
title: Glossary
---

# Hikube Glossary

Find here the definitions of terms and concepts used throughout the Hikube documentation.

---

| **Term** | **Definition** | **Documentation** |
|-----------|---------------|-------------------|
| **Add-on / Plugin** | An extension that can be enabled on a Kubernetes cluster (cert-manager, ingress-nginx, monitoring, etc.) to add functionality without manual configuration. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **AMQP** | Advanced Message Queuing Protocol. A standard messaging protocol used notably by RabbitMQ for communication between applications. | [RabbitMQ Overview](../services/messaging/rabbitmq/overview.md) |
| **ClickHouse Keeper** | A distributed consensus service built into ClickHouse, used for cluster node coordination (alternative to ZooKeeper). | [ClickHouse Overview](../services/databases/clickhouse/overview.md) |
| **Cloud-init** | An automatic initialization tool for virtual machines at first boot. It allows configuring users, packages, scripts, and networking via a YAML file. | [Compute API Reference](../services/compute/api-reference.md) |
| **CNI (Container Network Interface)** | A standard that defines network management for containers in a Kubernetes cluster. Hikube uses Cilium as the default CNI. | [Kubernetes Overview](../services/kubernetes/overview.md) |
| **Control Plane** | The set of components that manage the state of the Kubernetes cluster (API server, scheduler, controller manager). The number of replicas determines high availability. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **Golden Image** | A preconfigured base image for virtual machines, optimized for a given operating system (Ubuntu, Rocky Linux, etc.). | [Compute Overview](../services/compute/overview.md) |
| **Ingress / IngressClass** | A Kubernetes resource that manages external HTTP/HTTPS access to cluster services. IngressClass defines the controller used (nginx, traefik, etc.). | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **JetStream** | A streaming and persistence system built into NATS, enabling durable message storage, replay, and guaranteed delivery. | [NATS Overview](../services/messaging/nats/overview.md) |
| **Kubeconfig** | A configuration file containing access information for a Kubernetes cluster (server URL, certificates, tokens). Required to use `kubectl`. | [Kubernetes Quick Start](../services/kubernetes/quick-start.md) |
| **Namespace** | A logical space within a Kubernetes cluster used to isolate and organize resources. Each tenant has dedicated namespaces. | [Key Concepts](../getting-started/concepts.md) |
| **NodeGroup** | A group of worker nodes in a Kubernetes cluster with shared characteristics (instance type, min/max scaling, roles). Allows adapting resources to different workloads. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **Operator** | A Kubernetes pattern that automates the management of complex applications. Hikube uses specialized operators: Spotahome (Redis), CloudNativePG (PostgreSQL), etc. | [Redis Overview](../services/databases/redis/overview.md) |
| **PVC (PersistentVolumeClaim)** | A persistent storage request in Kubernetes. Allows pods to retain data beyond their lifecycle. The size is defined by the `size` parameter. | [Kubernetes Quick Start](../services/kubernetes/quick-start.md) |
| **Quorum Queues** | A RabbitMQ queue type based on Raft consensus, providing strong replication and fault tolerance for critical messages. | [RabbitMQ Overview](../services/messaging/rabbitmq/overview.md) |
| **ResourcesPreset** | A predefined resource profile (nano, micro, small, medium, large, xlarge, 2xlarge) that simplifies CPU/memory allocation for managed services. | [Redis API Reference](../services/databases/redis/api-reference.md) |
| **Sentinel** | A Redis component that continuously monitors the cluster state, detects master failures, and automatically orchestrates failover to a replica. | [Redis Overview](../services/databases/redis/overview.md) |
| **Shard / Replica** | A **shard** is a horizontal data partition (used by ClickHouse). A **replica** is a copy of the data for high availability and fault tolerance. | [ClickHouse Overview](../services/databases/clickhouse/overview.md) |
| **StorageClass** | Defines the type of storage used for persistent volumes. `replicated` provides data replication across multiple datacenters for high availability. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **Tenant / Sub-tenant** | An isolated and secure environment within Hikube. A tenant can contain sub-tenants to separate environments (production, staging, development). | [Key Concepts](../getting-started/concepts.md) |
