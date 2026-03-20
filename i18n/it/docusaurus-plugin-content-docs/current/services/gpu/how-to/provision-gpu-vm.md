---
title: "Come provisionare un GPU su una VM"
---

# Come provisionare un GPU su una VM

Hikube permette di collegare una o più GPU NVIDIA direttamente a una macchina virtuale. Questa guida spiega come scegliere il tipo di GPU adatto al vostro workload, creare una VM con GPU e verificare che l'accelerazione hardware sia disponibile.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un accesso **SSH** alla VM (chiave pubblica SSH disponibile)
- Familiarità con i concetti delle [macchine virtuali](../../compute/overview.md) su Hikube

## Passi

### 1. Scegliere il tipo di GPU

Hikube propone tre famiglie di GPU NVIDIA adatte a diversi casi d'uso:

| GPU | Architettura | Memoria | Prestazioni | Caso d'uso |
|-----|-------------|---------|-------------|-------------|
| **L40S** | Ada Lovelace | 48 GB GDDR6 | 362 TOPS (INT8) | Inferenza, sviluppo, prototipazione |
| **A100** | Ampere | 80 GB HBM2e | 312 TOPS (INT8) | Addestramento ML, fine-tuning |
| **H100** | Hopper | 80 GB HBM3 | 1979 TOPS (INT8) | LLM, calcolo exascale, addestramento distribuito |

:::tip Quale GPU scegliere?
Iniziate con un **L40S** per lo sviluppo e la prototipazione. Passate a un **A100** per l'addestramento di modelli ML standard, e riservate l'**H100** per i workload esigenti come l'addestramento di LLM o il calcolo ad alte prestazioni.
:::

Gli identificativi GPU da utilizzare nei vostri manifest sono:

| GPU | Valore `gpus[].name` |
|-----|----------------------|
| L40S | `nvidia.com/AD102GL_L40S` |
| A100 | `nvidia.com/GA100_A100_PCIE_80GB` |
| H100 | `nvidia.com/H100_94GB` |

### 2. Creare il manifest della VM con GPU

Create un manifest che dichiara la GPU desiderata nella sezione `spec.gpus`:

```yaml title="gpu-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: gpu-workstation
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.2xlarge
  gpus:
    - name: "nvidia.com/AD102GL_L40S"
  systemDisk:
    size: 100Gi
    storageClass: replicated
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 8888
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::tip Rapporto CPU/GPU raccomandato
Prevedete **da 8 a 16 vCPU per GPU**. Per una singola GPU, un `u1.2xlarge` (8 vCPU, 32 GB RAM) è un buon punto di partenza. Per il multi-GPU, passate a `u1.4xlarge` o `u1.8xlarge`.
:::

### 3. Distribuire la VM

Applicate il manifest:

```bash
kubectl apply -f gpu-vm.yaml
```

Attendete che la VM sia in stato `Running`:

```bash
kubectl get vminstance gpu-workstation -w
```

**Risultato atteso:**

```
NAME               STATUS    AGE
gpu-workstation    Running   2m
```

:::note
Il provisioning di una VM con GPU può richiedere qualche minuto supplementare rispetto a una VM standard, il tempo che la GPU venga allocata e collegata.
:::

### 4. Verificare la GPU nella VM

Connettetevi alla VM tramite SSH:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@gpu-workstation
```

Verificate che la GPU sia rilevata:

```bash
nvidia-smi
```

**Risultato atteso:**

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.xx.xx    Driver Version: 535.xx.xx    CUDA Version: 12.x     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA L40S         Off  | 00000000:00:06.0 Off |                    0 |
| N/A   30C    P0    35W / 350W |      0MiB / 46068MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```

Per informazioni dettagliate:

```bash
nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv
```

### 5. Configurare una VM multi-GPU

Per i workload intensivi (addestramento distribuito, inferenza su larga scala), potete collegare più GPU a una stessa VM ripetendo le voci in `spec.gpus`:

```yaml title="multi-gpu-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: multi-gpu-workstation
spec:
  runStrategy: Always
  instanceProfile: ubuntu
  instanceType: u1.8xlarge
  gpus:
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
    - name: "nvidia.com/H100_94GB"
  systemDisk:
    size: 200Gi
    storageClass: replicated
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 8888
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::warning
Per il multi-GPU, dimensionate il tipo di istanza di conseguenza. Prevedete come minimo 8 vCPU e 32 GB di RAM per GPU. Un `u1.8xlarge` (32 vCPU, 128 GB RAM) è adatto per 4 GPU.
:::

## Verifica

Dopo il deployment, confermate che tutto funzioni:

1. **Verificate lo stato della VM**:

```bash
kubectl get vminstance gpu-workstation
```

2. **Verificate la GPU nella VM**:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@gpu-workstation -- nvidia-smi
```

3. **Testate CUDA** (se i driver sono installati):

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@gpu-workstation -- nvidia-smi --query-gpu=name,memory.total,driver_version,cuda_version --format=csv,noheader
```

## Per approfondire

- [Riferimento API GPU](../api-reference.md)
- [Come provisionare un GPU su Kubernetes](./provision-gpu-kubernetes.md)
- [Come installare i driver CUDA](../../compute/how-to/install-cuda-drivers.md)
