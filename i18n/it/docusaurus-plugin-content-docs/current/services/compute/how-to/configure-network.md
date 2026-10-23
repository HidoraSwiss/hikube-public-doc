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
| **Public IPv4 Address** disattivato | Nessuna esposizione su Internet | VM interna, raggiungibile tramite il suo IP **mgmt** o tramite un [VPC](../../networking/overview.md) |

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

Queste modifiche si applicano in pochi secondi, senza riavviare la VM. Un cambio di formato, di dischi o di GPU, invece, ha effetto solo al successivo riavvio.

### 4. Collegare la VM a una rete privata (facoltativo)

In **VPC Networks (Secondary)**, selezioni un VPC e poi una o più delle sue **Subnets**. Ogni sottorete aggiunge un'interfaccia privata alla VM, il cui indirizzo è distribuito tramite DHCP: AlmaLinux o Rocky lo ottengono automaticamente, Debian e Ubuntu richiedono di attivare DHCP sull'interfaccia (vedere [Collegare una VM a un VPC](../../networking/how-to/attach-vm-to-vpc.md#4-verificare-nel-sistema-operativo)). Su un'immagine Debian o Ubuntu, la console lo ricorda con l'avviso **Manual setup required on Debian and Ubuntu**. Il pulsante **+ VPC** crea un VPC senza lasciare la schermata, e **Add subnet** crea una sottorete nel VPC selezionato. Il dettaglio è in [Rete: avvio rapido](../../networking/quick-start.md).

## Verifica

Nella pagina di dettaglio, sezione **Network & Security**, gli indirizzi della VM sono suddivisi in due zone:

- **Internal**, *From the project's resources only*: l'indirizzo con l'etichetta **mgmt**, poi, se presenti, gli indirizzi delle sottoreti VPC (vedere [Gli indirizzi di una VM](#gli-indirizzi-di-una-vm));
- **External**, *From the Internet*: l'IP pubblico. Senza IP pubblico, la zona indica **Disabled** e « This instance has no public IP. ». Finché l'indirizzo non è assegnato, indica « Waiting for allocation… ».

Seguono poi:

- **SSH Connection**: il comando pronto da copiare, sull'IP pubblico, oppure sull'IP **mgmt** se la VM non ha un IP pubblico;
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

## Gli indirizzi di una VM

### L'IP mgmt

Ogni VM riceve all'avvio un indirizzo sulla rete del suo progetto: l'IP **mgmt**, visualizzato nella zona **Internal**. Esiste che l'IP pubblico sia attivato o meno ed è raggiungibile dalle altre risorse dello stesso progetto, ad esempio le altre VM. È l'indirizzo da utilizzare tra due VM del progetto senza passare da Internet. Finché la VM è arrestata, la zona **Internal** indica « Assigned when the instance starts. ».

Il firewall Hikube non filtra questo traffico: se necessario, lo filtri con il firewall del sistema operativo. Per raggiungere la VM da un altro progetto o da Internet, utilizzi il suo IP pubblico.

### Raggiungere un servizio gestito del progetto

I database e RabbitMQ mostrano nella loro zona **Internal** un nome host completo, che termina con `.local`. Da una VM del progetto, lo copi così com'è, per intero: la sua forma breve non si risolve su tutte le immagini.

Su Debian 13, il nome non si risolve senza configurazione: il sistema ignora il dominio di ricerca distribuito tramite DHCP. Aggiunga queste righe al **Cloud-Init script (User Data)** della VM (se la sua configurazione contiene già `write_files` o `runcmd`, unisca le voci agli elenchi esistenti):

```yaml title="cloud-init.yaml"
#cloud-config
write_files:
  - path: /etc/netplan/90-hikube-dns.yaml
    permissions: '0600'
    content: |
      network:
        version: 2
        ethernets:
          enp1s0:
            dhcp4-overrides:
              use-domains: true
            dhcp6-overrides:
              use-domains: true
runcmd:
  - netplan apply
```

Su una VM già avviata, scriva lo stesso file, quindi esegua `sudo netplan apply`. Ubuntu, AlmaLinux e Debian 12 risolvono il nome senza configurazione.

## Per approfondire

- [Rete: VPC e sottoreti](../../networking/overview.md)
- [Avvio rapido VM](../quick-start.md)
- [Risoluzione dei problemi](../troubleshooting.md)
