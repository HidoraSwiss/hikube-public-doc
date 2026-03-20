---
title: "Come scalare verticalmente Redis"
---

# Come scalare verticalmente Redis

Questa guida spiega come regolare le risorse CPU, memoria e archiviazione della vostra istanza Redis su Hikube, sia tramite un preset predefinito, sia definendo valori espliciti.

## Prerequisiti

- Un'istanza Redis distribuita su Hikube (vedere l'[avvio rapido](../quick-start.md))
- `kubectl` configurato per interagire con l'API Hikube
- Il file YAML di configurazione della vostra istanza Redis

## Passaggi

### 1. Verificare le risorse attuali

Consultate la configurazione attuale della vostra istanza Redis:

```bash
kubectl get redis my-redis -o yaml
```

Annotate i valori di `resourcesPreset`, `resources`, `replicas` e `size` nella sezione `spec`.

### 2. Opzione A: Modificare il resourcesPreset

Il modo più semplice per scalare e usare un preset predefinito. Ecco i preset disponibili:

| **Preset** | **CPU** | **Memoria** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Ad esempio, per passare da `nano` a `medium`:

```yaml title="redis-medium.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 2
  resourcesPreset: medium
  size: 2Gi
  authEnabled: true
```

### 3. Opzione B: Definire risorse esplicite

Per un controllo preciso, specificate direttamente CPU e memoria con il campo `resources`:

```yaml title="redis-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 2
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 5Gi
  authEnabled: true
```

:::warning
Se il campo `resources` e definito, il valore di `resourcesPreset` viene completamente ignorato. Rimuovete `resourcesPreset` dal manifesto per evitare confusione.
:::

### 4. Regolare il numero di repliche se necessario

Potete anche aumentare il numero di repliche per distribuire il carico di lettura:

```yaml title="redis-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 3
  resourcesPreset: large
  size: 5Gi
  storageClass: replicated
  authEnabled: true
```

### 5. Applicare l'aggiornamento

```bash
kubectl apply -f redis-medium.yaml
```

:::tip
Redis e un data store in-memory: la memoria allocata (`resources.memory` o quella del preset) deve essere sufficiente a contenere l'intero dataset. Monitorate l'utilizzo della memoria prima di scalare.
:::

## Verifica

Verificate che le risorse siano state aggiornate:

```bash
# Verificare la configurazione della risorsa Redis
kubectl get redis my-redis -o yaml | grep -A 5 resources

# Verificare lo stato dei pod Redis
kubectl get pods -l app.kubernetes.io/instance=my-redis
```

**Risultato atteso:**

```console
NAME              READY   STATUS    RESTARTS   AGE
my-redis-0        1/1     Running   0          2m
my-redis-1        1/1     Running   0          2m
```

## Per approfondire

- [Riferimento API](../api-reference.md) -- Parametri `resources`, `resourcesPreset` e `replicas`
- [Come configurare l'alta disponibilità](./configure-ha.md) -- Configurazione Redis HA con Sentinel
