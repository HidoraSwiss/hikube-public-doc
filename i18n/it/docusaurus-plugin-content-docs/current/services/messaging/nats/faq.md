---
sidebar_position: 6
title: FAQ
---

# FAQ — NATS

### Faut-il activer JetStream ?

**JetStream** ajoute la **persistance**, le **streaming** et le **replay** des messages à NATS. Sans JetStream, NATS fonctionne en mode **pub/sub pur** (fire-and-forget) : les messages sont transmis uniquement aux abonnés connectés au moment de la publication.

JetStream est activé par défaut (`jetstream.enabled: true`). Ne le désactivez que si vous avez besoin uniquement de messagerie éphémère sans persistance :

```yaml title="nats.yaml"
jetstream:
  enabled: true
  size: 10Gi
```

:::tip
En production, gardez toujours JetStream activé pour bénéficier de la persistance des messages, de la possibilité de rejouer les événements, et des consumer groups durables.
:::

### Quelle est la différence entre pub/sub et queue groups ?

NATS propose deux modèles de consommation :

- **Pub/sub classique** : chaque abonné reçoit **tous les messages** publiés sur le subject. Adapté à la diffusion (notifications, logs).
- **Queue groups** : les abonnés d'un même groupe se **partagent les messages** (load balancing). Chaque message est délivré à **un seul abonné** du groupe. Adapté au traitement distribué.

Plusieurs queue groups peuvent s'abonner au même subject — chaque groupe reçoit une copie de chaque message, mais un seul membre par groupe le traite.

### Comment fonctionnent les wildcards dans les subjects ?

NATS utilise un système de subjects hiérarchiques séparés par des points (`.`). Deux wildcards sont disponibles :

| **Wildcard** | **Description**                        | **Exemple**                                                     |
| ------------ | -------------------------------------- | --------------------------------------------------------------- |
| `*`          | Correspond à **un seul token**         | `orders.*` matche `orders.new` mais pas `orders.new.urgent`     |
| `>`          | Correspond à **un ou plusieurs tokens**| `orders.>` matche `orders.new`, `orders.new.urgent`, etc.       |

Exemples :
- `logs.*` : reçoit `logs.info`, `logs.error`, mais pas `logs.app.error`
- `logs.>` : reçoit `logs.info`, `logs.error`, `logs.app.error`, etc.

### Quelle est la différence entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` applique une configuration CPU/mémoire prédéfinie, tandis que `resources` permet de spécifier des valeurs explicites. Si `resources` est défini, `resourcesPreset` est **ignoré**.

| **Preset** | **CPU** | **Mémoire** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Exemple avec des ressources explicites :

```yaml title="nats.yaml"
replicas: 3
resources:
  cpu: 2000m
  memory: 2Gi
```

### NATS persiste-t-il les messages ?

Par défaut, NATS fonctionne en mode **fire-and-forget** : les messages ne sont transmis qu'aux abonnés connectés au moment de la publication. **Aucune persistance** n'a lieu sans configuration supplémentaire.

Pour persister les messages, deux conditions doivent être remplies :

1. **JetStream doit être activé** (`jetstream.enabled: true`)
2. **Un stream doit être créé** pour capturer les messages des subjects concernés

Sans stream configuré, même avec JetStream activé, les messages publiés sur un subject sans stream associé ne sont pas persistés.

### Comment configurer NATS de manière avancée ?

Le champ `config.merge` permet d'ajouter ou de surcharger des paramètres de la configuration NATS :

```yaml title="nats.yaml"
config:
  merge:
    max_payload: 8MB
    write_deadline: 2s
    debug: false
    trace: false
```

Paramètres courants :

| **Paramètre**     | **Description**                                          | **Défaut** |
| ------------------ | -------------------------------------------------------- | ---------- |
| `max_payload`      | Taille maximale d'un message                             | 1MB        |
| `write_deadline`   | Timeout d'écriture vers un client                        | 2s         |
| `debug`            | Active les logs de debug                                 | false      |
| `trace`            | Active le traçage des messages (très verbeux)            | false      |

:::warning
Activer `debug` et `trace` en production génère un volume de logs considérable. Utilisez-les uniquement pour le diagnostic temporaire.
:::
