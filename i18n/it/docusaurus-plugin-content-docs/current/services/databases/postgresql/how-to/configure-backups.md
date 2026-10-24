---
title: "Come configurare i backup automatici — PostgreSQL"
sidebar_label: "Come configurare i backup automatici"
sidebar_position: 3
description: "Pianifichi i backup di un cluster PostgreSQL Hikube dalla console, verso un bucket del suo progetto, ed esporti un database su richiesta con pg_dump."
---

# Come configurare i backup automatici

I cluster PostgreSQL si salvano con il [servizio di backup](../../../backups/overview.md) di Hikube, dalla scheda **Backups** della pagina del cluster nella [console Hikube](https://console.hikube.cloud).

## Principio

- **Backup completi**, pianificati o su richiesta, scritti in un bucket S3 del suo progetto;
- **Archiviazione continua dei log delle transazioni** tra due backup, che consente di ripristinare il database a un istante preciso;
- **Conservazione** in giorni, fissata dalla destinazione.

## Passaggi

1. Crei una destinazione in **Infrastructure** > **Backups** > **Destinations**: vedere [Creare una destinazione](../../../backups/how-to/create-destination.md).
2. Apra **PostgreSQL**, il cluster, poi la scheda **Backups**.
3. Faccia clic su **Schedule**, scelga la destinazione e l'orario, poi **Schedule**. Vedere [Pianificare i backup](../../../backups/how-to/schedule-backups.md).

:::warning Una sola destinazione per cluster
Tutti i backup di uno stesso cluster PostgreSQL devono puntare alla stessa destinazione: una seconda destinazione viene rifiutata.
:::

## Backup logico su richiesta

Indipendentemente dai backup gestiti dalla piattaforma, può esportare in qualsiasi momento un database con gli strumenti PostgreSQL standard:

```bash
# Esportazione di un database in formato custom
pg_dump "host=<host> port=5432 dbname=myapp user=app_user sslmode=require" \
  --format=custom --file=myapp-$(date +%F).dump
```

L'utente deve disporre del diritto **Administrator (Admin)** o **Read-only** sul database esportato.

## Per approfondire

- [Ripristinare un backup](./restore-backup.md)
- [Concetti dei backup](../../../backups/concepts.md)
