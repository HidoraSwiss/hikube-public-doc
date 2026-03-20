---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API RabbitMQ

Questo riferimento descrive in dettaglio la configurazione e il funzionamento dei **cluster RabbitMQ** su Hikube, inclusa la gestione degli **utenti**, dei **vhost** e delle **code**.
I deployment si basano sull'**operatore ufficiale RabbitMQ**, garantendo una gestione semplificata, altamente disponibile e conforme alle buone pratiche del progetto upstream.

---

## Struttura di Base

### **Risorsa RabbitMQ**

#### Esempio di configurazione YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: rabbitmq
spec:
  replicas: 3
  resourcesPreset: small
  size: 10Gi
  storageClass: replicated
  users:
    admin:
      password: "strongpassword"
  vhosts:
    default:
      roles:
        admin: ["admin"]
```

---

## Parametri

### **Parametri Comuni**

| **Parametro**      | **Tipo**   | **Descrizione**                                                                         | **Default** | **Richiesto** |
| ------------------ | ---------- | --------------------------------------------------------------------------------------- | ----------- | ------------- |
| `external`         | `bool`     | Attiva l'accesso esterno al cluster RabbitMQ (esposizione fuori dal cluster)            | `false`     | No            |
| `replicas`         | `int`      | Numero di repliche RabbitMQ (nodi del cluster)                                          | `3`         | Sì            |
| `resources`        | `object`   | Configurazione esplicita di CPU e memoria per ogni replica RabbitMQ                     | `{}`        | No            |
| `resources.cpu`    | `quantity` | CPU disponibile per replica                                                             | `null`      | No            |
| `resources.memory` | `quantity` | RAM disponibile per replica                                                             | `null`      | No            |
| `resourcesPreset`  | `string`   | Preset di risorse (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)    | `"small"`   | Sì            |
| `size`             | `quantity` | Dimensione del volume persistente utilizzato per i dati RabbitMQ                        | `10Gi`      | Sì            |
| `storageClass`     | `string`   | StorageClass utilizzata per archiviare i dati RabbitMQ                                  | `""`        | No            |

#### Esempio YAML

```yaml title="rabbitmq.yaml"
replicas: 3
resourcesPreset: medium
size: 20Gi
storageClass: replicated
external: true
```

---

### **Parametri Utenti**

| **Parametro**          | **Tipo**            | **Descrizione**                 | **Default** | **Richiesto** |
| ---------------------- | ------------------- | ------------------------------- | ----------- | ------------- |
| `users`                | `map[string]object` | Lista degli utenti RabbitMQ     | `{}`        | Sì            |
| `users[name].password` | `string`            | Password dell'utente            | `null`      | Sì            |

#### Esempio YAML

```yaml title="rabbitmq.yaml"
users:
  admin:
    password: "securepassword"
  app:
    password: "apppassword123"
```

---

### **Parametri Virtual Host (vhost)**

| **Parametro**                 | **Tipo**            | **Descrizione**                                                   | **Default** | **Richiesto** |
| ----------------------------- | ------------------- | ----------------------------------------------------------------- | ----------- | ------------- |
| `vhosts`                      | `map[string]object` | Lista dei virtual host RabbitMQ                                   | `{}`        | No            |
| `vhosts[name].roles`          | `object`            | Ruoli e permessi associati a questo virtual host                  | `{}`        | No            |
| `vhosts[name].roles.admin`    | `[]string`          | Lista degli utenti con accesso amministratore su questo vhost     | `[]`        | No            |
| `vhosts[name].roles.readonly` | `[]string`          | Lista degli utenti con accesso in sola lettura                    | `[]`        | No            |

#### Esempio YAML

```yaml title="rabbitmq.yaml"
vhosts:
  "default":
    roles:
      admin: ["admin"]
      readonly: ["app"]
  "analytics":
    roles:
      admin: ["admin"]
      readonly: ["analyst"]
```

---

### **resources e resourcesPreset**

Il campo `resources` consente di definire esplicitamente la configurazione CPU e memoria di ogni replica RabbitMQ.
Se questo campo viene lasciato vuoto, viene utilizzato il valore del parametro `resourcesPreset`.

#### Esempio YAML

```yaml title="rabbitmq.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Se `resources` è definito, il valore di `resourcesPreset` viene ignorato.

| **Nome Preset** | **CPU** | **Memoria** |
| --------------- | ------- | ----------- |
| `nano`          | 100m    | 128Mi       |
| `micro`         | 250m    | 256Mi       |
| `small`         | 500m    | 512Mi       |
| `medium`        | 500m    | 1Gi         |
| `large`         | 1       | 2Gi         |
| `xlarge`        | 2       | 4Gi         |
| `2xlarge`       | 4       | 8Gi         |

---

## Esempi Completi

### Cluster di Produzione

```yaml title="rabbitmq-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: production
spec:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 20Gi
  storageClass: replicated
  external: false

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: SecureAppPassword
    monitoring:
      password: SecureMonitoringPassword

  vhosts:
    production:
      roles:
        admin: ["admin"]
        readonly: ["monitoring"]
    analytics:
      roles:
        admin: ["admin"]
        readonly: ["appuser"]
```

### Cluster di Sviluppo

```yaml title="rabbitmq-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: development
spec:
  replicas: 1
  resourcesPreset: nano
  size: 5Gi
  external: true

  users:
    dev:
      password: devpassword

  vhosts:
    default:
      roles:
        admin: ["dev"]
```

---

:::tip Buone Pratiche

- **3 repliche per le quorum queue**: con 3 nodi, RabbitMQ utilizza le quorum queue per garantire la durabilità dei messaggi in caso di guasto
- **Vhost per applicazione**: isolate ogni applicazione in un vhost dedicato per limitare l'impatto in caso di sovraccarico
- **Ruoli distinti**: separate gli utenti admin, applicativi e di monitoraggio con permessi adeguati
- **Archiviazione replicata**: utilizzate `storageClass: replicated` per proteggere i dati dalla perdita di un nodo
:::

:::warning Attenzione

- **Le eliminazioni sono irreversibili**: l'eliminazione di una risorsa RabbitMQ comporta la perdita definitiva di tutte le code e i messaggi
- **Repliche sotto 3**: con meno di 3 repliche, le quorum queue non possono garantire la durabilità dei messaggi in caso di guasto
- **Porte esposte**: se `external: true`, le porte AMQP (5672) e Management UI (15672) sono accessibili dall'esterno — proteggete le credenziali
:::

---

### Riferimenti esterni

* **Operatore ufficiale RabbitMQ:** [GitHub - rabbitmq/cluster-operator](https://github.com/rabbitmq/cluster-operator/)
* **Documentazione RabbitMQ Operator:** [operator-overview.html](https://www.rabbitmq.com/kubernetes/operator/operator-overview.html)
