---
title: "Come ripristinare un backup (PITR)"
sidebar_position: 4
description: "Ripristini un cluster PostgreSQL Hikube dalla console: stato di un backup, stato più recente o istante preciso, sul cluster di origine o su un altro cluster."
---

# Come ripristinare un backup (PITR)

Un archivio PostgreSQL si ripristina dalla scheda **Backups** della pagina del cluster, nella [console Hikube](https://console.hikube.cloud), oppure da **Infrastructure** > **Backups** > **Archives**.

## Principio

Grazie all'archiviazione continua dei log delle transazioni, un ripristino può riportare il database:

- allo **stato esatto di un backup**;
- al suo **stato più recente**;
- a un **istante preciso** (PITR, *Point-In-Time Recovery*), tra due backup.

Il ripristino scrive **sul cluster di origine**, il cui contenuto viene sovrascritto, oppure **su un altro cluster PostgreSQL** esistente del progetto, della stessa versione principale.

## Passaggi

- [Ripristinare un database PostgreSQL o MariaDB](../../../backups/how-to/restore-database.md)
- [Ripristinare un database PostgreSQL a un istante preciso](../../../backups/how-to/restore-point-in-time.md)

## Dopo il ripristino

Verifichi i dati prima di rimettere in servizio le sue applicazioni:

```sql
-- Controllare il volume dei dati
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

Se ha ripristinato su un altro cluster, aggiorni la configurazione delle sue applicazioni con il suo indirizzo (zone **Internal** ed **External** della sua pagina) e le sue credenziali.

## Ripristino di un'esportazione logica

Se dispone di un'esportazione eseguita con `pg_dump`, può ripristinarla autonomamente in un database esistente:

```bash
pg_restore --no-owner --dbname "host=<host> port=5432 dbname=myapp user=app_user sslmode=require" \
  myapp-2026-06-15.dump
```

## Per approfondire

- [Configurare i backup](./configure-backups.md)
- [Gestire utenti e database](./manage-users-databases.md)
