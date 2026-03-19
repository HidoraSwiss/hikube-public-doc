---
title: "Come scalare il cluster"
---

# Come scalare il cluster RabbitMQ

Questa guida spiega come regolare le risorse di un cluster RabbitMQ su Hikube: numero di repliche, risorse CPU/memoria e archiviazione.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un cluster **RabbitMQ** distribuito su Hikube

## Preset disponibili

Hikube propone dei preset di risorse predefiniti per RabbitMQ:

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 100m | 128Mi |
| `micro` | 250m | 256Mi |
| `small` | 500m | 512Mi |
| `medium` | 500m | 1Gi |
| `large` | 1 | 2Gi |
| `xlarge` | 2 | 4Gi |
| `2xlarge` | 4 | 8Gi |

:::warning
Se il campo `resources` (CPU/memoria espliciti) è definito, il valore di `resourcesPreset` viene **completamente ignorato**. Assicuratevi di svuotare il campo `resources` se desiderate utilizzare un preset.
:::

:::note
I preset RabbitMQ differiscono leggermente dagli altri servizi (Kafka, NATS, database). Consultate la tabella sopra per i valori esatti.
:::

## Passi

### 1. Verificare le risorse attuali

Consultate la configurazione attuale del cluster:

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 5 -E "replicas:|resources:|resourcesPreset|size:"
```

**Esempio di risultato:**

```console
  replicas: 3
  resourcesPreset: small
  resources: {}
  size: 10Gi
```

### 2. Modificare il numero di repliche

Il numero di repliche determina il numero di nodi nel cluster RabbitMQ.

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  replicas: 3
'
```

:::warning
Con meno di 3 repliche, le quorum queue non possono garantire la durabilità dei messaggi in caso di guasto. Utilizzate **minimo 3 repliche** in produzione.
:::

**Raccomandazioni per ambiente:**

| Ambiente | Repliche | Giustificazione |
|----------|----------|-----------------|
| Sviluppo | 1 | Sufficiente per i test |
| Staging | 3 | Simula la produzione |
| Produzione | 3 o 5 | Alta disponibilità e quorum queue |

### 3. Modificare il preset o le risorse esplicite

**Opzione A: cambiare il preset**

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  resourcesPreset: large
  resources: {}
'
```

:::note
È importante reimpostare `resources: {}` quando si passa a un preset, affinché il preset venga correttamente preso in considerazione.
:::

**Opzione B: definire risorse esplicite**

Per un controllo fine, definite direttamente i valori CPU e memoria:

```bash
kubectl patch rabbitmq my-rabbitmq --type='merge' -p='
spec:
  resources:
    cpu: 2000m
    memory: 4Gi
'
```

Potete anche modificare il manifesto completo:

```yaml title="rabbitmq-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: my-rabbitmq
spec:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 20Gi
  storageClass: replicated

  users:
    admin:
      password: SecureAdminPassword

  vhosts:
    production:
      roles:
        admin:
          - admin
```

```bash
kubectl apply -f rabbitmq-scaled.yaml
```

### 4. Applicare e verificare

Monitorate il rolling update dei pod:

```bash
kubectl get po -w | grep my-rabbitmq
```

**Risultato atteso (durante il rolling update):**

```console
my-rabbitmq-server-0   1/1     Running       0   45m
my-rabbitmq-server-1   1/1     Terminating   0   44m
my-rabbitmq-server-1   0/1     Pending       0   0s
my-rabbitmq-server-1   1/1     Running       0   30s
```

Attendete che tutti i pod siano nello stato `Running`:

```bash
kubectl get po | grep my-rabbitmq
```

```console
my-rabbitmq-server-0   1/1     Running   0   10m
my-rabbitmq-server-1   1/1     Running   0   8m
my-rabbitmq-server-2   1/1     Running   0   6m
```

Verificate lo stato del cluster RabbitMQ:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl cluster_status
```

## Verifica

Confermate che le nuove risorse siano applicate:

```bash
kubectl get rabbitmq my-rabbitmq -o yaml | grep -A 5 -E "replicas:|resources:|resourcesPreset|size:"
```

Verificate che il cluster sia funzionante:

```bash
kubectl exec -it my-rabbitmq-server-0 -- rabbitmqctl node_health_check
```

**Risultato atteso:**

```console
Health check passed
```

## Per approfondire

- **[Riferimento API RabbitMQ](../api-reference.md)**: documentazione completa dei parametri `replicas`, `resources`, `resourcesPreset` e della tabella dei preset
- **[Come gestire i vhost e gli utenti](./manage-vhosts-users.md)**: configurare gli utenti e i permessi
