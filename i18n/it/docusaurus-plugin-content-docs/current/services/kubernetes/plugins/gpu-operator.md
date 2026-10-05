---
sidebar_position: 7
title: GPU Operator
---

# GPU Operator

L'addon **GPU Operator** installa il **NVIDIA GPU Operator**, che gestisce automaticamente le GPU del cluster: driver NVIDIA, runtime dei container, `device plugin` e strumenti di monitoring necessari all'utilizzo delle GPU.

## Nella console

- **Con nodi GPU**: non appena un gruppo di nodi dispone di GPU (sezione **GPU** del passaggio **Nodes**), la console attiva **GPU Operator** e ne impedisce la deselezione («Required when a node group has GPUs»).
- **Senza nodi GPU**: selezioni **GPU Operator** nel passaggio **Addons** oppure da **Edit** > **Extensions & Addons**, quindi **Save**. È disattivato per impostazione predefinita.

La pagina di dettaglio del cluster mostra **GPU Operator** nella sezione **Extensions** quando è attivo.

Vedere [Come aggiungere e modificare un gruppo di nodi](../how-to/manage-node-groups.md#5-aggiungere-gpu) per l'aggiunta di GPU.

## Sovrascrivere la configurazione

Una volta selezionato l'addon, compare il campo **Helm Configuration (YAML) — optional**. Il valore viene trasmesso al chart Helm del GPU Operator, sotto la chiave `gpu-operator`.

```yaml title="gpu-operator-override.yaml"
gpu-operator:
  dcgmExporter:
    enabled: true
```

Le opzioni disponibili sono descritte nella [documentazione del NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html).

:::warning
I driver e il device plugin sono preconfigurati dalla piattaforma per i nodi Hikube. Non li disattivi tramite sovrascrittura: le GPU non sarebbero più esposte ai pod.
:::

## Utilizzo nel cluster

```bash
# Pod del GPU Operator
kubectl get pods -A | grep -i -E "gpu-operator|nvidia"

# GPU allocabili per nodo
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

Esempio di pod che richiede una GPU:

```yaml title="gpu-test.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
    - name: cuda
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["nvidia-smi"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

```bash
kubectl apply -f gpu-test.yaml
kubectl logs gpu-test
```

Vedere anche [Effettuare il provisioning di GPU in Kubernetes](../../gpu/how-to/provision-gpu-kubernetes.md).

## Buone pratiche

- Collochi i workload GPU su un gruppo di nodi dedicato, con un minimo di nodi pari a 0 se l'uso è occasionale.
- Per condividere una stessa GPU tra più pod, attivi [HAMi](./hami.md).
