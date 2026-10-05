---
title: "Come collegare una VM a un VPC"
---

# Come collegare una VM a un VPC

Questa guida spiega come collegare una VM a una o più sottoreti VPC, alla creazione o su una VM esistente, e poi come verificare e configurare l'interfaccia nel sistema operativo. Tratta anche lo scollegamento.

## Prerequisiti

- Un account Hikube e un progetto
- Un VPC con almeno una sottorete (vedere [Avvio rapido](../quick-start.md)), oppure l'intenzione di crearne uno dalla procedura guidata VM
- Un accesso SSH alla VM per la verifica

## Passaggi

### 1. Collegare una nuova VM

1. Apra **VM Instances** > **Create an Instance** e compili i primi passaggi.
2. Al passaggio **Network**, sezione **VPC Networks (Secondary)**, selezioni il VPC desiderato.
3. Sotto **Subnets**, selezioni una o più sottoreti.
4. Completi la procedura guidata: il **Summary** mostra **Private Networks** con il numero di sottoreti. Faccia clic su **Create instance**.

Non ha ancora un VPC? Faccia clic su **+ VPC** nella sezione **VPC Networks (Secondary)**: la finestra **Create VPC** consente di creare il VPC e le sue sottoreti, quindi lo seleziona automaticamente. Per aggiungere una sottorete a un VPC selezionato, faccia clic su **Add subnet**, inserisca un nome e un intervallo CIDR, quindi confermi.

### 2. Collegare una VM esistente

1. Apra la pagina di dettaglio della VM e faccia clic su **Edit**.
2. In **Network & Security**, sotto **VPC Networks (Secondary)**, selezioni il VPC e poi le sottoreti.
3. Faccia clic su **Save**.

### 3. Verificare nella console

Nella pagina di dettaglio della VM, sezione **Network & Security**:

- **VPC Networks** elenca ogni VPC con le sue **Connected subnets** e il relativo intervallo, ad esempio `app (172.16.0.0/24)`;
- **IP Addresses** aggiunge un indirizzo **Secondary** per sottorete.

### 4. Verificare nel sistema operativo

```bash
ip -br addr
```

**Risultato atteso:** un'interfaccia aggiuntiva per ogni sottorete collegata. Il sistema operativo non la configura automaticamente: compare inizialmente senza indirizzo, ad esempio:

```
lo               UNKNOWN        127.0.0.1/8 ::1/128
enp1s0           UP             10.x.x.x/xx ...
enp2s0           DOWN
```

Attivi DHCP sull'interfaccia secondaria. Esempio con netplan (Ubuntu):

```yaml title="/etc/netplan/60-vpc.yaml"
network:
  version: 2
  ethernets:
    enp2s0:
      dhcp4: true
      dhcp4-overrides:
        use-routes: false
```

```bash
sudo chmod 600 /etc/netplan/60-vpc.yaml
sudo netplan apply
ip -br addr show enp2s0
```

**Risultato atteso:** `enp2s0` è `UP` con l'indirizzo **Secondary** mostrato nella console, ad esempio `172.16.0.11/24`.

`use-routes: false` evita che l'interfaccia VPC sostituisca la route predefinita: l'accesso a Internet continua a passare per l'interfaccia principale.

### 5. Scollegare una VM

1. Pagina di dettaglio della VM > **Edit**.
2. Sotto **VPC Networks (Secondary)**, deselezioni la sottorete, oppure l'intero VPC.
3. Faccia clic su **Save**.

Rimuova poi la configurazione corrispondente nel sistema operativo (ad esempio il file netplan aggiunto).

## Verifica

Da un'altra VM della stessa sottorete:

```bash
ping -c 3 <indirizzo-secondario-della-vm>
```

## Per approfondire

- [Gestire le sottoreti](./manage-subnets.md)
- [Configurare la rete e il firewall di una VM](../../compute/how-to/configure-network.md)
- [Risoluzione dei problemi](../troubleshooting.md)
