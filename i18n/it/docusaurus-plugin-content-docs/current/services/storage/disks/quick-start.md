---
sidebar_position: 3
title: Avvio rapido
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Creare e utilizzare il primo disco

Questa guida la accompagna nella creazione di un **disco dati** dalla [console Hikube](https://console.hikube.cloud), nel suo collegamento a una macchina virtuale e poi nella sua formattazione e nel suo montaggio nel sistema.

---

## Obiettivi

Al termine di questa guida disporrà di:

- Un **disco dati** da 20 GB nel suo progetto
- Questo disco **collegato** a una VM esistente
- Un file system **montato** e utilizzabile nella VM

---

## Prerequisiti

- Un **account Hikube** e un **progetto** (vedere l'[avvio rapido Hikube](../../../getting-started/quick-start.md))
- Una **VM Linux** in questo progetto, accessibile in SSH (vedere l'[avvio rapido delle macchine virtuali](../../compute/quick-start.md))
- Una quota di storage disponibile di almeno 20 GB

---

## Passo 1: Aprire la procedura guidata di creazione

1. Acceda alla [console Hikube](https://console.hikube.cloud) e selezioni il suo progetto.
2. Nel menu laterale, apra **Infrastructure** → **Disks**. Viene visualizzata la pagina **Storage Disks**.
3. Faccia clic su **Create a disk**.

---

## Passo 2: Configurare e creare il disco

La procedura guidata **Create a disk** comprende quattro passaggi.

1. **General**: inserisca il nome nel campo **Disk Name** (viene proposto un nome predefinito). Regole: lettere minuscole, cifre e trattini; inizia con una lettera e termina con una lettera o una cifra; massimo 16 caratteri. Esempio: `data01`.
2. **Source**: scelga **Empty Disk**.
3. **Configuration** (Size and Security):
   - **Size (GB)**: `20` (minimo 20 GB). L'indicatore **Estimated project usage** mostra l'impatto sulla quota del progetto;
   - **Replication Type**: lasci **Asynchronous Replication** (Recommended);
   - **Disk Encryption**: per questa guida lo lasci disattivato.
4. **Summary**: controlli il nome, la dimensione, la cifratura, la replica e l'origine, nonché l'**Estimated Cost** visualizzato in cima alla procedura guidata, quindi faccia clic su **Create disk**.

La console mostra «Disk created» e torna all'elenco dei dischi.

---

## Passo 3: Verificare lo stato del disco

Nell'elenco **Storage Disks**, il disco compare con lo stato **Creating**, poi **Ready**.

Faccia clic sul disco (oppure menu delle azioni → **Preview**) per aprirne la pagina di dettaglio:

- **Configuration**: **Capacity**, **Encryption**, **Replication**;
- **Source**: immagine di origine (**N/A** per un disco vuoto) e **Attached to** (per ora **Not attached**).

---

## Passo 4: Collegare il disco alla VM

1. Apra **Infrastructure** → **VM Instances**, poi la pagina della sua VM, e faccia clic su **Edit**.
2. Nella sezione **Storage**, faccia clic su **Add a disk**.
3. Sul nuovo volume, selezioni **Existing**, quindi scelga `data01` in **Select an existing volume**.
4. Faccia clic su **Save**.

:::warning Riavvio della VM
La modifica dello storage riavvia la VM («The instance type or storage was modified. The instance will reboot»). Pianifichi l'operazione di conseguenza.
:::

Una volta terminata l'operazione, il disco passa allo stato **In Use** e la sua pagina mostra il nome della VM in **Attached to**.

---

## Passo 5: Formattare e montare il disco nella VM

Si connetta alla VM in SSH, quindi identifichi il nuovo disco:

```bash
lsblk
```

Il nuovo disco compare senza partizioni né punto di montaggio, con una dimensione di 20 GB (ad esempio `vdb`). Adatti il nome del dispositivo nei comandi seguenti.

```bash
# Creare un file system (cancella il contenuto del disco)
sudo mkfs.ext4 /dev/vdb

# Montare il disco
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Montare automaticamente all'avvio
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab

# Testare
echo "hello hikube" | sudo tee /mnt/data/test.txt
df -h /mnt/data
```

**Risultato atteso:** `df -h` mostra un file system di circa 20 GB montato su `/mnt/data`.

---

## Passo 6: Risoluzione rapida dei problemi

| Sintomo | Causa probabile | Azione |
|----------|----------------|--------|
| **Next** disattivato al passaggio **Configuration** | Dimensione inferiore a 20 GB o quota superata | Adatti la dimensione; «Size exceeds available quota» indica il massimo possibile |
| Il disco non compare in **Select an existing volume** | Disco già collegato a una VM, oppure disco di sistema proposto per un volume dati | Verifichi **Attached to** nella pagina del disco; un disco vuoto va su un volume dati, non sul disco di sistema |
| Il disco non compare in `lsblk` | La VM non si è ancora riavviata | Attenda la fine del riavvio, quindi esegua di nuovo `lsblk` |
| Stato **Error** | Provisioning non riuscito | [Contatti il supporto](mailto:support@hidora.io) indicando il nome e l'identificativo del disco |

Vedere anche la [risoluzione dei problemi completa](./troubleshooting.md).

---

## Passo 7: Pulizia

1. Nella VM, smonti il disco e rimuova la relativa riga da `/etc/fstab`:
   ```bash
   sudo umount /mnt/data
   sudo sed -i '\|/mnt/data|d' /etc/fstab
   ```
2. Scolleghi il disco: pagina della VM → **Edit** → sezione **Storage**, faccia clic sull'icona di eliminazione del volume, confermi inserendo il suo nome, quindi faccia clic su **Save**. Il disco torna allo stato **Ready**.
3. Elimini il disco: pagina del disco → **Delete** (oppure menu delle azioni → **Delete** nell'elenco), inserisca il suo nome esatto in **Resource name to confirm**, quindi faccia clic su **Permanently delete**.

:::warning
L'eliminazione di un disco è irreversibile: tutti i suoi dati vanno persi. Un disco collegato a una VM non può essere eliminato; lo scolleghi prima.
:::

<NavigationFooter
  nextSteps={[
    {label: "Ridimensionare un disco", href: "../how-to/resize"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Macchine virtuali", href: "../../../compute/overview"},
  ]}
/>
