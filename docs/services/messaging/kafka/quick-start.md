---
sidebar_position: 2
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Démarrer avec Kafka

:::info Disponibilité
Kafka n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide explique comment obtenir un **cluster Kafka** sur Hikube et réaliser vos premiers tests de publication et de consommation avec les outils clients Kafka.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un **cluster Kafka** provisionné dans votre projet Hikube
- Un **topic** prêt à recevoir des messages
- Publié et consommé un premier message depuis votre poste ou votre application

---

## Prérequis

- Un **compte Hikube** et un **projet** (voir le [démarrage rapide Hikube](../../../getting-started/quick-start.md))
- Un client Kafka installé : les scripts Kafka (`kafka-console-producer.sh`, `kafka-console-consumer.sh`) ou **kcat** (anciennement `kafkacat`)

---

## Étape 1 : Préparer votre demande

Rassemblez les paramètres de l'instance souhaitée :

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| Projet | Projet Hikube dans lequel créer l'instance | `demo01` |
| Nom | Nom de l'instance Kafka | `events` |
| Brokers | Nombre de brokers Kafka | `3` |
| Preset des brokers | Profil CPU/mémoire (voir [Concepts](./concepts.md#presets-de-ressources)) | `small` |
| Stockage des brokers | Taille du volume par broker | `10 Go` |
| ZooKeeper | Nombre d'instances (impair), preset et taille de stockage | `3`, `small`, `5 Go` |
| Topics | Nom, partitions, réplicas et options (`retention.ms`, `cleanup.policy`…) | `my-topic`, 3 partitions, 3 réplicas |
| Accès externe | Exposer ou non le cluster en dehors de la plateforme | Non |

---

## Étape 2 : Demander l'instance

Envoyez ces paramètres au support à [support@hidora.io](mailto:support@hidora.io), ou via le bouton **Contacter le support** du menu profil de la console.

Le support vous communique en retour les informations de connexion :

- l'adresse des **serveurs bootstrap** (notée `<bootstrap-servers>` dans la suite de ce guide) ;
- le cas échéant, les identifiants et paramètres de sécurité à utiliser côté client.

:::note
À l'intérieur du projet, les brokers écoutent sur le port `9092` (sans chiffrement) et `9093` (TLS). Avec l'accès externe, l'adresse publique utilise le port `9094`, chiffré en TLS par défaut : vos clients doivent alors faire confiance au certificat d'autorité du cluster, que le support vous transmet (par exemple `-X security.protocol=SSL -X ssl.ca.location=ca.crt` avec kcat). Aucune authentification des clients n'est configurée par défaut. Utilisez toujours l'adresse et le port communiqués par le support.
:::

---

## Étape 3 : Publier un message

Avec les scripts Kafka :

```bash
echo "Hello Hikube!" | kafka-console-producer.sh \
  --bootstrap-server <bootstrap-servers> \
  --topic my-topic
```

Ou avec kcat :

```bash
echo "Hello Hikube!" | kcat -b <bootstrap-servers> -t my-topic -P
```

---

## Étape 4 : Consommer le message

Avec les scripts Kafka :

```bash
kafka-console-consumer.sh \
  --bootstrap-server <bootstrap-servers> \
  --topic my-topic \
  --from-beginning \
  --max-messages 1
```

Ou avec kcat :

```bash
kcat -b <bootstrap-servers> -t my-topic -C -o beginning -e
```

**Résultat attendu :**

```console
Hello Hikube!
```

:::note
kcat s'installe avec `apt install kafkacat` (Debian/Ubuntu) ou `brew install kcat` (macOS).
:::

---

## Étape 5 : Dépannage rapide

### Connexion impossible

Vérifiez les métadonnées du cluster depuis votre client :

```bash
kcat -b <bootstrap-servers> -L
```

**Causes fréquentes :** adresse ou port incorrect, accès externe non activé alors que vous vous connectez depuis l'extérieur de la plateforme, paramètres de sécurité client manquants.

### Topic introuvable

Listez les topics visibles :

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
```

**Causes fréquentes :** faute de frappe dans le nom du topic, topic non déclaré dans la configuration de l'instance.

### Problème côté cluster

Si le cluster semble indisponible (brokers injoignables, erreurs de quorum ZooKeeper), [contactez le support](mailto:support@hidora.io) en précisant le nom du projet et de l'instance.

---

## Étape 6 : Nettoyage

Pour supprimer l'instance, adressez la demande au [support](mailto:support@hidora.io) en indiquant le projet et le nom de l'instance.

:::warning
La suppression d'un cluster Kafka efface toutes les données associées. Cette opération est **irréversible**.
:::

---

## Prochaines étapes

- **[Concepts](./concepts.md)** : topics, partitions, ZooKeeper et presets
- **[Comment créer et gérer les topics](./how-to/manage-topics.md)** : options de configuration des topics

<NavigationFooter
  nextSteps={[
    {label: "FAQ", href: "../faq"},
    {label: "Concepts", href: "../concepts"},
  ]}
  seeAlso={[
    {label: "Tous les services de messagerie", href: "../../"},
  ]}
/>
