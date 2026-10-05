---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Démarrer avec ClickHouse

:::info Disponibilité
ClickHouse n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide décrit les informations à préparer pour demander une instance **ClickHouse**, puis la prise en main avec `clickhouse-client` une fois l'instance livrée.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Une demande de provisionnement complète, avec la topologie adaptée à vos besoins
- Une connexion fonctionnelle avec `clickhouse-client`
- Une première table analytique

---

## Prérequis

- Un **compte Hikube** et un **projet** disposant de quotas suffisants
- Le client **`clickhouse-client`** installé sur votre poste

---

## Étape 1 : Définir la topologie

Choisissez le nombre de **shards** et de **réplicas** selon votre usage (voir [Vue d'ensemble](./overview.md)) :

| Usage | Shards | Réplicas par shard |
|-------|--------|--------------------|
| POC, développement | 1 | 1 |
| Production, volume modéré | 1 | 2 |
| Production, gros volumes | 2 ou plus | 2 |

Une configuration répliquée s'appuie sur **ClickHouse Keeper** (3 instances recommandées) pour la coordination.

---

## Étape 2 : Demander l'instance

[Contactez le support](mailto:support@hidora.io) en indiquant :

| Information | Exemple |
|-------------|---------|
| Projet | `analytics` |
| Nom de l'instance | `events-ch` |
| Shards / réplicas par shard | `1` / `2` |
| Preset par réplica | `large` (2 CPU, 2Gi) |
| Taille du stockage par réplica | `50 Go` |
| Utilisateurs et droits | `app` (accès complet), `analyst` (lecture seule) |
| Accès depuis Internet | Oui / Non |
| Sauvegardes | Oui / Non, avec la rétention souhaitée |

---

## Étape 3 : Vérifier la livraison

Le support vous confirme la mise à disposition de l'instance, ainsi que les informations de connexion : adresse, ports et identifiants.

---

## Étape 4 : Récupérer les identifiants

Conservez les mots de passe transmis dans un gestionnaire de mots de passe. Pour en changer, contactez le support.

---

## Étape 5 : Connexion et tests

ClickHouse expose le protocole natif (port `9000` par défaut) et l'interface HTTP (port `8123` par défaut).

```bash
clickhouse-client \
  --host <hôte> \
  --port 9000 \
  --user app \
  --password \
  --query "SHOW DATABASES;"
```

**Résultat attendu :**

```console
INFORMATION_SCHEMA
default
information_schema
system
```

Créez ensuite une première table :

```sql
CREATE TABLE default.events
(
    ts DateTime,
    user_id UInt64,
    action String
)
ENGINE = MergeTree
ORDER BY (ts, user_id);

INSERT INTO default.events VALUES (now(), 1, 'login');
SELECT action, count() FROM default.events GROUP BY action;
```

---

## Étape 6 : Dépannage rapide

### Connexion impossible

Vérifiez l'adresse et le port : `9000` pour le protocole natif (`clickhouse-client`), `8123` pour HTTP. Si l'instance n'est pas exposée sur Internet, connectez-vous depuis une ressource du même projet.

### Authentification refusée

Vérifiez l'utilisateur et le mot de passe transmis. Pour réinitialiser un mot de passe, contactez le support.

### Requêtes lentes

Vérifiez que l'`ORDER BY` de vos tables correspond à vos filtres les plus fréquents. Voir [Dépannage](./troubleshooting.md).

---

## Étape 7 : Nettoyage

Pour supprimer une instance ClickHouse, [contactez le support](mailto:support@hidora.io) en indiquant le projet et le nom de l'instance.

:::warning
La suppression d'une instance efface toutes les données associées. Elle est **irréversible**.
:::

---

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Toutes les bases de données", href: "../../"},
  ]}
/>
