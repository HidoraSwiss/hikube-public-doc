---
sidebar_position: 6
title: FAQ
---

# FAQ — RabbitMQ

### Quelle est la différence entre quorum queues et classic queues ?

RabbitMQ propose deux types principaux de queues :

- **Quorum queues** : basées sur le protocole **Raft**, les données sont répliquées sur plusieurs nœuds du cluster. Elles garantissent la **durabilité** et la **haute disponibilité** des messages. Recommandées pour la production.
- **Classic queues** : stockées sur un seul nœud, plus rapides en écriture mais **sans réplication**. En cas de panne du nœud, les messages sont perdus.

:::tip
Avec 3 réplicas ou plus (`replicas: 3`), RabbitMQ utilise les quorum queues par défaut, garantissant la durabilité des messages en cas de panne d'un nœud.
:::

### À quoi servent les virtual hosts (vhosts) ?

Les **virtual hosts** (vhosts) fournissent une **isolation logique** au sein d'un même cluster RabbitMQ :

- Chaque vhost possède ses propres exchanges, queues et bindings
- Les permissions sont gérées **par vhost**, permettant de contrôler l'accès par application
- Un utilisateur peut avoir des rôles différents selon le vhost (admin sur l'un, readonly sur l'autre)

Exemple de configuration avec plusieurs vhosts :

```yaml title="rabbitmq.yaml"
vhosts:
  production:
    roles:
      admin: ["admin"]
      readonly: ["monitoring"]
  staging:
    roles:
      admin: ["admin", "dev"]
```

### Comment fonctionnent les exchanges dans RabbitMQ ?

Un **exchange** reçoit les messages des producteurs et les route vers les queues selon des règles de **binding** :

| **Type**    | **Comportement**                                                              |
| ----------- | ----------------------------------------------------------------------------- |
| `direct`    | Route le message vers la queue dont la **routing key** correspond exactement  |
| `fanout`    | Diffuse le message à **toutes les queues** liées, sans filtre                 |
| `topic`     | Route selon un **pattern** de routing key (ex. `orders.*`, `logs.#`)          |
| `headers`   | Route selon les **headers** du message plutôt que la routing key              |

Le producteur publie vers un exchange, jamais directement vers une queue.

### Quels protocoles sont supportés ?

RabbitMQ sur Hikube supporte les protocoles suivants :

| **Protocole**        | **Port** | **Usage**                              |
| -------------------- | -------- | -------------------------------------- |
| AMQP                 | 5672     | Protocole principal pour les messages  |
| Management HTTP API  | 15672    | Interface web et API de gestion        |

### Quelle est la différence entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` applique une configuration CPU/mémoire prédéfinie, tandis que `resources` permet de spécifier des valeurs explicites. Si `resources` est défini, `resourcesPreset` est **ignoré**.

| **Preset** | **CPU** | **Mémoire** |
| ---------- | ------- | ----------- |
| `nano`     | 100m    | 128Mi       |
| `micro`    | 250m    | 256Mi       |
| `small`    | 500m    | 512Mi       |
| `medium`   | 500m    | 1Gi         |
| `large`    | 1       | 2Gi         |
| `xlarge`   | 2       | 4Gi         |
| `2xlarge`  | 4       | 8Gi         |

Exemple avec des ressources explicites :

```yaml title="rabbitmq.yaml"
replicas: 3
resources:
  cpu: 2000m
  memory: 4Gi
size: 20Gi
```

### Comment accéder à l'interface de management ?

L'interface de management RabbitMQ est accessible sur le port **15672**. Deux options :

**Option 1 — Port-forward (accès local)** :

```bash
kubectl port-forward svc/<nom-rabbitmq> 15672:15672
```

Puis ouvrez `http://localhost:15672` dans votre navigateur.

**Option 2 — Accès externe** :

Activez `external: true` dans votre manifeste pour exposer le service via un LoadBalancer :

```yaml title="rabbitmq.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq
spec:
  external: true
  replicas: 3
  resourcesPreset: small
  size: 10Gi
```

:::warning
L'accès externe expose les ports AMQP (5672) et Management (15672) sur Internet. Assurez-vous d'utiliser des mots de passe forts pour tous les utilisateurs.
:::
