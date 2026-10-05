---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Dischi

### «Size exceeds available quota»

**Causa**: la dimensione richiesta supera lo storage rimanente nella quota del progetto. Il messaggio indica il massimo disponibile.

**Soluzione**:

1. Riduca la **Size (GB)** a un valore inferiore o uguale al massimo indicato.
2. Liberi storage eliminando dischi o risorse inutilizzati (anche i dischi scollegati consumano la quota).
3. Se necessario, faccia aumentare la quota di storage del progetto.

---

### «Minimum size is 20 GB» o «Disk size must be at least 50 GB for Windows»

**Causa**: la dimensione è inferiore al minimo.

**Soluzione**: inserisca almeno 20 GB, oppure 50 GB per un disco di sistema Windows.

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
2. Attenda la fine del riavvio della VM, quindi esegua di nuovo `lsblk` nella VM.

---

### La nuova dimensione non è visibile nella VM dopo un ridimensionamento

**Causa**: il file system non è stato esteso, oppure la VM non ha ancora rilevato la nuova dimensione del dispositivo.

**Soluzione**:

1. Verifichi la dimensione del dispositivo con `lsblk`. Se non è cambiata, riavvii la VM.
2. Estenda la partizione e il file system (vedere [Ridimensionare un disco](./how-to/resize.md)).

---

### L'eliminazione del disco non riesce

**Causa**: il disco è collegato a una VM («The disk cannot be deleted as it is in use.»), oppure il servizio è momentaneamente non disponibile.

**Soluzione**:

1. Scolleghi il disco dalla pagina di modifica della VM (sezione **Storage**), quindi riprovi.
2. Se il messaggio indica «The disk deletion service is temporarily unavailable.», riprovi qualche minuto più tardi.

---

### Il nome del disco viene rifiutato

**Causa**: il nome non rispetta le regole, oppure termina con un suffisso riservato («This domain is reserved by Hikube»).

**Soluzione**: utilizzi da 3 a 16 caratteri (lettere minuscole, cifre e trattini), inizi con una lettera e termini con una lettera o una cifra.
