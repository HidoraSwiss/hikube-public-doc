---
title: "Come pianificare i backup ed eseguirli su richiesta"
sidebar_position: 2
description: "Pianifichi il backup ricorrente di un database, di una VM o di un disco Hikube, avvii un backup su richiesta e individui le risorse non protette."
---

# Come pianificare i backup ed eseguirli su richiesta

Questa guida pianifica il backup ricorrente di una risorsa dalla [console Hikube](https://console.hikube.cloud), avvia un backup immediato e mostra come individuare le risorse che non sono protette.

## Prerequisiti

- Una destinazione **Ready** nel progetto (vedere [Creare una destinazione](./create-destination.md)).
- Un database PostgreSQL o MariaDB, una VM o un disco.

## Pianificare un backup

1. Apra la risorsa (ad esempio **PostgreSQL** > il suo database, oppure **VM Instances** > la sua VM), poi la sua scheda **Backups**.
2. Nel riquadro **Schedule**, faccia clic su **Schedule**.
3. Nella finestra **Schedule a backup**:
   - **Plan name**: minuscole, cifre e trattini, al massimo 40 caratteri;
   - **Destination**: una destinazione **Ready**;
   - l'orario, in uno dei due modi descritti di seguito.
4. Faccia clic su **Schedule**.

### Orario tramite impostazione predefinita

Nella scheda **Preset**, scelga una **Frequency**:

| Frequenza | Campi |
|-----------|-------|
| **Hourly** | **Minute** |
| **Daily** | **Hour**, **Minute** |
| **Weekly** | **Day**, **Hour**, **Minute** |

L'ora si inserisce in **ora locale** e viene convertita in UTC al salvataggio. La console mostra l'espressione ottenuta seguita da **(UTC)**, e la **Next run**.

### Orario come espressione cron

Nella scheda **Cron expression**, inserisca un'espressione a cinque campi (minuto, ora, giorno del mese, mese, giorno della settimana), **interpretata in UTC**:

| Espressione | Significato |
|-------------|-------------|
| `0 1 * * *` | Ogni giorno alle 01:00 UTC |
| `30 2 * * 0` | Ogni domenica alle 02:30 UTC |
| `0 3 1 * *` | Il 1° di ogni mese alle 03:00 UTC |
| `@daily` | Ogni giorno alle 00:00 UTC |

Vengono rifiutati: un'espressione che si attiva più di una volta all'ora (ad esempio `*/30 * * * *`), gli intervalli `@every` e i prefissi di fuso orario `CRON_TZ=` o `TZ=`.

:::note Cambio dell'ora legale
Un orario è fisso in UTC: si sposta di un'ora in ora locale a ogni cambio dell'ora legale. Un backup pianificato alle 02:00 in inverno a Zurigo viene eseguito alle 03:00 in estate.
:::

## Modificare o eliminare una pianificazione

- **Edit**: si modifica solo l'orario. Il nome, la risorsa e la destinazione sono fissati alla creazione; per cambiare destinazione, elimini la pianificazione e ne crei un'altra.
- **Delete**: le esecuzioni future si fermano e gli archivi già creati vengono conservati. La cronologia delle esecuzioni di questa pianificazione scompare con essa.

Una risorsa può avere più pianificazioni, ad esempio una giornaliera e una mensile.

:::warning PostgreSQL: una sola destinazione
Tutte le pianificazioni e tutti i backup di uno stesso database PostgreSQL devono puntare alla **stessa** destinazione. Una seconda destinazione viene rifiutata. Vedere [Concetti](../concepts.md#postgresql-una-sola-destinazione).
:::

## Eseguire subito un backup

1. Nella scheda **Backups** della risorsa, sezione **On-demand backup**, scelga la **Destination** se ce ne sono più di una pronte.
2. Faccia clic su **Back up now**.

Il backup compare in **Run status**. Per una VM o un disco, la console mostra la percentuale di dati trasferiti.

Un backup su richiesta viene rifiutato durante un ripristino della stessa risorsa.

## Salvare i dischi di una VM

L'archivio di una VM contiene tutti i suoi dischi: basta pianificare la VM. Nella scheda **Backups** di un disco collegato, la console indica allora **Backed up with another resource**. Una pianificazione propria del disco resta possibile (**Schedule a backup of this resource**), ma un tale archivio non si ripristina sul disco finché esiste: vedere [Ripristinare una VM o un disco](./restore-vm-or-disk.md).

## Individuare le risorse non protette

Apra **Backups** > **Protection**. Ogni risorsa coperta del progetto vi compare con il suo stato:

| Stato | Significato |
|-------|-------------|
| **Scheduled** | Almeno una pianificazione valida. |
| **Covered** | Nessuna pianificazione propria, ma contenuta negli archivi di un'altra risorsa (disco di una VM pianificata). |
| **Schedule failing** | Tutte le sue pianificazioni sono in errore. |
| **Unprotected** | Nessuna pianificazione. |

Il pulsante **Schedule** di questa pagina apre direttamente la finestra di pianificazione. Il widget **Backup status** della dashboard riassume le applicazioni senza protezione, le ultime esecuzioni non riuscite e le destinazioni non disponibili.

## Verifica

- Il riquadro **Schedule** mostra l'orario, la prossima (**Next**) e l'ultima (**Last**) esecuzione.
- **Backups** > **Activity** elenca ogni esecuzione con il suo stato e la sua durata.

## Per approfondire

- [Gestire gli archivi](./manage-archives.md)
- [Annullare un backup o un ripristino](./cancel-backup-or-restore.md)
