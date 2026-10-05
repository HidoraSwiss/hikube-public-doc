---
title: "Come configurare cloud-init"
---

# Come configurare cloud-init

cloud-init è lo standard di inizializzazione automatica delle VM: creazione di utenti, installazione di pacchetti, scrittura di file, esecuzione di comandi. Nella console Hikube, lo script cloud-init si inserisce nel campo **Cloud-Init script (User Data)**.

## Prerequisiti

- Un account Hikube e un progetto
- Un'immagine **Linux**: il campo cloud-init non è disponibile per le immagini Windows
- Una conoscenza di base del formato **YAML**

## Passaggi

### 1. Inserire lo script alla creazione

1. Apra **Infrastructure** > **VM Instances** > **Create an Instance** e compili i passaggi **General**, **Configuration** e **Storage**.
2. Al passaggio **Network**, sezione **Initialization & Access**, attivi l'interruttore **Cloud-Init script (User Data)**.
3. Inserisca la sua configurazione nell'area di testo. Deve iniziare con `#cloud-config`.
4. Completi la procedura guidata e faccia clic su **Create instance**.

Le chiavi inserite in **Authorized SSH keys** vengono iniettate dalla piattaforma: non è necessario ripeterle nello script per l'utente predefinito.

### 2. Esempi

#### Utente supplementare con sudo

```yaml title="user-data.yaml"
#cloud-config
users:
  - default
  - name: deployer
    sudo: ALL=(ALL) NOPASSWD:ALL
    groups: sudo
    shell: /bin/bash
    ssh_authorized_keys:
      - ssh-ed25519 AAAA... deployer@ci
```

La voce `default` mantiene l'utente predefinito dell'immagine (ad esempio `ubuntu`).

#### Pacchetti installati all'avvio

```yaml title="user-data.yaml"
#cloud-config
package_update: true
package_upgrade: true
packages:
  - htop
  - curl
  - git
  - docker.io
```

#### Comandi all'avvio

```yaml title="user-data.yaml"
#cloud-config
runcmd:
  - mkdir -p /opt/app
  - echo "VM inizializzata il $(date)" > /opt/app/init.log
  - systemctl enable --now docker
```

#### Server web

Autorizzi anche le porte **HTTP (80)** e **HTTPS (443)** al passaggio **Network**.

```yaml title="user-data.yaml"
#cloud-config
packages:
  - nginx
write_files:
  - path: /var/www/html/index.html
    content: |
      <!DOCTYPE html>
      <html>
      <head><title>Hikube VM</title></head>
      <body><h1>VM operativa</h1></body>
      </html>
runcmd:
  - systemctl enable --now nginx
```

### 3. Modificare lo script di una VM esistente

1. Apra la pagina di dettaglio della VM e faccia clic su **Edit**.
2. In **Advanced Configuration**, modifichi **Cloud-Init script (User Data)**.
3. Faccia clic su **Save**.

Il nuovo script viene salvato senza riavviare la VM, ma non viene rieseguito automaticamente: passi al passaggio successivo.

### 4. Rieseguire lo script

1. Su una VM in stato **Running**, faccia clic su **Reload UserData**, dalla sezione **Actions** della pagina di dettaglio oppure dal menu **Actions** dell'elenco. La console mostra **UserData reload has been initiated.**
2. Il ricaricamento non riavvia la VM: lo script viene rieseguito all'avvio successivo. Faccia clic su **Restart** per applicarlo subito.

Al riavvio, cloud-init tratta la VM come una nuova istanza: riesegue l'intero script (`runcmd`, `write_files`, `packages`…) e rigenera le chiavi host SSH. Il suo client SSH segnala allora un cambiamento della chiave host; rimuova la vecchia voce con `ssh-keygen -R <ip-pubblico>`.

Quando modifica le **SSH Keys** di una VM, la console propone direttamente questo ricaricamento nella finestra **SSH keys changed**: **Reload user-data** o **Don't reload user-data**.

:::warning Effetti di un ricaricamento
Un ricaricamento seguito da un riavvio fa rieseguire alla VM l'intero script cloud-init. Scriva script idempotenti (senza effetti indesiderati se eseguiti più volte), in particolare per `runcmd` e `write_files`.
:::

## Verifica

Si connetta alla VM e verifichi lo stato di cloud-init:

```bash
cloud-init status
```

**Risultato atteso:**

```
status: done
```

In caso di problemi, consulti il log:

```bash
sudo cat /var/log/cloud-init-output.log
```

Verifichi la sintassi di uno script prima di inviarlo (su una macchina in cui cloud-init è installato):

```bash
cloud-init schema --config-file user-data.yaml
```

Lo script salvato è visibile in qualsiasi momento nella pagina di dettaglio, sezione **Advanced Configuration** > **Cloud-Init User Data**.

## Per approfondire

- [Installare CUDA tramite cloud-init](./install-cuda-drivers.md)
- [Avvio rapido VM](../quick-start.md)
- [Documentazione cloud-init](https://cloudinit.readthedocs.io/)
