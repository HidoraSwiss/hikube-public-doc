---
sidebar_position: 6
title: "FAQ — Redis"
sidebar_label: FAQ
description: "Domande frequenti su Redis in Hikube: funzionamento di Sentinel, persistenza, autenticazione, password persa, scalabilità, connessione e ACL."
---

# FAQ — Redis

### Come funziona Redis Sentinel su Hikube?

Redis su Hikube è distribuito in architettura **Redis Sentinel** per l'alta disponibilità:

- **Redis Sentinel** monitora le istanze Redis ed esegue una **commutazione automatica** (failover) in caso di guasto del master.
- Un **quorum** di Sentinel decide il failover. Vengono sempre distribuiti tre Sentinel, qualunque sia il numero di repliche Redis: la commutazione funziona a partire da **2 repliche**.
- I Sentinel contano nelle quote del progetto (CPU e memoria, alla taglia del preset del cluster).
- L'host della zona **Internal**, come l'indirizzo della zona **External**, segue il master: dopo una commutazione, punta automaticamente al nuovo master, senza cambio di indirizzo.

:::tip
In produzione, scelga almeno 3 repliche alla creazione: questo numero non potrà più essere modificato in seguito.
:::

### Quali preset sono disponibili?

Il **Preset** definisce la CPU e la memoria di ogni nodo. I preset riprendono le taglie delle [macchine virtuali](../../compute/overview.md) delle serie `u1`, `s1` e `m1`: un preset ha le stesse risorse della VM con lo stesso nome. Fa fede l'elenco mostrato dalla procedura guidata:

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

Può essere cambiato dopo la creazione da **Edit**.

### Redis rende persistenti i dati?

Sì. Ogni nodo dispone di un volume persistente (**Volume size (GB)**) su cui Redis scrive i dati tramite i propri meccanismi nativi. I dati sopravvivono ai riavvii.

### A cosa serve l'opzione «Enable authentication»?

Attivata (valore predefinito), protegge il cluster con una password generata automaticamente, mostrata una sola volta alla creazione insieme all'utente `default`. Questa password è richiesta per qualsiasi connessione.

:::warning
Mantenga sempre l'autenticazione attivata, in particolare se la rete pubblica è attivata.
:::

### Ho smarrito la password. Come recuperarla?

Non può essere riletta. Ne generi una nuova dalla sezione **Security** della pagina del cluster (**Rotate password**), quindi riavvii il cluster: la nuova password viene accettata solo dopo questo riavvio. Si veda [Rinnovare la password](./how-to/rotate-password.md).

### Ho attivato l'autenticazione, ma Redis accetta ancora connessioni senza password. Perché?

L'attivazione o la disattivazione dell'autenticazione su un cluster esistente, come il rinnovo della sua password, viene salvata immediatamente ma si applica ai server Redis solo dopo un riavvio del cluster. Finché la pagina del cluster mostra il banner **Restart required**, faccia clic su **Restart now**. Il cluster non è raggiungibile per circa un minuto. Si veda [Riavviare un cluster](./how-to/restart-cluster.md).

### Come scalare Redis?

- **Verticalmente**: cambi il **Preset** e la **Volume Size (GB)** tramite **Edit**. Si veda [Modificare le risorse](./how-to/scale-resources.md).
- **Orizzontalmente**: il numero di repliche è fissato alla creazione. Per modificarlo, [contatti il supporto](mailto:support@hidora.io).

### Come connettersi a Redis?

Con la rete pubblica attivata, utilizzi l'indirizzo della zona **External** (sezione **Connection** della pagina del cluster) sulla porta `6379`:

```bash
REDISCLI_AUTH='<password>' redis-cli -h <host> -p 6379 ping
```

Da una VM o da un cluster Kubernetes del progetto, utilizzi l'host della zona **Internal**, con o senza rete pubblica. Anch'esso segue il master.

### È possibile creare più utenti Redis (ACL)?

No, la console non offre la gestione degli utenti Redis: l'accesso si basa su una password globale del cluster.
