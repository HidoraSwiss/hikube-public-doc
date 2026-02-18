---
sidebar_position: 2
title: FAQ
---

# Questions fréquentes

Retrouvez ici les réponses aux questions les plus courantes sur l'utilisation d'Hikube.

---

## 1. Comment récupérer mon kubeconfig ?

Une fois votre cluster Kubernetes déployé, récupérez le kubeconfig avec :

```bash
kubectl get secret <nom-cluster>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > my-cluster-kubeconfig.yaml

export KUBECONFIG=my-cluster-kubeconfig.yaml
kubectl get nodes
```

Voir : [Kubernetes - Démarrage rapide](../services/kubernetes/quick-start.md)

---

## 2. Comment récupérer les identifiants de ma base de données ?

Les identifiants sont stockés dans un Secret Kubernetes. La commande varie selon le service :

```bash
# Redis
kubectl get secret redis-<nom>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

# PostgreSQL
kubectl get secret pg-<nom>-app -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

# MySQL
kubectl get secret mysql-<nom>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

Voir : [Redis - Démarrage rapide](../services/databases/redis/quick-start.md), [PostgreSQL - Démarrage rapide](../services/databases/postgresql/quick-start.md), [MySQL - Démarrage rapide](../services/databases/mysql/quick-start.md)

---

## 3. Comment exposer un service à l'extérieur ?

Deux options sont disponibles :

**Option 1 : Accès externe via LoadBalancer** (recommandé pour la production)

Ajoutez `external: true` dans le manifeste YAML de votre service. Un LoadBalancer avec une IP publique sera créé automatiquement.

```yaml
spec:
  external: true
```

**Option 2 : Port-forward** (recommandé pour le développement)

```bash
kubectl port-forward svc/<nom-du-service> <port-local>:<port-service>
```

:::note
Il est recommandé de ne pas exposer les bases de données à l'extérieur si vous n'en avez pas le besoin.
:::

---

## 4. Quelle est la différence entre `resources` et `resourcesPreset` ?

- **`resourcesPreset`** : profil prédéfini (nano, micro, small, medium, large, xlarge, 2xlarge) qui alloue automatiquement CPU et mémoire.
- **`resources`** : permet de définir **explicitement** les valeurs CPU et mémoire.

Si `resources` est défini, `resourcesPreset` est **ignoré**.

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

Voir : [Redis - Référence API](../services/databases/redis/api-reference.md)

---

## 5. Comment choisir mon instanceType pour Kubernetes ?

Le paramètre `instanceType` dans les `nodeGroups` détermine les ressources de chaque nœud worker :

| Instance Type | vCPU | RAM |
|---------------|------|-----|
| `s1.small` | 1 | 2 GB |
| `s1.medium` | 2 | 4 GB |
| `s1.large` | 4 | 8 GB |
| `s1.xlarge` | 8 | 16 GB |
| `s1.2xlarge` | 16 | 32 GB |

Choisissez en fonction de vos workloads :
- **Applications web classiques** : `s1.large` (bon équilibre coût/performance)
- **Applications gourmandes en mémoire** : `s1.xlarge` ou `s1.2xlarge`
- **Environnements de développement** : `s1.small` ou `s1.medium`

Voir : [Kubernetes - Référence API](../services/kubernetes/api-reference.md)

---

## 6. Comment activer les backups S3 ?

Pour les bases de données qui le supportent (PostgreSQL, ClickHouse), ajoutez la section `backup` dans votre manifeste :

```yaml
spec:
  backup:
    enabled: true
    s3:
      endpoint: "https://s3.example.com"
      bucket: "my-backups"
      accessKey: "ACCESS_KEY"
      secretKey: "SECRET_KEY"
```

Voir : [PostgreSQL - Référence API](../services/databases/postgresql/api-reference.md)

---

## 7. Comment accéder à Grafana et mes dashboards ?

Si le monitoring est activé sur votre tenant, Grafana est accessible via une URL dédiée. Pour la retrouver :

```bash
# Vérifier les Ingress de monitoring
kubectl get ingress -n monitoring

# Ou vérifier les services
kubectl get svc -n monitoring | grep grafana
```

Les dashboards sont préconfigurés pour chaque type de ressource (Kubernetes, bases de données, VMs, etc.).

Voir : [Concepts clés - Observabilité](../getting-started/concepts.md)

---

## 8. Comment scaler mon cluster ?

### Scaler les réplicas d'une base de données

Modifiez le champ `replicas` dans votre manifeste et réappliquez :

```yaml
spec:
  replicas: 5  # Augmenter le nombre de réplicas
```

```bash
kubectl apply -f <manifeste>.yaml
```

### Scaler les nœuds Kubernetes

Les nœuds scalent automatiquement entre `minReplicas` et `maxReplicas` selon la charge. Pour modifier les limites, ajustez la configuration du `nodeGroup` :

```yaml
spec:
  nodeGroups:
    general:
      minReplicas: 2
      maxReplicas: 10
```

Voir : [Kubernetes - Démarrage rapide](../services/kubernetes/quick-start.md)

---

## 9. Quels sont les storageClass disponibles ?

| StorageClass | Description |
|-------------|-------------|
| `""` (défaut) | Stockage standard, données sur un seul datacenter |
| `replicated` | Stockage répliqué sur plusieurs datacenters, haute disponibilité |

Utilisez `replicated` pour les workloads de production nécessitant une tolérance aux pannes matérielles.

```yaml
spec:
  storageClass: replicated
```

Voir : [Kubernetes - Référence API](../services/kubernetes/api-reference.md)

---

## 10. Comment fonctionne l'auto-failover sur les bases de données ?

Chaque service de base de données managé dispose d'un mécanisme d'auto-failover :

| Service | Mécanisme | Fonctionnement |
|---------|-----------|----------------|
| **Redis** | Redis Sentinel | Surveille le master, promeut automatiquement un réplica en cas de panne |
| **PostgreSQL** | CloudNativePG | Détection de panne et promotion automatique d'un standby |
| **MySQL** | MySQL Operator | Réplication semi-synchrone avec failover automatique |
| **ClickHouse** | ClickHouse Keeper | Consensus distribué pour la coordination des shards et réplicas |
| **RabbitMQ** | Quorum Queues | Réplication Raft pour la tolérance aux pannes des messages |

L'auto-failover est **activé par défaut** lorsque `replicas > 1`. Aucune configuration supplémentaire n'est nécessaire.

Voir : [Redis - Vue d'ensemble](../services/databases/redis/overview.md), [PostgreSQL - Vue d'ensemble](../services/databases/postgresql/overview.md)
