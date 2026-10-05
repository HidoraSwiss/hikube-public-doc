---
sidebar_position: 6
title: FAQ
---

# FAQ — Macchine virtuali

### Qual è la differenza tra firewall attivato e disattivato?

| | **Enable Firewall** selezionato | Firewall non selezionato |
|---|---|---|
| **Porte aperte sull'IP pubblico** | Solo le **Allowed Ports** | Tutte |
| **Sicurezza** | Superficie di attacco ridotta | Firewall da configurare nel sistema operativo (ufw, firewalld, nftables) |
| **Casi d'uso** | Produzione, servizi mirati | VPN, gateway, protocolli a porte dinamiche |

Le porte si modificano in qualsiasi momento dalla pagina di dettaglio > **Edit** > **Network & Security**. Vedere [Configurare la rete](./how-to/configure-network.md).

---

### Quali immagini sono disponibili?

AlmaLinux, CentOS Stream, CloudLinux, Debian, openSUSE, Oracle Linux, Rocky Linux, Ubuntu e Windows Server. Il dettaglio delle versioni si trova nella [panoramica](./overview.md#sistemi-operativi); fa fede l'elenco mostrato al passaggio **Storage** della procedura guidata.

---

### Posso usare una mia immagine?

Sì, in due fasi: crei prima un disco a partire dall'URL della sua immagine (ISO o QCOW2, in HTTPS) nel menu **Disks**, poi, nella procedura guidata di creazione della VM, scelga **Existing** per il **System Disk (Boot)** e selezioni questo disco. La scheda **Custom Image** è disattivata (**Reserved**) nella procedura guidata della VM: è utilizzabile solo durante la creazione di un disco. Vedere [Creare un disco di sistema da un'immagine](../storage/disks/how-to/create-from-image.md).

---

### Come scegliere il tipo di istanza?

| Serie | Etichetta | Rapporto | Esempio d'uso |
|-------|---------|-------|-----------------|
| `s1` | **Standard (S)** | 1:2 | Sviluppo, test |
| `u1` | **Universal (U)** | 1:4 | Server web, applicazioni |
| `m1` | **Memory (M)** | 1:8 | Database, cache |

Ad esempio, `u1.xlarge` offre 4 vCPU e 16 GB di RAM. Il formato può essere cambiato in seguito da **Edit**; la VM si riavvia.

---

### Come aggiungere un disco supplementare?

Alla creazione, faccia clic su **Add a disk** al passaggio **Storage**. Su una VM esistente, apra la pagina di dettaglio, faccia clic su **Edit**, poi su **Add a disk** nella sezione **Storage**, quindi su **Save**. La VM si riavvia. La guida completa, inclusa la formattazione nel sistema operativo, è disponibile [qui](./how-to/attach-extra-disk.md).

---

### Come connettersi in SSH?

1. Aggiunga la sua chiave pubblica in **Authorized SSH keys** (passaggio **Network** della procedura guidata, oppure **Edit** > **Advanced Configuration** > **SSH Keys**).
2. Lasci **Public IPv4 Address** attivato e la porta **SSH (22)** autorizzata.
3. Copi il comando dal blocco **SSH Connection** nella pagina di dettaglio e aggiunga la sua chiave privata:
   ```bash
   ssh -i ~/.ssh/ma-cle ubuntu@<ip-pubblico>
   ```

Utenti predefiniti in base all'immagine:

| Immagine | Utente |
|-------|-------------|
| Ubuntu | `ubuntu` |
| Debian | `debian` |
| Rocky Linux | `rocky` |
| AlmaLinux | `almalinux` |
| CentOS Stream, CloudLinux | `cloud-user` |
| Oracle Linux | `opc` |
| openSUSE | `opensuse` |

L'utente effettivo è sempre indicato nella pagina di dettaglio, in **System Image**.

---

### Come personalizzare la VM all'avvio?

Al passaggio **Network** della procedura guidata, attivi **Cloud-Init script (User Data)** e inserisca la sua configurazione:

```yaml title="user-data.yaml"
#cloud-config
packages:
  - nginx
  - htop
runcmd:
  - systemctl enable --now nginx
```

Vedere [Configurare cloud-init](./how-to/configure-cloud-init.md).

---

### Cosa succede ai dischi quando elimino una VM?

Vengono scollegati, non eliminati. Restano nel menu **Disks**, possono essere ricollegati a un'altra VM (opzione **Existing**) e continuano a essere conteggiati nella quota di storage del progetto fino alla loro eliminazione.

---

### Posso accedere alla console seriale o VNC della VM?

Questa opzione non è disponibile nella console; contatti il [supporto](mailto:support@hidora.io). L'accesso avviene in SSH (Linux) o in RDP (Windows).

---

### Perché il pulsante Edit è disattivato nell'elenco?

Nel menu **Actions** dell'elenco, **Edit** è disponibile solo quando la VM è **Running**. Per modificare una VM arrestata, ne apra la pagina di dettaglio e faccia clic su **Edit**.
