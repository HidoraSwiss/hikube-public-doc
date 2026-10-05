---
title: Storage
sidebar_position: 0
---

import ServiceCardGrid from '@site/src/components/ServiceCardGrid';

# Storage

Hikube offre soluzioni di storage gestito, cifrabile e replicato su più datacenter svizzeri. I dischi e i bucket S3 si gestiscono in modalità self-service dalla [console Hikube](https://console.hikube.cloud), nel menu **Infrastructure** del suo progetto.

## Tipi di storage

| Tipo | Menu della console | Utilizzo | Accesso |
|------|--------------------|-------|-------|
| Dischi (storage a blocchi) | **Infrastructure** → **Disks** | Dischi di sistema e dischi dati delle macchine virtuali | Collegato a una VM, montato dal sistema operativo |
| Storage a oggetti (S3) | **Infrastructure** → **S3 Buckets** | File, backup, asset statici, archivi | API S3 (HTTPS) |

:::note
I volumi persistenti dei suoi cluster Kubernetes vengono forniti all'interno di ciascun cluster, tramite le sue StorageClass. Non sono gestiti dal menu **Disks**.
:::

## Caratteristiche

- **Cifratura**: cifratura a riposo (LUKS) opzionale per dischi e bucket; accesso S3 in HTTPS
- **Replica**: dischi con replica sincrona o asincrona; bucket replicati su 3 datacenter
- **Isolamento**: ogni risorsa appartiene a un progetto; ogni utente S3 dispone di chiavi proprie, limitate al suo bucket
- **Quote**: la dimensione dei dischi viene imputata alla quota di storage del progetto

## Servizi disponibili

<ServiceCardGrid items={[
  {
    title: "Dischi",
    description: "Volumi a blocchi persistenti e replicati per le sue macchine virtuali: dischi di sistema e dischi dati.",
    icon: "/img/services/disks.svg",
    href: "./disks/overview",
    tags: ["Block Storage", "VM"],
  },
  {
    title: "Bucket S3",
    description: "Storage a oggetti compatibile S3 per i suoi file, backup e asset, con utenti e chiavi di accesso per bucket.",
    icon: "/img/services/s3.svg",
    href: "./buckets/overview",
    tags: ["Object Storage", "S3"],
  },
]} />
