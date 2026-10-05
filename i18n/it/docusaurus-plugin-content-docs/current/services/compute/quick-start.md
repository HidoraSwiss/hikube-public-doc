---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Creare la prima macchina virtuale

Questa guida la accompagna nella creazione di una VM Ubuntu dalla [console Hikube](https://console.hikube.cloud), fino alla prima connessione SSH.

---

## Obiettivo

Al termine di questa guida disporrà di:

- una VM Ubuntu in stato **Running**;
- un IP pubblico con la porta 22 aperta;
- un accesso SSH tramite chiave;
- un disco di sistema replicato.

---

## Prerequisiti

- Un account Hikube e un **progetto** (vedere [Avvio rapido Hikube](../../getting-started/quick-start.md)).
- Quote disponibili in questo progetto: almeno 4 vCPU, 16 GB di memoria e 20 GB di storage per l'esempio seguente.
- Una coppia di chiavi SSH. Se non ne dispone:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/hikube-vm
cat ~/.ssh/hikube-vm.pub
```

Conservi la chiave pubblica visualizzata (riga che inizia con `ssh-ed25519`): la incollerà nella procedura guidata.

---

## Passo 1: Aprire la procedura guidata di creazione

1. Acceda a [https://console.hikube.cloud](https://console.hikube.cloud) e selezioni il suo progetto.
2. Nel menu laterale, apra **Infrastructure** > **VM Instances**.
3. Faccia clic su **Create an Instance**.

Si apre la procedura guidata **Create a new instance**. Comprende cinque passaggi: **General**, **Configuration**, **Storage**, **Network** e **Summary**.

---

## Passo 2: Configurare e confermare

### General

Inserisca il nome nel campo **Instance name**, ad esempio `vm-demo`. Il nome deve contenere da 3 a 16 caratteri, iniziare con una lettera, terminare con una lettera o una cifra e contenere solo lettere minuscole, cifre e trattini. Faccia clic su **Next**.

### Configuration

1. In **Resources (CPU / RAM)**, scelga la serie **Universal (U)**, poi la dimensione **XLARGE** (4 vCPU, 16 GB).
2. Lasci vuota la sezione **Hardware Acceleration (GPU)** (vedere [GPU](../gpu/overview.md) per una VM con GPU).
3. Lasci **Automatic Restart** disattivato oppure lo attivi secondo le sue esigenze.
4. Faccia clic su **Next**.

Il banner in cima al passaggio mostra il costo stimato e il consumo di quota del progetto.

### Storage

Il **System Disk (Boot)** è precompilato: porta il nome della VM e misura 20 GB.

1. In **Operating System**, selezioni la scheda **ubuntu** e la versione **24.04**.
2. Mantenga **Size (GB)** a `20`.
3. Mantenga **Asynchronous Replication** (consigliata).
4. Attivi **Disk Encryption** se desidera cifrare i dati a riposo.
5. Faccia clic su **Next**.

### Network

1. Verifichi che **Public IPv4 Address** sia attivato.
2. Verifichi che **Enable Firewall** sia selezionato e che **SSH (22)** sia selezionato in **Allowed Ports**.
3. In **Authorized SSH keys**, incolli la sua chiave pubblica nel campo **Add a public SSH key**, quindi confermi con Invio o con il pulsante di aggiunta. Il formato atteso è `<algoritmo> <chiave-base64> [commento]`.
4. Faccia clic su **Next**.

### Summary

Il **Summary** riepiloga l'istanza, lo storage e la sezione **Network & Security** (IP pubblico, firewall, porte aperte, chiavi SSH). Faccia clic su **Create instance**.

La console mostra **Instance created** e torna all'elenco delle istanze.

---

## Passo 3: Verificare lo stato

Nell'elenco **VM Instances**, la VM passa da **Creating** a **Running**. L'aggiornamento è automatico, senza ricaricare la pagina.

Faccia clic sul nome della VM per aprirne la pagina di dettaglio. Vi trova:

- **Resources & Characteristics**: tipo di istanza, immagine di sistema, utente predefinito, vCPU e RAM;
- **Storage & Disks**: dischi collegati, dimensione, replica, cifratura;
- **Network & Security**: **Public IP**, **SSH Connection**, **IP Addresses**, **Firewall & Ports**.

**Risultato atteso:** stato **Running**, **Public IP** su **Active**, porta **22** elencata in **Firewall & Ports**.

---

## Passo 4: Recuperare le informazioni di connessione

Nella sezione **Network & Security** della pagina di dettaglio, il blocco **SSH Connection** mostra il comando pronto all'uso, ad esempio:

```bash
ssh ubuntu@203.0.113.10
```

Faccia clic sull'icona di copia per copiarlo negli appunti. L'utente predefinito dipende dall'immagine; è quello indicato nel comando SSH.

---

## Passo 5: Connessione e test

Si connetta con la sua chiave privata:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@203.0.113.10
```

Una volta connesso, verifichi le risorse e il disco:

```bash
nproc
free -h
lsblk
```

**Risultato atteso:** 4 processori, circa 16 GB di memoria e un disco `vda` di circa 20 GB.

---

## Passo 6: Risoluzione rapida dei problemi

| Sintomo | Verifica |
|----------|--------------|
| **Next** resta disattivato al passaggio Configuration o Storage | Una quota del progetto è superata: riduca il formato o la dimensione del disco, oppure faccia aumentare le quote del progetto. |
| `Connection timed out` in SSH | Verifichi nella pagina di dettaglio che **Public IP** sia **Active** e che la porta 22 compaia in **Firewall & Ports**. |
| `Permission denied (publickey)` | Verifichi l'utente (blocco **SSH Connection**) e che la chiave privata utilizzata corrisponda alla chiave pubblica elencata in **Advanced Configuration** > **SSH Keys**. |
| Stato **Error** o **Failed** | Consulti la [risoluzione dei problemi](./troubleshooting.md). |

---

## Passo 7: Pulizia

1. Apra la pagina di dettaglio della VM, oppure il menu **Actions** della riga nell'elenco.
2. Faccia clic su **Delete**.
3. Inserisca il nome esatto della VM per confermare, quindi faccia clic su **Permanently delete**.

Il disco di sistema viene scollegato ma **non eliminato**: resta nel menu **Disks** e continua a consumare quota di storage. Lo elimini da **Disks** se non le serve più (vedere [Dischi](../storage/disks/overview.md)).

:::warning Eliminazione irreversibile
L'eliminazione di una VM, e poi quella dei suoi dischi, è definitiva. Esegua prima un backup dei dati importanti.
:::

---

## Passi successivi

- [Collegare un disco dati](./how-to/attach-extra-disk.md)
- [Configurare cloud-init](./how-to/configure-cloud-init.md)
- [Configurare la rete e il firewall](./how-to/configure-network.md)
- [Collegare la VM a una rete privata (VPC)](../networking/quick-start.md)

<NavigationFooter
  nextSteps={[
    {label: "Guide pratiche", href: "../how-to/attach-extra-disk"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
