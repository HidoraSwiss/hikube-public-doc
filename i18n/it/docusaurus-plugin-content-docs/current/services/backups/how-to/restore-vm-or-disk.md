---
title: "Come ripristinare una VM o un disco"
sidebar_position: 5
description: "Ripristini una macchina virtuale Hikube e tutti i suoi dischi da un archivio, scelga la sorte dei dischi sostituiti e ricrei una VM o un disco eliminato."
---

# Come ripristinare una VM o un disco

Questa guida ripristina una macchina virtuale, o un disco eliminato, a partire da un archivio, dalla [console Hikube](https://console.hikube.cloud).

## Prerequisiti

- Un archivio **Ready** e ripristinabile della VM o del disco (vedere [Gestire gli archivi](./manage-archives.md)).

## Che cosa occorre sapere

- **Una VM o un disco si ripristina su sé stesso**, mai su un'altra risorsa.
- **L'archivio di una VM contiene tutti i suoi dischi**, e il ripristino li riscrive tutti. Non è possibile ripristinarne uno solo.
- **Un disco salvato da solo non si ripristina su sé stesso finché esiste.** Per tornare a uno stato precedente di un disco collegato, ripristini un archivio della VM a cui è collegato. L'archivio di un disco serve a **ricrearlo** se è stato eliminato.
- La VM viene arrestata durante il ripristino: preveda un'interruzione del servizio.

## Ripristinare una VM

1. Apra **VM Instances**, la VM, poi la sua scheda **Backups**. Può anche partire da **Backups** > **Archives**.
2. Sulla riga dell'archivio, faccia clic su **Restore**.
3. Scelga la sorte di **This machine's current disks**:

   | Scelta | Effetto |
   |--------|---------|
   | **Discard them** (predefinito) | Ogni disco riprende il contenuto dell'archivio; ciò che conteneva finora viene eliminato una volta che il ripristino è riuscito. |
   | **Keep them** | Ogni disco riprende il contenuto dell'archivio; ciò che conteneva finora diventa un disco a sé, chiamato `<disco>-orig-<identificativo>`, scollegato, fatturato finché lei non lo elimina. |

4. Inserisca il nome della VM per confermare, poi faccia clic su **Restore**.

:::tip Quando conservare i vecchi dischi
Scelga **Keep them** se non è certo che l'archivio sia quello giusto: potrà collegare un vecchio disco a una VM per recuperarne dei file. Si ricordi di eliminarlo in seguito da **Disks**.
:::

## Ricreare una VM o un disco eliminato

Se la VM o il disco è stato eliminato, la console lo indica (**“…” was deleted: it will be recreated from this archive.**). Il ripristino ricrea la risorsa con il suo nome di origine.

Per una VM eliminata di cui alcuni dischi sono sopravvissuti, la scelta riguarda **The disks that outlived this machine**.

Se una **nuova** VM o un nuovo disco porta ora lo stesso nome, creato dopo il backup, il ripristino viene rifiutato: sostituirebbe i dati di un'altra risorsa. Elimini prima questa risorsa, poi ripristini. Lo stesso vale se uno dei dischi contenuti nell'archivio di una VM è stato eliminato e poi ricreato dopo il backup.

## Seguire il ripristino

- La sezione **Restores** della scheda **Backups** mostra lo stato, la percentuale di dati trasferiti e la sorte dei dischi di origine (**Original disks deleted if the restore succeeds**, **Original disks kept**…).
- Prima di passare a **Succeeded**, il ripristino verifica che ogni disco dell'archivio sia stato effettivamente riscritto; resta **In progress** durante questi pochi secondi.
- Un ripristino che non riesce, o che lei annulla, **non elimina nulla**, anche con **Discard them**: i vecchi dischi vengono conservati con il nome `<disco>-orig-<identificativo>`, e il messaggio lo indica (**Original disks kept: the restore did not succeed**). Rilanciare il ripristino può riuscire.
- Un ripristino di VM non si ferma da solo se resta bloccato: può annullarlo (vedere [Annullare un backup o un ripristino](./cancel-backup-or-restore.md)).

## Verifica

- Il ripristino è **Succeeded**.
- Avvii la VM se è arrestata, si connetta e controlli i suoi dati.
- Con **Keep them**, i dischi `<disco>-orig-<identificativo>` compaiono in **Disks**, non collegati.

## Per approfondire

- [Concetti: ripristini](../concepts.md#ripristini)
- [Collegare un disco a una VM](../../storage/disks/how-to/attach-to-vm.md)
