---
title: "Come risolvere il DNS .local nelle VM"
---

# Come risolvere il DNS .local nelle VM

Le VM Hikube basate su Debian o Ubuntu utilizzano `systemd-resolved` per la risoluzione DNS. Tuttavia il dominio DNS interno della piattaforma termina con `.local` (`cozy.local`), e `systemd-resolved` rifiuta per impostazione predefinita le richieste `*.local` perché questo TLD è riservato al protocollo mDNS (RFC 6762). Questa guida spiega come correggere questo comportamento nel sistema operativo della VM.

## Prerequisiti

- Una VM Hikube basata su Debian o Ubuntu
- Un accesso **SSH** alla VM (comando del blocco **SSH Connection** della pagina di dettaglio)
- Diritti **root** o **sudo**

## Passaggi

### 1. Diagnosticare il problema

Si connetta alla VM:

```bash
ssh -i ~/.ssh/hikube-vm ubuntu@<ip-pubblico>
```

Verifichi la configurazione DNS attuale:

```bash
resolvectl status
```

Individui la sezione dell'interfaccia di rete principale (spesso `enp1s0`). Non contiene né dominio di ricerca né dominio di instradamento.

Verifichi la risoluzione di un nome in `.local`:

```bash
dig mon-service.cozy.local
```

**Risultato tipico del problema:**

```
;; ->>HEADER<<- opcode: QUERY, status: REFUSED, id: 12345
```

Lo stato `REFUSED` conferma che `systemd-resolved` invia la richiesta `.local` verso mDNS invece che al server DNS unicast.

**Causa principale**: il DHCP della piattaforma fornisce un server DNS ma nessun dominio di ricerca. Senza dominio di instradamento `~local`, `systemd-resolved` applica la RFC 6762 e instrada `.local` verso mDNS.

### 2. Creare il drop-in systemd-networkd

:::warning Non utilizzare netplan
Netplan non gestisce i domini di instradamento (prefisso `~`). Utilizzi direttamente un drop-in `systemd-networkd`.
:::

Individui il nome del file di rete generato per l'interfaccia:

```bash
networkctl status enp1s0 | grep "Network File"
```

Crei la directory del drop-in corrispondente (qui per `10-netplan-enp1s0.network`):

```bash
sudo mkdir -p /etc/systemd/network/10-netplan-enp1s0.network.d/
```

Crei il file di configurazione:

```bash
sudo tee /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf << 'EOF'
[Network]
Domains=cozy.local ~local ~.
EOF
```

**Domini configurati:**

| Dominio | Ruolo |
|---------|------|
| `cozy.local` | Dominio di ricerca: consente di risolvere un nome relativo a `cozy.local` |
| `~local` | Dominio di instradamento: forza `.local` verso il DNS unicast invece che verso mDNS |
| `~.` | Dominio di instradamento: rende questa interfaccia la route DNS predefinita (senza di esso, la risoluzione esterna smette di funzionare) |

:::note Domini di ricerca supplementari
Se le è stato comunicato un dominio interno più specifico (ad esempio `<spazio>.svc.cozy.local`), lo aggiunga all'inizio della riga `Domains=` per poter utilizzare nomi brevi. In caso di dubbio sul dominio da utilizzare, contatti il [supporto](mailto:support@hidora.io).
:::

### 3. Applicare la configurazione

```bash
sudo systemctl restart systemd-networkd systemd-resolved
```

### 4. Verificare la configurazione

```bash
resolvectl status
```

La sezione dell'interfaccia deve elencare i domini:

```
Link 2 (enp1s0)
    Current Scopes: DNS
         Protocols: +DefaultRoute ...
Current DNS Server: 10.x.x.x
       DNS Servers: 10.x.x.x
        DNS Domain: ~.
                    ~local
                    cozy.local
```

## Verifica

Verifichi la risoluzione di un nome `.local` completo:

```bash
dig mon-service.cozy.local
```

**Risultato atteso:** stato `NOERROR` (o `NXDOMAIN` se il nome non esiste), e non più `REFUSED`.

Verifichi che la risoluzione esterna funzioni ancora:

```bash
dig example.com
```

:::tip Persistenza
Il drop-in viene letto da `systemd-networkd` a ogni avvio: la correzione sopravvive ai riavvii.
:::

:::tip Automatizzare con cloud-init
Per applicare la correzione fin dalla creazione, la aggiunga al **Cloud-Init script (User Data)**:

```yaml title="user-data.yaml"
#cloud-config
write_files:
  - path: /etc/systemd/network/10-netplan-enp1s0.network.d/dns-fix.conf
    content: |
      [Network]
      Domains=cozy.local ~local ~.
runcmd:
  - systemctl restart systemd-networkd systemd-resolved
```
:::

## Per approfondire

- [Configurare cloud-init](./configure-cloud-init.md)
- [Risoluzione dei problemi](../troubleshooting.md)
