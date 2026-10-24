---
title: "Come configurare i backup automatici — MariaDB"
sidebar_label: "Come configurare i backup automatici"
sidebar_position: 3
description: "Pianifichi i backup di un cluster MariaDB Hikube dalla console, verso un bucket del suo progetto, ed esporti un database su richiesta con mysqldump."
---

# Come configurare i backup automatici

I cluster MariaDB si salvano con il [servizio di backup](../../../backups/overview.md) di Hikube, dalla scheda **Backups** della pagina del cluster nella [console Hikube](https://console.hikube.cloud).

## Principio

Ogni backup è un'esportazione completa del cluster, pianificata o su richiesta, scritta in un bucket S3 del suo progetto e conservata secondo la **conservazione** della destinazione.

## Passaggi

1. Crei una destinazione in **Infrastructure** > **Backups** > **Destinations**: vedere [Creare una destinazione](../../../backups/how-to/create-destination.md).
2. Apra **MariaDB**, il cluster, poi la scheda **Backups**.
3. Faccia clic su **Schedule**, scelga la destinazione e l'orario, poi **Schedule**. Vedere [Pianificare i backup](../../../backups/how-to/schedule-backups.md).

Per conservare backup su durate diverse (ad esempio giornalieri conservati 7 giorni e settimanali conservati 30 giorni), crei due destinazioni, ciascuna con la propria conservazione, e una pianificazione verso ciascuna.

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
- [Concetti dei backup](../../../backups/concepts.md)
