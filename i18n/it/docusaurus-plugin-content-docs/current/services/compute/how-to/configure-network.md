---
title: "Come configurare la rete e il firewall"
---

# Come configurare la rete e il firewall

Una VM Hikube può essere esposta su Internet tramite un IP pubblico IPv4, filtrato da un firewall che apre solo le porte scelte. Può anche essere collegata a reti private (VPC). Questa guida spiega come regolare queste opzioni dalla console, alla creazione o su una VM esistente.

## Prerequisiti

- Un account Hikube e un progetto
- Una VM esistente, oppure la procedura guidata di creazione aperta
- L'elenco delle porte di cui la sua applicazione ha bisogno

## Passaggi

### 1. Scegliere la modalità di esposizione

| Configurazione | Effetto | Caso d'uso |
|---------------|-------|-------------|
| **Public IPv4 Address** attivato + **Enable Firewall** selezionato | Solo le **Allowed Ports** sono raggiungibili da Internet | Produzione, servizi mirati (consigliato) |
| **Public IPv4 Address** attivato + firewall non selezionato | Tutte le porte della VM sono raggiungibili da Internet | VPN, gateway, protocolli a porte dinamiche |
| **Public IPv4 Address** disattivato | Nessuna esposizione su Internet | VM interna, raggiungibile tramite un [VPC](../../networking/overview.md) |

:::tip Raccomandazione
Mantenga il firewall attivato in produzione e apra solo le porte necessarie.

Il firewall filtra solo il traffico che arriva dall'IP pubblico. Il traffico tra le VM del progetto, su un VPC come sulla rete principale, non è filtrato: a tale scopo utilizzi il firewall del sistema operativo (ufw, firewalld, nftables).
:::

### 2. Regolare le opzioni alla creazione

Al passaggio **Network** della procedura guidata:

1. **Public IPv4 Address**: lasci l'interruttore attivato per esporre la VM.
2. **Enable Firewall**: lasci la casella selezionata.
3. **Allowed Ports**: selezioni **SSH (22)**, **HTTP (80)**, **HTTPS (443)** secondo le sue esigenze.
4. Per un'altra porta, la inserisca in **Custom port...** (da 1 a 65535) e faccia clic sul pulsante di aggiunta. Compare selezionata nell'elenco; l'icona del cestino la rimuove.

Il **Summary** mostra **Public IP**, **Firewall** e **Open Ports** prima della distribuzione.

### 3. Modificare le opzioni di una VM esistente

1. Apra la pagina di dettaglio della VM e faccia clic su **Edit**.
2. In **Network & Security**, regoli **Public IPv4 Address**, **Enable Firewall** e le **Allowed Ports**.
3. Faccia clic su **Save**.

Queste modifiche si applicano in pochi secondi, senza riavviare la VM, a differenza di un cambio di formato, di dischi o di GPU.

### 4. Collegare la VM a una rete privata (facoltativo)

In **VPC Networks (Secondary)**, selezioni un VPC e poi una o più delle sue **Subnets**. Ogni sottorete aggiunge un'interfaccia privata alla VM, che il sistema operativo non configura automaticamente (vedere [Collegare una VM a un VPC](../../networking/how-to/attach-vm-to-vpc.md#4-verificare-nel-sistema-operativo)). Il pulsante **+ VPC** crea un VPC senza lasciare la schermata, e **Add subnet** crea una sottorete nel VPC selezionato. Il dettaglio è in [Rete: avvio rapido](../../networking/quick-start.md).

## Verifica

Nella pagina di dettaglio, sezione **Network & Security**:

- **Public IP**: **Active** o **Disabled**;
- **IP Addresses**: l'indirizzo **Primary** e, se presenti, gli indirizzi **Secondary** delle sottoreti VPC;
- **VPC Networks**: i VPC e le sottoreti connessi;
- **Firewall & Ports**: le porte aperte, oppure **No ports open**.

Esegua un test dalla sua postazione:

```bash
# SSH
ssh ubuntu@<ip-pubblico>

# HTTP, se un server web è in ascolto
curl http://<ip-pubblico>

# Una porta non autorizzata deve essere irraggiungibile
nc -zv -w 5 <ip-pubblico> 8080
```

:::warning Firewall disattivato
Senza il firewall Hikube, la VM è completamente esposta. Configuri un firewall nel sistema operativo (ufw, firewalld, nftables) prima di disattivare l'opzione.
:::

## Per approfondire

- [Rete: VPC e sottoreti](../../networking/overview.md)
- [Avvio rapido VM](../quick-start.md)
- [Risoluzione dei problemi](../troubleshooting.md)
