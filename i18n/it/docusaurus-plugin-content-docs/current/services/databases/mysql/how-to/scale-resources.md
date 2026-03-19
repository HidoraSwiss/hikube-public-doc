---
title: "Come scalare verticalmente"
---

# Come scalare verticalmente

Questa guida vi spiega come regolare le risorse CPU e memoria della vostra istanza MySQL su Hikube, sia tramite un preset predeterminato, sia definendo valori espliciti.

## Prerequisiti

- **kubectl** configurato con il vostro kubeconfig Hikube
- Un'istanza **MySQL** distribuita sul vostro tenant
- Conoscenza dei requisiti di risorse del vostro carico di lavoro

## Passaggi

### 1. Verificare le risorse attuali

Consultate la configurazione attuale della vostra istanza MySQL:

```bash
kubectl get mariadb example -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

**Risultato atteso (con preset):**

```console
  resourcesPreset: nano
```

**Risultato atteso (con risorse esplicite):**

```console
  resources:
    cpu: 1000m
    memory: 1Gi
```

### 2. Scegliere il metodo di scaling

Hikube propone due approcci per definire le risorse:

#### Opzione A: Usare un `resourcesPreset`

I preset offrono profili di risorse predefiniti e adatti a diversi casi d'uso:

| Preset | CPU | Memoria | Caso d'uso |
|---|---|---|---|
| `nano` | 250m | 128Mi | Test, sviluppo minimale |
| `micro` | 500m | 256Mi | Sviluppo, piccole applicazioni |
| `small` | 1 | 512Mi | Applicazioni leggere |
| `medium` | 1 | 1Gi | Applicazioni standard |
| `large` | 2 | 2Gi | Carichi di lavoro moderati |
| `xlarge` | 4 | 4Gi | Produzione standard |
| `2xlarge` | 8 | 8Gi | Produzione intensiva |

#### Opzione B: Definire risorse esplicite

Per un controllo preciso, definite direttamente i valori `resources.cpu` e `resources.memory`.

:::warning
Se il campo `resources` e definito (CPU e memoria espliciti), il valore di `resourcesPreset` viene **ignorato**. I due approcci sono mutuamente esclusivi.
:::

### 3. Opzione A: Modificare il resourcesPreset

Per passare da un preset a un altro, usate `kubectl patch`:

```bash
kubectl patch mariadb example --type='merge' -p='
spec:
  resourcesPreset: medium
'
```

O modificate direttamente il manifesto:

```yaml title="mysql-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resourcesPreset: medium
```

```bash
kubectl apply -f mysql-scaled.yaml
```

### 4. Opzione B: Definire risorse esplicite

Per un controllo fine delle risorse, specificate i valori CPU e memoria direttamente:

```bash
kubectl patch mariadb example --type='merge' -p='
spec:
  resources:
    cpu: 2000m
    memory: 4Gi
'
```

O tramite il manifesto completo:

```yaml title="mysql-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resources:
    cpu: 2000m
    memory: 4Gi
```

```bash
kubectl apply -f mysql-custom-resources.yaml
```

:::tip
Per tornare a un preset dopo aver usato risorse esplicite, rimuovete il campo `resources` e definite `resourcesPreset` nel vostro manifesto.
:::

## Verifica

Seguite il rolling update dei pod MySQL:

```bash
kubectl get pods -w | grep mysql-example
```

**Risultato atteso:**

```console
mysql-example-0   1/1     Running   0   5m
mysql-example-1   1/1     Running   0   3m
mysql-example-2   1/1     Running   0   1m
```

Verificate che le nuove risorse siano applicate:

```bash
kubectl get mariadb example -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

:::note
Lo scaling verticale comporta un **rolling update** dei pod. Le repliche vengono riavviate una alla volta per minimizzare l'impatto sulla disponibilita. Durante questo processo, il cluster resta accessibile in lettura tramite le repliche gia aggiornate.
:::

## Per approfondire

- [Riferimento API](../api-reference.md): lista completa dei preset e parametri di risorse
