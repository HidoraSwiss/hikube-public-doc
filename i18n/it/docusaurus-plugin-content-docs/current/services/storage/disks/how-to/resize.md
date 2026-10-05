---
title: "Come ridimensionare un disco"
---

# Come ridimensionare un disco

Questa guida spiega come ingrandire un disco dalla [console Hikube](https://console.hikube.cloud) e poi estenderne il file system nella VM.

## Prerequisiti

- Un **disco** nel suo progetto
- Una quota di storage sufficiente per la nuova dimensione

:::warning Nessuna riduzione
La riduzione della dimensione non è supportata. La nuova dimensione deve essere superiore o uguale a quella attuale, e di almeno 20 GB.
:::

## Passaggi

### 1. Aprire la modifica del disco

1. Apra **Infrastructure** → **Disks**.
2. Apra il menu delle azioni del disco e scelga **Edit**, oppure apra la pagina del disco e faccia clic su **Edit**.

La pagina **Edit disk** mostra la **CURRENT SIZE** e lo stato della cifratura.

### 2. Inserire la nuova dimensione

1. In **New Size (GB)**, inserisca la dimensione desiderata.
2. Verifichi l'indicatore **Estimated project usage**. Se la dimensione supera la quota, la console mostra «The size exceeds the project quota» e il pulsante resta disattivato.
3. Faccia clic su **Save changes**.

La console conferma: «The disk was successfully resized to N GB.»

### 3. Estendere il file system nella VM

Il ridimensionamento ingrandisce il dispositivo a blocchi a caldo, senza riavviare la VM; la partizione e il file system devono poi essere estesi dalla VM, anche in questo caso senza riavvio. Si connetta in SSH e verifichi la nuova dimensione del dispositivo:

```bash
lsblk
```

Se dopo qualche minuto la nuova dimensione non è ancora visibile, riavvii la VM dalla console.

**Disco formattato senza partizioni** (ad esempio `/dev/vdb` montato direttamente):

```bash
# ext4
sudo resize2fs /dev/vdb

# XFS (indicare il punto di montaggio)
sudo xfs_growfs /mnt/data
```

**Disco partizionato** (ad esempio il disco di sistema `/dev/vda`, partizione 1):

```bash
# Ingrandire la partizione (pacchetto cloud-guest-utils o cloud-utils-growpart)
sudo growpart /dev/vda 1

# Poi estendere il file system
sudo resize2fs /dev/vda1      # ext4
sudo xfs_growfs /             # XFS
```

:::tip
Molte immagini cloud estendono automaticamente la partizione root all'avvio (cloud-init). Se preferisce non eseguire `growpart` personalmente, per un disco di sistema spesso è sufficiente un riavvio.
:::

## Verifica

- La pagina del disco mostra la nuova **Capacity**.
- Nella VM, `df -h` mostra la nuova dimensione del file system.

## Per approfondire

- [Collegare un disco a una VM](./attach-to-vm.md)
- [FAQ](../faq.md)
