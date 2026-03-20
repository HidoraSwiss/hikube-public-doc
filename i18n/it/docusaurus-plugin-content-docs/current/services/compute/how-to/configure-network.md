---
title: "Come configurare la rete esterna"
---

# Come configurare la rete esterna

Hikube propone due metodi di esposizione di rete per rendere una VM accessibile dall'esterno: **PortList** (raccomandato) e **WholeIP**. Questa guida spiega come scegliere e configurare ciascun metodo.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Una **VMInstance** esistente o un manifest pronto per il deployment
- Conoscenza delle porte necessarie per la vostra applicazione

## Passi

### 1. Scegliere il metodo di esposizione

Hikube supporta due metodi tramite il parametro `externalMethod`:

| Metodo | Descrizione | Caso d'uso |
|---------|-------------|-------------|
| **PortList** | Solo le porte elencate in `externalPorts` sono esposte. Firewall automatico. | Produzione, ambienti sicuri |
| **WholeIP** | Tutte le porte della VM sono esposte. Nessun filtraggio di rete. | Sviluppo, test, VPN/Gateway, accesso amministrativo completo |

:::tip Raccomandazione
Utilizzate **PortList** in produzione. Questo metodo applica un firewall automatico che espone solo le porte esplicitamente dichiarate.
:::

### 2. Configurare con PortList (raccomandato)

Con `PortList`, dichiarate esplicitamente le porte da esporre tramite `externalPorts`. Tutto il resto è bloccato a livello di rete:

```yaml title="vm-portlist.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-web-server
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 80
    - 443
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

In questo esempio, solo le porte SSH (22), HTTP (80) e HTTPS (443) sono accessibili dall'esterno.

### 3. Configurare con WholeIP (alternativa)

Con `WholeIP`, la VM riceve un IP pubblico con tutte le porte aperte. Il parametro `externalPorts` non è necessario:

```yaml title="vm-wholeip.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-dev
spec:
  runStrategy: Always
  instanceType: u1.xlarge
  instanceProfile: ubuntu
  external: true
  externalMethod: WholeIP
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-ed25519 AAAA... user@host
```

:::warning Sicurezza
Con `WholeIP`, la VM è interamente esposta su Internet. Tutte le porte sono accessibili. Configurate obbligatoriamente un **firewall a livello del sistema operativo** (ufw, firewalld, iptables) per restringere gli accessi.
:::

### 4. Applicare e verificare l'accesso

Applicate il manifest:

```bash
kubectl apply -f vm-portlist.yaml
```

Attendete che la VM sia in stato `Running`:

```bash
kubectl get vminstance vm-web-server -w
```

## Verifica

Recuperate l'indirizzo IP esterno della VM:

```bash
kubectl get vminstance vm-web-server -o yaml
```

Testate la connettività sulle porte esposte:

```bash
# Test SSH
ssh -i ~/.ssh/hikube-vm ubuntu@<IP-ESTERNO>

# Test HTTP (se un server web è installato)
curl http://<IP-ESTERNO>
```

Per verificare che una porta non esposta sia ben bloccata (con PortList):

```bash
# Questa porta dovrebbe essere inaccessibile con PortList
nc -zv <IP-ESTERNO> 8080
```

:::note Modifica delle porte
Per aggiungere o rimuovere porte esposte con `PortList`, modificate la lista `externalPorts` nel manifest e riapplicate con `kubectl apply`.
:::

## Per approfondire

- [Riferimento API](../api-reference.md) -- sezione Configurazione di rete
- [Avvio rapido](../quick-start.md)
