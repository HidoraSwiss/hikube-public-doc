---
title: "Come risolvere il DNS .local nelle VM"
---

# Come risolvere il DNS .local nelle VM

Le VM Hikube basate su Debian o Ubuntu utilizzano `systemd-resolved` per la risoluzione DNS. Tuttavia, il dominio DNS interno del cluster è `cozy.local`, e `systemd-resolved` rifiuta di default tutte le richieste `*.local` poiché questo TLD è riservato al protocollo mDNS (RFC 6762). Questa guida spiega come correggere questo comportamento per permettere la risoluzione DNS dei servizi Kubernetes da una VM.

## Prerequisiti

- Una **VMInstance** Hikube basata su Debian o Ubuntu
- Un accesso **SSH** o **console** alla VM
- Diritti **root** o **sudo** sulla VM

## Passi

### 1. Diagnosticare il problema

Connettetevi alla VM:

```bash
virtctl ssh -i ~/.ssh/id_ed25519 ubuntu@my-vm
```

Verificate la configurazione DNS attuale:

```bash
resolvectl status
```

Osservate la sezione della vostra interfaccia di rete (generalmente `enp1s0`). Noterete l'assenza di domini di ricerca (search domains) e di domini di routing (routing domains).

Testate la risoluzione di un servizio Kubernetes:

```bash
dig my-service.my-namespace.svc.cozy.local
```

**Risultato tipico del problema:**

```
;; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 12345
```

Lo stato `REFUSED` conferma che `systemd-resolved` invia la richiesta `.local` verso mDNS (disabilitato nella VM) invece del server DNS unicast.

**Causa principale**: il DHCP di KubeVirt (virt-launcher) fornisce un server DNS ma non trasmette domini di ricerca. Senza il dominio di routing `~local`, `systemd-resolved` applica il comportamento predefinito dell'RFC 6762 e instrada `.local` verso mDNS.

### 2. Creare il drop-in systemd-networkd

La soluzione consiste nel creare un file drop-in per `systemd-networkd` che dichiari i domini di ricerca e i domini di routing appropriati.

:::warning Non utilizzare netplan
Netplan non supporta i domini di routing (prefisso `~`). Utilizzate direttamente un drop-in `systemd-networkd`.
:::

Create la directory del drop-in:

```bash
sudo mkdir -p /etc/systemd/network/10-netplan-enp1s0.network.d/
```

Create il file di configurazione:

```bash
sudo tee /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf << 'EOF'
[Network]
Domains=<namespace>.svc.cozy.local svc.cozy.local cozy.local ~local ~.
EOF
```

:::note Sostituite il namespace
Sostituite `<namespace>` con il nome reale del vostro namespace (tenant) Hikube. Ad esempio: `tenant-prod.svc.cozy.local`.
:::

**Spiegazione dei domini configurati:**

| Dominio | Ruolo |
|---------|------|
| `<namespace>.svc.cozy.local` | Dominio di ricerca: permette la risoluzione per nome breve (es.: `my-service` invece di `my-service.my-namespace.svc.cozy.local`) |
| `svc.cozy.local` | Dominio di ricerca: risoluzione dei servizi in altri namespace |
| `cozy.local` | Dominio di ricerca: risoluzione di qualsiasi nome nel cluster |
| `~local` | Dominio di routing: forza `.local` verso il DNS unicast invece di mDNS |
| `~.` | Dominio di routing: rende questa interfaccia la rotta DNS predefinita (altrimenti la risoluzione esterna smette di funzionare) |

### 3. Applicare la configurazione

Riavviate i servizi di rete:

```bash
sudo systemctl restart systemd-networkd systemd-resolved
```

### 4. Verificare la configurazione

Verificate che i domini siano correttamente applicati:

```bash
resolvectl status
```

Dovreste vedere i domini di ricerca e di routing nella sezione dell'interfaccia `enp1s0`:

```
Link 2 (enp1s0)
    Current Scopes: DNS
         Protocols: +DefaultRoute ...
Current DNS Server: 10.x.x.x
       DNS Servers: 10.x.x.x
        DNS Domain: ~.
                    ~local
                    <namespace>.svc.cozy.local
                    svc.cozy.local
                    cozy.local
```

## Verifica

Testate la risoluzione DNS di un servizio Kubernetes per nome completo (FQDN):

```bash
dig my-service.my-namespace.svc.cozy.local
```

**Risultato atteso:** stato `NOERROR` con una risposta contenente l'indirizzo IP del servizio.

Testate la risoluzione per nome breve (grazie ai domini di ricerca):

```bash
dig my-service
```

Testate che la risoluzione DNS esterna funzioni ancora:

```bash
dig google.com
```

:::tip Persistenza
Questa configurazione è **persistente**: sopravvive ai riavvii della VM. Il file drop-in viene letto automaticamente da `systemd-networkd` all'avvio.
:::

:::note Soluzione a livello piattaforma
Questo problema verrà risolto a termine a livello della piattaforma Hikube configurando il DHCP di KubeVirt (virt-launcher) per trasmettere i domini di ricerca alle VM. Nel frattempo, questa correzione manuale è necessaria.
:::

## Per approfondire

- [Riferimento API](../api-reference.md)
- [Avvio rapido](../quick-start.md)
