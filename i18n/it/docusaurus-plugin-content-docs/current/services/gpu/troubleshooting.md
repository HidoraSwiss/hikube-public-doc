---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — GPU

### GPU non rilevata nella VM

**Causa**: il campo `gpus` non è configurato nel manifest, o il PCI passthrough non ha correttamente collegato la GPU alla VM.

**Soluzione**:

1. Verificate che il campo `gpus` sia presente nel vostro manifest:
   ```yaml title="vm-gpu.yaml"
   spec:
     gpus:
       - name: "nvidia.com/AD102GL_L40S"
   ```

2. Nella VM, verificate il rilevamento PCI:
   ```bash
   lspci | grep -i nvidia
   ```

3. Verificate che il modulo kernel NVIDIA sia caricato:
   ```bash
   lsmod | grep nvidia
   ```

4. Se nessun risultato, i driver non sono installati. Consultate la sezione seguente.

---

### Driver NVIDIA mancanti

**Causa**: i driver NVIDIA non sono installati nella VM, o i kernel header non corrispondono alla versione del kernel.

**Soluzione**:

1. Installate i prerequisiti e i driver tramite cloud-init o manualmente:
   ```bash
   sudo apt-get update
   sudo apt-get install -y linux-headers-$(uname -r)
   sudo apt-get install -y nvidia-driver-550 nvidia-utils-550
   ```

2. Riavviate la VM dopo l'installazione:
   ```bash
   sudo reboot
   ```

3. Verificate l'installazione:
   ```bash
   nvidia-smi
   ```

:::tip
Per automatizzare l'installazione, utilizzate il campo `cloudInit` nel vostro manifest VM affinché i driver vengano installati al primo avvio.
:::

---

### Pod GPU in stato Pending

**Causa**: nessun nodo con GPU disponibile, la configurazione GPU del cluster è assente, o il GPU Operator non è attivo.

**Soluzione**:

1. Verificate gli eventi del pod:
   ```bash
   kubectl describe pod <pod-name>
   ```
   Cercate il messaggio `Insufficient nvidia.com/gpu`.

2. Verificate che esistano nodi GPU con GPU allocabili:
   ```bash
   kubectl get nodes -o json | jq '.items[] | {name: .metadata.name, gpu: .status.allocatable["nvidia.com/gpu"]}'
   ```

3. Verificate la configurazione del nodeGroup GPU nel manifest del cluster:
   ```yaml title="cluster.yaml"
   spec:
     nodeGroups:
       gpu-workers:
         minReplicas: 1
         maxReplicas: 4
         instanceType: "u1.2xlarge"
         gpus:
           - name: "nvidia.com/AD102GL_L40S"
   ```

4. Assicuratevi che l'addon GPU Operator sia attivato:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

---

### `nvidia-smi` fallisce in un pod

**Causa**: il GPU Operator non è attivato sul cluster, il che impedisce l'installazione automatica dei driver e la messa a disposizione del device plugin.

**Soluzione**:

1. Attivate l'addon GPU Operator sul cluster:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

2. Applicate la modifica:
   ```bash
   kubectl apply -f cluster.yaml
   ```

3. Verificate che i pod del GPU Operator siano in esecuzione:
   ```bash
   kubectl get pods -n gpu-operator
   ```

4. Una volta che il GPU Operator è operativo, ricreate il vostro pod GPU.

---

### GPU Operator non funzionante

**Causa**: l'addon non è attivato, i pod dell'operatore sono in errore, o i nodi non hanno GPU fisiche.

**Soluzione**:

1. Verificate che l'addon sia attivato nel manifest del cluster:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

2. Verificate lo stato dei pod del GPU Operator:
   ```bash
   kubectl get pods -n gpu-operator
   kubectl describe pod -n gpu-operator <pod-name>
   ```

3. Verificate che i nodi possiedano hardware GPU:
   ```bash
   kubectl get nodes -o json | jq '.items[] | {name: .metadata.name, gpu: .status.capacity["nvidia.com/gpu"]}'
   ```

4. Se i pod sono in `CrashLoopBackOff`, consultate i log:
   ```bash
   kubectl logs -n gpu-operator <pod-name>
   ```
