---
title: "Come installare una VM Windows"
---

# Come installare una VM Windows

L'installazione di una VM Windows Server su Hikube richiede diversi passaggi manuali: preparare i dischi ISO, creare la VM, installare Windows tramite VNC poi caricare i driver virtio. Questa guida dettaglia l'intero processo.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- **virtctl** installato per l'accesso VNC
- Licenza o valutazione **Windows Server 2025** (l'ISO di valutazione viene utilizzato in questa guida)
- Spazio di storage sufficiente (circa 70 Gi in totale)

## Passi

### 1. Creare il disco ISO Windows Server 2025

Create un VMDisk di tipo ottico contenente l'ISO di installazione Windows Server:

```yaml title="win-iso-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: win2k25-iso
spec:
  source:
    http:
      url: https://software-static.download.prss.microsoft.com/dbazure/888969d5-f34g-4e03-ac9d-1f9786c66749/SERVER_EVAL_x64FRE_en-us.iso
  optical: true
  storage: 7Gi
  storageClass: replicated
```

```bash
kubectl apply -f win-iso-disk.yaml
```

### 2. Creare il disco ISO dei driver virtio

I driver virtio sono indispensabili affinché Windows riconosca i dischi e la rete in un ambiente KubeVirt:

```yaml title="virtio-drivers-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: virtio-drivers
spec:
  source:
    http:
      url: https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso
  optical: true
  storage: 1Gi
  storageClass: replicated
```

```bash
kubectl apply -f virtio-drivers-disk.yaml
```

### 3. Creare il disco di sistema

Create un disco vuoto che servirà come disco di sistema per Windows:

```yaml title="win-system-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: win-system
spec:
  source: {}
  optical: false
  storage: 60Gi
  storageClass: replicated
```

```bash
kubectl apply -f win-system-disk.yaml
```

### 4. Verificare che i tre dischi siano pronti

```bash
kubectl get vmdisk win2k25-iso virtio-drivers win-system
```

**Risultato atteso:**

```
NAME              STATUS   SIZE   STORAGECLASS   AGE
win2k25-iso       Ready    7Gi    replicated     2m
virtio-drivers    Ready    1Gi    replicated     2m
win-system        Ready    60Gi   replicated     1m
```

:::note Tempo di download
Il download dell'ISO Windows (~5 GB) può richiedere diversi minuti a seconda della larghezza di banda. Attendete che tutti i dischi siano in stato `Ready`.
:::

### 5. Creare la VMInstance

Create la VM con i tre dischi collegati. Il disco di sistema deve essere in prima posizione:

```yaml title="windows-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: windows-server
spec:
  runStrategy: Always
  instanceProfile: windows.2k25.virtio
  instanceType: u1.xlarge
  external: true
  externalMethod: PortList
  externalPorts:
    - 3389
  disks:
    - win-system
    - win2k25-iso
    - virtio-drivers
```

```bash
kubectl apply -f windows-vm.yaml
```

Attendete che la VM si avvii:

```bash
kubectl get vminstance windows-server -w
```

### 6. Accedere tramite VNC per l'installazione

Aprite una sessione VNC verso la VM:

```bash
virtctl vnc windows-server
```

L'installer Windows dovrebbe avviarsi automaticamente dall'ISO. Seguite i passaggi classici dell'installazione:

1. Scegliete la lingua e la tastiera
2. Cliccate su **Installa ora**
3. Selezionate l'edizione Windows Server desiderata
4. Accettate il contratto di licenza
5. Scegliete **Installazione personalizzata**

### 7. Caricare i driver virtio durante l'installazione

Durante il passaggio di selezione del disco di installazione, Windows non rileverà nessun disco. Dovete caricare i driver virtio:

1. Cliccate su **Carica un driver** (Load driver)
2. Cliccate su **Sfoglia** (Browse)
3. Navigate verso il lettore CD dei driver virtio (generalmente `E:\`)
4. Selezionate la cartella `vioscsi\2k25\amd64` (storage controller)
5. Cliccate su **OK** poi **Avanti**

Il disco da 60 GB dovrebbe ora apparire. Selezionatelo e proseguite l'installazione.

:::warning Driver di rete
Dopo l'installazione, installate anche i driver di rete (NetKVM) e balloon di memoria (Balloon) dal CD virtio per prestazioni ottimali. Navigate nelle cartelle `NetKVM\2k25\amd64` e `Balloon\2k25\amd64`.
:::

### 8. Post-installazione: rimuovere i dischi ISO

Una volta che Windows è installato e funzionale, rimuovete i dischi ISO dal manifest per liberare le risorse e evitare di avviare dall'ISO:

```yaml title="windows-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: windows-server
spec:
  runStrategy: Always
  instanceProfile: windows.2k25.virtio
  instanceType: u1.xlarge
  external: true
  externalMethod: PortList
  externalPorts:
    - 3389
  disks:
    - win-system
```

```bash
kubectl apply -f windows-vm.yaml
```

Potete poi eliminare i VMDisk ISO se non ne avete più bisogno:

```bash
kubectl delete vmdisk win2k25-iso virtio-drivers
```

### 9. Configurare l'accesso RDP (opzionale)

La VM espone già la porta 3389 (RDP). Recuperate l'indirizzo IP esterno:

```bash
kubectl get vminstance windows-server -o yaml
```

Connettetevi con il vostro client RDP:

```bash
# Da Linux
xfreerdp /v:<IP-ESTERNO> /u:Administrator

# Da macOS (Microsoft Remote Desktop)
# Aggiungete un PC con l'indirizzo <IP-ESTERNO>
```

## Verifica

Verificate che la VM Windows funzioni correttamente:

```bash
kubectl get vminstance windows-server
```

**Risultato atteso:**

```
NAME              STATUS    AGE
windows-server    Running   15m
```

Testate l'accesso RDP sulla porta 3389:

```bash
nc -zv <IP-ESTERNO> 3389
```

## Per approfondire

- [Riferimento API](../api-reference.md)
- [Come configurare la rete esterna](./configure-network.md)
