---
sidebar_position: 2
title: Architecture
---

# Hikube Kubernetes Architecture

The diagram below illustrates the structure and main interactions of the **Hikube Kubernetes cluster**, including high availability of the control plane, node management, data persistence, and inter-region replication.

<div class="only-light">
  <img src="/img/hikube-kubernetes-architecture.svg" alt="Light logo"/>
</div>
<div class="only-dark">
  <img src="/img/hikube-kubernetes-architecture-dark.svg" alt="Dark logo"/>
</div>
---

## 🧩 1. Main Components of the Cluster

### 🔹 Etcd Cluster

* Contains multiple replicated **etcd** instances.
* Ensures **consistent storage of the Kubernetes cluster state** (information about pods, services, configurations, etc.).
* Internal replication between `etcd` nodes guarantees **fault tolerance**.

### 🔹 Control Plane

* Composed of the API Server, Scheduler, and Controller Manager.
* Responsibilities:

  * **Schedules workloads** (pods, deployments, etc.) across available nodes.
  * **Interacts with etcd** to read/write the cluster state.

### 🔹 Node Groups

* Each group contains several **worker nodes**.
* Workloads (pods) are deployed on these nodes.
* Nodes communicate with the Control Plane to receive their tasks.
* They read and write their data into **Kubernetes Persistent Volumes (PV)**.

### 🔹 Kubernetes PV Data

* Represents the **persistent storage** used by pods.
* Workload data is **written to and read from this storage**.
* This layer is integrated with Hikube replication to ensure data availability.

---

## 🗄️ 2. Hikube Replication Layer

### Hikube Replication Data Layer

* Serves as an interface between Kubernetes and **regional storage systems**.
* Automatically replicates PV data to multiple regions to provide:

  * **High availability**,
  * **Regional fault tolerance**,
  * and **service continuity**.

### Regional Storage

* **Region 1** → Geneva Data Storage
* **Region 2** → Gland Data Storage
* **Region 3** → Lucerne Data Storage

Each region has its own storage backend, all synchronized through the Hikube layer.

---

## 🔁 3. Communication Flow

1. **Etcd nodes** synchronize with one another to maintain a consistent global state.
2. The **Control Plane** reads/writes to etcd to store cluster state.
3. The **Control Plane** schedules workloads on the **Node Groups**.
4. **Node Groups** interact with **Kubernetes PVs** to store or retrieve data.
5. **PV Data** is replicated through the **Hikube Replication Data Layer** across the **3 regions**.

---

## ⚙️ 4. Functional Summary

| Layer             | Main Function                                | Technology                    |
| ----------------- | -------------------------------------------- | ----------------------------- |
| Etcd Cluster      | Cluster state storage                        | etcd                          |
| Control Plane     | Workload management and scheduling           | Kubernetes                    |
| Node Groups       | Workload execution                           | kubelet, container runtime    |
| PV Data           | Persistent storage                           | Kubernetes Persistent Volumes |
| Hikube Data Layer | Multi-region replication and synchronization | Hikube                        |
| Data Storage      | Physical regional storage                    | Geneva / Gland / Lucerne      |

---

## 🌍 5. Overall Objective

This architecture ensures:

* **High availability** of the Kubernetes cluster
* **Geographic resilience** through inter-region replication
* **Data integrity** via etcd and persistent storage
* **Horizontal scalability** with Node Groups

---
