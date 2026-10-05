---
title: "Come configurare i backup automatici"
sidebar_position: 3
---

# Come configurare i backup automatici

:::info Disponibilità
La configurazione dei backup PostgreSQL non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per attivare o modificare i backup di un cluster, [contatti il supporto](mailto:support@hidora.io).
:::

## Principio

I cluster PostgreSQL Hikube sono in grado di eseguire il backup di un database verso uno storage a oggetti compatibile S3:

- **Backup completi** (base backup) pianificati a intervalli regolari;
- **Archiviazione continua dei WAL**, che consente il ripristino a un istante preciso (PITR, Point-In-Time Recovery);
- **Politica di conservazione** che determina la durata di conservazione dei backup.

## Informazioni da preparare

Per una richiesta di attivazione, indichi al supporto:

| Informazione | Esempio |
|--------------|---------|
| Progetto e nome del cluster | `prod` / `orders-db` |
| Frequenza dei backup completi | Ogni giorno alle 2:00 |
| Durata di conservazione | 30 giorni |
| Bucket di destinazione | Un bucket [Hikube Object Storage](../../../storage/buckets/overview.md) dedicato o uno storage S3 esterno |

:::warning
Non trasmetta mai chiavi di accesso S3 tramite un canale non sicuro. Il supporto le indicherà la procedura adeguata.
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
- [Concetti PostgreSQL](../concepts.md)
