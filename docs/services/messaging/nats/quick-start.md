---
sidebar_position: 2
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Démarrer avec NATS

:::info Disponibilité
NATS n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide explique comment obtenir un **cluster NATS** sur Hikube et réaliser vos premiers tests de publication et de consommation avec le CLI `nats`.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un **cluster NATS** provisionné dans votre projet Hikube, avec **JetStream** activé
- Un **utilisateur** pour vous connecter au cluster
- Créé un stream, publié et consommé un premier message

---

## Prérequis

- Un **compte Hikube** et un **projet** (voir le [démarrage rapide Hikube](../../../getting-started/quick-start.md))
- Le **CLI NATS** (`nats`) installé sur votre poste, disponible sur [nats-io/natscli](https://github.com/nats-io/natscli)

---

## Étape 1 : Préparer votre demande

Rassemblez les paramètres de l'instance souhaitée :

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| Projet | Projet Hikube dans lequel créer l'instance | `demo01` |
| Nom | Nom de l'instance NATS | `events` |
| Réplicas | Nombre de serveurs NATS (3 pour la haute disponibilité de JetStream) | `3` |
| Preset | Profil CPU/mémoire (voir [Concepts](./concepts.md#presets-de-ressources)) | `small` |
| JetStream | Activation et taille du volume de persistance | Activé, `10 Go` |
| Utilisateurs | Noms des comptes à créer | `user1` |
| Configuration avancée | Paramètres NATS à ajuster (`max_payload`, `write_deadline`…) | `max_payload: 16MB` |
| Accès externe | Exposer ou non le cluster en dehors de la plateforme | Non |

---

## Étape 2 : Demander l'instance

Envoyez ces paramètres au support à [support@hidora.io](mailto:support@hidora.io), ou via le bouton **Contacter le support** du menu profil de la console.

Le support vous communique en retour :

- l'**URL du serveur** NATS (notée `<nats-url>` dans la suite de ce guide) ;
- les **identifiants** des utilisateurs demandés.

:::note
Le port client NATS standard est `4222`. Utilisez toujours l'adresse et le port communiqués par le support.
:::

Pour éviter de répéter l'URL et les identifiants, enregistrez un contexte dans le CLI :

```bash
nats context save hikube --server <nats-url> --user <utilisateur> --password <mot-de-passe> --select
```

---

## Étape 3 : Créer un stream JetStream

```bash
nats stream add EVENTS \
  --subjects "events.*" --storage file --replicas 3 --retention limits \
  --max-msgs -1 --max-bytes -1 --max-age 24h --discard old --defaults
```

:::note
Le nombre de réplicas d'un stream ne peut pas dépasser le nombre de serveurs NATS de l'instance.
:::

---

## Étape 4 : Publier et consommer un message

```bash
# Publier un message
nats pub events.test "Hello Hikube!"

# Lire le contenu du stream
nats stream view EVENTS
```

**Résultat attendu :**

```console
[1] Subject: events.test Received: 2025-01-15T10:30:00Z
  Hello Hikube!
```

---

## Étape 5 : Dépannage rapide

### Connexion refusée

```bash
nats server check connection
```

**Causes fréquentes :** URL ou port incorrect, identifiants erronés (`Authorization Violation`), accès externe non activé alors que vous vous connectez depuis l'extérieur de la plateforme.

### JetStream non fonctionnel

```bash
nats account info
```

**Causes fréquentes :** JetStream non activé sur l'instance, espace de stockage JetStream insuffisant, nombre de réplicas du stream supérieur au nombre de serveurs.

### Problème côté cluster

Si le cluster semble indisponible, [contactez le support](mailto:support@hidora.io) en précisant le nom du projet et de l'instance.

---

## Étape 6 : Nettoyage

Supprimez le stream de test depuis le CLI :

```bash
nats stream rm EVENTS -f
```

Pour supprimer l'instance elle-même, adressez la demande au [support](mailto:support@hidora.io) en indiquant le projet et le nom de l'instance.

:::warning
La suppression d'un cluster NATS efface toutes les données associées, y compris les streams JetStream. Cette opération est **irréversible**.
:::

---

## Prochaines étapes

- **[Concepts](./concepts.md)** : modèles de communication et JetStream
- **[Comment configurer JetStream](./how-to/configure-jetstream.md)** : dimensionnement et gestion des streams

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Concepts", href: "../concepts"},
  ]}
  seeAlso={[
    {label: "Tous les services de messagerie", href: "../../"},
  ]}
/>
