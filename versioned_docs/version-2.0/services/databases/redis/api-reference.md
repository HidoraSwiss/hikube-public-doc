---
sidebar_position: 3
title: Référence API
---

# Référence API Redis

Cette référence détaille l’utilisation de **Redis** sur Hikube, en mettant en avant sa rapidité et sa polyvalence en tant que **data store in-memory** et système de **cache distribué**.  
Le service managé simplifie le déploiement et la gestion des clusters Redis, garantissant une **haute disponibilité**, une **faible latence** et des performances optimales pour vos applications.  

Le service s’appuie sur l’opérateur **[Spotahome Redis Operator](https://github.com/spotahome/redis-operator)**, qui assure l’orchestration, la réplication et la supervision des clusters Redis.  

---

## Structure de Base

### **Ressource Redis**
#### Exemple de configuration YAML
```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
  namespace: default
spec:
```

---

## Paramètres

### **Paramètres Communs**
| **Paramètre**     | **Type**   | **Description**                                                                 | **Valeur par défaut** | **Requis** |
|--------------------|------------|---------------------------------------------------------------------------------|------------------------|------------|
| `replicas`         | `int`      | Nombre de réplicas Redis (instances dans le cluster)                            | `2`                    | Oui        |
| `resources`        | `object`   | Configuration CPU et mémoire explicite de chaque réplique Redis. Si vide, `resourcesPreset` est appliqué | `{}`                   | Non        |
| `resources.cpu`    | `quantity` | CPU disponible par réplique                                                     | `null`                 | Non        |
| `resources.memory` | `quantity` | RAM disponible par réplique                                                     | `null`                 | Non        |
| `resourcesPreset`  | `string`   | Profil de ressources prédéfini (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"nano"`              | Oui        |
| `size`             | `quantity` | Taille du volume persistant (PVC) pour les données                              | `1Gi`                  | Oui        |
| `storageClass`     | `string`   | Classe de stockage utilisée                                                     | `""`                   | Non        |
| `external`         | `bool`     | Activer l’accès externe au cluster (LoadBalancer)                               | `false`                | Non        |
| `authEnabled`      | `bool`     | Activer l’authentification par mot de passe (stockée dans un Secret Kubernetes) | `true`                 | Non        |


#### Exemple de configuration YAML

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
  namespace: default
spec:
  # Nombre de réplicas Redis (haute dispo si >1)
  replicas: 3

  # Ressources allouées par instance
  resources:
    cpu: 1000m      # 1 vCPU
    memory: 1Gi     # 1 GiB de RAM

  # Taille du disque persistant pour chaque instance
  size: 2Gi
  storageClass: replicated

  # Activer l’authentification Redis
  # Si true, un mot de passe est généré automatiquement
  authEnabled: true

  # Exposer le service Redis à l’extérieur du cluster
  external: true
  ```

  ---

### **Paramètres d'application spécifique**

| **Paramètre**   | **Type** | **Description**                  | **Valeur par défaut** | **Requis** |
|------------------|----------|----------------------------------|------------------------|------------|
| `authEnabled`    | `bool`   | Active la génération d’un mot de passe (stocké dans un Secret Kubernetes) | `true` | Non |


#### Exemple de configuration YAML

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
  namespace: default
spec:
  replicas: 3
  resources:
    cpu: 1000m 
    memory: 1Gi 
  size: 2Gi
  storageClass: replicated
  # Activer l’authentification Redis
  # Si true, un mot de passe est généré automatiquement
  authEnabled: false
  # Exposer le service Redis à l’extérieur du cluster
  external: false
```

### resources et resourcesPreset  

Le champ `resources` permet de définir explicitement la configuration CPU et mémoire de chaque réplique PostgreSQL.  
Si ce champ est laissé vide, la valeur du paramètre `resourcesPreset` est utilisée.  

#### Exemple de configuration YAML
```yaml title="redis.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```  

⚠️ Attention : si resources est défini, la valeur de resourcesPreset est ignorée.

| **Preset name** | **CPU** | **Mémoire** |
|-----------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |