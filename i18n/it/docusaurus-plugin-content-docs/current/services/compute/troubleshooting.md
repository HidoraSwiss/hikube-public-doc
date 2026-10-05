---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Macchine virtuali

### Il pulsante Next resta disattivato nella procedura guidata

**Causa**: la VM supererebbe una quota del progetto (CPU, memoria o storage). Il banner della procedura guidata mostra **Quota exceeded** e il dettaglio per risorsa.

**Soluzione**:

1. Scelga un tipo di istanza più piccolo o riduca la dimensione dei dischi.
2. Liberi risorse: elimini VM o dischi inutilizzati (i dischi scollegati sono conteggiati nella quota di storage).
3. Faccia aumentare le quote del progetto.

Se la console indica che le quote del progetto non sono disponibili, la creazione resta bloccata finché non possono essere lette: riprovi più tardi o contatti il [supporto](mailto:support@hidora.io).

---

### Errore alla creazione: nome già utilizzato o dimensione del disco rifiutata

**Causa e soluzione**:

| Messaggio | Soluzione |
|---------|----------|
| **An instance with this name already exists.** | Scelga un altro nome. |
| **Min. 20 GB required** / **Min. 50 GB required** | Aumenti **Size (GB)**: minimo 20 GB, 50 GB per Windows. |
| Messaggio che indica una dimensione minima per Oracle Linux | Il disco di sistema Oracle Linux richiede almeno 40 GB. |
| **A system image is required for a new disk** | Selezioni una scheda in **Operating System**. |
| **Invalid format. Expected: `<algorithm> <base64-key> [comment]`** | Incolli la chiave **pubblica** completa (file `.pub`), su una sola riga. |

---

### La VM resta in stato Error o Failed

**Causa**: la VM non ha potuto essere pianificata o avviata (risorse non disponibili, disco in errore, GPU non disponibile…). Quando la piattaforma restituisce un motivo, questo viene mostrato al passaggio del mouse sul badge di stato.

**Soluzione**:

1. Apra la pagina di dettaglio e verifichi la sezione **Storage & Disks**: i dischi devono essere presenti.
2. Se la VM dispone di GPU, consulti [GPU non disponibile all'avvio](#gpu-non-disponibile-allavvio).
3. Provi **Stop** e poi **Start** dalla sezione **Actions**.
4. Se lo stato persiste, contatti il [supporto](mailto:support@hidora.io) indicando il nome della VM e il suo identificativo (mostrato sotto il titolo della pagina di dettaglio, con un pulsante di copia).

---

### Timeout SSH

**Causa**: nessun IP pubblico, porta 22 non autorizzata, oppure servizio SSH non ancora avviato nella VM.

**Soluzione**:

1. Nella pagina di dettaglio, sezione **Network & Security**: **Public IP** deve essere **Active** e la porta **22** deve comparire in **Firewall & Ports**.
2. In caso contrario, faccia clic su **Edit**, attivi **Public IPv4 Address**, selezioni **SSH (22)** in **Allowed Ports**, poi faccia clic su **Save**.
3. Subito dopo la creazione, attenda uno o due minuti che il sistema operativo abbia terminato l'avvio.
4. Esegua un test in modalità dettagliata:
   ```bash
   ssh -v ubuntu@<ip-pubblico>
   ```

---

### Permission denied (publickey)

**Causa**: utente errato, chiave errata, oppure chiave aggiunta dopo il primo avvio senza ricaricare lo user-data.

**Soluzione**:

1. Utilizzi l'utente indicato nel blocco **SSH Connection** (oppure in **System Image** > **User**).
2. Verifichi che la chiave pubblica corrispondente alla sua chiave privata compaia in **Advanced Configuration** > **SSH Keys**.
3. Se ha appena aggiunto la chiave tramite **Edit**, scelga **Reload user-data** nella finestra di dialogo **SSH keys changed**, oppure avvii **Reload UserData** dalla sezione **Actions**, poi **Restart**: la chiave viene installata solo al riavvio.

---

### Il disco aggiunto non compare nella VM

**Causa**: la VM non è ancora stata riavviata dopo l'aggiunta, oppure il disco non è formattato.

**Soluzione**:

1. Dopo **Save**, la console mostra **Restart required**: attenda che la VM torni allo stato **Running**.
2. Verifichi il disco nella sezione **Storage & Disks** della pagina di dettaglio.
3. Nella VM, elenchi i dispositivi: un nuovo disco compare senza partizione né punto di montaggio.
   ```bash
   lsblk
   ```
4. Lo formatti e lo monti: vedere [Collegare un disco supplementare](./how-to/attach-extra-disk.md).

---

### GPU non disponibile all'avvio

**Causa**: una GPU viene liberata quando la VM è arrestata e nel frattempo può essere assegnata a un altro carico di lavoro.

**Soluzione**: all'avvio, se la GPU non è più disponibile, la console apre la finestra **Select an alternative GPU**. Scelga un modello in **Available GPU** e faccia clic su **Update and Start**. Se la finestra indica **No GPUs are currently available.**, riprovi più tardi o contatti il [supporto](mailto:support@hidora.io). Vedere [Risoluzione dei problemi GPU](../gpu/troubleshooting.md).

---

### Il DNS .local non funziona nella VM

**Causa**: `systemd-resolved` tratta i domini `.local` come mDNS.

**Soluzione**: vedere [Risolvere il DNS .local nelle VM](./how-to/fix-dns-local.md).

---

### La VM non risponde più (né SSH né RDP)

**Causa**: sistema operativo bloccato, rete configurata male nella VM, firewall interno troppo restrittivo.

**Soluzione**:

1. Avvii **Restart** dalla sezione **Actions** della pagina di dettaglio.
2. Se è in causa una modifica recente del cloud-init, corregga lo script in **Edit** > **Advanced Configuration**, poi avvii **Reload UserData** e **Restart**.
3. L'accesso tramite console seriale o VNC non è disponibile nella console; contatti il [supporto](mailto:support@hidora.io) per una diagnosi di basso livello.
