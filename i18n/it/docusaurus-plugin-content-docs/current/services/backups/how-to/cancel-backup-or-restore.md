---
title: "Come annullare un backup o un ripristino"
sidebar_position: 6
description: "Annulli un backup in corso o un ripristino di VM bloccato su Hikube: che cosa può essere interrotto, che cosa non può esserlo e che cosa resta dopo l'annullamento."
---

# Come annullare un backup o un ripristino

Questa guida ferma un backup in corso, oppure un ripristino di VM o di disco che non termina, dalla [console Hikube](https://console.hikube.cloud).

## Che cosa può essere annullato

| Operazione | Annullabile |
|------------|-------------|
| Backup non ancora avviato | Sì |
| Backup PostgreSQL | Finché attende di partire. Una volta iniziato, non si interrompe: termina o non riesce da solo. |
| Backup MariaDB | Sì |
| Backup di VM o di disco | Sì, tranne nei primissimi secondi |
| Ripristino di VM o di disco | Sì, tranne nei primissimi secondi |
| Ripristino PostgreSQL o MariaDB | No. Non riesce da solo dopo 30 minuti se non va a buon fine. |
| Operazione terminata o in procinto di terminare | No |

## Annullare un backup

1. Individui il backup in corso: sezione **Run status** della scheda **Backups** della risorsa, oppure **Backups** > **Activity**.
2. Faccia clic su **Cancel**.
3. Nella finestra **Cancel the backup of “…”?**, faccia clic su **Cancel backup** (oppure su **Let it run** per rinunciare).

Il backup compare come **Cancelled** nell'attività e non produce alcun archivio.

## Annullare un ripristino di VM o di disco

1. Nella sezione **Restores** della scheda **Backups**, oppure in **Backups** > **Activity**, faccia clic su **Cancel restore**.
2. Confermi con **Cancel restore**.

:::warning Nulla viene annullato a ritroso
I trasferimenti in corso si fermano, ma ciò che il ripristino ha già fatto resta tale: la VM può restare arrestata e i suoi dischi messi da parte con il nome `<disco>-orig-<identificativo>`, come dopo un errore. È un nuovo ripristino che rimette in funzione la VM.
:::

## Quando l'annullamento viene rifiutato o è incompleto

| Messaggio | Significato | Che cosa fare |
|-----------|-------------|---------------|
| **Cannot cancel yet** | La VM o il disco sta copiando la sua configurazione; nessun trasferimento è ancora iniziato. | Faccia clic su **Retry** qualche secondo dopo. |
| **Cancellation refused** | L'operazione non può essere interrotta (backup PostgreSQL iniziato, ripristino di database, operazione terminata). Il messaggio ne indica il motivo. | Attenda la fine dell'operazione. |
| **Cancellation to finish** | L'operazione è stata fermata, ma una parte del lavoro avviato non ha potuto essere interrotta al primo tentativo. | Faccia clic su **Retry**. Altrimenti, Hikube completa da solo la pulizia nei minuti successivi. |

## Per approfondire

- [Ripristinare una VM o un disco](./restore-vm-or-disk.md)
- [Concetti: annullamento](../concepts.md#annullamento)
