---
title: "Come scalare verticalmente"
---

# Come scalare verticalmente

Questa guida spiega come regolare le risorse CPU e memoria della vostra istanza PostgreSQL su Hikube, sia tramite un preset predefinito, sia con valori espliciti.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un'istanza **PostgreSQL** distribuita su Hikube

## Preset disponibili

Hikube propone preset di risorse predefiniti per semplificare il dimensionamento:

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::warning
Se il campo `resources` (CPU/memoria espliciti) e definito, il valore di `resourcesPreset` viene **completamente ignorato**. Assicuratevi di svuotare il campo `resources` se desiderate usare un preset.
:::

## Passaggi

### 1. Verificare le risorse attuali

Consultate la configurazione attuale della vostra istanza:

```bash
kubectl get postgres my-database -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

**Esempio di risultato con un preset:**

```console
  resourcesPreset: micro
  resources: {}
```

**Esempio di risultato con risorse esplicite:**

```console
  resourcesPreset: micro
  resources:
    cpu: 2000m
    memory: 2Gi
```

### 2. Opzione A: cambiare il preset di risorse

Per passare da un preset a un altro (ad esempio da `micro` a `large`), applicate un patch:

```bash
kubectl patch postgres my-database --type='merge' -p='
spec:
  resourcesPreset: large
  resources: {}
'
```

:::note
E importante reimpostare `resources: {}` quando si passa a un preset, affinche il preset venga effettivamente preso in considerazione. Se `resources` contiene valori espliciti, il preset viene ignorato.
:::

Potete anche modificare il manifesto YAML completo:

```yaml title="postgresql-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resourcesPreset: large
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
```

Poi applicare:

```bash
kubectl apply -f postgresql-scaled.yaml
```

### 3. Opzione B: definire risorse esplicite

Per un controllo fine, definite direttamente i valori CPU e memoria:

```bash
kubectl patch postgres my-database --type='merge' -p='
spec:
  resources:
    cpu: 4000m
    memory: 4Gi
'
```

O tramite il manifesto completo:

```yaml title="postgresql-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resources:
    cpu: 4000m
    memory: 4Gi
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
```

```bash
kubectl apply -f postgresql-custom-resources.yaml
```

:::tip
Per il dimensionamento PostgreSQL, una buona regola di partenza e allocare `shared_buffers` a circa il 25% della memoria totale. Regolate i parametri PostgreSQL di conseguenza tramite la sezione `postgresql.parameters`.
:::

### 4. Verificare il rolling update

Dopo la modifica delle risorse, l'operatore effettua un **rolling update** dei pod PostgreSQL. Monitorate l'avanzamento:

```bash
kubectl get po -w | grep postgres-my-database
```

**Risultato atteso (durante il rolling update):**

```console
postgres-my-database-2   1/1     Terminating   0   45m
postgres-my-database-2   0/1     Pending       0   0s
postgres-my-database-2   1/1     Running       0   30s
```

Attendete che tutti i pod siano nello stato `Running`:

```bash
kubectl get po | grep postgres-my-database
```

```console
postgres-my-database-1   1/1     Running   0   2m
postgres-my-database-2   1/1     Running   0   4m
postgres-my-database-3   1/1     Running   0   6m
```

## Verifica

Confermate che le nuove risorse siano applicate:

```bash
kubectl get postgres my-database -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

Verificate che l'istanza sia funzionante:

```bash
kubectl get postgres my-database
```

**Risultato atteso:**

```console
NAME          READY   AGE   VERSION
my-database   True    1h    0.18.0
```

## Per approfondire

- **[Riferimento API PostgreSQL](../api-reference.md)**: documentazione completa dei parametri `resources`, `resourcesPreset` e tabella dei preset
