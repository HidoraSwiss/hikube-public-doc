---
sidebar_position: 6
title: FAQ
---

# FAQ — Macchine virtuali

### Qual è la differenza tra PortList e WholeIP?

| Caratteristica | `PortList` | `WholeIP` |
|----------------|-----------|-----------|
| **Funzionamento** | Solo le porte elencate in `externalPorts` sono esposte | Tutte le porte della VM sono esposte |
| **Sicurezza** | Controllo fine, superficie d'attacco ridotta | Necessita un firewall a livello dell'OS |
| **Caso d'uso** | Produzione, servizi mirati | Sviluppo, test rapidi |

:::warning
Con `WholeIP`, dovete obbligatoriamente configurare un firewall nella VM (iptables, nftables, ufw) per proteggere i servizi non esposti.
:::

```yaml title="vm-portlist.yaml"
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 443
```

---

### Quali immagini sono disponibili?

Hikube propone delle **Golden Image** preconfigurate:

| Sistema operativo | Versioni disponibili |
|----------------------|---------------------|
| **Ubuntu** | 22.04, 24.04 |
| **Debian** | 11, 12, 13 |
| **CentOS Stream** | 9, 10 |
| **Rocky Linux** | 8, 9, 10 |
| **AlmaLinux** | 8, 9, 10 |

Le immagini sono specificate nel campo `source.image.name` della risorsa **VMDisk**, nel formato `{os}-{version}`. Ad esempio: `ubuntu-2404`, `debian-12`, `rocky-9`.

---

### Come scegliere il mio instanceType?

Le istanze seguono tre gamme con rapporti vCPU:RAM differenti:

| Gamma | Prefisso | Rapporto | Esempio d'uso |
|-------|---------|-------|-----------------|
| **Standard** | `s1` | 1:2 | Server web, applicazioni leggere |
| **Universal** | `u1` | 1:4 | Applicazioni aziendali, database |
| **Memory** | `m1` | 1:8 | Cache, elaborazioni in memoria |

Le dimensioni disponibili vanno da `small` a `8xlarge`. Ad esempio: `u1.xlarge` offre 4 vCPU e 16 GB di RAM.

---

### Come aggiungere un disco supplementare?

Create prima una risorsa `VMDisk`, poi referenziatela nella vostra `VMInstance`:

```yaml title="data-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: data-volume
spec:
  size: 100Gi
  storageClass: replicated
```

```yaml title="vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: my-vm
spec:
  instanceType: u1.large
  instanceProfile: ubuntu
  disks:
    - data-volume
```

---

### Come accedere alla mia VM in SSH?

1. Iniettate la vostra chiave SSH pubblica nel manifest della VM:
   ```yaml title="vm-ssh.yaml"
   spec:
     sshKeys:
       - "ssh-ed25519 AAAAC3... user@laptop"
   ```

2. Esponete la porta 22 tramite `PortList`:
   ```yaml title="vm-ssh.yaml"
   spec:
     external: true
     externalMethod: PortList
     externalPorts:
       - 22
   ```

3. Recuperate l'indirizzo IP esterno:
   ```bash
   kubectl get svc
   ```

4. Connettetevi:
   ```bash
   ssh user@<external-ip>
   ```

:::note
Il nome utente predefinito dipende dall'immagine: `ubuntu` per Ubuntu, `debian` per Debian, `cloud-user` per CentOS/Rocky/AlmaLinux.
:::

---

### Come personalizzare la VM all'avvio?

Utilizzate il campo `cloudInit` per iniettare una configurazione cloud-init in formato YAML:

```yaml title="vm-cloudinit.yaml"
spec:
  cloudInit: |
    #cloud-config
    packages:
      - nginx
      - htop
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        ssh_authorized_keys:
          - ssh-ed25519 AAAAC3... admin@company
    runcmd:
      - systemctl enable nginx
      - systemctl start nginx
```

Cloud-init viene eseguito al primo avvio della VM e permette di installare pacchetti, creare utenti, eseguire comandi, ecc.

---

### Qual è la differenza tra `instanceProfile` e `instanceType`?

| Parametro | Ruolo | Esempi |
|-----------|------|----------|
| `instanceProfile` | Carica i **driver e i kernel** adatti all'OS | `ubuntu`, `centos`, `windows.2k25.virtio` |
| `instanceType` | Definisce la **dimensione** della VM (CPU/RAM) | `s1.small`, `u1.large`, `m1.2xlarge` |

`instanceProfile` non determina l'immagine OS — questa è definita nella risorsa **VMDisk** tramite `source.image.name`. Il profilo serve a caricare i driver e i kernel ottimizzati per il sistema operativo. È principalmente utile per **Windows** (driver virtio). `instanceType` dimensiona le risorse CPU e memoria allocate alla VM.
