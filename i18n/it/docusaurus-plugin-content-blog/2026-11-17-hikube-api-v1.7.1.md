---
title: Hikube API v1.7.1
authors: [hikube]
tags: [release]
---

Questa versione correttiva rende disponibile la GPU NVIDIA L4. Una nuova dimensione scelta per un database o per il control plane Kubernetes ora viene applicata davvero, e la dimensione di un cluster MariaDB, MongoDB o RabbitMQ si cambia senza ricrearlo.

<!-- truncate -->

## Aggiunto

- **GPU** — La GPU NVIDIA L4, con 24 GB di memoria video, è disponibile con il nome `l4`. Compare in `GET /gpu/v1alpha1/gpus` e si richiede sia per un'istanza VM sia per un node group Kubernetes.

## Corretto

- **PostgreSQL, Redis, Kubernetes** — Cambiare la dimensione di un database o del control plane di un cluster poteva restare senza effetto: la nuova dimensione veniva salvata e riletta, ma il database continuava a girare con le risorse precedenti. Ora la nuova dimensione viene applicata, e il database si riavvia per adottarla.

- **MariaDB, MongoDB, RabbitMQ** — La dimensione di un cluster poteva essere scelta solo alla creazione. Ora si cambia con un aggiornamento, tramite il campo `preset`, senza ricreare il cluster. Come per PostgreSQL e Redis, il cluster si riavvia per adottare la nuova dimensione.
