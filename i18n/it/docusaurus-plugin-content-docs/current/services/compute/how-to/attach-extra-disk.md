---
title: "Come collegare un disco supplementare"
---

# Come collegare un disco supplementare

Separare i dati applicativi dal disco di sistema semplifica i backup, le migrazioni e il ridimensionamento. Questa guida spiega come aggiungere un disco dati a una VM dalla console, quindi formattarlo e montarlo nel sistema operativo.

## Prerequisiti

- Un account Hikube e un progetto con quota di **Storage** disponibile
- Un'**istanza VM** esistente
- Un accesso **SSH** alla VM

## Passaggi

### 1. Aprire la modifica della VM

1. Apra **Infrastructure** > **VM Instances** e faccia clic sul nome della VM.
2. Faccia clic su **Edit**.

### 2. Aggiungere il disco

Nella sezione **Storage**, faccia clic su **Add a disk**. Compare un blocco **Storage Volume #1**. Due opzioni:

**Nuovo disco** (scheda **New**):

1. **Volume Name**: mantenga il nome proposto o inserisca il suo (lettere minuscole, cifre e trattini).
2. **Size (GB)**: minimo 20 GB, ad esempio `50`.
3. **Replication Type**: **Asynchronous Replication** (Recommended) o **Synchronous Replication**.
4. **Disk Encryption**: la attivi per cifrare i dati a riposo.

**Disco esistente** (scheda **Existing**): in **Select an existing volume**, scelga un disco dati del progetto che non sia collegato ad alcuna VM. I dischi si creano anche in modo indipendente nel menu **Disks** (vedere [Dischi](../../storage/disks/quick-start.md)).

### 3. Salvare

Verifichi il riepilogo delle quote in cima alla pagina, quindi faccia clic su **Save**.

La console mostra **Restart required**: la VM si riavvia per prendere in carico il nuovo disco. Attenda che torni allo stato **Running**. Il disco compare nella sezione **Storage & Disks** della pagina di dettaglio.

:::note Disco aggiunto alla creazione
Può anche aggiungere dischi direttamente alla creazione della VM, con **Add a disk** al passaggio **Storage** della procedura guidata. Prendono allora il nome della VM con un suffisso (`ma-vm-2`, `ma-vm-3`…).
:::

### 4. Formattare e montare il disco nella VM

Si connetta alla VM con il comando del blocco **SSH Connection**:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<ip-pubblico>
```

Identifichi il nuovo disco:

```bash
lsblk
```

**Risultato atteso:**

```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda     252:0    0   20G  0 disk
├─vda1  252:1    0 19.9G  0 part /
└─vda15 252:15   0  106M  0 part /boot/efi
vdb     252:16   0   50G  0 disk
```

Il nuovo disco compare come `vdb`, senza partizione né punto di montaggio.

Lo formatti in ext4:

```bash
sudo mkfs.ext4 /dev/vdb
```

Lo monti:

```bash
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data
```

Renda il montaggio persistente utilizzando l'UUID del file system, più stabile del nome del dispositivo:

```bash
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

## Verifica

```bash
df -h /mnt/data
```

**Risultato atteso:**

```
Filesystem      Size  Used Avail Use% Mounted on
/dev/vdb         49G   24K   47G   1% /mnt/data
```

Verifichi la scrittura:

```bash
sudo touch /mnt/data/test.txt && echo "OK"
```

## Scollegare un disco

In **Edit** > **Storage**, faccia clic sull'icona di eliminazione del volume, confermi inserendone il nome, quindi faccia clic su **Save**. Il disco viene scollegato dalla VM (che si riavvia) e resta disponibile nel menu **Disks**. Prima lo smonti nel sistema operativo e rimuova la sua riga da `/etc/fstab`.

## Per approfondire

- [Dischi: panoramica](../../storage/disks/overview.md)
- [Collegare un disco esistente a una VM](../../storage/disks/how-to/attach-to-vm.md)
- [Ridimensionare un disco](../../storage/disks/how-to/resize.md)
- [Avvio rapido VM](../quick-start.md)
