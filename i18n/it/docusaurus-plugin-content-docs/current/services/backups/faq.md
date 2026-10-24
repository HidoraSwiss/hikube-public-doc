---
sidebar_position: 6
title: "FAQ — Backup"
sidebar_label: FAQ
description: "Risposte alle domande sui backup Hikube: risorse coperte, posizione degli archivi, quota, fuso orario, PostgreSQL e destinazioni, ripristino verso una copia, eliminazione."
---

# FAQ — Backup

### Quali risorse possono essere salvate?

I database **PostgreSQL** e **MariaDB**, le **macchine virtuali** (con tutti i loro dischi) e i **dischi**. MongoDB, Redis, RabbitMQ, i cluster Kubernetes e i bucket non sono coperti da questo servizio. I dati di un cluster [Kubernetes](../kubernetes/overview.md) si salvano con gli strumenti installati in quel cluster.

---

### Dove sono conservati i miei backup?

Nel bucket S3 del suo progetto scelto per la destinazione. Hikube non ne conserva altre copie: eliminare il bucket elimina gli archivi.

---

### I backup hanno una quota?

No, nessuna quota specifica. Gli archivi occupano lo spazio del loro bucket, conteggiato come il resto dello storage a oggetti.

---

### Devo creare una destinazione per ogni risorsa?

No. Una destinazione serve a tutte le risorse coperte del progetto. Ne crei più d'una per conservazioni o bucket diversi.

---

### Posso salvare un database PostgreSQL verso due destinazioni?

No. Un database PostgreSQL archivia i suoi log delle transazioni in continuo verso una sola destinazione; due destinazioni si dividerebbero questo flusso e nessuna conterrebbe una cronologia completa. La seconda viene rifiutata. Più pianificazioni verso la stessa destinazione restano possibili. Vedere [Concetti](./concepts.md#postgresql-una-sola-destinazione).

---

### In quale fuso orario sono gli orari?

In UTC. L'impostazione predefinita della console converte la sua ora locale in UTC; l'espressione cron si inserisce direttamente in UTC. Un backup pianificato si sposta quindi di un'ora in ora locale a ogni cambio dell'ora legale.

---

### Posso eseguire backup più spesso di una volta all'ora?

Non con una pianificazione: la frequenza massima è di un'esecuzione all'ora. Per PostgreSQL non è necessario: i log delle transazioni sono archiviati in continuo, e il [ripristino a un istante preciso](./how-to/restore-point-in-time.md) raggiunge qualsiasi istante tra due backup.

---

### Come ottenere una copia di un database senza toccare l'originale?

Crei un database vuoto dello stesso tipo (e della stessa versione principale per PostgreSQL), poi vi ripristini l'archivio con **Another application**. Vedere [Ripristinare un database](./how-to/restore-database.md).

---

### Posso ripristinare una VM con un altro nome?

No. Una VM o un disco si ripristina solo su sé stesso. Per recuperare dei file senza sostituire l'intera VM, la ripristini scegliendo **Keep them**: i vecchi dischi restano disponibili come dischi separati. Vedere [Ripristinare una VM o un disco](./how-to/restore-vm-or-disk.md).

---

### Posso ripristinare un solo disco di una VM?

No. L'archivio di una VM si ripristina per intero, con tutti i suoi dischi. L'archivio di un disco salvato da solo serve solo a ricrearlo se è stato eliminato.

---

### Eliminare un archivio libera spazio nel mio bucket?

Per una **VM** o un **disco**, sì: i dati vengono cancellati poco dopo l'eliminazione. Per **PostgreSQL** e **MariaDB**, no: scompare dalla console solo la voce dell'archivio, i dati restano nel bucket.

---

### Che cosa succede ai miei archivi se elimino la risorsa salvata?

Vengono conservati e restano ripristinabili. Per una VM o un disco, il ripristino ricrea la risorsa; per un database, scelga un altro database come target.

---

### Che cosa succede ai miei archivi se elimino la destinazione?

Restano nel bucket, ma non sono più ripristinabili dalla console, anche se ricrea una destinazione con lo stesso nome. Per PostgreSQL, la loro conservazione non viene più applicata.

---

### Perché la dimensione dei miei archivi non viene mostrata?

Oggi non viene misurata. Per una VM o un disco, la percentuale mostrata durante un backup misura i dati trasferiti, non lo spazio occupato. Lo spazio effettivo si legge sul bucket.

---

### Che cosa succede se un backup pianificato cade durante un ripristino?

Un backup su richiesta viene rifiutato durante un ripristino, ma un backup pianificato si avvia comunque. Per un database PostgreSQL ripristinato sul posto, può far fallire il ripristino: prima di ripristinare, verifichi che nessuna esecuzione sia prevista nei 30 minuti successivi.
