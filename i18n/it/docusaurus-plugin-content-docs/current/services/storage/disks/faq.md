---
sidebar_position: 6
title: FAQ
---

# FAQ — Dischi

### Qual è la differenza tra un disco e un bucket S3?

Un **disco** è un volume a blocchi collegato a una sola VM, che il sistema operativo formatta e monta come un disco locale. Un [bucket S3](../buckets/overview.md) è uno storage a oggetti accessibile tramite API HTTPS da qualsiasi applicazione, senza essere collegato a una macchina.

---

### Posso creare un disco direttamente dalla procedura guidata della VM?

Sì. Al passaggio **Storage** della procedura guidata di creazione della VM, ogni volume in modalità **New** crea un disco. Questi dischi compaiono poi in **Infrastructure** → **Disks**, come quelli creati dal menu **Disks**.

---

### Un disco può essere collegato a più VM?

No. Un disco è collegato a una sola VM alla volta. Per spostarlo, lo scolleghi dalla prima VM, quindi lo colleghi alla seconda (vedere [Collegare un disco a una VM](./how-to/attach-to-vm.md)).

---

### Cosa succede ai dischi quando elimino una VM?

Vengono **scollegati** e conservati, insieme ai loro dati. Restano nell'elenco **Storage Disks** in stato **Ready** e continuano a consumare la quota di storage del progetto fino alla loro eliminazione.

---

### È possibile ridurre la dimensione di un disco?

No. «Size reduction is not supported»: un disco può soltanto essere ingrandito. Per ridurre lo spazio utilizzato, crei un disco più piccolo, vi copi i dati dalla VM, quindi elimini quello precedente.

---

### È possibile attivare la cifratura o cambiare la replica dopo la creazione?

No. La cifratura e il tipo di replica si scelgono alla creazione; in seguito è modificabile solo la dimensione. Per cambiare queste opzioni, crei un nuovo disco e vi copi i dati.

---

### Quale replica scegliere?

- **Asynchronous Replication** (consigliata): adatta alla maggior parte dei carichi di lavoro. RPO < 5 min.
- **Synchronous Replication**: per i dati la cui perdita deve essere minima. RPO < 1 min.

In entrambi i casi, il RTO è inferiore a 5 minuti.

---

### Perché la dimensione minima è di 50 GB per Windows?

Un disco di sistema Windows richiede almeno 50 GB. La console applica automaticamente questo minimo quando seleziona un'immagine Windows.

---

### Come viene fatturato un disco?

La procedura guidata mostra un **Estimated Cost**: una tariffa per GB al mese e il costo mensile corrispondente alla dimensione scelta. La tariffa dipende dalla cifratura; un disco di sistema Windows aggiunge il costo della licenza.

---

### Perché non riesco a eliminare il mio disco?

Un disco collegato a una VM non può essere eliminato: la console risponde «The disk cannot be deleted as it is in use.». Lo scolleghi prima dalla pagina di modifica della VM.
