---
sidebar_position: 2
title: Avvio rapido
---

# Creare la vostra prima Macchina Virtuale

Questa guida vi accompagna nella creazione della vostra prima macchina virtuale Hikube in **5 minuti** cronometro!

---

## Obiettivo

Alla fine di questa guida, avrete:

- Una macchina virtuale Ubuntu funzionante
- Accesso SSH configurato
- Connettività di rete operativa
- Storage persistente collegato

---

## Prerequisiti

Prima di iniziare, assicuratevi di avere:

- **kubectl** configurato con il vostro kubeconfig Hikube
- **Diritti amministratore** sul vostro tenant

---

## 🚀 Passo 1: Creare il Disco VM (2 minuti)

### **Preparate il file manifest**

Create un file `vm-disk.yaml` con un'immagine Ubuntu Cloud:

```yaml title="vm-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
  optical: false
  storage: 20Gi
  storageClass: "replicated"
```

### **Distribuite il disco**

```bash
# Creare il disco VM
kubectl apply -f vm-disk.yaml

# Verificare lo stato (può richiedere 1-2 minuti)
kubectl get vmdisk disk-example -w
```

**Risultato atteso:**

```
NAME          STATUS   SIZE   STORAGECLASS   AGE
disk-example  Ready    20Gi   replicated     90s
```

---

## Passo 2: Creare la Macchina Virtuale (2 minuti)

### **Generate la vostra chiave SSH**

Se non avete ancora una chiave SSH:

```bash
# Generare una chiave SSH Ed25519 (moderna e sicura)
ssh-keygen -t ed25519 -f ~/.ssh/hikube-vm

# Visualizzare la chiave pubblica
cat ~/.ssh/hikube-vm.pub
```

### **Preparate il manifest VM**

Create un file `vm-instance.yaml`:

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-example
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
  running: true
  instanceType: u1.xlarge
  instanceProfile: "ubuntu"
  disks:
    - name: disk-example #Specificare il nome del vostro disco
  resources:
    cpu: ""
    memory: ""
  sshKeys:
    - vostra-chiave-pubblica-qui
  cloudInit: |
    #cloud-config
  cloudInitSeed: ""
```

:::warning Attenzione
Sostituite `vostra-chiave-pubblica-qui` con la vostra vera chiave SSH pubblica!
:::

### **Distribuite la VM**

```bash
# Creare la macchina virtuale
kubectl apply -f vm-instance.yaml

# Seguire l'avvio
kubectl get vminstance vm-example -w
```

---

## Comprendere i Metodi di Esposizione

### **PortList vs WholeIP: Quale differenza?**

Hikube propone due metodi di esposizione esterna, ciascuno con le sue specificità:

#### **PortList (Raccomandato)**

- **Firewall controllato**: Solo le porte specificate in `externalPorts` sono accessibili
- **Sicurezza rafforzata**: Protezione automatica contro gli accessi non autorizzati
- **Uso**: Produzione, ambienti sicuri
- **Configurazione**: `externalMethod: PortList` + `externalPorts: [22, 80, 443]`

#### **WholeIP**

- **Accesso completo**: Tutte le porte della VM sono direttamente accessibili
- **Nessun firewall**: Nessuna protezione a livello di rete configurata tramite il servizio
- **Uso**: Sviluppo, accesso amministrativo completo
- **Configurazione**: `externalMethod: WholeIP` (non è necessario `externalPorts`)

:::tip Scelta del Metodo

- **Produzione/Sicuro** → `PortList` con porte specifiche
- **Sviluppo/Debug** → `WholeIP` per un accesso completo
:::

---

## 🔌 Passo 3: Accedere alla vostra VM (1 minuto)

### **Installazione di virtctl**

Se non avete ancora `virtctl` installato:

```bash
# Installazione di virtctl
export VERSION=$(curl https://storage.googleapis.com/kubevirt-prow/release/kubevirt/kubevirt/stable.txt)
wget https://github.com/kubevirt/kubevirt/releases/download/${VERSION}/virtctl-${VERSION}-linux-amd64
chmod +x virtctl
sudo mv virtctl /usr/local/bin/

# Verificare l'installazione
virtctl version
```

### **Metodi di accesso**

#### **Opzione 1: SSH Diretto**

```bash
# SSH tramite virtctl (con chiave personalizzata)
virtctl ssh -i ~/.ssh/hikube-vm ubuntu@vm-example
# o SSH tramite IP pubblico (con chiave personalizzata)
ssh -i ~/.ssh/hikube-vm ubuntu@public-ip
```

#### **Opzione 2: Console Seriale (sempre disponibile)**

```bash
# Accesso console diretto
virtctl console vm-example
```

#### **Opzione 3: Interfaccia VNC**

```bash
# Accesso grafico
virtctl vnc vm-example
```

---

## 🎉 Congratulazioni

La vostra macchina virtuale Hikube è **operativa**!

### **Quello che avete realizzato:**

- **VM Ubuntu** distribuita con 4 vCPU / 16 GB RAM
- **Storage persistente** di 20 GB replicato
- **Accesso SSH** sicuro configurato
- **Connettività esterna** attivata
- **Infrastruttura resiliente** con separazione compute/storage

---

## Pulizia (Opzionale)

Se volete eliminare le risorse create:

```bash
# Eliminare la VM (attenzione!)
kubectl delete vminstance vm-example

# Eliminare il disco (attenzione!)
kubectl delete vmdisk disk-example
```

:::warning Eliminazione Irreversibile
L'eliminazione delle VM e dei dischi è **irreversibile**. Assicuratevi di aver salvato tutti i dati importanti prima di procedere.
:::

---

## 🎯 Prossimi Passi

<div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>

**📚 Configurazione Avanzata**
→ [API Reference completa](./api-reference.md)

**📖 Architettura Tecnica**
→ [Comprendere il funzionamento](./overview.md)

</div>

---

**💡 Punti Chiave da Ricordare:**

- I vostri **dati sono sempre al sicuro** grazie alla replica su 3 datacenter
- La vostra VM può essere **rilocalizzata automaticamente** in caso di guasto del nodo
- L'**isolamento totale** garantisce la sicurezza tra tenant
