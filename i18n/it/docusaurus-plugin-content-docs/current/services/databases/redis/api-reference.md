---
sidebar_position: 3
title: Riferimento API
---

# Riferimento API Redis

Questo riferimento descrive in dettaglio l'utilizzo di **Redis** su Hikube, evidenziando la sua rapidita e versatilita come **data store in-memory** e sistema di **cache distribuita**.
Il servizio gestito semplifica il deployment e la gestione dei cluster Redis, garantendo **alta disponibilita**, **bassa latenza** e prestazioni ottimali per le vostre applicazioni.

Il servizio si basa sull'operatore **[Spotahome Redis Operator](https://github.com/spotahome/redis-operator)**, che assicura l'orchestrazione, la replica e la supervisione dei cluster Redis.

---

## Struttura di Base

### **Risorsa Redis**

#### Esempio di configurazione YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
spec:
```

---

## Parametri

### **Parametri Comuni**

| **Parametro**     | **Tipo**   | **Descrizione**                                                                 | **Valore predefinito** | **Richiesto** |
|--------------------|------------|---------------------------------------------------------------------------------|------------------------|------------|
| `replicas`         | `int`      | Numero di repliche Redis (istanze nel cluster)                            | `2`                    | Si        |
| `resources`        | `object`   | Configurazione CPU e memoria esplicita di ogni replica Redis. Se vuoto, viene applicato `resourcesPreset` | `{}`                   | No        |
| `resources.cpu`    | `quantity` | CPU disponibile per replica                                                     | `null`                 | No        |
| `resources.memory` | `quantity` | RAM disponibile per replica                                                     | `null`                 | No        |
| `resourcesPreset`  | `string`   | Profilo di risorse predefinito (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `"nano"`              | Si        |
| `size`             | `quantity` | Dimensione del volume persistente (PVC) per i dati                              | `1Gi`                  | Si        |
| `storageClass`     | `string`   | Classe di archiviazione utilizzata                                                     | `""`                   | No        |
| `external`         | `bool`     | Attivare l'accesso esterno al cluster (LoadBalancer)                               | `false`                | No        |
| `authEnabled`      | `bool`     | Attivare l'autenticazione tramite password (memorizzata in un Secret Kubernetes) | `true`                 | No        |

#### Esempio di configurazione YAML

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
spec:
  # Numero di repliche Redis (alta disponibilita se >1)
  replicas: 3

  # Risorse allocate per istanza
  resources:
    cpu: 1000m      # 1 vCPU
    memory: 1Gi     # 1 GiB di RAM

  # Dimensione del disco persistente per ogni istanza
  size: 2Gi
  storageClass: replicated

  # Attivare l'autenticazione Redis
  # Se true, una password viene generata automaticamente
  authEnabled: true

  # Esporre il servizio Redis all'esterno del cluster
  external: true
```

---

### **Parametri specifici dell'applicazione**

| **Parametro**   | **Tipo** | **Descrizione**                  | **Valore predefinito** | **Richiesto** |
|------------------|----------|----------------------------------|------------------------|------------|
| `authEnabled`    | `bool`   | Attiva la generazione di una password (memorizzata in un Secret Kubernetes) | `true` | No |

#### Esempio di configurazione YAML

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
spec:
  replicas: 3
  resources:
    cpu: 1000m
    memory: 1Gi
  size: 2Gi
  storageClass: replicated
  # Attivare l'autenticazione Redis
  # Se true, una password viene generata automaticamente
  authEnabled: false
  # Esporre il servizio Redis all'esterno del cluster
  external: false
```

### resources e resourcesPreset

Il campo `resources` permette di definire esplicitamente la configurazione CPU e memoria di ogni replica Redis.
Se questo campo e lasciato vuoto, viene utilizzato il valore del parametro `resourcesPreset`.

#### Esempio di configurazione YAML

```yaml title="redis.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Attenzione: se resources e definito, il valore di resourcesPreset viene ignorato.

| **Preset name** | **CPU** | **Memoria** |
|-----------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

:::tip Buone Pratiche

- **`authEnabled: true`**: attivate sempre l'autenticazione in produzione per proteggere l'accesso ai vostri dati Redis
- **3 repliche minimo** in produzione per garantire l'alta disponibilita con Redis Sentinel
- **Storage replicato**: usate `storageClass: replicated` per proteggere i dati contro la perdita di un nodo fisico
- **Dimensionamento memoria**: la memoria allocata (`resources.memory`) deve essere sufficiente a contenere l'intero dataset Redis
:::

:::warning Attenzione

- **Le cancellazioni sono irreversibili**: la cancellazione di una risorsa Redis comporta la perdita definitiva dei dati se nessuna persistenza esterna e configurata
- **`resources` vs `resourcesPreset`**: se `resources` e definito, `resourcesPreset` viene completamente ignorato
- **Accesso esterno**: attivare `external: true` espone Redis su Internet — assicuratevi che `authEnabled: true` sia configurato
:::
