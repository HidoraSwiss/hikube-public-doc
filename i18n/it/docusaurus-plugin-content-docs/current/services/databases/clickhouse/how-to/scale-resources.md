---
title: "Come scalare verticalmente ClickHouse"
---

# Come scalare verticalmente ClickHouse

Questa guida spiega come regolare le risorse CPU, memoria e archiviazione della vostra istanza ClickHouse su Hikube, sia tramite un preset predefinito, sia definendo valori espliciti.

## Prerequisiti

- Un'istanza ClickHouse distribuita su Hikube (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Il file YAML di configurazione della vostra istanza ClickHouse

## Passaggi

### 1. Verificare le risorse attuali

Consultate la configurazione attuale della vostra istanza ClickHouse:

```bash
kubectl get clickhouse my-clickhouse -o yaml
```

Annotate i valori di `resourcesPreset`, `resources`, `replicas`, `shards` e `size` nella sezione `spec`.

### 2. Modificare il resourcesPreset o le risorse esplicite

#### Opzione A: Usare un preset

Ecco i preset disponibili:

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Ad esempio, per passare da `small` (valore predefinito) a `large`:

```yaml title="clickhouse-large.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: large
  size: 20Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
```

#### Opzione B: Definire risorse esplicite

Per un controllo preciso, specificate direttamente CPU e memoria:

```yaml title="clickhouse-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resources:
    cpu: 4000m
    memory: 8Gi
  size: 50Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 2Gi
```

:::warning
Se il campo `resources` e definito, il valore di `resourcesPreset` viene completamente ignorato. Rimuovete `resourcesPreset` dal manifesto per evitare confusione.
:::

### 3. Regolare l'archiviazione se necessario

ClickHouse archivia i dati su disco (a differenza di Redis). Pensate ad aumentare il volume persistente (`size`) in funzione del volume di dati previsto:

```yaml title="clickhouse-storage.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: xlarge
  size: 100Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
```

:::tip
Usate `storageClass: replicated` in produzione per proteggere i dati contro la perdita di un nodo fisico.
:::

### 4. Applicare l'aggiornamento

```bash
kubectl apply -f clickhouse-large.yaml
```

## Verifica

Verificate che le risorse siano state aggiornate:

```bash
# Verificare la configurazione della risorsa ClickHouse
kubectl get clickhouse my-clickhouse -o yaml | grep -A 5 resources

# Verificare lo stato dei pod ClickHouse
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse
```

**Risultato atteso:**

```console
NAME                READY   STATUS    RESTARTS   AGE
my-clickhouse-0-0   1/1     Running   0          3m
my-clickhouse-0-1   1/1     Running   0          3m
```

## Per approfondire

- [Riferimento API](../api-reference.md) -- Parametri `resources`, `resourcesPreset`, `size` e `storageClass`
- [Come configurare lo sharding](./configure-sharding.md) -- Distribuzione orizzontale dei dati
- [Come gestire utenti e profili](./manage-users.md) -- Gestione degli accessi utente
