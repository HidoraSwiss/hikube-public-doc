---
sidebar_position: 4
title: Node Group
---

---
sidebar_position: 4
title: Node Group
---

# 🧩 Détails du champ `nodeGroup`

Le champ `nodeGroup` définit la configuration d’un groupe de nœuds (workers) au sein du cluster Kubernetes.
Il permet de spécifier le type d’instance, les ressources, le nombre de réplicas, ainsi que les rôles et les GPU associés.

```yaml
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

## `ephemeralStorage` (Object) — **Obligatoire**

### Description
Définit la configuration du **stockage éphémère** associé aux nœuds du groupe.
Ce stockage est utilisé pour les données temporaires, les caches ou les fichiers de logs.

### Exemple
```yaml
ephemeralStorage:
  size: 100Gi
```

---

## `gpus` (Array)

### Description
Liste les **GPU** disponibles sur les nœuds du groupe, utilisés pour des charges de travail nécessitant de la puissance de calcul (IA, ML, etc.).

### Champs internes
| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `name` | string | ✅ | Nom du GPU ou type de carte (nvidia.com/AD102GL_L40S ou nvidia.com/GA100_A100_PCIE_80GB) |

### Exemple
```yaml
gpus:
  - name: nvidia.com/AD102GL_L40S
```

---

## `instanceType` (string) — **Obligatoire**

### Description
Spécifie le **type d’instance** utilisé pour les nœuds.
Ce paramètre détermine les ressources de base disponibles (CPU, mémoire, stockage, etc.).

### Exemple
```yaml
instanceType: s1.small
```

### **Types d'Instances Disponibles**

#### **Série S (Standard) - Ratio 1:2**

Optimisée pour workloads généraux avec CPU partagé et burstable.

```yaml
# Instances disponibles
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

#### **Série U (Universal) - Ratio 1:4**

Optimisée pour workloads équilibrés avec plus de mémoire.

```yaml
# Instances disponibles
instanceType: "u1.medium"    # 1 vCPU, 4 GB RAM
instanceType: "u1.large"     # 2 vCPU, 8 GB RAM
instanceType: "u1.xlarge"    # 4 vCPU, 16 GB RAM
instanceType: "u1.2xlarge"   # 8 vCPU, 32 GB RAM
instanceType: "u1.4xlarge"   # 16 vCPU, 64 GB RAM
instanceType: "u1.8xlarge"   # 32 vCPU, 128 GB RAM
```

#### **Série M (Memory Optimized) - Ratio 1:8**

Optimisée pour applications nécessitant beaucoup de mémoire.

```yaml
# Instances disponibles
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
instanceType: "m1.8xlarge"   # 32 vCPU, 256 GB RAM
```

---

## `maxReplicas` (integer) — **Obligatoire**

### Description
Nombre **maximal** de nœuds pouvant être déployés dans ce groupe.
Ce champ permet de **limiter l’autoscaling** du cluster.

### Exemple
```yaml
maxReplicas: 5
```

---

## `minReplicas` (integer) — **Obligatoire**

### Description
Nombre **minimal** de nœuds garantis dans ce groupe.
Ce paramètre assure une capacité minimale même lorsque la charge est faible.

### Exemple
```yaml
minReplicas: 2
```

---

## `resources` (Object) — **Obligatoire**

### Description
Définit les **ressources allouées** à chaque nœud du groupe (CPU et mémoire).
Ces valeurs peuvent être utilisées pour ajuster la taille et la performance des nœuds.

### Champs internes
| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `cpu` | Object | ❌ | Nombre de vCPU attribués par nœud (ex : `4`) |
| `memory` | Object | ❌ | Quantité de mémoire allouée par nœud (ex : `16Gi`) |

### Exemple
```yaml
resources:
  cpu: 4
  memory: 16Gi
```

---

## `roles` (Array)

### Description
Liste les **rôles** assignés aux nœuds du groupe.
Ces rôles peuvent être utilisés pour organiser les responsabilités au sein du cluster.

### Exemple
```yaml
roles:
  - ingress-nginx
```

---

# **Exemples de Node Groups**

## **Node Group Général**

```yaml
nodeGroups:
  general:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    ephemeralStorage: 50Gi
    roles:
      - ingress-nginx
```

## **Node Group Compute Intensif**

```yaml
nodeGroups:
  compute:
    minReplicas: 0
    maxReplicas: 5
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    ephemeralStorage: 100Gi
    roles: []
```

## **Node Group Memory Optimized**

```yaml
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

---

# 💡 Bonnes pratiques

- Ajuster `minReplicas` et `maxReplicas` en fonction des besoins de montée en charge.
- Utiliser des `instanceType` cohérents avec la charge de travail (ex : GPU → `p3`, CPU intensif → `c5`).
- Définir un stockage éphémère suffisant pour les charges temporaires (logs, caches).
- Spécifier clairement les rôles pour segmenter les fonctions des nœuds (ex : séparation `worker` / `ingress`).
- Surveiller l’utilisation des ressources pour ajuster `cpu` et `memory` au fil du temps.

---
