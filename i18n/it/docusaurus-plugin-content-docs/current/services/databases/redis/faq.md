---
sidebar_position: 6
title: FAQ
---

# FAQ — Redis

### Come funziona Redis Sentinel su Hikube?

Redis su Hikube è distribuito in architettura **Redis Sentinel** per l'alta disponibilità:

- **Redis Sentinel** monitora le istanze Redis ed esegue una **commutazione automatica** (failover) in caso di guasto del master.
- Un **quorum** di Sentinel decide il failover. Vengono sempre distribuiti tre Sentinel, qualunque sia il numero di repliche Redis: la commutazione funziona a partire da **2 repliche**.
- L'indirizzo del campo **Host** segue il master: dopo una commutazione, punta automaticamente al nuovo master, senza cambio di indirizzo.

:::tip
In produzione, scelga almeno 3 repliche alla creazione: questo numero non potrà più essere modificato in seguito.
:::

### Quali preset sono disponibili?

Il **Preset** definisce la CPU e la memoria di ogni nodo. Fa fede l'elenco mostrato dalla procedura guidata; a titolo indicativo:

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Può essere cambiato dopo la creazione da **Edit**.

### Redis rende persistenti i dati?

Sì. Ogni nodo dispone di un volume persistente (**Volume size (GB)**) su cui Redis scrive i dati tramite i propri meccanismi nativi. I dati sopravvivono ai riavvii.

### A cosa serve l'opzione «Enable authentication»?

Attivata (valore predefinito), protegge il cluster con una password generata automaticamente, mostrata una sola volta alla creazione insieme all'utente `default`. Questa password è richiesta per qualsiasi connessione.

:::warning
Mantenga sempre l'autenticazione attivata, in particolare se la rete pubblica è attivata.
:::

### Ho smarrito la password. Come recuperarla?

Non può essere riletta. Ne generi una nuova dalla sezione **Security** della pagina del cluster (**Rotate password**). Si veda [Rinnovare la password](./how-to/rotate-password.md).

### Come scalare Redis?

- **Verticalmente**: cambi il **Preset** e la **Volume Size (GB)** tramite **Edit**. Si veda [Modificare le risorse](./how-to/scale-resources.md).
- **Orizzontalmente**: il numero di repliche è fissato alla creazione. Per modificarlo, [contatti il supporto](mailto:support@hidora.io).

### Come connettersi a Redis?

Con la rete pubblica attivata, utilizzi l'indirizzo del campo **Host** (sezione **Connection** della pagina del cluster) sulla porta `6379`:

```bash
REDISCLI_AUTH='<password>' redis-cli -h <host> -p 6379 ping
```

Senza rete pubblica, l'istanza resta raggiungibile dalle VM del progetto tramite un indirizzo interno, che la console non mostra. [Contatti il supporto](mailto:support@hidora.io) per ottenerlo.

### È possibile creare più utenti Redis (ACL)?

No, la console non offre la gestione degli utenti Redis: l'accesso si basa su una password globale del cluster.
