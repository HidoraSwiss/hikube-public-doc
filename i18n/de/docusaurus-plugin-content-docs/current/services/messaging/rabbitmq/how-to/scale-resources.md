---
title: "Skalierung von le cluster"
---

# Skalierung von le cluster RabbitMQ

Dieser Leitfaden erklärt comment ajuster les ressources d'un cluster RabbitMQ auf Hikube : nombre de réplicas, ressources CPU/mémoire et stockage.

## Voraussetzungen

- **kubectl** configuré avec votre kubeconfig Hikube
- Un cluster **RabbitMQ** déployé sur Hikube

## Presets disponibles

Hikube bietet des presets de ressources prédéfinis pour RabbitMQ :

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `nano` | 100m | 128Mi |
| `micro` | 250m | 256Mi |
| `small` | 500m | 512Mi |
| `medium` | 500m | 1Gi |
| `large` | 1 | 2Gi |
| `xlarge` | 2 | 4Gi |
| `2xlarge` | 4 | 8Gi |

:::warning
Si le champ `resources` (CPU/mémoire explicites) est défini, la valeur de `resourcesPreset` est **entièrement ignorée**. Assurez-vous de vider le champ `resources` si vous souhaitez utiliser un preset.
:::

:::note
Les presets RabbitMQ diffèrent légèrement des autres services (Kafka, NATS, bases de données). Consultez le tableau ci-dessus pour les valeurs exactes.
:::

## Schritte

### 1. Vérifier les ressources actuelles

Consultez la configuration actuelle du cluster :

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 5 -E "replicas:|resources:|resourcesPreset|size:"
```

**Exemple de résultat :**

```console
  replicas: 3
  resourcesPreset: small
  resources: {}
  size: 10Gi
```

### 2. Modifier le nombre de réplicas

Le nombre de réplicas détermine le nombre de nœuds dans le cluster RabbitMQ.

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  replicas: 3
'
```

:::warning
Avec moins de 3 réplicas, les quorum queues ne peuvent pas garantir la durabilité des messages en cas de panne. Utilisez **3 réplicas minimum** en production.
:::

**Recommandations par environnement :**

| Environnement | Réplicas | Justification |
|--------------|----------|---------------|
| Développement | 1 | Suffisant pour les tests |
| Staging | 3 | Simule la production |
| Production | 3 ou 5 | Hochverfügbarkeit et quorum queues |

### 3. Modifier le preset ou les ressources explicites

**Option A : changer le preset**

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  resourcesPreset: large
  resources: {}
'
```

:::note
Il est important de remettre `resources: {}` lors du passage à un preset, afin que le preset soit bien pris en compte.
:::

**Option B : définir des ressources explicites**

Pour un contrôle fin, définissez directement les valeurs CPU et mémoire :

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  resources:
    cpu: 2000m
    memory: 4Gi
'
```

Vous pouvez aussi modifier le manifeste complet :

```yaml title="rabbitmq-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: my-rabbitmq
spec:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 20Gi
  storageClass: replicated

  users:
    admin:
      password: SecureAdminPassword

  vhosts:
    production:
      roles:
        admin:
          - admin
```

```bash
kubectl apply -f rabbitmq-scaled.yaml
```

### 4. Appliquer et vérifier

Surveillez le rolling update des pods :

```bash
kubectl get po -w | grep my-rabbitmq
```

**Erwartetes Ergebnis (pendant le rolling update) :**

```console
my-rabbitmq-server-0   1/1     Running       0   45m
my-rabbitmq-server-1   1/1     Terminating   0   44m
my-rabbitmq-server-1   0/1     Pending       0   0s
my-rabbitmq-server-1   1/1     Running       0   30s
```

Attendez que tous les pods soient en état `Running` :

```bash
kubectl get po | grep my-rabbitmq
```

```console
my-rabbitmq-server-0   1/1     Running   0   10m
my-rabbitmq-server-1   1/1     Running   0   8m
my-rabbitmq-server-2   1/1     Running   0   6m
```

Vérifiez l'état du cluster RabbitMQ :

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl cluster_status
```

## Überprüfung

Confirmez que les nouvelles ressources sont appliquées :

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 5 -E "replicas:|resources:|resourcesPreset|size:"
```

Überprüfen Sie, ob le cluster est fonctionnel :

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl node_health_check
```

**Erwartetes Ergebnis :**

```console
Health check passed
```

## Weiterführende Informationen

- **[API-Referenz RabbitMQ](../api-reference.md)** : documentation complète des paramètres `replicas`, `resources`, `resourcesPreset` et du tableau des presets
- **[Verwaltung von les vhosts et utilisateurs](./manage-vhosts-users.md)** : configurer les utilisateurs et les permissions
