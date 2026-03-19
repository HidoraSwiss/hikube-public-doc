---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API NATS

Questo riferimento descrive in dettaglio la configurazione e il funzionamento dei **cluster NATS** su Hikube, inclusa la gestione degli **utenti**, la configurazione di **JetStream** per la persistenza dei messaggi e le opzioni di personalizzazione tramite il campo `config`.

---

## Struttura di Base

### **Risorsa NATS**

#### Esempio di configurazione YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: nats
spec:
  replicas: 2
  resourcesPreset: nano
  external: false
  jetstream:
    enabled: true
    size: 10Gi
  users:
    user1:
      password: "mypassword"
```

---

## Parametri

### **Parametri Comuni**

| **Parametro**      | **Tipo**   | **Descrizione**                                                                                      | **Default** | **Richiesto** |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------------- | ----------- | ------------- |
| `replicas`         | `int`      | Numero di repliche NATS (nodi del cluster)                                                           | `2`         | Sì            |
| `resources`        | `object`   | Configurazione esplicita di CPU e memoria per ogni replica. Se vuoto, viene utilizzato `resourcesPreset`. | `{}`   | No            |
| `resources.cpu`    | `quantity` | CPU disponibile per replica NATS                                                                     | `""`        | No            |
| `resources.memory` | `quantity` | RAM disponibile per replica NATS                                                                     | `""`        | No            |
| `resourcesPreset`  | `string`   | Preset di risorse predefinito (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)     | `"nano"`    | Sì            |
| `storageClass`     | `string`   | StorageClass utilizzata per archiviare i dati persistenti del cluster                                | `""`        | No            |
| `external`         | `bool`     | Attiva l'accesso esterno al cluster NATS (esposizione fuori dal cluster Kubernetes)                  | `false`     | No            |

#### Esempio YAML

```yaml title="nats.yaml"
replicas: 3
resourcesPreset: small
external: true
storageClass: replicated
```

---

### **Parametri Applicazione (Specifici di NATS)**

| **Parametro**          | **Tipo**            | **Descrizione**                                                                                                | **Default** | **Richiesto** |
| ---------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------- | ----------- | ------------- |
| `users`                | `map[string]object` | Lista degli utenti autorizzati a connettersi al cluster NATS. La chiave corrisponde al nome utente.            | `{}`        | No            |
| `users[name].password` | `string`            | Password associata all'utente.                                                                                 | `""`        | Sì se definito |
| `jetstream`            | `object`            | Configurazione del modulo **JetStream** per la persistenza dei messaggi.                                       | `{}`        | No            |
| `jetstream.enabled`    | `bool`              | Attiva o disattiva il modulo JetStream.                                                                        | `true`      | No            |
| `jetstream.size`       | `quantity`          | Dimensione del volume persistente allocato per JetStream.                                                      | `10Gi`      | No            |
| `config`               | `object`            | Configurazione avanzata di NATS. Consente di aggiungere o sovrascrivere determinati valori della configurazione predefinita. | `{}` | No    |
| `config.merge`         | `object`            | Configurazione aggiuntiva unita alla configurazione NATS principale.                                           | `{}`        | No            |
| `config.resolver`      | `object`            | Configurazione specifica del resolver NATS (DNS, operatore, ecc.).                                             | `{}`        | No            |

#### Esempio YAML

```yaml title="nats.yaml"
users:
  admin:
    password: "supersecurepassword"
  client:
    password: "clientpassword"

jetstream:
  enabled: true
  size: 20Gi

config:
  merge:
    debug: true
    trace: true
  resolver:
    dir: /data/nats/resolver
```

---

### **resources e resourcesPreset**

Il campo `resources` consente di definire esplicitamente la configurazione CPU e memoria di ogni replica.
Se questo campo viene lasciato vuoto, viene utilizzato il valore del parametro `resourcesPreset`.

#### Esempio YAML

```yaml title="nats.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ **Nota:** se `resources` è definito, il valore di `resourcesPreset` viene ignorato.

| **Nome Preset** | **CPU** | **Memoria** |
| --------------- | ------- | ----------- |
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

## Esempi Completi

### Cluster di Produzione

```yaml title="nats-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: production
spec:
  external: false
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: SecureAppPassword
    monitoring:
      password: SecureMonitoringPassword

  config:
    merge:
      max_payload: 8MB
      write_deadline: 2s
      debug: false
      trace: false
```

### Cluster di Sviluppo

```yaml title="nats-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: development
spec:
  external: true
  replicas: 1
  resourcesPreset: nano

  jetstream:
    enabled: true
    size: 5Gi

  users:
    dev:
      password: devpassword
```

---

:::tip Buone Pratiche

- **JetStream in produzione**: attivate sempre JetStream (`jetstream.enabled: true`) per beneficiare della persistenza dei messaggi e dello streaming
- **Minimo 3 repliche** in produzione per garantire l'alta disponibilità e il consenso Raft per JetStream
- **`max_payload`**: regolate la dimensione massima dei messaggi secondo il vostro caso d'uso (predefinito: 1MB, massimo raccomandato: 8MB)
- **Utenti dedicati**: create utenti distinti per applicazione per un controllo degli accessi granulare
:::

:::warning Attenzione

- **Le eliminazioni sono irreversibili**: l'eliminazione di una risorsa NATS comporta la perdita definitiva degli stream JetStream e di tutti i messaggi
- **Modifica di `jetstream.size`**: ridurre la dimensione del volume JetStream su un cluster esistente può comportare una perdita di dati
- **Accesso esterno**: attivare `external: true` espone il cluster NATS su Internet — assicuratevi che l'autenticazione sia ben configurata
:::
