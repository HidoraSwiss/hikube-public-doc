---
sidebar_position: 3
title: Référence API
---

# Référence API RabbitMQ

Cette référence détaille la configuration et le fonctionnement des **clusters RabbitMQ** sur Hikube, incluant la gestion des **utilisateurs**, des **vhosts**, et des **queues**.
Les déploiements s’appuient sur l’**opérateur officiel RabbitMQ**, garantissant une gestion simplifiée, hautement disponible et conforme aux bonnes pratiques du projet upstream.

---

## Structure de Base

### **Ressource RabbitMQ**

#### Exemple de configuration YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq
spec:
  replicas: 3
  resourcesPreset: small
  size: 10Gi
  storageClass: replicated
  users:
    admin:
      password: "strongpassword"
  vhosts:
    default:
      roles:
        admin: ["admin"]
```

---

## Paramètres

### **Paramètres Communs**

| **Paramètre**      | **Type**   | **Description**                                                                         | **Défaut** | **Requis** |
| ------------------ | ---------- | --------------------------------------------------------------------------------------- | ---------- | ---------- |
| `external`         | `bool`     | Active l’accès externe au cluster RabbitMQ (exposition hors du cluster)                 | `false`    | Non        |
| `replicas`         | `int`      | Nombre de réplicas RabbitMQ (nœuds du cluster)                                          | `3`        | Oui        |
| `resources`        | `object`   | Configuration explicite CPU et mémoire pour chaque réplique RabbitMQ                    | `{}`       | Non        |
| `resources.cpu`    | `quantity` | CPU disponible par réplique                                                             | `null`     | Non        |
| `resources.memory` | `quantity` | RAM disponible par réplique                                                             | `null`     | Non        |
| `resourcesPreset`  | `string`   | Preset de ressources (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"small"`  | Oui        |
| `size`             | `quantity` | Taille du volume persistant utilisé pour les données RabbitMQ                           | `10Gi`     | Oui        |
| `storageClass`     | `string`   | StorageClass utilisé pour stocker les données RabbitMQ                                  | `""`       | Non        |

#### Exemple YAML

```yaml title="rabbitmq.yaml"
replicas: 3
resourcesPreset: medium
size: 20Gi
storageClass: replicated
external: true
```

---

### **Paramètres Utilisateurs**

| **Paramètre**          | **Type**            | **Description**                 | **Défaut** | **Requis** |
| ---------------------- | ------------------- | ------------------------------- | ---------- | ---------- |
| `users`                | `map[string]object` | Liste des utilisateurs RabbitMQ | `{}`       | Oui        |
| `users[name].password` | `string`            | Mot de passe de l’utilisateur   | `null`     | Oui        |

#### Exemple YAML

```yaml title="rabbitmq.yaml"
users:
  admin:
    password: "securepassword"
  app:
    password: "apppassword123"
```

---

### **Paramètres Virtual Hosts (vhosts)**

| **Paramètre**                 | **Type**            | **Description**                                                   | **Défaut** | **Requis** |
| ----------------------------- | ------------------- | ----------------------------------------------------------------- | ---------- | ---------- |
| `vhosts`                      | `map[string]object` | Liste des virtual hosts RabbitMQ                                  | `{}`       | Non        |
| `vhosts[name].roles`          | `object`            | Rôles et permissions associés à ce virtual host                   | `{}`       | Non        |
| `vhosts[name].roles.admin`    | `[]string`          | Liste des utilisateurs ayant un accès administrateur sur ce vhost | `[]`       | Non        |
| `vhosts[name].roles.readonly` | `[]string`          | Liste des utilisateurs avec accès lecture seule                   | `[]`       | Non        |

#### Exemple YAML

```yaml title="rabbitmq.yaml"
vhosts:
  "default":
    roles:
      admin: ["admin"]
      readonly: ["app"]
  "analytics":
    roles:
      admin: ["admin"]
      readonly: ["analyst"]
```

---

### **resources et resourcesPreset**

Le champ `resources` permet de définir explicitement la configuration CPU et mémoire de chaque réplique RabbitMQ.
Si ce champ est laissé vide, la valeur du paramètre `resourcesPreset` est utilisée.

#### Exemple YAML

```yaml title="rabbitmq.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Si `resources` est défini, la valeur de `resourcesPreset` est ignorée.

| **Preset name** | **CPU** | **Mémoire** |
| --------------- | ------- | ----------- |
| `nano`          | 100m    | 128Mi       |
| `micro`         | 250m    | 256Mi       |
| `small`         | 500m    | 512Mi       |
| `medium`        | 500m    | 1Gi         |
| `large`         | 1       | 2Gi         |
| `xlarge`        | 2       | 4Gi         |
| `2xlarge`       | 4       | 8Gi         |

---

## Exemples Complets

### Cluster de Production

```yaml title="rabbitmq-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: production
spec:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 20Gi
  storageClass: replicated
  external: false

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: SecureAppPassword
    monitoring:
      password: SecureMonitoringPassword

  vhosts:
    production:
      roles:
        admin: ["admin"]
        readonly: ["monitoring"]
    analytics:
      roles:
        admin: ["admin"]
        readonly: ["appuser"]
```

### Cluster de Développement

```yaml title="rabbitmq-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: development
spec:
  replicas: 1
  resourcesPreset: nano
  size: 5Gi
  external: true

  users:
    dev:
      password: devpassword

  vhosts:
    default:
      roles:
        admin: ["dev"]
```

---

:::tip Bonnes Pratiques

- **3 réplicas pour les quorum queues** : avec 3 noeuds, RabbitMQ utilise les quorum queues pour garantir la durabilité des messages en cas de panne
- **Vhosts par application** : isolez chaque application dans un vhost dédié pour limiter l'impact en cas de surcharge
- **Rôles distincts** : séparez les utilisateurs admin, applicatifs et de monitoring avec des permissions adaptées
- **Stockage répliqué** : utilisez `storageClass: replicated` pour protéger les données contre la perte d'un noeud
:::

:::warning Attention

- **Les suppressions sont irréversibles** : la suppression d'une ressource RabbitMQ entraîne la perte définitive de toutes les queues et messages
- **Réplicas sous 3** : avec moins de 3 réplicas, les quorum queues ne peuvent pas garantir la durabilité des messages en cas de panne
- **Ports exposés** : si `external: true`, les ports AMQP (5672) et Management UI (15672) sont accessibles depuis l'extérieur — sécurisez les identifiants
:::

---

### Références externes

* **Opérateur officiel RabbitMQ :** [GitHub – rabbitmq/cluster-operator](https://github.com/rabbitmq/cluster-operator/)
* **Documentation RabbitMQ Operator :** [operator-overview.html](https://www.rabbitmq.com/kubernetes/operator/operator-overview.html)
