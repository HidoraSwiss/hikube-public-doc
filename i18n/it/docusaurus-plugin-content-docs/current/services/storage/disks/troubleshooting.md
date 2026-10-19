---
sidebar_position: 7
title: "Risoluzione dei problemi — Dischi"
sidebar_label: Risoluzione dei problemi
description: "Risolvere i problemi comuni dei dischi Hikube: quota superata, dimensione minima, disco in errore o non visibile nella VM, ridimensionamento, eliminazione."
---

# Risoluzione dei problemi — Dischi

### «Size exceeds available quota»

**Causa**: la dimensione richiesta supera lo storage rimanente nella quota del progetto. Il messaggio indica il massimo disponibile.

**Soluzione**:

1. Riduca la **Size (GB)** a un valore inferiore o uguale al massimo indicato.
2. Liberi storage eliminando dischi o risorse inutilizzati (anche i dischi scollegati consumano la quota).
3. Se necessario, faccia aumentare la quota di storage del progetto.

---

### «Minimum size is 20 GB» o «This image needs a disk of at least … GB»

**Causa**: la dimensione è inferiore al minimo.

**Soluzione**: inserisca almeno 20 GB; per un disco di sistema, almeno 28 GB con Windows Server e 40 GB con Oracle Linux.

---

### Il disco resta in «Downloading» o passa a «Error»

**Causa**: l'importazione dell'immagine richiede molto tempo (immagine di grandi dimensioni) oppure non è riuscita (URL non raggiungibile, file non riconosciuto).

**Soluzione**:

1. Segua l'avanzamento in percentuale nella pagina del disco; un'importazione di grandi dimensioni può richiedere tempo.
2. Per un'immagine personalizzata, verifichi che l'URL sia accessibile pubblicamente in HTTPS e punti a un file ISO o QCOW2 valido:
   ```bash
   curl -I https://example.com/image.qcow2
   ```
3. Se il disco passa a **Error**, lo elimini e lo ricrei con un URL corretto. Se il problema persiste, [contatti il supporto](mailto:support@hidora.io) indicando il nome e l'identificativo del disco.

---

### Il disco non compare in «Select an existing volume»

**Causa**: il disco è già collegato a una VM, è già selezionato su un altro volume, oppure il suo tipo non corrisponde al volume.

**Soluzione**:

1. Verifichi nella pagina del disco il campo **Attached to**: se indica una VM, scolleghi prima il disco.
2. Per il **System Disk (Boot)** vengono proposti solo i dischi di sistema (creati a partire da un'immagine); per i volumi dati, solo i dischi dati.

---

### Il disco non è visibile nella VM

**Causa**: la VM non si è ancora riavviata dopo la modifica dello storage, oppure il disco non è stato salvato sulla VM.

**Soluzione**:

1. Verifichi nella pagina del disco che **Attached to** indichi la VM corretta e che lo stato sia **In Use**.
2. Un disco collegato viene preso in carico solo al successivo riavvio della VM: faccia clic su **Restart** (sezione **Actions** della pagina della VM), attenda la fine del riavvio, quindi esegua di nuovo `lsblk` nella VM.

---

### La nuova dimensione non è visibile nella VM dopo un ridimensionamento

**Causa**: il file system non è stato esteso, oppure la VM non ha ancora rilevato la nuova dimensione del dispositivo.

**Soluzione**:

1. Verifichi la dimensione del dispositivo con `lsblk`. Se non è cambiata, riavvii la VM.
2. Estenda la partizione e il file system (vedere [Ridimensionare un disco](./how-to/resize.md)).

---

### L'eliminazione del disco non riesce

**Causa**: una VM usa ancora il disco, oppure il servizio è momentaneamente non disponibile. La console mostra uno di questi messaggi:

- «The disk cannot be deleted as it is in use.» (pagina del disco) o un messaggio equivalente nell'elenco dei dischi: il disco è collegato a una VM;
- «This disk was detached, but its VM still uses it until its next restart. Restart the VM, then try again.»: il disco è stato scollegato, ma la VM non è ancora stata riavviata e lo usa ancora;
- «The disk deletion service is temporarily unavailable.».

**Soluzione**:

1. Disco collegato: lo scolleghi dalla pagina di modifica della VM (sezione **Storage**), faccia clic su **Save**, quindi passi al punto 2.
2. Disco scollegato: faccia clic su **Restart** nella pagina della VM, attenda che torni allo stato **Running**, poi qualche minuto, e riprovi.
3. Servizio non disponibile: riprovi qualche minuto più tardi.

---

### Il nome del disco viene rifiutato

**Causa**: il nome non rispetta le regole, oppure termina con un suffisso riservato («This domain is reserved by Hikube»).

**Soluzione**: utilizzi da 3 a 16 caratteri (lettere minuscole, cifre e trattini), inizi con una lettera e termini con una lettera o una cifra.
