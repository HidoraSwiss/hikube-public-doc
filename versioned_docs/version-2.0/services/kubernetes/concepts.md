---
sidebar_position: 2
title: Concepts
---

# Concepts — Kubernetes

## Architecture

Le schéma, ci-après, illustre la structure et les interactions principales du **cluster Kubernetes Hikube**, incluant la haute disponibilité du plan de contrôle, la gestion des nœuds, la persistance des données, et la réplication inter-régions.

<div class="only-light">
  <img src="/img/hikube-kubernetes-architecture.svg" alt="Logo clair"/>
</div>
<div class="only-dark">
  <img src="/img/hikube-kubernetes-architecture-dark.svg" alt="Logo sombre"/>
</div>

---

### Composants principaux du cluster

#### Etcd Cluster

- Contient plusieurs instances d'**etcd** répliquées entre elles.
- Assure la **cohérence du stockage d'état du cluster Kubernetes** (informations sur les pods, services, configurations, etc.).
- La réplication interne entre les nœuds `etcd` garantit la **tolérance aux pannes**.

#### Control Plane

- Composé de l'API Server, du Scheduler et du Controller Manager.
- Rôle :
  - **Planifie les workloads** (pods, déploiements, etc.) sur les nœuds disponibles.
  - **Interagit avec etcd** pour lire/écrire l'état du cluster.

#### Node Groups

- Chaque groupe contient plusieurs **nœuds de travail (worker nodes)**.
- Les workloads (pods) sont déployés sur ces nœuds.
- Les nœuds communiquent avec le Control Plane pour recevoir leurs tâches.
- Ils lisent et écrivent leurs données dans les **Persistent Volume (PV)** Kubernetes.

#### Kubernetes PV Data

- Représente le **stockage persistant** utilisé par les pods.
- Les données des workloads sont **écrites et lues depuis ce stockage**.
- Cette couche est intégrée à la réplication Hikube pour garantir la disponibilité des données.

---

### Couche de réplication Hikube

#### Hikube Replication Data Layer

- Sert d'interface entre Kubernetes et les **systèmes de stockage régionaux**.
- Réplique automatiquement les données des PV vers plusieurs régions pour :
  - la **haute disponibilité**,
  - la **résilience aux pannes régionales**,
  - et la **continuité de service**.

#### Stockages régionaux

- **Region 1** → Geneva Data Storage
- **Region 2** → Gland Data Storage
- **Region 3** → Lucerne Data Storage

Chaque région dispose de son propre backend de stockage, tous synchronisés via la couche Hikube.

---

### Flux de communication

1. Les **nœuds etcd** se synchronisent entre eux pour maintenir un état global cohérent.
2. Le **Control Plane** lit/écrit dans etcd pour stocker l'état du cluster.
3. Le **Control Plane** planifie les workloads sur les **Node Groups**.
4. Les **Node Groups** interagissent avec les **PV Kubernetes** pour stocker ou récupérer des données.
5. Les **PV Data** sont répliquées à travers la **Hikube Replication Data Layer** vers les **3 régions**.

---

### Résumé fonctionnel

| Couche | Fonction principale | Technologie |
|--------|---------------------|-------------|
| Etcd Cluster | Stockage de l'état du cluster | etcd |
| Control Plane | Gestion et planification des workloads | Kubernetes |
| Node Groups | Exécution des workloads | kubelet, container runtime |
| PV Data | Stockage persistant | Kubernetes Persistent Volumes |
| Hikube Data Layer | Réplication et synchronisation multi-régions | Hikube |
| Data Storage | Stockage physique régional | Geneva / Gland / Lucerne |

---

### Objectif global

Cette architecture assure :

- **Haute disponibilité** du cluster Kubernetes.
- **Résilience géographique** grâce à la réplication inter-régions.
- **Intégrité des données** via etcd et le stockage persistant.
- **Scalabilité** horizontale avec les Node Groups.

---

## Control Plane

Le champ `controlPlane` définit la configuration du plan de contrôle du cluster Kubernetes géré.
Il spécifie les ressources allouées à chaque composant clé (API Server, Scheduler, Controller Manager, Konnectivity) et le nombre de réplicas pour la haute disponibilité.

