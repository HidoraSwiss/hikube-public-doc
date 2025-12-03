---
sidebar_position: 2
title: Architecture
---

# Architecture Hikube Kubernetes

Le schéma, ci-après, illustre la structure et les interactions principales du **cluster Kubernetes Hikube**, incluant la haute disponibilité du plan de contrôle, la gestion des nœuds, la persistance des données, et la réplication inter-régions.

<div class="only-light">
  <img src="/img/hikube-kubernetes-architecture.svg" alt="Logo clair"/>
</div>
<div class="only-dark">
  <img src="/img/hikube-kubernetes-architecture-dark.svg" alt="Logo sombre"/>
</div>
---

## 🧩 1. Composants principaux du cluster

### 🔹 Etcd Cluster

- Contient plusieurs instances d’**etcd** répliquées entre elles.
- Assure la **cohérence du stockage d’état du cluster Kubernetes** (informations sur les pods, services, configurations, etc.).
- La réplication interne entre les nœuds `etcd` garantit la **tolérance aux pannes**.

### 🔹 Control Plane

- Composé de l’API Server, du Scheduler et du Controller Manager.
- Rôle :
  - **Planifie les workloads** (pods, déploiements, etc.) sur les nœuds disponibles.
  - **Interagit avec etcd** pour lire/écrire l’état du cluster.

### 🔹 Node Groups

- Chaque groupe contient plusieurs **nœuds de travail (worker nodes)**.
- Les workloads (pods) sont déployés sur ces nœuds.
- Les nœuds communiquent avec le Control Plane pour recevoir leurs tâches.
- Ils lisent et écrivent leurs données dans les **Persistent Volume (PV)** Kubernetes.

### 🔹 Kubernetes PV Data

- Représente le **stockage persistant** utilisé par les pods.
- Les données des workloads sont **écrites et lues depuis ce stockage**.
- Cette couche est intégrée à la réplication Hikube pour garantir la disponibilité des données.

---

## 🗄️ 2. Couche de réplication Hikube

### Hikube Replication Data Layer

- Sert d’interface entre Kubernetes et les **systèmes de stockage régionaux**.
- Réplique automatiquement les données des PV vers plusieurs régions pour :
  - la **haute disponibilité**,
  - la **résilience aux pannes régionales**,
  - et la **continuité de service**.

### Stockages régionaux

- **Region 1** → Geneva Data Storage
- **Region 2** → Gland Data Storage
- **Region 3** → Lucerne Data Storage

Chaque région dispose de son propre backend de stockage, tous synchronisés via la couche Hikube.

---

## 🔁 3. Flux de communication

1. Les **nœuds etcd** se synchronisent entre eux pour maintenir un état global cohérent.
2. Le **Control Plane** lit/écrit dans etcd pour stocker l’état du cluster.
3. Le **Control Plane** planifie les workloads sur les **Node Groups**.
4. Les **Node Groups** interagissent avec les **PV Kubernetes** pour stocker ou récupérer des données.
5. Les **PV Data** sont répliquées à travers la **Hikube Replication Data Layer** vers les **3 régions**.

---

## ⚙️ 4. Résumé fonctionnel

| Couche | Fonction principale | Technologie |
|--------|---------------------|-------------|
| Etcd Cluster | Stockage de l’état du cluster | etcd |
| Control Plane | Gestion et planification des workloads | Kubernetes |
| Node Groups | Exécution des workloads | kubelet, container runtime |
| PV Data | Stockage persistant | Kubernetes Persistent Volumes |
| Hikube Data Layer | Réplication et synchronisation multi-régions | Hikube |
| Data Storage | Stockage physique régional | Geneva / Gland / Lucerne |

---

## 🌍 5. Objectif global

Cette architecture assure :

- **Haute disponibilité** du cluster Kubernetes.
- **Résilience géographique** grâce à la réplication inter-régions.
- **Intégrité des données** via etcd et le stockage persistant.
- **Scalabilité** horizontale avec les Node Groups.

---
