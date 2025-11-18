---
sidebar_position: 3
title: Control Plane
---

# 🧩 Détails du champ `controlPlane`

Le champ `controlPlane` définit la configuration du plan de contrôle du cluster Kubernetes géré.
Il spécifie les ressources allouées à chaque composant clé (API Server, Scheduler, Controller Manager, Konnectivity) et le nombre de réplicas pour la haute disponibilité.

```yaml
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

## `apiServer` (Object) — **Obligatoire**

### Description
Le `apiServer` est le composant central du plan de contrôle Kubernetes.
Il gère toutes les requêtes vers l’API Kubernetes et assure la communication entre les composants internes du cluster.

### Champs internes
| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `resources` | Object | ✅ | Définit les ressources CPU et mémoire allouées à l’API Server |
| `resources.cpu` | string | ❌ | Nombre de vCPU attribués (ex: `2`) |
| `resources.memory` | string | ❌ | Quantité de mémoire allouée (ex: `4Gi`) |
| `resourcesPreset` | string | ✅ | Profil de ressources prédéfini pour simplifier la configuration |
| | | | Valeurs possibles : `nano`, `micro`, `small`, `medium`, `large`, ... |

### Exemple
```yaml
apiServer:
  resources:
    cpu: 2
    memory: 4Gi
  resourcesPreset: small
```

---

## `controllerManager` (Object) — **Obligatoire**

### Description
Le `controllerManager` exécute les **boucles de contrôle** Kubernetes (reconciliation loops).
Il assure la création, la mise à jour et la suppression des ressources (pods, services, etc.) en fonction de l’état désiré du cluster.

### Champs internes
| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `resources` | Object | ✅ | Spécifie les ressources CPU/mémoire pour le Controller Manager |
| `resources.cpu` | Object | ❌ | Nombre de vCPU réservés |
| `resources.memory` | Object | ❌ | Quantité de mémoire allouée |
| `resourcesPreset` | string | ✅ | Taille prédéfinie (`nano`, `micro`, `small`, `medium`, etc.) |

### Exemple
```yaml
controllerManager:
  resources:
    cpu: 2
    memory: 2Gi
  resourcesPreset: small
```

---

## `konnectivity` (Object) — **Obligatoire**

### Description
Le service **Konnectivity** gère la communication sécurisée entre le plan de contrôle et les nœuds (agents).
Il remplace l’ancien `kube-proxy` pour les connexions sortantes des nœuds et optimise la connectivité réseau.

### Sous-champ : `server`
Définit la configuration du serveur Konnectivity responsable des connexions multiplexées entre control plane et nodes.

#### Champs internes
| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `resources` | Object | ✅ | Spécifie les ressources CPU/mémoire du serveur Konnectivity |
| `resources.cpu` | Object | ❌ | Nombre de vCPU |
| `resources.memory` | Object | ❌ | Quantité de mémoire |
| `resourcesPreset` | string | ✅ | Profil prédéfini (`nano`, `micro`, `small`, `medium`, etc.) |

### Exemple
```yaml
konnectivity:
  server:
    resources:
      cpu: 1
      memory: 1Gi
    resourcesPreset: nano
```

---

## `scheduler` (Object) — **Obligatoire**

### Description
Le `scheduler` détermine sur quel nœud chaque pod doit être exécuté en fonction des contraintes de ressources, affinités, et topologies.
Il est essentiel pour la performance et l’équilibrage du cluster.

### Champs internes
| Champ | Type | Obligatoire | Description |
|-------|------|-------------|--------------|
| `resources` | Object | ✅ | Définit les ressources allouées au Scheduler |
| `resources.cpu` | Object | ❌ | Nombre de vCPU |
| `resources.memory` | Object | ❌ | Quantité de mémoire |
| `resourcesPreset` | string | ✅ | Taille prédéfinie (`nano`, `micro`, `small`, `medium`, etc.) |

### Exemple
```yaml
scheduler:
  resources:
    cpu: 1
    memory: 512Mi
  resourcesPreset: micro
```

---

## `replicas` (integer) — **Obligatoire**

### Description
Le champ `replicas` définit le **nombre d’instances du plan de contrôle**.
Un nombre impair de réplicas (généralement `3`) est recommandé pour garantir la haute disponibilité et le quorum dans `etcd`.

### Exemple
```yaml
replicas: 3
```

---

## **Types de resourcesPreset**

```yaml
# Instances disponibles
resourcesPreset: "nano"     # 0.1 CPU, 128 MiB RAM
resourcesPreset: "micro"    # 0.25 CPU, 256 MiB RAM
resourcesPreset: "small"    # 0.5 CPU, 512 MiB RAM
resourcesPreset: "medium"   # 0.5 CPU, 1 GiB RAM
resourcesPreset: "large"    # 1 CPU, 2 GiB RAM
resourcesPreset: "xlarge"   # 2 CPU, 4 GiB RAM
resourcesPreset: "2xlarge"  # 4 CPU, 8 GiB RAM
```

---

## 💡 Bonnes pratiques

- Toujours définir `replicas: 3` pour la redondance.
- Utiliser des `resourcesPreset` cohérents entre les composants.
- Adapter les ressources en fonction de la charge (clusters de production → `medium` ou `large`).
- Ne pas sous-dimensionner `apiServer`, c’est le composant le plus sollicité.
