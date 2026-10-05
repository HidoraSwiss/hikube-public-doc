---
title: "Comment gérer les utilisateurs et profils ClickHouse"
sidebar_position: 1
---

# Comment gérer les utilisateurs et profils ClickHouse

:::info Disponibilité
ClickHouse n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide présente les options de gestion des utilisateurs d'une instance ClickHouse Hikube et la manière de vérifier leurs permissions.

## Options disponibles

Les utilisateurs d'une instance ClickHouse sont définis par la plateforme, sur demande auprès du support. Pour chaque utilisateur, précisez :

| Option | Description |
|--------|-------------|
| Nom d'utilisateur | Identifiant de connexion |
| Accès | **Complet** (lecture et écriture) ou **lecture seule** (requêtes `SELECT` uniquement) |

La rétention des journaux de requêtes (`system.query_log`, `system.query_thread_log`) et la taille du stockage qui leur est dédié se règlent également sur demande.

:::tip
Créez un utilisateur en lecture seule pour les outils d'analyse et de reporting (Grafana, Metabase, etc.). Cela limite les risques de modification accidentelle des données.
:::

## Étapes

### 1. Demander la création ou la modification d'un utilisateur

[Contactez le support](mailto:support@hidora.io) en indiquant le projet, le nom de l'instance, le nom de l'utilisateur et le niveau d'accès souhaité.

### 2. Se connecter avec clickhouse-client

```bash
clickhouse-client --host <hôte> --port 9000 --user analyst --password
```

### 3. Vérifier les permissions

Une fois connecté avec un utilisateur en lecture seule, vérifiez que l'écriture est bloquée :

```sql
-- Cette requête doit réussir (lecture autorisée)
SELECT count() FROM system.tables;

-- Cette requête doit échouer (écriture interdite)
CREATE TABLE test_write (id UInt32) ENGINE = Memory;
```

L'utilisateur en lecture seule reçoit une erreur du type :

```console
Code: 164. DB::Exception: analyst: Not enough privileges.
```

## Vérification

```sql
SHOW GRANTS;
```

## Pour aller plus loin

- [Concepts ClickHouse](../concepts.md)
- [Dépannage](../troubleshooting.md)
