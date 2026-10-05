---
title: "Come configurare i backup automatici"
sidebar_position: 3
---

# Come configurare i backup automatici

:::info Disponibilità
La configurazione dei backup MariaDB non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per attivare o modificare i backup di un cluster, [contatti il supporto](mailto:support@hidora.io).
:::

## Principio

I backup dei cluster MariaDB si basano su snapshot **cifrati** inviati verso uno storage a oggetti compatibile S3, pianificati a intervalli regolari e soggetti a una **strategia di conservazione** che ne determina la durata di conservazione.

## Informazioni da preparare

Per una richiesta di attivazione, indichi al supporto:

| Informazione | Esempio |
|--------------|---------|
| Progetto e nome del cluster | `prod` / `shop-db` |
| Frequenza dei backup | Ogni giorno alle 2:00 |
| Conservazione desiderata | 7 backup giornalieri, 4 settimanali |
| Bucket di destinazione | Un bucket [Hikube Object Storage](../../../storage/buckets/overview.md) dedicato o uno storage S3 esterno |

:::warning
Non trasmetta mai chiavi di accesso S3 tramite un canale non sicuro. Il supporto le indicherà la procedura adeguata.
:::

## Backup logico su richiesta

Indipendentemente dai backup gestiti dalla piattaforma, può esportare in qualsiasi momento un database con `mysqldump` (o `mariadb-dump`):

```bash
mysqldump -h <host> -P 3306 -u app-user -p \
  --single-transaction --routines --triggers \
  myapp > myapp-$(date +%F).sql
```

L'opzione `--single-transaction` produce un'esportazione coerente senza bloccare le tabelle InnoDB.

## Per approfondire

- [Ripristinare un backup](./restore-backup.md)
- [Concetti MariaDB](../concepts.md)
