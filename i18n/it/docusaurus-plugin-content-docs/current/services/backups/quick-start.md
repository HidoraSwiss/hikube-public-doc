---
sidebar_position: 3
title: "Eseguire il backup e ripristinare un database PostgreSQL"
sidebar_label: Avvio rapido
description: "Crei una destinazione di backup dalla console Hikube, pianifichi il backup di un database PostgreSQL, ne avvii uno su richiesta e poi ripristini l'archivio."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Eseguire il backup e ripristinare un database PostgreSQL

Questa guida crea una destinazione di backup dalla [console Hikube](https://console.hikube.cloud), pianifica il backup giornaliero di un database PostgreSQL, ne avvia uno su richiesta e poi ripristina l'archivio ottenuto. La procedura è la stessa per un database MariaDB, una VM o un disco.

---

## Prerequisiti

- Un progetto Hikube che contenga:
  - un **bucket S3** (vedere [Creare un bucket](../storage/buckets/quick-start.md));
  - un **database PostgreSQL**, ad esempio `orders-db` (vedere [Avvio rapido PostgreSQL](../databases/postgresql/quick-start.md)).

---

## Passo 1: Aprire la creazione della destinazione

1. Nel menu laterale, apra **Infrastructure** > **Backups**.
2. Apra la scheda **Destinations**, poi faccia clic su **Create a destination**.

Si apre la pagina **New destination**.

---

## Passo 2: Configurare e confermare

1. **Name**: `quotidien` (minuscole, cifre e trattini, al massimo 40 caratteri).
2. **Bucket**: scelga il bucket del progetto.
3. **Credentials**: lasci **Create a dedicated user** e inserisca un **User name**, ad esempio `backup`. Le sue credenziali serviranno solo ai backup.
4. **Retention (days)**: mantenga `30`.
5. Faccia clic su **Create**.

La console mostra **Destination created**: «quotidien» è in fase di predisposizione.

---

## Passo 3: Verificare lo stato

Nella scheda **Destinations**, lo stato di `quotidien` passa da **Provisioning** a **Ready** in pochi istanti.

**Risultato atteso:** destinazione **Ready**, con il bucket, l'utente e la conservazione di 30 giorni.

---

## Passo 4: Pianificare e avviare un backup

1. Apra **PostgreSQL**, faccia clic su `orders-db`, poi sulla scheda **Backups**.
2. In **Schedule**, faccia clic su **Schedule**. Si apre la finestra **Schedule a backup**:
   - **Plan name**: `orders-db-quotidien`;
   - **Destination**: `quotidien`;
   - scheda **Preset**, **Frequency**: **Daily**, **Hour** `02`, **Minute** `00` (ora locale).
3. Faccia clic su **Schedule**. Il riquadro **Schedule** mostra l'orario e la prossima esecuzione (**Next**).
4. In **On-demand backup**, faccia clic su **Back up now**. La console mostra **Backup started to “quotidien”**.

Il backup compare in **Run status**, poi nell'elenco degli archivi del database.

**Risultato atteso:** dopo qualche minuto, l'archivio passa a **Ready**.

:::note Orario in UTC
L'ora scelta nell'impostazione predefinita viene convertita in UTC. Si sposterà quindi di un'ora in ora locale al prossimo cambio dell'ora legale. Vedere [Concetti](./concepts.md#orari-e-fuso-orario).
:::

---

## Passo 5: Ripristinare e verificare

Aggiunga prima un dato di controllo, per constatarne poi l'assenza dopo il ripristino:

```sql
CREATE TABLE apres_sauvegarde (id int);
```

Poi ripristini l'archivio sul database di origine:

1. Nella scheda **Backups** di `orders-db`, sulla riga dell'archivio, faccia clic su **Restore**.
2. **Restore target**: **In place**.
3. **Restore up to**: lasci lo stato del backup selezionato.
4. Inserisca `orders-db` per confermare, poi faccia clic sul pulsante di ripristino (**Restore the state of the backup of…**).

:::warning
Un ripristino sul posto **sovrascrive** il contenuto attuale del database. Per fare una prova senza toccare i suoi dati, crei un secondo database PostgreSQL vuoto della stessa versione e scelga **Another application**.
:::

Il ripristino compare in **Restores**, poi passa a **Succeeded**. Si riconnetta al database:

```sql
SELECT to_regclass('apres_sauvegarde');
```

**Risultato atteso:** `NULL`: la tabella creata dopo il backup non esiste più.

---

## Passo 6: Risoluzione rapida dei problemi

| Sintomo | Azione |
|---------|--------|
| **No bucket in this project** | Crei un bucket da **S3 Buckets**, poi torni alla creazione della destinazione. |
| La destinazione resta in **Error** | Il bucket o il suo utente non è più leggibile: vedere [Risoluzione dei problemi](./troubleshooting.md#la-destinazione-è-in-errore). |
| **No destination ready in this project** nella finestra di pianificazione | Attenda che la destinazione sia **Ready**. |
| L'archivio è **Failed** | Legga il messaggio dell'esecuzione in **Backups** > **Activity**, poi vedere [Risoluzione dei problemi](./troubleshooting.md#un-backup-non-riesce). |
| Il ripristino viene rifiutato | Vedere [Risoluzione dei problemi](./troubleshooting.md#un-ripristino-viene-rifiutato). |

---

## Passo 7: Pulizia

1. Nella scheda **Backups** di `orders-db`, riquadro **Schedule**, faccia clic su **Delete** e confermi. Gli archivi vengono conservati.
2. Elimini gli archivi di prova con **Delete** su ogni riga. Per PostgreSQL, scompare solo la voce dell'archivio: i dati restano nel bucket, che può svuotare da **S3 Buckets**.
3. In **Backups** > **Destinations**, apra il menu di `quotidien` e scelga **Delete**. L'eliminazione viene rifiutata finché una pianificazione, un backup o un ripristino la utilizza.

---

## Passi successivi

- [Pianificare i backup](./how-to/schedule-backups.md)
- [Ripristinare un database a un istante preciso](./how-to/restore-point-in-time.md)
- [Ripristinare una VM o un disco](./how-to/restore-vm-or-disk.md)

<NavigationFooter
  nextSteps={[
    {label: "Guide pratiche", href: "../how-to/create-destination"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
