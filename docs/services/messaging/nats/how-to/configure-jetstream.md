---
title: "Comment configurer JetStream"
---

# Comment configurer JetStream

:::info Disponibilité
NATS n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide explique comment dimensionner **JetStream** sur un cluster NATS Hikube, puis comment créer et utiliser des streams depuis le CLI `nats`. JetStream fournit la persistance des messages, le streaming et le replay avec garanties de livraison.

L'activation de JetStream, la taille de son volume et la configuration avancée du serveur font partie de la configuration de l'instance. Cette option n'est pas proposée dans la console ; contactez le support.

## Prérequis

- Un cluster **NATS** provisionné sur Hikube, son URL (`<nats-url>`) et des identifiants
- Le CLI **nats** installé localement, avec un contexte enregistré (voir le [démarrage rapide](../quick-start.md))

## Étapes

### 1. Dimensionner le stockage JetStream

| Paramètre | Description |
|-----------|-------------|
| JetStream activé | Active ou désactive la persistance sur l'instance |
| Taille du volume | Espace disque réservé aux données JetStream |

Le dimensionnement du volume dépend de votre cas d'usage :

- **Messages éphémères** (TTL court, quelques heures) : 10 à 20 Go
- **Rétention longue** (jours, semaines) : 50 à 100 Go
- **Streams volumineux** (événements, logs) : 100 Go et plus

:::tip
Prévoyez 3 réplicas minimum en production pour bénéficier du consensus Raft de JetStream. Cela garantit la haute disponibilité et la durabilité des streams en cas de panne d'un nœud.
:::

:::warning
La réduction du volume JetStream sur une instance existante peut entraîner une perte de données. Prévoyez une marge suffisante lors du dimensionnement initial.
:::

### 2. Ajuster la configuration du serveur (optionnel)

Les paramètres suivants peuvent être ajustés au niveau de l'instance :

| Paramètre | Description | Défaut |
|-----------|-------------|--------|
| `max_payload` | Taille maximale d'un message | `1MB` |
| `write_deadline` | Délai maximal pour écrire une réponse au client | `2s` |
| `debug` | Active les logs de debug | `false` |
| `trace` | Active le traçage des messages (très verbeux) | `false` |

:::note
`debug` et `trace` ne se justifient que pour un dépannage temporaire. Ces options génèrent un volume important de logs et peuvent impacter les performances.
:::

Transmettez la taille souhaitée et les éventuels paramètres au [support](mailto:support@hidora.io), en précisant le projet et le nom de l'instance.

### 3. Créer un stream

Une fois JetStream activé, créez un stream depuis le CLI :

```bash
nats stream add EVENTS \
  --subjects "events.>" \
  --storage file \
  --retention limits \
  --max-msgs -1 \
  --max-bytes -1 \
  --max-age 72h \
  --replicas 3 \
  --defaults
```

**Résultat attendu :**

```console
Stream EVENTS was created

Information:

  Subjects: events.>
  Replicas: 3
  Storage:  File
  Retention: Limits
  ...
```

### 4. Tester le stream

Publiez un message :

```bash
nats pub events.test "Hello JetStream"
```

Consommez le message :

```bash
nats sub "events.>" --count 1
```

**Résultat attendu :**

```console
[#1] Received on "events.test"
Hello JetStream
```

Vérifiez l'état du stream :

```bash
nats stream info EVENTS
```

## Vérification

La configuration est correcte si :

- `nats account info` indique que JetStream est disponible
- Un stream peut être créé avec le nombre de réplicas souhaité
- Les messages publiés sont persistés et peuvent être consommés
- `nats stream info` affiche le bon nombre de réplicas et la politique de rétention configurée

## Pour aller plus loin

- **[Concepts](../concepts.md)** : modèles de communication et JetStream
- **[Comment gérer les utilisateurs NATS](./manage-users.md)** : comptes d'accès au cluster
