---
title: "Come creare una VM Windows"
---

# Come creare una VM Windows

La console Hikube propone immagini **Windows Server** pronte all'uso. Questa guida spiega come creare una VM Windows Server, recuperare la password di amministratore generata e connettersi in RDP.

## Prerequisiti

- Un account Hikube e un progetto con almeno 4 vCPU, 16 GB di memoria e 50 GB di storage disponibili
- Un client RDP (Connessione Desktop remoto su Windows, Windows App su macOS, `xfreerdp` o Remmina su Linux)
- Un gestore di password per conservare la password di amministratore

## Passaggi

### 1. Avviare la procedura guidata

Apra **Infrastructure** > **VM Instances** e faccia clic su **Create an Instance**. Al passaggio **General**, inserisca il nome nel campo **Instance name** (ad esempio `win-srv01`), quindi faccia clic su **Next**.

### 2. Scegliere il formato

Al passaggio **Configuration**, scelga almeno **Universal (U)** > **XLARGE** (4 vCPU, 16 GB). Faccia clic su **Next**.

:::note Licenza Windows
La licenza Windows viene fatturata in base al numero di vCPU. È inclusa nel costo stimato mostrato in cima alla procedura guidata.
:::

### 3. Scegliere l'immagine e il disco di sistema

Al passaggio **Storage**:

1. In **Operating System**, selezioni la scheda **windows-server** e la versione **2022** o **2025**.
2. Porti **Size (GB)** ad almeno `50`: è il minimo per Windows (messaggio **Min. 50 GB required** sotto il campo).
3. Scelga il **Replication Type** e, se necessario, attivi **Disk Encryption**.
4. Faccia clic su **Next**.

### 4. Aprire la porta RDP

Al passaggio **Network**:

1. Lasci **Public IPv4 Address** attivato e **Enable Firewall** selezionato.
2. In **Custom port...**, inserisca `3389` e faccia clic sul pulsante di aggiunta.
3. Deselezioni **SSH (22)** se non utilizza OpenSSH sul server.

Il campo **Cloud-Init script (User Data)** non è disponibile per Windows.

### 5. Creare l'istanza e copiare la password

Al passaggio **Summary**, faccia clic su **Create instance**. Si apre la finestra **Windows Instance Credentials**, che mostra:

- **Default Username**;
- **Administrator Password**.

Copi entrambi i valori con i pulsanti di copia e li salvi nel suo gestore di password, quindi faccia clic su **I copied the password and continue**.

:::warning Password mostrata una sola volta
La password viene generata alla creazione e **non sarà più mostrata**. Se la perde, non è recuperabile dalla console.
:::

### 6. Attendere l'avvio

Nell'elenco **VM Instances**, attenda lo stato **Running**. Il primo avvio di Windows (inizializzazione e configurazione) richiede diversi minuti in più rispetto a una VM Linux: attenda prima della prima connessione RDP.

### 7. Connettersi in RDP

Annoti l'indirizzo IP pubblico nella pagina di dettaglio: compare nel blocco **SSH Connection** della sezione **Network & Security**. Si connetta quindi:

```bash
# Linux
xfreerdp /v:<ip-pubblico> /u:<nome-utente>
```

Su Windows o macOS, aggiunga un PC con l'indirizzo `<ip-pubblico>` nel suo client Desktop remoto e utilizzi le credenziali copiate al passaggio 5.

## Verifica

Verifichi l'apertura della porta RDP dalla sua postazione:

```bash
nc -zv -w 5 <ip-pubblico> 3389
```

**Risultato atteso:** `Connection to <ip-pubblico> 3389 port [tcp/ms-wbt-server] succeeded!`

Una volta connesso, cambi la password e applichi gli aggiornamenti di Windows.

:::note Installazione dalla propria ISO
L'installazione di Windows da una ISO personalizzata richiede un accesso alla console grafica (VNC) durante l'installazione. Questa opzione non è disponibile nella console; contatti il [supporto](mailto:support@hidora.io).
:::

## Per approfondire

- [Configurare la rete e il firewall](./configure-network.md)
- [Collegare un disco supplementare](./attach-extra-disk.md)
