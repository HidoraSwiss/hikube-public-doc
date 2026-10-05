---
title: "Come ripristinare un backup (PITR)"
sidebar_position: 4
---

# Come ripristinare un backup (PITR)

:::info Disponibilità
Il ripristino dei backup PostgreSQL non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per ripristinare un cluster, [contatti il supporto](mailto:support@hidora.io).
:::

## Principio

Quando i backup sono attivati su un cluster, l'archiviazione continua dei WAL consente di ripristinare i dati a un **istante preciso** (Point-In-Time Recovery). Il ripristino crea un **nuovo cluster**, con un nome diverso; il cluster di origine non viene modificato.

## Informazioni da preparare

| Informazione | Esempio |
|--------------|---------|
| Progetto e nome del cluster di origine | `prod` / `orders-db` |
| Nome desiderato per il cluster ripristinato | `orders-restored` |
| Istante di ripristino (con fuso orario) | `2026-06-15 14:30 Europe/Zurich`, oppure « ultimo stato disponibile » |

## Dopo il ripristino

Il cluster ripristinato compare nell'elenco **PostgreSQL Clusters** del suo progetto. Verifichi i dati prima di far passare le sue applicazioni al nuovo cluster:

```sql
-- Controllare il volume dei dati
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

Aggiorni quindi la configurazione delle sue applicazioni con l'indirizzo del nuovo cluster (campo **Host** della sua pagina) e le credenziali associate.

## Ripristino di un'esportazione logica

Se dispone di un'esportazione eseguita con `pg_dump`, può ripristinarla autonomamente in un database esistente:

```bash
pg_restore --no-owner --dbname "host=<host> port=5432 dbname=myapp user=app_user sslmode=require" \
  myapp-2026-06-15.dump
```

## Per approfondire

- [Configurare i backup](./configure-backups.md)
- [Gestire utenti e database](./manage-users-databases.md)
