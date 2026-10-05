---
sidebar_position: 11
title: HAMi
---

# HAMi

L'addon **HAMi** introduce la **virtualizzazione delle GPU**: consente di condividere una stessa GPU tra più pod, anziché assegnare una GPU intera a ciascun pod.

## Nella console

HAMi richiede l'addon [GPU Operator](./gpu-operator.md), e quindi un gruppo di nodi con GPU.

1. Alla creazione, passaggio **Addons**, selezioni **HAMi** (disattivato per impostazione predefinita). Se **GPU Operator** non è selezionato, la console mostra «Requires the GPU Operator addon» e blocca il proseguimento.
2. Su un cluster esistente: **Edit** > **Extensions & Addons**, selezioni **HAMi**, quindi **Save**.

La pagina di dettaglio del cluster mostra **HAMi** nella sezione **Extensions** quando è attivo.

## Sovrascrivere la configurazione

Una volta selezionato l'addon, compare il campo **Helm Configuration (YAML) — optional**. Il valore viene trasmesso al chart Helm di HAMi, sotto la chiave `hami`. Le opzioni disponibili sono descritte nella [documentazione HAMi](https://project-hami.io/docs).

## Utilizzo nel cluster

```bash
# Pod HAMi
kubectl get pods -A | grep -i hami
```

I pod richiedono una frazione di GPU tramite le risorse esposte da HAMi (memoria GPU, quota di calcolo). Consulti la [documentazione HAMi](https://project-hami.io/docs) per i nomi delle risorse e alcuni esempi di pod.

## Buone pratiche

- Riservi la condivisione delle GPU ai carichi che non sfruttano una GPU intera (inferenza leggera, sviluppo, notebook).
- Imposti limiti di memoria GPU per pod per evitare che un pod ne privi gli altri.
