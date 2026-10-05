---
sidebar_position: 6
title: FAQ
---

# FAQ — NATS

:::info Disponibilité
NATS n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

### Comment obtenir un cluster NATS ?

Adressez votre demande au [support](mailto:support@hidora.io) avec les paramètres de l'instance (réplicas, preset, JetStream, utilisateurs, accès externe). Le [démarrage rapide](./quick-start.md) liste les informations à préparer.

### Faut-il activer JetStream ?

**JetStream** ajoute la **persistance**, le **streaming** et le **replay** des messages à NATS. Sans JetStream, NATS fonctionne en mode **pub/sub pur** (fire-and-forget) : les messages sont transmis uniquement aux abonnés connectés au moment de la publication.

:::tip
En production, gardez JetStream activé pour bénéficier de la persistance des messages, de la possibilité de rejouer les événements et des consumers durables.
:::

L'activation de JetStream et la taille de son volume font partie de la configuration de l'instance. Cette option n'est pas proposée dans la console ; contactez le support.

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

### Quels presets de ressources sont disponibles ?

| **Preset** | **CPU** | **Mémoire** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Des valeurs CPU/mémoire explicites peuvent aussi être demandées ; elles remplacent alors le preset. Cette option n'est pas proposée dans la console ; contactez le support.

### NATS persiste-t-il les messages ?

Par défaut, NATS fonctionne en mode **fire-and-forget** : les messages ne sont transmis qu'aux abonnés connectés au moment de la publication. **Aucune persistance** n'a lieu sans configuration supplémentaire.

Pour persister les messages, deux conditions doivent être remplies :

1. **JetStream doit être activé** sur l'instance
2. **Un stream doit être créé** (par exemple avec `nats stream add`) pour capturer les messages des subjects concernés

Même avec JetStream activé, les messages publiés sur un subject sans stream associé ne sont pas persistés.

### Peut-on ajuster la configuration du serveur NATS ?

Certains paramètres du serveur peuvent être ajustés au niveau de l'instance :

| **Paramètre**     | **Description**                                          | **Défaut** |
| ------------------ | -------------------------------------------------------- | ---------- |
| `max_payload`      | Taille maximale d'un message                             | 1MB        |
| `write_deadline`   | Timeout d'écriture vers un client                        | 2s         |
| `debug`            | Active les logs de debug                                 | false      |
| `trace`            | Active le traçage des messages (très verbeux)            | false      |

Cette option n'est pas proposée dans la console ; contactez le support.

:::warning
Activer `debug` et `trace` en production génère un volume de logs considérable. Ne les demandez que pour un diagnostic temporaire.
:::