```yaml title="control-plane.yaml"
controlPlane:
  apiServer:
    resources:
      cpu: 2
      memory: 4Gi
    resourcesPreset: small
  controllerManager:
    resources:
      cpu: 2
      memory: 2Gi
    resourcesPreset: small
  konnectivity:
    server:
      resources:
        cpu: 1
        memory: 1Gi
      resourcesPreset: nano
  scheduler:
    resources:
      cpu: 1
      memory: 512Mi
    resourcesPreset: micro
  replicas: 3
```

---

### `apiServer` (Object)

Le `apiServer` est le composant central du plan de contrôle Kubernetes.
Il gère toutes les requêtes vers l'API Kubernetes et assure la communication entre les composants internes du cluster.

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `resources` | Object | Oui | Définit les ressources CPU et mémoire allouées à l'API Server |
| `resources.cpu` | string | Non | Nombre de vCPU attribués (ex: `2`) |
| `resources.memory` | string | Non | Quantité de mémoire allouée (ex: `4Gi`) |
| `resourcesPreset` | string | Oui | Profil de ressources prédéfini (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) |

### `controllerManager` (Object)

Le `controllerManager` exécute les **boucles de contrôle** Kubernetes (reconciliation loops).
Il assure la création, la mise à jour et la suppression des ressources (pods, services, etc.) en fonction de l'état désiré du cluster.

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `resources` | Object | Oui | Spécifie les ressources CPU/mémoire pour le Controller Manager |
| `resources.cpu` | string | Non | Nombre de vCPU réservés |
| `resources.memory` | string | Non | Quantité de mémoire allouée |
| `resourcesPreset` | string | Oui | Taille prédéfinie (`nano`, `micro`, `small`, `medium`, etc.) |

### `konnectivity` (Object)

Le service **Konnectivity** gère la communication sécurisée entre le plan de contrôle et les nœuds (agents).
Il remplace l'ancien `kube-proxy` pour les connexions sortantes des nœuds et optimise la connectivité réseau.

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `server.resources` | Object | Oui | Spécifie les ressources CPU/mémoire du serveur Konnectivity |
| `server.resources.cpu` | string | Non | Nombre de vCPU |
| `server.resources.memory` | string | Non | Quantité de mémoire |
| `server.resourcesPreset` | string | Oui | Profil prédéfini (`nano`, `micro`, `small`, `medium`, etc.) |

### `scheduler` (Object)

Le `scheduler` détermine sur quel nœud chaque pod doit être exécuté en fonction des contraintes de ressources, affinités, et topologies.

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `resources` | Object | Oui | Définit les ressources allouées au Scheduler |
| `resources.cpu` | string | Non | Nombre de vCPU |
| `resources.memory` | string | Non | Quantité de mémoire |
| `resourcesPreset` | string | Oui | Taille prédéfinie (`nano`, `micro`, `small`, `medium`, etc.) |

### `replicas` (integer)

Le champ `replicas` définit le **nombre d'instances du plan de contrôle**.
Un nombre impair de réplicas (généralement `3`) est recommandé pour garantir la haute disponibilité et le quorum dans `etcd`.

---

### Types de resourcesPreset

```yaml
resourcesPreset: "nano"     # 0.1 CPU, 128 MiB RAM
resourcesPreset: "micro"    # 0.25 CPU, 256 MiB RAM
resourcesPreset: "small"    # 0.5 CPU, 512 MiB RAM
resourcesPreset: "medium"   # 0.5 CPU, 1 GiB RAM
resourcesPreset: "large"    # 1 CPU, 2 GiB RAM
resourcesPreset: "xlarge"   # 2 CPU, 4 GiB RAM
resourcesPreset: "2xlarge"  # 4 CPU, 8 GiB RAM
```

:::tip Bonnes pratiques Control Plane
- Toujours définir `replicas: 3` pour la redondance.
- Utiliser des `resourcesPreset` cohérents entre les composants.
- Adapter les ressources en fonction de la charge (clusters de production → `medium` ou `large`).
- Ne pas sous-dimensionner `apiServer`, c'est le composant le plus sollicité.
:::

---

## Node Groups

Le champ `nodeGroup` définit la configuration d'un groupe de nœuds (workers) au sein du cluster Kubernetes.
Il permet de spécifier le type d'instance, les ressources, le nombre de réplicas, ainsi que les rôles et les GPU associés.

```yaml title="node-group.yaml"
nodeGroup:
  <name>:
    ephemeralStorage:
      size: 100Gi
    gpus:
      - name: nvidia.com/AD102GL_L40S
    instanceType: m5.large
    maxReplicas: 5
    minReplicas: 2
    resources:
      cpu: 4
      memory: 16Gi
    roles:
      - ingress-nginx
```

