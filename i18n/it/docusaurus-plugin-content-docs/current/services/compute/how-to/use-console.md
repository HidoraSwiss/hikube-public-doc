---
title: "Come aprire la console di una VM"
description: "Visualizzare lo schermo o la porta seriale di una VM dalla console Hikube, per riparare una VM che non risponde più in SSH o in RDP, o seguire un'installazione o un avvio."
---

# Come aprire la console di una VM

La scheda **Console** della pagina di una VM le mostra, nel browser, lo schermo della VM e la sua porta seriale. È l'equivalente di uno schermo e di una tastiera collegati alla macchina: funziona anche quando la VM non è più raggiungibile in rete.

La utilizzi per:

- riparare una VM che non risponde più in SSH o in RDP: firewall interno troppo restrittivo, configurazione di rete errata, sistema bloccato all'avvio;
- seguire un'installazione o un avvio, leggere i messaggi visualizzati sullo schermo;
- usare il menu di avvio o il BIOS della VM;
- inviare Ctrl+Alt+Canc a una VM Windows.

Per un lavoro prolungato, SSH (Linux) o RDP (Windows) restano più comodi e più rapidi.

## Prerequisiti

- Una VM in stato **Running** in **Infrastructure** > **VM Instances**
- Almeno il ruolo **Use** sul progetto (vedere [Diritti necessari](#droits))
- Per la console seriale: un account con password nella VM (vedere [Accedere dalla porta seriale](#mot-de-passe))

## Passaggi

### 1. Aprire la scheda Console

1. Apra **Infrastructure** > **VM Instances** e clicchi sulla VM.
2. Clicchi sulla scheda **Console**, tra **Overview** e **Backups**.
3. Scelga la vista:
   - **Screen (VNC)**: lo schermo grafico della VM;
   - **Serial console**: la porta seriale della VM, in modalità testo.

La scheda **Console** compare solo quando la VM è in esecuzione (o in migrazione). Una VM arrestata non ha console da aprire: la avvii prima (vedere [Avviare una VM](./manage-lifecycle.md#2-avviare-una-vm)).

{/* Screenshot da aggiungere: scheda Console di una VM, vista Screen (VNC), barra degli strumenti visibile.
    File attesi: /img/console/compute/vm-console-vnc.fr.png e .en.png */}

Lo schermo e la porta seriale sono indipendenti: può aprirli entrambi contemporaneamente, ad esempio in due schede del browser.

### 2. Usare lo schermo

La vista **Screen (VNC)** mostra lo schermo della VM. Clicchi nello schermo per inviargli tastiera e mouse. La barra degli strumenti propone:

| Pulsante | Effetto |
|----------|---------|
| **Ctrl+Alt+Del** | Invia la combinazione alla VM. Indispensabile sotto Windows: digitata sulla sua tastiera, viene intercettata dal suo sistema. |
| **Paste clipboard** | Digita nella VM il testo dei suoi appunti (vedere sotto). |
| **Full screen** | Mostra lo schermo della VM a schermo intero. Tenga premuto Esc per uscire. |
| **New tab** | Apre la sola console in una nuova scheda del browser. |

**Tastiera.** I tasti premuti vengono interpretati secondo il layout di tastiera configurato nella VM, non secondo quello del suo computer. Se i caratteri visualizzati non corrispondono ai tasti (ad esempio `z` e `y` invertiti), cambi il layout nel sistema della VM.

**Incolla.** Non esistono appunti condivisi tra il suo computer e la VM. **Paste clipboard** aggira questo limite digitando il testo tasto per tasto, come su una tastiera US:

- passano solo i caratteri ASCII, Invio e Tab: le lettere accentate e gli altri caratteri vengono ignorati, e la console indica quanti non è stato possibile digitare;
- al massimo 4000 caratteri;
- se la VM usa un layout diverso da quello US, alcuni caratteri possono risultare diversi.

Se il browser rifiuta l'accesso agli appunti, si apre una finestra **Paste text**: incolli lì il testo, poi clicchi su **Type the text**.

### 3. Usare la porta seriale

La vista **Serial console** mostra la porta seriale della VM in un terminale. All'apertura, un banner ricorda l'organizzazione, il progetto e la VM, poi indica: «Press Enter to show the login prompt.»

{/* Screenshot da aggiungere: scheda Console di una VM, vista Serial console, banner e prompt di login.
    File attesi: /img/console/compute/vm-console-serial.fr.png e .en.png */}

Prema Invio: compare il prompt di login della VM, se il suo sistema ne propone uno sulla porta seriale (è il caso delle immagini Linux più comuni). Acceda con un utente della VM e la relativa password.

La barra degli strumenti propone:

| Pulsante | Effetto |
|----------|---------|
| **–** / **+** | Riduce o ingrandisce il carattere del terminale. |
| **Full screen** | Mostra il terminale a schermo intero. |
| **New tab** | Apre la sola console in una nuova scheda del browser. |
| **Fit the VM to C×R** | Comunica al sistema della VM la dimensione del terminale (C colonne, R righe). |

**Adattare la dimensione.** La porta seriale non trasmette la dimensione della sua finestra: senza regolazione, i programmi a schermo intero (`vim`, `less`, `top`) usano solo una parte del terminale. Il pulsante **Fit the VM to C×R** digita per lei `stty rows R cols C` nella sessione. Lo usi **una volta connesso a una shell**: al prompt di login, il comando verrebbe preso per un nome utente. Lo ripeta dopo aver cambiato la dimensione della finestra o del carattere.

**Cosa non fa la porta seriale**:

- non ha cronologia: viene mostrato solo ciò che la VM scrive dopo l'apertura;
- la sua velocità è di circa 40 KB/s: un comando che stampa molto testo scorre lentamente. Per un lavoro prolungato, preferisca SSH.

#### Accedere dalla porta seriale {#mot-de-passe}

La porta seriale chiede un utente **e una password**. Le immagini cloud spesso non ne definiscono alcuna: vi si accede con una chiave SSH, e l'utente predefinito non ha password. In questo caso il prompt di login compare, ma nessuna password viene accettata.

Definisca una password **prima** di averne bisogno, finché la VM è raggiungibile:

- **da una sessione SSH**: `sudo passwd <utente>`;
- **alla creazione della VM**, nel campo **Cloud-Init script (User Data)** (vedere [Configurare cloud-init](./configure-cloud-init.md)). Ad esempio, per l'utente predefinito dell'immagine:

```yaml title="user-data.yaml"
#cloud-config
password: "<password-temporanea>"
chpasswd:
  expire: true
ssh_pwauth: false
```

`expire: true` obbliga a cambiare la password al primo accesso; `ssh_pwauth: false` lascia SSH accessibile solo con chiave: la password serve unicamente sulla console. Non conservi una vera password in uno script cloud-init: la sostituisca al primo accesso.

## Diritti necessari {#droits}

Aprire la console richiede almeno il ruolo **Use** sul progetto: dalla console si può agire sulla VM come con una tastiera. Un membro con il solo ruolo **Read** vede la VM, ma l'apertura della sua console viene rifiutata con il messaggio «You are not allowed to open this console.»

:::info Disponibilità
La console di una VM si apre solo dalla console web Hikube. Non è accessibile con una chiave API, né da riga di comando.
:::

## Una sola sessione per console {#une-seule-session-par-console}

Ogni console di una VM, lo schermo come la porta seriale, accetta una sola sessione alla volta. Aprirla altrove, in un'altra scheda o da parte di un'altra persona, chiude la sessione precedente. Questa mostra:

> The console was closed, perhaps opened elsewhere.

con un pulsante **Reconnect**. Non si riconnette da sola: cliccare su **Reconnect** riprende la console e chiude a sua volta la sessione dell'altra scheda o dell'altra persona. Prima di riprendere una console, si assicuri che nessun altro la stia usando.

Il pulsante **New tab** segue la stessa regola: la console si apre nella nuova scheda, e la scheda d'origine mostra «The console is open in another tab.» con un pulsante **Open here** per riprenderla.

## Durata e riconnessioni

| Situazione | Cosa fa la console |
|------------|--------------------|
| Circa ogni 12 minuti | La connessione sicura viene rinnovata: la sessione si riapre da sola, in circa un secondo. |
| Manutenzione della piattaforma | Riconnessione automatica. |
| Migrazione della VM su un altro server | Riconnessione automatica. |
| VM arrestata o riavviata dalla console Hikube | La console mostra «The instance is not running. The console will open as soon as it has started.» e si riapre da sola quando la VM è di nuovo in esecuzione. |
| Sessione aperta da 8 ore | La sessione si chiude («The session reached its maximum duration of 8 hours.»): clicchi su **Reconnect**. |

Sullo schermo, una riconnessione non fa perdere nulla: l'immagine viene ridisegnata. Sulla porta seriale, ciò che la VM scrive durante il secondo della riconnessione va perso; la sua sessione nella VM resta aperta.

:::tip Vedere l'avvio dall'inizio
Dopo un **Restart** dalla console Hikube, la console si riapre quando la VM è di nuovo in esecuzione: i primi secondi dell'avvio (menu di avvio, BIOS) possono essere già passati. Per vederli, tenga aperta la console e riavvii dal sistema della VM (`sudo reboot`, oppure **Ctrl+Alt+Del** e poi riavvio sotto Windows).
:::

## FAQ

### Sullo schermo non compare nulla

- Lo schermo della VM potrebbe essere in standby: clicchi nello schermo o prema un tasto, ad esempio Maiusc.
- Una VM Linux senza interfaccia grafica mostra un semplice prompt di login testuale; se resta nero, provi la **Serial console**.
- Se la VM è appena stata avviata, il suo sistema potrebbe non aver ancora mostrato nulla: attenda qualche secondo.

### Sulla porta seriale non compare nulla

La porta seriale non ha cronologia: prema Invio per far comparire il prompt di login. Se non compare nulla, il sistema della VM forse non usa la porta seriale (è il caso di Windows e di alcune immagini personalizzate): usi **Screen (VNC)**.

### La console si è chiusa

A seconda del messaggio mostrato:

- «The console was closed, perhaps opened elsewhere.»: la stessa console è stata aperta in un'altra scheda o da un'altra persona (vedere [Una sola sessione per console](#une-seule-session-par-console));
- «The session reached its maximum duration of 8 hours.»: clicchi su **Reconnect**;
- «The connection was too slow to keep up with the screen: the session was closed.»: la sua connessione Internet non ha retto il flusso dello schermo. Clicchi su **Reconnect**; se si ripete, chiuda le applicazioni che caricano la connessione o riduca l'attività sullo schermo della VM.

In tutti e tre i casi, la console non si riapre da sola.

### Non ho una password per la porta seriale

È il caso più frequente con le immagini cloud, pensate per l'accesso con chiave SSH. Definisca una password come indicato in [Accedere dalla porta seriale](#mot-de-passe). Se la VM non è più raggiungibile in SSH e non ha alcuna password, la console non permette di accedervi: corregga la causa tramite lo script cloud-init (**Edit** > **Advanced Configuration**, poi **Reload UserData** e **Restart**, vedere [Risoluzione dei problemi](../troubleshooting.md)), oppure contatti il [supporto](mailto:support@hidora.io).

### La scheda Console non compare

La VM non è in esecuzione: la scheda è proposta solo per una VM **Running** (o in migrazione). La avvii, poi riapra la sua pagina.

## Condizioni d'uso

La console è un servizio Hikube, soggetto alle [condizioni generali di Hidora SA](https://hikube.cloud/en/terms).

## Per approfondire

- [Avviare, arrestare, modificare ed eliminare una VM](./manage-lifecycle.md)
- [Configurare cloud-init](./configure-cloud-init.md)
- [Risoluzione dei problemi](../troubleshooting.md)
