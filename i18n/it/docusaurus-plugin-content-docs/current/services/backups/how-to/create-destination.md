---
title: "Come creare e gestire una destinazione di backup"
sidebar_position: 1
description: "Crei una destinazione di backup Hikube su un bucket del suo progetto, ne modifichi la conservazione, utilizzi un bucket bloccato (WORM) ed elimini una destinazione."
---

# Come creare e gestire una destinazione di backup

Una destinazione indica dove vengono scritti i backup del progetto e per quanto tempo vengono conservati. Questa guida la crea dalla [console Hikube](https://console.hikube.cloud), poi spiega come modificarne la conservazione ed eliminarla.

## Prerequisiti

- Un **bucket S3** nel progetto (vedere [Creare un bucket](../../storage/buckets/quick-start.md)). Per archivi che nessuno può eliminare prima di un anno, lo crei con il blocco degli oggetti (vedere [Bucket bloccato](#usare-un-bucket-bloccato-worm)).

## Creare una destinazione

1. Apra **Infrastructure** > **Backups**, scheda **Destinations**, poi faccia clic su **Create a destination**.
2. Compili la pagina **New destination**:

   | Campo | Valore |
   |-------|--------|
   | **Name** | Minuscole, cifre e trattini, al massimo 40 caratteri, senza iniziare né terminare con un trattino. Unico nel progetto. |
   | **Bucket** | Un bucket del progetto. |
   | **Credentials** | **Create a dedicated user** (consigliato) con un **User name**, oppure **Use an existing user** del bucket. |
   | **Retention (days)** | Numero intero di giorni, da 1 a 3 650. |

3. Faccia clic su **Create**. La console mostra **Destination created**.

Nella scheda **Destinations**, la destinazione passa da **Provisioning** a **Ready**. È allora utilizzabile da tutti i database PostgreSQL e MariaDB, le VM e i dischi del progetto.

:::tip Un utente dedicato
Un utente del bucket riservato ai backup può essere revocato o vedere le sue chiavi rinnovate senza toccare le applicazioni che utilizzano lo stesso bucket. Se la creazione dell'utente riesce ma non quella della destinazione, la console lo segnala: riprovi scegliendo questo utente esistente, oppure lo elimini dalla schermata del bucket.
:::

## Modificare la conservazione

1. Nella scheda **Destinations**, apra il menu della destinazione e scelga **Change retention**.
2. Inserisca i **Days kept**, poi faccia clic su **Save**.

Il nuovo valore non si applica allo stesso modo a tutti gli archivi:

- **MariaDB, VM, dischi**: gli archivi già scritti mantengono la loro conservazione; solo i successivi adottano il nuovo valore.
- **PostgreSQL**: il nuovo valore si applica a tutta la cronologia. Ridurlo può eliminare archivi esistenti a partire dal backup successivo.

## Usare un bucket bloccato (WORM)

Se il bucket scelto è stato creato con il blocco degli oggetti, ogni archivio vi resta bloccato per 365 giorni: nessuno può eliminarlo prima. La console mostra **WORM · 365 d** accanto alla destinazione.

- La conservazione deve essere di almeno 365 giorni. Un valore più breve viene rifiutato, sia alla creazione sia alla modifica, con il minimo esatto.
- Il blocco di un bucket non cambia mai: viene fissato alla sua creazione.

## Eliminare una destinazione

1. Nella scheda **Destinations**, apra il menu della destinazione e scelga **Delete**.
2. Confermi.

Prima di confermare, tenga presente che:

- l'eliminazione viene **rifiutata** finché una pianificazione, un backup in corso o un ripristino utilizza la destinazione: elimini prima le pianificazioni interessate;
- gli archivi già creati **restano nel suo bucket**: nulla viene cancellato;
- questi archivi **non sono più ripristinabili**, anche se in seguito ricrea una destinazione con lo stesso nome sullo stesso bucket;
- per PostgreSQL, la conservazione smette di essere applicata: gli archivi non vengono più eliminati automaticamente.

Se l'eliminazione non va completamente a buon fine, la destinazione resta elencata in **Error** con un messaggio che indica che cosa non è stato possibile liberare: la elimini di nuovo.

## Verifica

- La destinazione è **Ready** nella scheda **Destinations**.
- Nella scheda **Backups** di un database, di una VM o di un disco, la destinazione è proposta in **Schedule** e **Back up now**.

## Per approfondire

- [Pianificare i backup](./schedule-backups.md)
- [Concetti: destinazioni](../concepts.md#destinazioni)
