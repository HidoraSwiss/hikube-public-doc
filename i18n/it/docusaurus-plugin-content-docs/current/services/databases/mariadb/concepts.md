---
sidebar_position: 2
title: Concetti
---

# Concetti — MariaDB

## Architettura

MariaDB su Hikube è un servizio gestito. MariaDB è un fork di MySQL compatibile con i suoi client e il suo protocollo. Ogni cluster creato dalla console è un insieme replicato composto da un primary e da eventuali repliche. Appartiene a un **progetto** e consuma la quota di tale progetto.

```mermaid
graph TB
    subgraph "Console Hikube"
        UI[Progetto → DB & Messaging → MariaDB]
    end

    subgraph "Cluster MariaDB"
        P[Primary - R/W]
        R1[Replica 1 - RO]
        R2[Replica 2 - RO]
    end

    subgraph "Storage"
        PV1[Volume primary]
        PV2[Volume replica 1]
        PV3[Volume replica 2]
    end

    UI -->|creazione / modifica| P
    P -->|binlog replication| R1
    P -->|binlog replication| R2
    P --> PV1
    R1 --> PV2
    R2 --> PV3
```

---

## Terminologia

| Termine | Descrizione |
|---------|-------------|
| **Cluster MariaDB** | Istanza gestita creata dalla console, composta da un primary e da eventuali repliche. |
| **Progetto** | Spazio isolato che raggruppa le sue risorse e a cui è associata la quota. |
| **Primary** | Nodo principale che accetta letture e scritture. |
| **Replica** | Nodo in sola lettura, sincronizzato dal primary tramite la replica binlog. |
| **Preset** | Profilo di risorse (CPU, memoria) assegnato a ogni nodo del cluster. |
| **Accesso esterno** | Opzione che espone il cluster su Internet tramite un indirizzo IP pubblico. |
| **Ruolo** | Diritto di un utente su un database: **Administrator** o **Read-only**. |

---

## Replica e alta disponibilità

Il cluster utilizza la **replica binlog** di MariaDB:

1. **Il primary** scrive tutte le modifiche nel binary log
2. **Le repliche** consumano il binlog e applicano le modifiche
3. **In caso di guasto** del primary, la piattaforma promuove automaticamente una replica

```mermaid
sequenceDiagram
    participant Client
    participant Primary
    participant Replica

    Client->>Primary: INSERT INTO ...
    Primary->>Primary: Scrittura binlog
    Primary-->>Client: OK
    Primary->>Replica: Binlog event
    Replica->>Replica: Applica la modifica
```

Il **Number of replicas** si sceglie al momento della creazione:

| Valore proposto | Utilizzo |
|-----------------|----------|
| **1 (Standalone)** | Sviluppo, test |
| **3 (Max High Availability)** | Produzione |
| **5 (Ultra High Availability)** | Produzione critica |

:::warning
Il numero di repliche e il preset non possono essere modificati dopo la creazione. Per cambiarli, [contatti il supporto](mailto:support@hidora.io).
:::

Il passaggio manuale del primary (switchover) non è proposto nella console; contatti il supporto.

---

## Utenti, database e ruoli

La pagina di un cluster MariaDB comprende una sezione **Users**; non esiste una scheda dedicata ai database. I diritti si assegnano database per database: ogni accesso associa un **Database name** a dei **Rights**, **Administrator (Admin)** o **Read-only**. **Administrator** concede tutti i privilegi sul database (`ALL`, con diritto di delega), **Read-only** il diritto `SELECT`. Concedere un accesso su un database che non esiste ancora lo crea. Non esiste un ruolo globale: un utente ha accesso solo ai database che gli sono assegnati.

- Alla creazione del cluster, il passaggio **Users** della procedura guidata chiede per ogni utente un **Database** applicativo e un **Role**.
- In seguito, **Create a user** e **Manage Access** permettono di assegnare uno o più accessi. Un utente salvato senza accessi non ha diritti su alcun database.
- La colonna **Databases** dell'elenco degli utenti mostra ogni database con il ruolo, ad esempio `myapp (Administrator)`.

I database di sistema `mysql`, `information_schema`, `performance_schema` e `sys` non possono ricevere accessi: la console mostra «“mysql” is a system database: choose an application database.» e l'API rifiuta la richiesta. Non possono nemmeno essere creati né eliminati.

:::warning Utenti creati prima della console v1.3.0
La procedura guidata di creazione del cluster assegnava in precedenza a ogni utente un ruolo sul database di sistema `mysql`, che contiene gli account e i diritti del server: un accesso **Administrator** su questo database consente di modificare i diritti di tutti gli utenti, un accesso **Read-only** di leggere gli hash delle password. Per questi utenti, apra **Actions** → **Manage Access**: la riga `mysql` vi appare in errore. La rimuova, aggiunga se necessario il database applicativo dell'utente, quindi faccia clic su **Save**.
:::

La password di un utente è generata dalla piattaforma e mostrata **una sola volta**. In caso di smarrimento, ne generi una nuova con **Change Password**.

### Regole di denominazione

| Elemento | Regola |
|----------|--------|
| Nome del cluster | Da 3 a 16 caratteri: lettere minuscole, cifre e trattini; inizia con una lettera, termina con una lettera o una cifra |
| Nome utente | Da 3 a 16 caratteri: lettere minuscole, cifre e trattini; inizia con una lettera, termina con una lettera o una cifra. Alcuni nomi, come `admin` o `root`, sono riservati |
| Nome del database | Da 1 a 63 caratteri: lettere minuscole, cifre e trattini; inizia con una lettera, termina con una lettera o una cifra. I database di sistema `mysql`, `information_schema`, `performance_schema` e `sys` sono rifiutati |

:::note
I trattini bassi (`_`) non sono accettati né nei nomi dei database né nei nomi utente.
:::

---

## Preset

Il **Preset** definisce la capacità assegnata a **ogni nodo** del cluster. Fa fede l'elenco mostrato dalla procedura guidata; a titolo indicativo:

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

La definizione di risorse CPU/memoria libere non è proposta nella console; contatti il supporto.

---

## Accesso di rete

- **Accesso esterno disattivato** (impostazione predefinita): il cluster non è esposto su Internet. Il campo **Host** del riquadro **Connection and network** mostra **Not defined**.
- **Accesso esterno attivato**: la piattaforma assegna un indirizzo IP pubblico, mostrato nel campo **Host**. La porta è la porta MySQL standard, `3306`.

---

## Backup e ripristino

La configurazione dei backup e il ripristino non sono proposti nella console; contatti il supporto. Consulti [Configurare i backup](./how-to/configure-backups.md).

---

## Quota e costo

La procedura guidata mostra l'**Estimated cost** e l'impatto del cluster sulla quota del progetto. Se il cluster supera la quota disponibile, il pulsante **Next** resta inattivo.

| Parametro | Valore |
|-----------|--------|
| Versioni | 10.6, 10.11, 11.4, 11.8; dopo la creazione, solo aggiornamento di versione |
| Repliche | 1, 3 o 5 |
| Dimensione del disco | Da 1 a 4.096 GB, entro il limite della quota di storage del progetto; dopo la creazione, solo aumento |

---

## Per approfondire

- [Panoramica](./overview.md): presentazione del servizio
- [Avvio rapido](./quick-start.md): creare il suo primo cluster