---

### `ephemeralStorage` (Object)

Définit la configuration du **stockage éphémère** associé aux nœuds du groupe.
Ce stockage est utilisé pour les données temporaires, les caches ou les fichiers de logs.

### `gpus` (Array)

Liste les **GPU** disponibles sur les nœuds du groupe, utilisés pour des charges de travail nécessitant de la puissance de calcul (IA, ML, etc.).

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `name` | string | Oui | Nom du GPU ou type de carte (`nvidia.com/AD102GL_L40S` ou `nvidia.com/GA100_A100_PCIE_80GB`) |

### `instanceType` (string)

Spécifie le **type d'instance** utilisé pour les nœuds.

#### Série S (Standard) — Ratio 1:2

Optimisée pour workloads généraux avec CPU partagé et burstable.

```yaml
instanceType: "s1.small"     # 1 vCPU, 2 GB RAM
instanceType: "s1.medium"    # 2 vCPU, 4 GB RAM
instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
instanceType: "s1.xlarge"    # 8 vCPU, 16 GB RAM
instanceType: "s1.3large"    # 12 vCPU, 24 GB RAM
instanceType: "s1.2xlarge"   # 16 vCPU, 32 GB RAM
instanceType: "s1.3xlarge"   # 24 vCPU, 48 GB RAM
instanceType: "s1.4xlarge"   # 32 vCPU, 64 GB RAM
instanceType: "s1.8xlarge"   # 64 vCPU, 128 GB RAM
```

#### Série U (Universal) — Ratio 1:4

Optimisée pour workloads équilibrés avec plus de mémoire.

```yaml
instanceType: "u1.medium"    # 1 vCPU, 4 GB RAM
instanceType: "u1.large"     # 2 vCPU, 8 GB RAM
instanceType: "u1.xlarge"    # 4 vCPU, 16 GB RAM
instanceType: "u1.2xlarge"   # 8 vCPU, 32 GB RAM
instanceType: "u1.4xlarge"   # 16 vCPU, 64 GB RAM
instanceType: "u1.8xlarge"   # 32 vCPU, 128 GB RAM
```

#### Série M (Memory Optimized) — Ratio 1:8

Optimisée pour applications nécessitant beaucoup de mémoire.

```yaml
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
instanceType: "m1.8xlarge"   # 32 vCPU, 256 GB RAM
```

### `maxReplicas` / `minReplicas` (integer)

- `maxReplicas` : nombre **maximal** de nœuds pouvant être déployés (limite l'autoscaling).
- `minReplicas` : nombre **minimal** de nœuds garantis dans ce groupe.

### `resources` (Object)

Définit les **ressources allouées** à chaque nœud du groupe (CPU et mémoire).

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `cpu` | string | Non | Nombre de vCPU attribués par nœud (ex : `4`) |
| `memory` | string | Non | Quantité de mémoire allouée par nœud (ex : `16Gi`) |

### `roles` (Array)

Liste les **rôles** assignés aux nœuds du groupe (ex : `ingress-nginx`).

---

### Exemples de Node Groups

#### Node Group Général

```yaml title="node-group-general.yaml"
nodeGroups:
  general:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    ephemeralStorage: 50Gi
    roles:
      - ingress-nginx
```

#### Node Group Compute Intensif

```yaml title="node-group-compute.yaml"
nodeGroups:
  compute:
    minReplicas: 0
    maxReplicas: 5
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    ephemeralStorage: 100Gi
    roles: []
```

#### Node Group Memory Optimized

```yaml title="node-group-memory.yaml"
nodeGroups:
  memory-intensive:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
    ephemeralStorage: 30Gi
    resources:
      cpu: "6"       # Override: 6 vCPU au lieu de 4
      memory: "48Gi" # Override: 48 GB au lieu de 32
```

:::tip Bonnes pratiques Node Groups
- Ajuster `minReplicas` et `maxReplicas` en fonction des besoins de montée en charge.
- Utiliser des `instanceType` cohérents avec la charge de travail.
- Définir un stockage éphémère suffisant pour les charges temporaires (logs, caches).
- Spécifier clairement les rôles pour segmenter les fonctions des nœuds (ex : séparation `worker` / `ingress`).
:::
