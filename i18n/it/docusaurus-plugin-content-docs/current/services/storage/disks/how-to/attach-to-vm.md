---
title: "Come collegare un disco a una VM"
---

# Come collegare un disco a una VM

Questa guida spiega come collegare un disco esistente a una macchina virtuale, renderlo utilizzabile nel sistema e poi scollegarlo, dalla [console Hikube](https://console.hikube.cloud).

## Prerequisiti

- Un **disco** in stato **Ready** (non collegato) nel suo progetto (vedere l'[avvio rapido](../quick-start.md))
- Una **VM** nello stesso progetto

## Principio

Il collegamento si configura **lato VM**, nella sezione **Storage**:

- alla creazione di una VM (passaggio **Storage** della procedura guidata);
- oppure su una VM esistente (pagina della VM → **Edit** → sezione **Storage**).

Ogni volume aggiunto può essere **New** (la console crea il disco) o **Existing** (sceglie un disco già creato). Il primo volume è il **System Disk (Boot)**; i successivi sono volumi dati.

Su una VM esistente, i dischi che possiede già sono mostrati in sola lettura, senza la scelta **New** / **Existing**: il **System Disk (Boot)** non ha alcuna azione («The system disk of an existing VM cannot be replaced: the VM boots from it.») e un disco dati propone solo **Detach disk**.

| Volume | Dischi proposti in modalità **Existing** |
|--------|----------------------------------------|
| **System Disk (Boot)** | Dischi di sistema (creati a partire da un'immagine) non collegati |
| **Storage Volume #N** | Dischi dati non collegati |

## Collegare un disco a una VM esistente

1. Apra **Infrastructure** → **VM Instances**, poi la pagina della VM, e faccia clic su **Edit**.
2. Nella sezione **Storage**, faccia clic su **Add a disk**.
3. Sul nuovo volume, selezioni **Existing**.
4. In **Select an existing volume**, cerchi e scelga il disco. L'elenco ne mostra il nome e la dimensione.
5. Faccia clic su **Save**.

:::warning Riavvio
Il disco viene preso in carico solo al successivo riavvio della VM. La console lo indica: «The instance type, storage or GPUs changed. These changes only take effect on the next restart: restart the VM to apply them.» Faccia clic su **Restart** nella sezione **Actions** della pagina della VM.
:::

## Collegare un disco alla creazione di una VM

Al passaggio **Storage** della procedura guidata di creazione della VM, faccia clic su **Add a disk**, selezioni **Existing** e poi il disco in **Select an existing volume**. Per avviare la VM su un disco di sistema creato in anticipo, selezioni **Existing** sul **System Disk (Boot)**.

Il disco di sistema di una VM esistente non si sostituisce: per avviarla su un altro disco di sistema, elimini la VM (i suoi dischi sono conservati), quindi la ricrei in questo modo.

## Rendere il disco utilizzabile nella VM (Linux)

Si connetta alla VM in SSH e identifichi il disco:

```bash
lsblk
```

Per un **disco vuoto**, crei un file system e lo monti:

```bash
# Attenzione: mkfs cancella il contenuto del disco
sudo mkfs.ext4 /dev/vdb
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Montaggio automatico all'avvio
UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

Per un disco **già formattato** (ad esempio scollegato da un'altra VM), non esegua `mkfs`: lo monti direttamente.

:::tip
Utilizzi l'UUID anziché il nome del dispositivo (`/dev/vdb`) in `/etc/fstab`: l'ordine dei dispositivi può cambiare quando aggiunge o rimuove dischi.
:::

## Scollegare un disco

1. Nella VM, smonti il disco e rimuova la relativa riga da `/etc/fstab`.
2. Apra la pagina della VM → **Edit** → sezione **Storage**.
3. Faccia clic su **Detach disk** sul volume, quindi confermi con **Detach** nella finestra **Detach `<name>`?**. Non è richiesto di inserire il nome.
4. Faccia clic su **Save**, poi su **Restart**: lo scollegamento ha effetto solo al successivo riavvio della VM; fino ad allora il disco resta visibile al sistema.

Il disco viene **scollegato**, non eliminato: i suoi dati sono conservati e resta in **Infrastructure** → **Disks** con lo stato **Ready** e può essere collegato a un'altra VM. Per eliminarlo definitivamente, utilizzi l'azione **Delete** della pagina del disco. Un disco scollegato resta in uso dalla VM fino al suo successivo riavvio. Riavvii la VM, quindi attenda qualche minuto prima di eliminare il disco: un'eliminazione troppo rapida può lasciare lo spazio occupato nella sua quota. Finché la VM non è stata riavviata, la console rifiuta l'eliminazione: «This disk was detached, but its VM still uses it until its next restart. Restart the VM, then try again.»

:::note
L'eliminazione di una VM scollega anche i suoi dischi senza eliminarli. Si ricordi di eliminare i dischi non più necessari: continuano a consumare la quota di storage del progetto.
:::

## Verifica

- La pagina del disco mostra il nome della VM in **Attached to** (link alla VM) e lo stato **In Use**.
- Nella VM, `lsblk` elenca il disco e `df -h` mostra il punto di montaggio.

## Per approfondire

- [Ridimensionare un disco](./resize.md)
- [Creare un disco di sistema a partire da un'immagine](./create-from-image.md)
- [Macchine virtuali](../../../compute/overview.md)
